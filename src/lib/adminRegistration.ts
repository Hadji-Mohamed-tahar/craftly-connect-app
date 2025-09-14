// نظام تسجيل وإدارة الإدمن
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AdminData, AdminPermission, createAdminDocument } from './userDataStructure';

// بيانات تسجيل الإدمن
export interface AdminRegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'super_admin' | 'moderator' | 'support';
  department?: string;
  employeeId?: string;
}

// صلاحيات حسب الدور
export const getRolePermissions = (role: 'super_admin' | 'moderator' | 'support'): AdminPermission[] => {
  switch (role) {
    case 'super_admin':
      return [
        'manage_users',
        'manage_requests', 
        'manage_orders',
        'view_analytics',
        'manage_payments',
        'send_notifications',
        'manage_system_settings'
      ];
    case 'moderator':
      return [
        'manage_users',
        'manage_requests',
        'manage_orders',
        'view_analytics',
        'send_notifications'
      ];
    case 'support':
      return [
        'manage_requests',
        'view_analytics'
      ];
    default:
      return [];
  }
};

// تسجيل إدمن جديد
export const registerAdmin = async (adminData: AdminRegistrationData): Promise<AdminData> => {
  try {
    // التحقق من أن المستخدم الحالي هو super admin
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // التحقق من صلاحية المستخدم الحالي
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!currentUserDoc.exists()) {
      throw new Error('المستخدم غير موجود');
    }

    const currentUserData = currentUserDoc.data() as AdminData;
    if (currentUserData.userType !== 'admin' || currentUserData.role !== 'super_admin') {
      throw new Error('ليس لديك صلاحية لإضافة إدمن جديد');
    }

    // التحقق من عدم وجود إيميل مكرر
    const existingUserQuery = query(
      collection(db, 'users'), 
      where('email', '==', adminData.email)
    );
    const existingUsers = await getDocs(existingUserQuery);
    
    if (!existingUsers.empty) {
      throw new Error('البريد الإلكتروني مستخدم مسبقاً');
    }

    // إنشاء حساب جديد
    const { user } = await createUserWithEmailAndPassword(
      auth, 
      adminData.email, 
      adminData.password
    );

    // تحديث الملف الشخصي
    await updateProfile(user, { 
      displayName: adminData.name 
    });

    // إنشاء بيانات الإدمن
    const adminDocument = createAdminDocument(user.uid, {
      email: adminData.email,
      name: adminData.name,
      phone: adminData.phone,
      role: adminData.role,
      permissions: getRolePermissions(adminData.role),
      department: adminData.department,
    });

    // إضافة employeeId إذا تم توفيره
    if (adminData.employeeId) {
      (adminDocument as any).employeeId = adminData.employeeId;
    }

    // حفظ في قاعدة البيانات
    await setDoc(doc(db, 'users', user.uid), adminDocument);

    // إضافة في جدول الإدمن المنفصل للسهولة
    await setDoc(doc(db, 'admins', user.uid), {
      uid: user.uid,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
      permissions: adminDocument.permissions,
      createdAt: adminDocument.createdAt,
      createdBy: currentUser.uid,
      department: adminData.department,
      employeeId: adminData.employeeId,
    });

    return adminDocument;

  } catch (error) {
    console.error('Error registering admin:', error);
    throw error;
  }
};

// التحقق من أن المستخدم إدمن
export const checkAdminStatus = async (uid: string): Promise<AdminData | null> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as AdminData;
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return null;
  }
};

// الحصول على جميع الإدمن
export const getAllAdmins = async (): Promise<AdminData[]> => {
  try {
    const adminsQuery = query(collection(db, 'admins'));
    const adminsSnapshot = await getDocs(adminsQuery);
    
    const adminIds = adminsSnapshot.docs.map(doc => doc.id);
    const adminDetails: AdminData[] = [];

    for (const adminId of adminIds) {
      const userDoc = await getDoc(doc(db, 'users', adminId));
      if (userDoc.exists()) {
        adminDetails.push(userDoc.data() as AdminData);
      }
    }

    return adminDetails;
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
};

// تحديث صلاحيات إدمن
export const updateAdminPermissions = async (
  adminId: string, 
  newPermissions: AdminPermission[]
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // التحقق من صلاحية المستخدم الحالي
    const currentUserData = await checkAdminStatus(currentUser.uid);
    if (!currentUserData || currentUserData.role !== 'super_admin') {
      throw new Error('ليس لديك صلاحية لتعديل صلاحيات الإدمن');
    }

    // تحديث في جدول المستخدمين
    await setDoc(doc(db, 'users', adminId), {
      permissions: newPermissions,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // تحديث في جدول الإدمن
    await setDoc(doc(db, 'admins', adminId), {
      permissions: newPermissions,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.uid
    }, { merge: true });

  } catch (error) {
    console.error('Error updating admin permissions:', error);
    throw error;
  }
};

// حذف إدمن
export const deleteAdmin = async (adminId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // التحقق من صلاحية المستخدم الحالي
    const currentUserData = await checkAdminStatus(currentUser.uid);
    if (!currentUserData || currentUserData.role !== 'super_admin') {
      throw new Error('ليس لديك صلاحية لحذف الإدمن');
    }

    // منع حذف الذات
    if (adminId === currentUser.uid) {
      throw new Error('لا يمكن حذف حسابك الخاص');
    }

    // تحديث حالة المستخدم بدلاً من الحذف الفعلي
    await setDoc(doc(db, 'users', adminId), {
      status: 'suspended',
      updatedAt: new Date().toISOString(),
      suspendedBy: currentUser.uid,
      suspendedAt: new Date().toISOString()
    }, { merge: true });

    // تحديث في جدول الإدمن
    await setDoc(doc(db, 'admins', adminId), {
      status: 'suspended',
      updatedAt: new Date().toISOString(),
      suspendedBy: currentUser.uid,
      suspendedAt: new Date().toISOString()
    }, { merge: true });

  } catch (error) {
    console.error('Error suspending admin:', error);
    throw error;
  }
};