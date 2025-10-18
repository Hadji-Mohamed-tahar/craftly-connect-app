import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// ========== Earnings Types ==========

export type EarningCategory = 
  | 'membership'      // أرباح العضويات
  | 'commission'      // عمولات الطلبات
  | 'advertising'     // أرباح الإعلانات
  | 'featured'        // رسوم إبراز الحرفيين
  | 'other';          // أرباح أخرى

export interface MembershipEarning {
  id?: string;
  userId: string;
  userName: string;
  amount: number;
  membershipType: 'premium';
  duration: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

export interface EarningRecord {
  id?: string;
  category: EarningCategory;
  amount: number;
  description: string;
  relatedUserId?: string;
  relatedUserName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy?: string;
}

export interface CompanyEarnings {
  // إجمالي الأرباح
  totalEarnings: number;
  
  // تفصيل الأرباح حسب الفئة
  membershipEarnings: number;
  commissionEarnings: number;
  advertisingEarnings: number;
  featuredEarnings: number;
  otherEarnings: number;
  
  // إحصائيات إضافية
  totalTransactions: number;
  lastTransactionDate?: string;
  
  // تواريخ التحديث
  lastUpdated: string;
  createdAt?: string;
}

// Document ID الثابت لأرباح الشركة
const COMPANY_EARNINGS_DOC_ID = 'main_earnings';

// ========== Initialize Company Earnings ==========

// تهيئة سجل أرباح الشركة (يُستخدم مرة واحدة عند بدء النظام)
export const initializeCompanyEarnings = async (): Promise<boolean> => {
  try {
    const earningsRef = doc(db, 'company_earnings', COMPANY_EARNINGS_DOC_ID);
    const earningsDoc = await getDoc(earningsRef);
    
    if (!earningsDoc.exists()) {
      const initialEarnings: CompanyEarnings = {
        totalEarnings: 0,
        membershipEarnings: 0,
        commissionEarnings: 0,
        advertisingEarnings: 0,
        featuredEarnings: 0,
        otherEarnings: 0,
        totalTransactions: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(earningsRef, initialEarnings);
      console.log('Company earnings initialized successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing company earnings:', error);
    return false;
  }
};

// ========== Update Company Earnings ==========

// تحديث أرباح الشركة بإضافة مبلغ جديد
const updateCompanyEarnings = async (
  category: EarningCategory,
  amount: number
): Promise<boolean> => {
  try {
    const earningsRef = doc(db, 'company_earnings', COMPANY_EARNINGS_DOC_ID);
    
    // تأكد من وجود السجل
    const earningsDoc = await getDoc(earningsRef);
    if (!earningsDoc.exists()) {
      await initializeCompanyEarnings();
    }
    
    // حدد الحقل المناسب للتحديث
    const categoryField = `${category}Earnings`;
    
    await updateDoc(earningsRef, {
      totalEarnings: increment(amount),
      [categoryField]: increment(amount),
      totalTransactions: increment(1),
      lastTransactionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating company earnings:', error);
    return false;
  }
};

// ========== Record Membership Earnings ==========

// تسجيل أرباح العضوية
export const recordMembershipEarning = async (
  userId: string,
  userName: string,
  amount: number, 
  membershipType: 'premium',
  duration: string = '1 year',
  paymentMethod?: string,
  transactionId?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const earning: MembershipEarning = {
      userId,
      userName,
      amount,
      membershipType,
      duration,
      paymentMethod,
      transactionId,
      notes,
      createdAt: new Date().toISOString(),
    };
    
    // حفظ السجل التفصيلي
    await addDoc(collection(db, 'membership_earnings'), earning);
    
    // تحديث إجمالي أرباح الشركة
    await updateCompanyEarnings('membership', amount);
    
    return true;
  } catch (error) {
    console.error('Error recording membership earning:', error);
    return false;
  }
};

// ========== Record Other Earnings ==========

// تسجيل أرباح عامة (قابلة للتوسع)
export const recordEarning = async (
  category: EarningCategory,
  amount: number,
  description: string,
  relatedUserId?: string,
  relatedUserName?: string,
  metadata?: Record<string, any>,
  createdBy?: string
): Promise<boolean> => {
  try {
    const earning: EarningRecord = {
      category,
      amount,
      description,
      relatedUserId,
      relatedUserName,
      metadata,
      createdAt: new Date().toISOString(),
      createdBy,
    };
    
    // حفظ السجل التفصيلي
    await addDoc(collection(db, 'earnings_records'), earning);
    
    // تحديث إجمالي أرباح الشركة
    await updateCompanyEarnings(category, amount);
    
    return true;
  } catch (error) {
    console.error('Error recording earning:', error);
    return false;
  }
};

// ========== Get Company Earnings ==========

// الحصول على إجمالي أرباح الشركة
export const getCompanyEarnings = async (): Promise<CompanyEarnings | null> => {
  try {
    const earningsRef = doc(db, 'company_earnings', COMPANY_EARNINGS_DOC_ID);
    const earningsDoc = await getDoc(earningsRef);
    
    if (!earningsDoc.exists()) {
      await initializeCompanyEarnings();
      return await getCompanyEarnings(); // استدعاء متكرر بعد التهيئة
    }
    
    return earningsDoc.data() as CompanyEarnings;
  } catch (error) {
    console.error('Error getting company earnings:', error);
    return null;
  }
};

// ========== Get Detailed Earnings ==========

// الحصول على أرباح العضويات مع التفاصيل
export const getMembershipEarnings = async (limit?: number): Promise<MembershipEarning[]> => {
  try {
    let q = query(
      collection(db, 'membership_earnings'),
      orderBy('createdAt', 'desc')
    );
    
    if (limit) {
      q = query(q, where('createdAt', '!=', null));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MembershipEarning));
  } catch (error) {
    console.error('Error getting membership earnings:', error);
    return [];
  }
};

// الحصول على سجلات الأرباح العامة
export const getEarningsRecords = async (
  category?: EarningCategory,
  limitCount?: number
): Promise<EarningRecord[]> => {
  try {
    let q = query(
      collection(db, 'earnings_records'),
      orderBy('createdAt', 'desc')
    );
    
    if (category) {
      q = query(
        collection(db, 'earnings_records'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EarningRecord));
  } catch (error) {
    console.error('Error getting earnings records:', error);
    return [];
  }
};

// الحصول على أرباح حسب نطاق تاريخي
export const getEarningsByDateRange = async (
  startDate: Date, 
  endDate: Date,
  category?: EarningCategory
): Promise<EarningRecord[]> => {
  try {
    let q = query(
      collection(db, 'earnings_records'),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString()),
      orderBy('createdAt', 'desc')
    );
    
    if (category) {
      q = query(
        collection(db, 'earnings_records'),
        where('category', '==', category),
        where('createdAt', '>=', startDate.toISOString()),
        where('createdAt', '<=', endDate.toISOString()),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EarningRecord));
  } catch (error) {
    console.error('Error getting earnings by date range:', error);
    return [];
  }
};

// ========== Statistics ==========

// إحصائيات الأرباح الشهرية
export const getMonthlyEarningsStats = async (
  year: number,
  month: number
): Promise<CompanyEarnings | null> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const records = await getEarningsByDateRange(startDate, endDate);
    
    const stats: CompanyEarnings = {
      totalEarnings: 0,
      membershipEarnings: 0,
      commissionEarnings: 0,
      advertisingEarnings: 0,
      featuredEarnings: 0,
      otherEarnings: 0,
      totalTransactions: records.length,
      lastUpdated: new Date().toISOString(),
    };
    
    records.forEach(record => {
      stats.totalEarnings += record.amount;
      
      switch (record.category) {
        case 'membership':
          stats.membershipEarnings += record.amount;
          break;
        case 'commission':
          stats.commissionEarnings += record.amount;
          break;
        case 'advertising':
          stats.advertisingEarnings += record.amount;
          break;
        case 'featured':
          stats.featuredEarnings += record.amount;
          break;
        case 'other':
          stats.otherEarnings += record.amount;
          break;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting monthly earnings stats:', error);
    return null;
  }
};
