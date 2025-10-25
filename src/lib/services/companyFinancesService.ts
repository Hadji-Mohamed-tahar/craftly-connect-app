import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, limit, increment } from 'firebase/firestore';
import { CompanyFinances, TransactionType } from '../types/earnings';

// ========== Company Finances Management ==========

// Get or create company finances for a period
export const getCompanyFinances = async (period: string): Promise<CompanyFinances | null> => {
  try {
    const financeDoc = await getDoc(doc(db, 'companyFinances', period));
    
    if (!financeDoc.exists()) {
      // Create initial finances for this period
      const initialFinances: CompanyFinances = {
        period,
        membershipRevenueTotal: 0,
        commissionRevenueTotal: 0,
        advertisingRevenueTotal: 0,
        featuredRevenueTotal: 0,
        otherRevenueTotal: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        currency: 'SAR',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'companyFinances', period), initialFinances);
      return initialFinances;
    }
    
    return {
      id: financeDoc.id,
      ...financeDoc.data()
    } as CompanyFinances;
  } catch (error) {
    console.error('Error getting company finances:', error);
    return null;
  }
};

// Update company finances
export const updateCompanyFinances = async (
  period: string,
  transactionType: TransactionType,
  amount: number
): Promise<boolean> => {
  try {
    const financeRef = doc(db, 'companyFinances', period);
    
    // Ensure document exists
    await getCompanyFinances(period);
    
    // Determine which field to update
    let revenueField = 'otherRevenueTotal';
    
    switch (transactionType) {
      case 'membership_payment':
        revenueField = 'membershipRevenueTotal';
        break;
      case 'commission_payment':
        revenueField = 'commissionRevenueTotal';
        break;
      case 'advertising_payment':
        revenueField = 'advertisingRevenueTotal';
        break;
      case 'featured_payment':
        revenueField = 'featuredRevenueTotal';
        break;
      case 'other_payment':
        revenueField = 'otherRevenueTotal';
        break;
    }
    
    // Update the specific revenue field and total
    await updateDoc(financeRef, {
      [revenueField]: increment(amount),
      totalRevenue: increment(amount),
      totalTransactions: increment(amount > 0 ? 1 : -1),
      lastUpdated: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating company finances:', error);
    return false;
  }
};

// Get current month finances
export const getCurrentMonthFinances = async (): Promise<CompanyFinances | null> => {
  const currentPeriod = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  return await getCompanyFinances(currentPeriod);
};

// Get total company finances (all time)
export const getTotalCompanyFinances = async (): Promise<CompanyFinances | null> => {
  try {
    const snapshot = await getDocs(collection(db, 'companyFinances'));
    
    if (snapshot.empty) {
      return null;
    }
    
    const totals: CompanyFinances = {
      period: 'all-time',
      membershipRevenueTotal: 0,
      commissionRevenueTotal: 0,
      advertisingRevenueTotal: 0,
      featuredRevenueTotal: 0,
      otherRevenueTotal: 0,
      totalRevenue: 0,
      totalTransactions: 0,
      currency: 'SAR',
      lastUpdated: new Date().toISOString()
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as CompanyFinances;
      totals.membershipRevenueTotal += data.membershipRevenueTotal || 0;
      totals.commissionRevenueTotal += data.commissionRevenueTotal || 0;
      totals.advertisingRevenueTotal += data.advertisingRevenueTotal || 0;
      totals.featuredRevenueTotal += data.featuredRevenueTotal || 0;
      totals.otherRevenueTotal += data.otherRevenueTotal || 0;
      totals.totalRevenue += data.totalRevenue || 0;
      totals.totalTransactions += data.totalTransactions || 0;
    });
    
    return totals;
  } catch (error) {
    console.error('Error getting total company finances:', error);
    return null;
  }
};

// Get finances by period range
export const getFinancesByPeriodRange = async (
  startPeriod: string, // "YYYY-MM"
  endPeriod: string    // "YYYY-MM"
): Promise<CompanyFinances[]> => {
  try {
    const q = query(
      collection(db, 'companyFinances'),
      orderBy('period', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CompanyFinances))
      .filter(finance => 
        finance.period >= startPeriod && finance.period <= endPeriod
      );
  } catch (error) {
    console.error('Error getting finances by period range:', error);
    return [];
  }
};

// Get recent financial periods
export const getRecentFinances = async (limitCount: number = 12): Promise<CompanyFinances[]> => {
  try {
    const q = query(
      collection(db, 'companyFinances'),
      orderBy('period', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CompanyFinances));
  } catch (error) {
    console.error('Error getting recent finances:', error);
    return [];
  }
};
