import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalCrafters: number;
  totalRequests: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

interface AdminContextType {
  isAdmin: boolean;
  stats: AdminStats;
  loading: boolean;
  users: any[];
  requests: any[];
  orders: any[];
  updateUserStatus: (userId: string, status: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalClients: 0,
    totalCrafters: 0,
    totalRequests: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is admin (you can add admin emails here)
    if (userProfile) {
      const adminEmails = ['admin@craft.com', 'admin@example.com'];
      console.log('Checking admin status for:', userProfile.email);
      console.log('Admin emails:', adminEmails);
      const isUserAdmin = adminEmails.includes(userProfile.email);
      console.log('Is admin:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    } else {
      console.log('No user profile found');
      setIsAdmin(false);
    }
  }, [userProfile]);

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const ordersSnapshot = await getDocs(collection(db, 'orders'));

      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setUsers(usersData);
      setOrders(ordersData);

      const clients = usersData.filter((user: any) => user.userType === 'client');
      const crafters = usersData.filter((user: any) => user.userType === 'crafter');
      const activeOrders = ordersData.filter((order: any) => order.status === 'inProgress');
      const completedOrders = ordersData.filter((order: any) => order.status === 'completed');

      setStats({
        totalUsers: usersData.length,
        totalClients: clients.length,
        totalCrafters: crafters.length,
        totalRequests: requests.length, // سيتم تحديثه من useEffect
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue: completedOrders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0),
        monthlyGrowth: 12.5 // This would be calculated based on historical data
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // الاستماع للطلبات في الوقت الفعلي
  useEffect(() => {
    if (!isAdmin) return;

    const requestsRef = collection(db, 'requests');
    const requestsQuery = query(requestsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(requestsQuery, 
      (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setRequests(requestsData);
        
        // تحديث الإحصائيات
        setStats(prev => ({
          ...prev,
          totalRequests: requestsData.length
        }));
      },
      (error) => {
        console.error('Error listening to requests:', error);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const updateUserStatus = async (userId: string, status: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), status);
      await refreshData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      await refreshData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), { status });
      // لا حاجة لـ refreshData - البيانات تُحدّث تلقائياً عبر onSnapshot
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await fetchStats();
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const value = {
    isAdmin,
    stats,
    loading,
    users,
    requests,
    orders,
    updateUserStatus,
    deleteUser,
    updateRequestStatus,
    refreshData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};