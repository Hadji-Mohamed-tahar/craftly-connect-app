
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboard from './ClientDashboard';
import CrafterDashboard from './CrafterDashboard';

const Home: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return userProfile.userType === 'client' ? <ClientDashboard /> : <CrafterDashboard />;
};

export default Home;
