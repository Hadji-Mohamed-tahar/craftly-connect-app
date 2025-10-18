import { db } from './firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { recordMembershipEarning } from './earningsService';

export interface Membership {
  userId: string;
  type: 'free' | 'premium';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Get user's membership
export const getUserMembership = async (userId: string): Promise<Membership | null> => {
  try {
    const membershipDoc = await getDoc(doc(db, 'memberships', userId));
    
    if (membershipDoc.exists()) {
      return membershipDoc.data() as Membership;
    }
    
    // Create default free membership if not exists
    const defaultMembership: Membership = {
      userId,
      type: 'free',
      expiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'memberships', userId), defaultMembership);
    return defaultMembership;
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
    
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year
    
    const membership: Membership = {
      userId,
      type: 'premium',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'memberships', userId), membership);
    
    // Record the earning with user name and details
    await recordMembershipEarning(
      userId,
      userName,
      499,
      'premium',
      '1 year',
      'مباشر',
      `TXN-${Date.now()}`,
      'ترقية العضوية إلى بريميوم - سنة واحدة'
    );
    
    return true;
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

// Get all premium members
export const getPremiumMembers = async (): Promise<Membership[]> => {
  try {
    const q = query(
      collection(db, 'memberships'),
      where('type', '==', 'premium')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Membership);
  } catch (error) {
    console.error('Error getting premium members:', error);
    return [];
  }
};