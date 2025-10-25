import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { MembershipPlan } from '../types/earnings';

// ========== Membership Plans Management ==========

// Get all membership plans
export const getMembershipPlans = async (activeOnly = true): Promise<MembershipPlan[]> => {
  try {
    let q = query(collection(db, 'membershipPlans'), orderBy('price', 'asc'));
    
    if (activeOnly) {
      q = query(collection(db, 'membershipPlans'), where('isActive', '==', true), orderBy('price', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MembershipPlan));
  } catch (error) {
    console.error('Error getting membership plans:', error);
    return [];
  }
};

// Get single membership plan
export const getMembershipPlan = async (planId: string): Promise<MembershipPlan | null> => {
  try {
    const planDoc = await getDoc(doc(db, 'membershipPlans', planId));
    
    if (!planDoc.exists()) {
      return null;
    }
    
    return {
      id: planDoc.id,
      ...planDoc.data()
    } as MembershipPlan;
  } catch (error) {
    console.error('Error getting membership plan:', error);
    return null;
  }
};

// Create default premium plan
export const initializeDefaultPlans = async (): Promise<boolean> => {
  try {
    const plans = await getMembershipPlans(false);
    
    if (plans.length === 0) {
      const defaultPlan: MembershipPlan = {
        title: 'عضوية بريميوم',
        description: 'عضوية سنوية كاملة مع جميع المميزات',
        price: 499,
        currency: 'SAR',
        durationDays: 365,
        features: [
          'ظهور مميز في قائمة الحرفيين',
          'شارة عضو مميز',
          'أولوية في نتائج البحث',
          'إحصائيات متقدمة',
          'دعم فني مخصص'
        ],
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await setDoc(doc(collection(db, 'membershipPlans')), defaultPlan);
      console.log('Default membership plan created');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing default plans:', error);
    return false;
  }
};

// Create new membership plan
export const createMembershipPlan = async (plan: Omit<MembershipPlan, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    const newPlan: MembershipPlan = {
      ...plan,
      createdAt: new Date().toISOString(),
      isActive: plan.isActive ?? true
    };
    
    const docRef = doc(collection(db, 'membershipPlans'));
    await setDoc(docRef, newPlan);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating membership plan:', error);
    return null;
  }
};

// Update membership plan
export const updateMembershipPlan = async (
  planId: string, 
  updates: Partial<MembershipPlan>
): Promise<boolean> => {
  try {
    const planRef = doc(db, 'membershipPlans', planId);
    await updateDoc(planRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating membership plan:', error);
    return false;
  }
};
