
import React from 'react';
import { ArrowLeft, User, Phone, MapPin, Star, Calendar, Package, Crown, Settings, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { userProfile } = useAuth(); 

  // فلترة الطلبات حسب نوع المستخدم
  const userOrders = userProfile?.userType === 'client' 
    ? orders.filter(order => order.clientId === userProfile.uid)
    : orders.filter(order => order.crafterId === userProfile?.uid);

  const completedOrders = userOrders.filter(order => order.status === 'completed' || order.status === 'rated');
  const averageRating = completedOrders.reduce((acc, order) => acc + (order.rating || 0), 0) / completedOrders.length || 0;

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">الملف الشخصي</h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {userProfile.name}
                </h2>
                <p className="text-gray-600">
                  {userProfile.userType === 'client' ? 'عميل' : `حرفي ${userProfile.specialty || ''}`}
                </p>
                {userProfile.userType === 'crafter' && averageRating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              تعديل
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5" />
              <span>{userProfile.phone || 'لم يتم إضافة رقم الهاتف'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{userProfile.location || 'لم يتم إضافة الموقع'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>عضو منذ {new Date().toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">الإحصائيات</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {userOrders.length}
              </div>
              <div className="text-sm text-blue-600">
                {userProfile.userType === 'client' ? 'إجمالي الطلبات' : 'الطلبات المقبولة'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {completedOrders.length}
              </div>
              <div className="text-sm text-green-600">الطلبات المكتملة</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">الطلبات الأخيرة</h3>
          
          {userOrders.length > 0 ? (
            <div className="space-y-3">
              {userOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{order.title}</h4>
                    <p className="text-sm text-gray-600">{order.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{order.price} ر.س</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>لا توجد طلبات حتى الآن</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
