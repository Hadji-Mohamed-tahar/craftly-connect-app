
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { RegistrationData, createUserDocument, ClientData, CrafterData, AdminData } from '../lib/userDataStructure';
import { checkAdminStatus } from '../lib/adminRegistration';

// استخدام النماذج المحدثة من userDataStructure
type UserProfile = ClientData | CrafterData | AdminData;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (registrationData: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (registrationData: RegistrationData) => {
    try {
      // إنشاء الحساب
      const { user } = await createUserWithEmailAndPassword(auth, registrationData.email, registrationData.password);
      await updateProfile(user, { displayName: registrationData.name });
      
      // إنشاء بيانات المستخدم المنظمة
      const userDocument = createUserDocument(user.uid, registrationData);

      // حفظ في قاعدة البيانات
      await setDoc(doc(db, 'users', user.uid), userDocument);
      
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed - user:', user ? user.email : 'null');
      setCurrentUser(user);
      
      if (user) {
        try {
          // التحقق أولاً من أن المستخدم إدمن
          const adminData = await checkAdminStatus(user.uid);
          if (adminData) {
            console.log('User is admin');
            setUserProfile(adminData);
          } else {
            // جلب بيانات المستخدم العادي
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              console.log('User profile loaded from Firestore');
              setUserProfile(userDoc.data() as UserProfile);
            } else {
              console.log('Creating fallback profile - user doc not found');
              // إنشاء ملف احتياطي
              const fallbackProfile: ClientData = {
                uid: user.uid,
                email: user.email || '',
                name: user.displayName || 'مستخدم',
                userType: 'client',
                phone: '+966501234567',
                location: 'الرياض',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                verified: false,
                status: 'active',
                notifications: {
                  email: true,
                  sms: true,
                  push: true,
                },
              };
              setUserProfile(fallbackProfile);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // إنشاء ملف احتياطي في حالة الخطأ
          const fallbackProfile: ClientData = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || 'مستخدم',
            userType: 'client',
            phone: '+966501234567',
            location: 'الرياض',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verified: false,
            status: 'active',
            notifications: {
              email: true,
              sms: true,
              push: true,
            },
          };
          setUserProfile(fallbackProfile);
        }
      } else {
        console.log('No user - clearing profile');
        setUserProfile(null);
      }
      
      console.log('Setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
