import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

export interface MembershipEarning {
  userId: string;
  amount: number;
  membershipType: 'premium';
  duration: string;
  createdAt: string;
}

export interface CompanyEarnings {
  totalEarnings: number;
  membershipEarnings: number;
  lastUpdated: string;
}

// Record membership earnings
export const recordMembershipEarning = async (
  userId: string, 
  amount: number, 
  membershipType: 'premium',
  duration: string = '1 year'
): Promise<boolean> => {
  try {
    const earning: MembershipEarning = {
      userId,
      amount,
      membershipType,
      duration,
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(collection(db, 'membership_earnings'), earning);
    return true;
  } catch (error) {
    console.error('Error recording membership earning:', error);
    return false;
  }
};

// Get total membership earnings
export const getTotalMembershipEarnings = async (): Promise<number> => {
  try {
    const snapshot = await getDocs(collection(db, 'membership_earnings'));
    let total = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data() as MembershipEarning;
      total += data.amount;
    });
    return total;
  } catch (error) {
    console.error('Error getting membership earnings:', error);
    return 0;
  }
};

// Get earnings by date range
export const getEarningsByDateRange = async (
  startDate: Date, 
  endDate: Date
): Promise<MembershipEarning[]> => {
  try {
    const q = query(
      collection(db, 'membership_earnings'),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString()),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MembershipEarning);
  } catch (error) {
    console.error('Error getting earnings by date range:', error);
    return [];
  }
};

// Get company earnings summary
export const getCompanyEarnings = async (): Promise<CompanyEarnings> => {
  try {
    const membershipEarnings = await getTotalMembershipEarnings();
    
    return {
      totalEarnings: membershipEarnings,
      membershipEarnings: membershipEarnings,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting company earnings:', error);
    return {
      totalEarnings: 0,
      membershipEarnings: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
};
