import React, { useState } from 'react';
import { ArrowLeft, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const RateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, rateOrder } = useOrders();
  const { userProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const order = orders.find(o => o.id === id);

  if (!order || userProfile?.userType !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">غير مصرح</h2>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setErrorMessage('يرجى اختيار تقييم');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await rateOrder(order.id, rating, review.trim() || undefined);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error rating order:', error);
      setErrorMessage('حدث خطأ أثناء إرسال التقييم');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onMouseEnter={() => setHoveredRating(i + 1)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => setRating(i + 1)}
        className="p-1 transition-transform hover:scale-110"
      >
        <Star
          className={`w-8 h-8 ${
            i < (hoveredRating || rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          } transition-colors`}
        />
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/order/${order.id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">تقييم العمل</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">{order.title}</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الحرفي: {order.crafterName}</span>
            <span className="text-lg font-bold text-green-600">{order.price} د.ج</span>
          </div>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">كيف كان العمل؟</h3>
            
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {renderStars()}
            </div>
            
            {/* Rating Text */}
            <div className="text-center mb-6">
              {rating > 0 && (
                <p className="text-gray-600">
                  {rating === 1 && 'ضعيف جداً'}
                  {rating === 2 && 'ضعيف'}
                  {rating === 3 && 'متوسط'}
                  {rating === 4 && 'جيد'}
                  {rating === 5 && 'ممتاز'}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعليق على العمل (اختياري)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="شاركنا رأيك في جودة العمل والتعامل..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإرسال...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                إرسال التقييم
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <DialogTitle>شكراً لك!</DialogTitle>
            </div>
            <DialogDescription>
              تم إرسال تقييمك بنجاح. شكراً لك على استخدام الخدمة.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/');
              }}
              className="w-full"
            >
              العودة للرئيسية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <DialogTitle>خطأ</DialogTitle>
            </div>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowErrorModal(false)}
              className="w-full"
            >
              حسناً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RateOrder;