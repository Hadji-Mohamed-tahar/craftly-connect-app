import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'crafter';
  message: string;
  timestamp: any;
  createdAt: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { orders } = useOrders();
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (!orderId || !currentUser) return;

    // Listen to messages for this order
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(
      messagesRef,
      where('orderId', '==', orderId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(messagesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [orderId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !orderId || !currentUser || !userProfile) return;

    try {
      await addDoc(collection(db, 'messages'), {
        orderId,
        senderId: currentUser.uid,
        senderName: userProfile.name,
        senderType: userProfile.userType,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">الطلب غير موجود</h2>
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

  const isAuthorized = 
    (userProfile?.userType === 'client' && order.clientId === currentUser?.uid) ||
    (userProfile?.userType === 'crafter' && (order.crafterId === currentUser?.uid || order.status === 'pending'));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600 mb-4">لا يمكنك الوصول لهذه المحادثة</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-800">{order.title}</h1>
              <p className="text-sm text-gray-600">
                {userProfile?.userType === 'client' 
                  ? order.crafterName || 'محادثة عامة' 
                  : order.clientName
                }
              </p>
            </div>
            <button
              onClick={() => navigate(`/order/${orderId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Package className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {order.status === 'pending' && 'طلب متاح للتقديم'}
              {order.status === 'accepted' && 'تم قبول الطلب'}
              {order.status === 'in_progress' && 'العمل قيد التنفيذ'}
              {order.status === 'completed' && 'تم إنجاز العمل'}
            </span>
          </div>
          <span className="text-sm text-blue-600 font-bold">{order.price} د.ج</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد رسائل بعد</h3>
            <p className="text-gray-500">ابدأ المحادثة بإرسال رسالة</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUser?.uid
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <div className="text-xs opacity-75 mb-1">
                  {message.senderName} • {message.senderType === 'client' ? 'عميل' : 'حرفي'}
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;