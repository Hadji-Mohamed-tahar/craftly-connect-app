import React, { useState } from 'react';
import { ArrowLeft, Send, Phone, Video, MoreVertical, CheckCircle, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { orders, completeOrder } = useOrders();
  const { userProfile, currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    isOwn: boolean;
  }>>([]);
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">المحادثة غير موجودة</h2>
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            العودة للطلبات
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        senderId: currentUser?.uid || '',
        timestamp: new Date().toISOString(),
        isOwn: true
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await completeOrder(order.id);
      navigate(`/rate-order/${order.id}`);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `قبل ${diffInHours} ساعة`;
    return `قبل ${Math.floor(diffInHours / 24)} يوم`;
  };

  const otherPersonName = userProfile?.userType === 'client' ? order.crafterName : order.clientName;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/order/${order.id}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="font-bold text-gray-800">{otherPersonName || 'المحادثة'}</h1>
                <p className="text-sm text-gray-500">{order.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {order.status === 'accepted' && 'تم قبول الطلب'}
              {order.status === 'in_progress' && 'العمل قيد التنفيذ'}
              {order.status === 'completed' && 'تم إنجاز العمل'}
            </span>
          </div>
          <span className="text-sm text-blue-600 font-bold">{order.price} ر.س</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">ابدأ المحادثة</h3>
            <p className="text-gray-500">اكتب رسالتك الأولى لبدء النقاش حول التفاصيل</p>
          </div>
        ) : (
          messages.map((message) => {
            return (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-between mt-1 ${
                    message.isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">{formatTimeAgo(message.timestamp)}</span>
                    {message.isOwn && (
                      <div className="text-xs">✓</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Order Button (for clients when work is in progress) */}
      {userProfile?.userType === 'client' && order.status === 'in_progress' && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-3">
          <button
            onClick={handleCompleteOrder}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            إنهاء الطلب وتقييم العمل
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;