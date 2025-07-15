
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Shield, Package, Clock, MessageCircle, Star, Eye, User, Settings, Plus } from 'lucide-react';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';

const CrafterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders, hasActiveSubscription, subscription } = useOrders();
  const { currentUser, logout } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'accepted' | 'active' | 'completed'>('all');

  // الطلبات التي قدم عليها الحرفي (مرتبطة بـ crafterId)
  const crafterOrders = orders.filter(order => 
    order.crafterId === currentUser?.uid && 
    ['accepted', 'in_progress', 'completed'].includes(order.status)
  );

  const filteredOrders = crafterOrders.filter(order => {
    switch (activeFilter) {
      case 'accepted':
        return order.status === 'accepted';
      case 'active':
        return order.status === 'in_progress';
      case 'completed':
        return order.status === 'completed';
      default:
        return true;
    }
  });

  // الطلبات المتاحة (للتقديم عليها)
  const availableOrders = orders.filter(order => order.status === 'pending');

  // إحصائيات الحرفي
  const crafterStats = {
    totalOrders: orders.filter(o => o.crafterId === currentUser?.uid && o.status === 'completed').length,
    activeOrders: orders.filter(o => o.crafterId === currentUser?.uid && ['accepted', 'in_progress'].includes(o.status)).length,
    averageRating: orders.filter(o => o.crafterId === currentUser?.uid && o.rating).reduce((acc, o) => acc + (o.rating || 0), 0) / orders.filter(o => o.crafterId === currentUser?.uid && o.rating).length || 0,
    pendingOrders: availableOrders.length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'مقبول';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'معلق';
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">لوحة الحرفي</h1>
              <span className="text-sm text-gray-600 bg-amber-100 px-2 py-1 rounded-full">حرفي</span>
              {hasActiveSubscription() && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                  <Crown className="w-3 h-3" />
                  <span>مميز</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => logout()}
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
          <div className="relative">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2"
            >
              👁️ <span>تصفح الطلبات</span>
            </button>
            {/* Red dot for new orders */}
            {availableOrders.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2"
          >
            <User className="w-6 h-6" />
            <span>ملفي الشخصي</span>
          </button>
        </div>

        {/* إحصائيات الحرفي */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{crafterStats.totalOrders}</div>
            <div className="text-sm text-gray-600">طلب مكتمل</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{crafterStats.activeOrders}</div>
            <div className="text-sm text-gray-600">طلب نشط</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{crafterStats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">متوسط التقييم</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{crafterStats.pendingOrders}</div>
            <div className="text-sm text-gray-600">طلب متاح</div>
          </div>
        </div>


        {/* الطلبات التي قدمت عليها */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">طلباتك</h2>
          
          {/* Filters */}
          <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 mb-4">
            {[
              { key: 'all', label: 'جميع طلباتك' },
              { key: 'accepted', label: 'مقبولة' },
              { key: 'active', label: 'قيد التنفيذ' },
              { key: 'completed', label: 'مكتملة' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{order.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">{order.category}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{order.price} د.ج</div>
                </div>

                {order.clientName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <User className="w-4 h-4" />
                    <span>العميل: {order.clientName}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    عرض التفاصيل
                  </button>
                  
                  {(order.status === 'accepted' || order.status === 'in_progress') && (
                    <button
                      onClick={() => navigate(`/chat/${order.id}`)}
                      className="px-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>محادثة</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {crafterOrders.length === 0 ? 'لم تقدم على أي طلبات بعد' : 'لا توجد طلبات في هذا القسم'}
            </h3>
            <p className="text-gray-500 mb-6">
              {crafterOrders.length === 0 
                ? 'تصفح الطلبات المتاحة وقدم على ما يناسبك' 
                : 'لا توجد طلبات متاحة في هذا القسم حالياً'
              }
            </p>
            {crafterOrders.length === 0 && (
              <button
                onClick={() => navigate('/orders')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                تصفح الطلبات المتاحة
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrafterDashboard;
