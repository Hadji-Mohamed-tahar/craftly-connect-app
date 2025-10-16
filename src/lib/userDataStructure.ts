// تنظيم بيانات المستخدمين والإدمن في Firebase
export interface BaseUserData {
  uid: string;
  email: string;
  name: string;
  phone: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
  status: 'active' | 'blocked' | 'suspended';
  avatar?: string;
  lastLogin?: string;
}

// بيانات العميل
export interface ClientData extends BaseUserData {
  userType: 'client';
  preferences?: string[];
  orderHistory?: string[];
  savedCrafters?: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// بيانات الحرفي
export interface CrafterData extends BaseUserData {
  userType: 'crafter';
  specialty: string;
  experience: string;
  rating: number;
  completedOrders: number;
  membershipType: 'free' | 'premium';
  membershipExpiresAt?: string;
  portfolioImages?: string[];
  certifications?: string[];
  workingHours?: {
    start: string;
    end: string;
    workingDays: string[];
  };
  serviceArea: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

// بيانات الإدمن
export interface AdminData extends BaseUserData {
  userType: 'admin';
  role: 'super_admin' | 'moderator' | 'support';
  permissions: AdminPermission[];
  department?: string;
  employeeId?: string;
}

export type AdminPermission = 
  | 'manage_users' 
  | 'manage_requests' 
  | 'manage_orders'
  | 'view_analytics'
  | 'manage_payments'
  | 'send_notifications'
  | 'manage_system_settings';

// بيانات التسجيل
export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  location: string;
  userType: 'client' | 'crafter';
  
  // بيانات إضافية للحرفي
  specialty?: string;
  experience?: string;
  
  // بيانات إضافية للإدمن (يتم إضافتها لاحقاً)
  adminRole?: 'super_admin' | 'moderator' | 'support';
  adminPermissions?: AdminPermission[];
}

// تصنيف البيانات حسب النوع
export const createUserDocument = (
  uid: string, 
  registrationData: RegistrationData
): ClientData | CrafterData => {
  const baseData = {
    uid,
    email: registrationData.email,
    name: registrationData.name,
    phone: registrationData.phone,
    location: registrationData.location,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    verified: false,
    status: 'active' as const,
  };

  if (registrationData.userType === 'crafter') {
    return {
      ...baseData,
      userType: 'crafter',
      specialty: registrationData.specialty || '',
      experience: registrationData.experience || '',
      rating: 0,
      completedOrders: 0,
      membershipType: 'free',
      serviceArea: [registrationData.location],
    } as CrafterData;
  } else {
    return {
      ...baseData,
      userType: 'client',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
    } as ClientData;
  }
};

// إنشاء بيانات إدمن
export const createAdminDocument = (
  uid: string,
  adminData: {
    email: string;
    name: string;
    phone: string;
    role: 'super_admin' | 'moderator' | 'support';
    permissions: AdminPermission[];
    department?: string;
  }
): AdminData => {
  return {
    uid,
    email: adminData.email,
    name: adminData.name,
    phone: adminData.phone,
    location: 'مقر الشركة',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    verified: true,
    status: 'active',
    userType: 'admin',
    role: adminData.role,
    permissions: adminData.permissions,
    department: adminData.department,
  };
};

// فئات التخصصات
export const SPECIALTIES = [
  'نجارة',
  'سباكة', 
  'كهرباء',
  'تكييف',
  'صباغة',
  'بلاط وسيراميك',
  'تنظيف',
  'صيانة عامة',
  'لحام',
  'تركيب الأثاث',
  'صيانة الأجهزة',
  'تنسيق الحدائق'
] as const;

// مستويات الخبرة
export const EXPERIENCE_LEVELS = [
  'أقل من سنة',
  '1-3 سنوات',
  '3-5 سنوات', 
  '5-10 سنوات',
  'أكثر من 10 سنوات'
] as const;

// المدن المدعومة
export const SUPPORTED_CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة المكرمة',
  'المدينة المنورة',
  'الطائف',
  'تبوك',
  'بريدة',
  'الخبر',
  'الظهران',
  'الجبيل',
  'ينبع',
  'الأحساء',
  'حائل',
  'أبها',
  'جازان',
  'نجران',
  'الباحة',
  'سكاكا',
  'عرعر'
] as const;