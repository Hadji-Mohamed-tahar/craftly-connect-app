
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Star, CheckCircle, User, Settings, Package, Eye, Search } from 'lucide-react';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { userProfile, logout } = useAuth();

  // فلترة الطلبات الخاصة بالعميل الحالي
  const clientOrders = orders.filter(order => order.clientId === userProfile?.uid);
  
  // الحرفيون الذين تواصل معهم العميل
  const connectedCrafters = clientOrders
    .filter(order => order.crafterName && ['accepted', 'in_progress', 'completed'].includes(order.status))
    .reduce((acc, order) => {
      const crafterId = order.crafterId;
      if (crafterId && !acc.find(c => c.id === crafterId)) {
        acc.push({
          id: crafterId,
          name: order.crafterName!,
          lastOrder: order,
          totalOrders: clientOrders.filter(o => o.crafterId === crafterId).length,
          rating: order.rating,
          hasActiveOrder: ['accepted', 'in_progress'].includes(order.status)
        });
      }
      return acc;
    }, [] as any[]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rated':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'accepted':
        return 'مقبول';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'completed':
        return 'مكتمل';
      case 'rated':
        return 'مقيم';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">مرحباً {userProfile?.name}</h1>
              <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">عميل</span>
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
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => navigate('/create-order')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2"
          >
            <Plus className="w-6 h-6" />
            <span>طلب جديد</span>
          </button>
          <button
            onClick={() => navigate('/search-crafters')}
            className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2"
          >
            <Search className="w-6 h-6" />
            <span>البحث عن حرفي</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2"
          >
            <Eye className="w-6 h-6" />
            <span>تصفح الطلبات</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2"
          >
            <User className="w-6 h-6" />
            <span>ملفي الشخصي</span>
          </button>
        </div>

        {/* الحرفيون المتواصلون */}
        {connectedCrafters.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">الحرفيون الذين تواصلوا معي</h2>
            <div className="space-y-3">
              {connectedCrafters.map((crafter) => (
                <div
                  key={crafter.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{crafter.name}</h3>
                        <p className="text-sm text-gray-600">{crafter.totalOrders} طلب سابق</p>
                      </div>
                    </div>
                    {crafter.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{crafter.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crafter.lastOrder.status)}`}>
                      {getStatusText(crafter.lastOrder.status)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/order/${crafter.lastOrder.id}`)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        عرض الطلب
                      </button>
                      {crafter.hasActiveOrder && (
                        <button
                          onClick={() => navigate(`/chat/${crafter.lastOrder.id}`)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          دردشة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* طلباتك الأخيرة */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">طلباتك الأخيرة</h2>
            {clientOrders.length > 3 && (
              <button
                onClick={() => navigate('/orders')}
                className="text-blue-500 text-sm font-medium"
              >
                عرض الكل
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {clientOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{order.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{order.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">{order.price} ر.س</span>
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {clientOrders.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد طلبات بعد</h3>
            <p className="text-gray-500 mb-6">ابدأ بإنشاء طلبك الأول للحصول على الخدمة التي تحتاجها</p>
            <button
              onClick={() => navigate('/create-order')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              إنشاء طلب جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
