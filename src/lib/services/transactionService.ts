import { db } from '../firebase';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { Transaction, TransactionType, TransactionStatus } from '../types/earnings';
import { updateCompanyFinances } from './companyFinancesService';

// ========== Transaction Management ==========

// Create new transaction
export const createTransaction = async (
  type: TransactionType,
  userId: string,
  amount: number,
  platformShare: number,
  options?: {
    userName?: string;
    planId?: string;
    subscriptionRef?: string;
    paymentProvider?: string;
    meta?: Record<string, any>;
    status?: TransactionStatus;
  }
): Promise<string | null> => {
  try {
    const transaction: Transaction = {
      type,
      userId,
      userName: options?.userName,
      planId: options?.planId,
      subscriptionRef: options?.subscriptionRef,
      amount,
      currency: 'SAR',
      platformShare,
      status: options?.status || 'pending',
      paymentProvider: options?.paymentProvider || 'مباشر',
      meta: options?.meta,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'transactions'), transaction);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return null;
  }
};

// Complete transaction
export const completeTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      console.error('Transaction not found');
      return false;
    }
    
    const transaction = transactionDoc.data() as Transaction;
    
    // Update transaction status
    await updateDoc(transactionRef, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    // Update company finances
    const period = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    await updateCompanyFinances(period, transaction.type, transaction.platformShare);
    
    return true;
  } catch (error) {
    console.error('Error completing transaction:', error);
    return false;
  }
};

// Get transaction by ID
export const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
    
    if (!transactionDoc.exists()) {
      return null;
    }
    
    return {
      id: transactionDoc.id,
      ...transactionDoc.data()
    } as Transaction;
  } catch (error) {
    console.error('Error getting transaction:', error);
    return null;
  }
};

// Get transactions by user
export const getUserTransactions = async (
  userId: string, 
  limitCount?: number
): Promise<Transaction[]> => {
  try {
    let q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return [];
  }
};

// Get transactions by status
export const getTransactionsByStatus = async (
  status: TransactionStatus,
  limitCount?: number
): Promise<Transaction[]> => {
  try {
    let q = query(
      collection(db, 'transactions'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error getting transactions by status:', error);
    return [];
  }
};

// Get transactions by type
export const getTransactionsByType = async (
  type: TransactionType,
  limitCount?: number
): Promise<Transaction[]> => {
  try {
    let q = query(
      collection(db, 'transactions'),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error getting transactions by type:', error);
    return [];
  }
};

// Get all transactions with filters
export const getTransactions = async (
  filters?: {
    type?: TransactionType;
    status?: TransactionStatus;
    userId?: string;
    startDate?: string;
    endDate?: string;
  },
  limitCount?: number
): Promise<Transaction[]> => {
  try {
    let q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    
    if (filters?.startDate) {
      q = query(q, where('createdAt', '>=', filters.startDate));
    }
    
    if (filters?.endDate) {
      q = query(q, where('createdAt', '<=', filters.endDate));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

// Refund transaction
export const refundTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      console.error('Transaction not found');
      return false;
    }
    
    const transaction = transactionDoc.data() as Transaction;
    
    if (transaction.status !== 'completed') {
      console.error('Can only refund completed transactions');
      return false;
    }
    
    // Update transaction status
    await updateDoc(transactionRef, {
      status: 'refunded',
      'meta.refundedAt': new Date().toISOString()
    });
    
    // Deduct from company finances
    const period = new Date().toISOString().substring(0, 7);
    await updateCompanyFinances(period, transaction.type, -transaction.platformShare);
    
    return true;
  } catch (error) {
    console.error('Error refunding transaction:', error);
    return false;
  }
};
