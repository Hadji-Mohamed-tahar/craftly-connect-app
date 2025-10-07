
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading, logout } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">مرحباً {userProfile?.name}</h1>
              <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                {userProfile?.userType === 'client' ? 'عميل' : 
                 userProfile?.userType === 'admin' ? 'مدير' : 'حرفي'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{userProfile.name}</h2>
              <p className="text-gray-600">
                {userProfile.userType === 'client' ? 'عميل' : 
                 userProfile.userType === 'admin' ? 'مدير النظام' : 'حرفي'}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="font-medium">البريد الإلكتروني:</span>
              <span>{userProfile.email}</span>
            </div>
            {userProfile.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <span className="font-medium">الهاتف:</span>
                <span>{userProfile.phone}</span>
              </div>
            )}
            {userProfile.location && (
              <div className="flex items-center gap-3 text-gray-600">
                <span className="font-medium">الموقع:</span>
                <span>{userProfile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            مرحباً بك في المنصة!
          </h3>
          <p className="text-blue-700">
            نحن سعداء بوجودك معنا
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
