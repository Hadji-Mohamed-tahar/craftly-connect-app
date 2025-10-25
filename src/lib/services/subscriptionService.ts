import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { Subscription, SubscriptionStatus } from '../types/earnings';
import { createTransaction, completeTransaction } from './transactionService';
import { getMembershipPlan } from './membershipPlanService';

// ========== Subscription Management ==========

// Get user's active subscription
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const subscription = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as Subscription;
    
    // Check if expired
    if (new Date(subscription.expiresAt) < new Date()) {
      await updateSubscriptionStatus(subscription.id!, 'expired');
      return null;
    }
    
    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
};

// Create new subscription
export const createSubscription = async (
  userId: string,
  userName: string,
  planId: string
): Promise<Subscription | null> => {
  try {
    // Get plan details
    const plan = await getMembershipPlan(planId);
    if (!plan) {
      console.error('Plan not found');
      return null;
    }
    
    // Check for existing active subscription
    const existingSubscription = await getUserSubscription(userId);
    if (existingSubscription) {
      console.error('User already has an active subscription');
      return null;
    }
    
    const startDate = new Date();
    const expiresAt = new Date(startDate);
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);
    
    // Create transaction first
    const transactionId = await createTransaction(
      'membership_payment',
      userId,
      plan.price,
      plan.price, // 100% platform share for membership
      {
        userName,
        planId,
        paymentProvider: 'مباشر',
        meta: {
          invoiceId: `INV-${Date.now()}`,
          details: {
            planTitle: plan.title,
            duration: `${plan.durationDays} يوم`
          }
        },
        status: 'pending'
      }
    );
    
    if (!transactionId) {
      console.error('Failed to create transaction');
      return null;
    }
    
    // Create subscription
    const subscription: Subscription = {
      userId,
      planId,
      status: 'active',
      startedAt: startDate.toISOString(),
      expiresAt: expiresAt.toISOString(),
      autoRenew: false,
      lastPaymentRef: transactionId,
      paymentCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = doc(collection(db, 'subscriptions'));
    await setDoc(docRef, subscription);
    
    // Update transaction with subscription reference
    await updateDoc(doc(db, 'transactions', transactionId), {
      subscriptionRef: docRef.id
    });
    
    // Complete the transaction
    await completeTransaction(transactionId);
    
    return {
      id: docRef.id,
      ...subscription
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<boolean> => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subscriptionRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return false;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    return await updateSubscriptionStatus(subscriptionId, 'cancelled');
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
};

// Get all subscriptions for a user
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subscription));
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return [];
  }
};

// Get all active subscriptions
export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('status', '==', 'active'),
      orderBy('expiresAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subscription));
  } catch (error) {
    console.error('Error getting active subscriptions:', error);
    return [];
  }
};

// Check if user has premium membership
export const hasPremiumMembership = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return subscription !== null;
};
