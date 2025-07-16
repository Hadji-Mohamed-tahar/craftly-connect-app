import React from 'react';
import { ArrowLeft, Star, MapPin, Award, User, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Crafter } from '../contexts/FirebaseOrderContext';

const CrafterProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const crafter = location.state?.crafter as Crafter;

  if (!crafter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">الحرفي غير موجود</h2>
          <button
            onClick={() => navigate('/search-crafters')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            العودة للبحث
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">ملف الحرفي</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{crafter.name}</h2>
                {crafter.verified && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    <Award className="w-3 h-3" />
                    موثق
                  </div>
                )}
              </div>
              <p className="text-amber-600 font-medium text-lg mb-2">{crafter.specialty}</p>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(crafter.rating)}</div>
                <span className="text-gray-600">({crafter.rating})</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-5 h-5" />
            <span>{crafter.location}</span>
          </div>

          {/* Experience */}
          {crafter.experience && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Calendar className="w-5 h-5" />
              <span>سنوات الخبرة: {crafter.experience}</span>
            </div>
          )}

          {/* Completed Orders */}
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>الطلبات المكتملة: {crafter.completedOrders}</span>
          </div>

          {/* Contact Notice */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">معلومات الاتصال</h3>
                <p className="text-blue-700 text-sm">
                  لحماية خصوصية الحرفي، معلومات الاتصال متاحة فقط بعد قبول الطلب من الجانبين.
                  يمكنك إرسال طلب مباشر للحرفي أو التواصل معه عبر النظام.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">الإحصائيات</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{crafter.completedOrders}</div>
              <div className="text-sm text-green-700">طلب مكتمل</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{crafter.rating}</div>
              <div className="text-sm text-yellow-700">متوسط التقييم</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/search-crafters', { 
              state: { selectedCrafter: crafter, showOrderForm: true } 
            })}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            إرسال طلب مباشر
          </button>
          
          <button
            onClick={() => navigate('/chat', { state: { crafterId: crafter.id } })}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            بدء محادثة
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrafterProfile;