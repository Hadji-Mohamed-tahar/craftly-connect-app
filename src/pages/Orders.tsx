
import React, { useState } from 'react';
import { ArrowLeft, Plus, Package, Clock, CheckCircle, Star, MessageCircle, Eye, Crown, AlertCircle, User, Wrench, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, hasActiveSubscription } = useOrders();
  const { userProfile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [showClientModal, setShowClientModal] = useState(false);

  const userType = userProfile?.userType || 'client';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'accepted':
        return <Package className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'متاح للتقديم';
      case 'accepted':
        return 'مقبول';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'accepted':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // عرض الطلبات العامة فقط (المتاحة للتقديم)
  const publicOrders = orders.filter(order => order.status === 'pending');

  const filteredOrders = publicOrders.filter(order => {
    switch (activeFilter) {
      case 'pending':
        return order.status === 'pending';
      case 'in-progress':
        return order.status === 'in_progress' || order.status === 'accepted';
      case 'completed':
        return order.status === 'completed';
      default:
        return true;
    }
  });

  const handleOrderClick = (orderId: string) => {
    if (userType === 'client') {
      setShowClientModal(true);
      return;
    }
    // السماح للحرفي بعرض التفاصيل
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">الطلبات المتاحة</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Client Notice */}
      {userType === 'client' && (
        <div className="bg-blue-50 border border-blue-200 mx-4 mt-4 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">معلومة مهمة</h3>
              <p className="text-blue-700 text-sm">
                هذه الطلبات متاحة للحرفيين للتقديم عليها. للتقديم على الطلبات، يجب التسجيل كحرفي.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Filters */}
      <div className="px-3 sm:px-4 py-3">
        <div className="flex space-x-2 space-x-reverse overflow-x-auto">
          {[
            { key: 'all', label: 'جميع الطلبات' },
            { key: 'pending', label: 'متاح للتقديم' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-3 sm:px-4 pb-4 space-y-3 sm:space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleOrderClick(order.id)}
          >
            {/* Order Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
                  {order.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {order.description}
                </p>
              </div>
              <div className={`px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="whitespace-nowrap">{getStatusText(order.status)}</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span className="bg-gray-100 px-2 py-1 rounded-lg">{order.category}</span>
              <span>{new Date(order.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>

            {/* Location */}
            <div className="text-sm text-gray-600 mb-3">
              📍 {order.clientLocation}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {order.price} د.ج
              </div>
              
              {userType === 'crafter' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/order/${order.id}`);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  👁️ عرض التفاصيل
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <Package className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">لا توجد طلبات متاحة</h3>
          <p className="text-sm sm:text-base text-gray-500 text-center">
            لا توجد طلبات متاحة للتقديم عليها حالياً
          </p>
        </div>
      )}

      {/* Client Modal */}
      <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <DialogTitle>معلومة مهمة</DialogTitle>
            </div>
            <DialogDescription>
              يجب التسجيل كحرفي للتقديم على الطلبات. هذه الطلبات متاحة للحرفيين المسجلين فقط.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowClientModal(false)}
              className="w-full"
            >
              فهمت
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
