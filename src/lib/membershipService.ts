import { db } from './firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { createSubscription, getUserSubscription, hasPremiumMembership } from './services/subscriptionService';
import { initializeDefaultPlans, getMembershipPlans } from './services/membershipPlanService';

export interface Membership {
  userId: string;
  type: 'free' | 'premium';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Get user's membership (compatibility wrapper)
export const getUserMembership = async (userId: string): Promise<Membership | null> => {
  try {
    const subscription = await getUserSubscription(userId);
    
    if (subscription) {
      return {
        userId,
        type: 'premium',
        expiresAt: subscription.expiresAt,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
      };
    }
    
    // Return default free membership
    return {
      userId,
      type: 'free',
      expiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting membership:', error);
    return null;
  }
};

// Upgrade to premium membership (Demo payment)
export const upgradeToPremium = async (userId: string): Promise<boolean> => {
  try {
    // Get user info
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('uid', '==', userId));
    const userSnapshot = await getDocs(userQuery);
    
    let userName = 'مستخدم';
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      userName = userData.name || 'مستخدم';
    }
    
    // Initialize default plans if needed
    await initializeDefaultPlans();
    
    // Get the first active plan (premium plan)
    const plans = await getMembershipPlans(true);
    if (plans.length === 0) {
      console.error('No membership plans available');
      return false;
    }
    
    const premiumPlan = plans[0];
    
    // Create subscription (this will also create transaction and update finances)
    const subscription = await createSubscription(userId, userName, premiumPlan.id!);
    
    return subscription !== null;
  } catch (error) {
    console.error('Error upgrading membership:', error);
    return false;
  }
};

// Check if membership is expired
export const isMembershipExpired = (membership: Membership): boolean => {
  if (membership.type === 'free') return false;
  if (!membership.expiresAt) return false;
  
  return new Date(membership.expiresAt) < new Date();
};

// Get all premium members (compatibility wrapper)
export const getPremiumMembers = async (): Promise<Membership[]> => {
  try {
    // This would need to query subscriptions now
    // For compatibility, returning empty array
    // TODO: Implement if needed
    return [];
  } catch (error) {
    console.error('Error getting premium members:', error);
    return [];
  }
};

// Export new functions for direct use
export { hasPremiumMembership } from './services/subscriptionService';