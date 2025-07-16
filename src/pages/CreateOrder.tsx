
import React, { useState } from 'react';
import { ArrowLeft, Plus, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    clientLocation: userProfile?.location || ''
  });

  const categories = [
    'نجارة',
    'سباكة',
    'كهرباء',
    'تكييف',
    'صباغة',
    'بلاط وسيراميك',
    'تنظيف',
    'صيانة عامة',
    'أعمال أخرى'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      setErrorMessage('يجب تسجيل الدخول أولاً');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    // Validation
    if (!formData.title || !formData.description || !formData.category || 
        !formData.price || !formData.clientLocation) {
      setErrorMessage('يرجى ملء جميع الحقول');
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await createOrder({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        clientPhone: userProfile.phone || '', // إضافة قيمة افتراضية فارغة إذا لم يكن هناك رقم هاتف
        clientLocation: formData.clientLocation
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('حدث خطأ أثناء إنشاء الطلب');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!userProfile || userProfile.userType !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600 mb-4">هذه الصفحة متاحة للعملاء فقط</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            العودة للرئيسية
          </button>
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
            <h1 className="text-xl font-bold text-gray-800">إنشاء طلب جديد</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Details Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الطلب</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الطلب *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثال: إصلاح دولاب المطبخ"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الطلب *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="اكتب وصفاً مفصلاً للعمل المطلوب..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الميزانية المتوقعة *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    د.ج
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="clientLocation"
                    value={formData.clientLocation}
                    onChange={handleChange}
                    placeholder="المدينة، الحي"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري النشر...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                نشر الطلب
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
              <DialogTitle>تم بنجاح!</DialogTitle>
            </div>
            <DialogDescription>
              تم إنشاء الطلب بنجاح وسيتم عرضه للحرفيين المتاحين.
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

export default CreateOrder;
