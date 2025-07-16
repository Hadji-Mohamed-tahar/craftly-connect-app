import React, { useState } from 'react';
import { ArrowLeft, Search, Star, MapPin, Award, Phone, MessageCircle, User, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders, Crafter } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const CrafterSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchCrafters, createOrder } = useOrders();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<Crafter[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrafter, setSelectedCrafter] = useState<Crafter | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const specialties = [
    'نجارة',
    'سباكة', 
    'كهرباء',
    'تكييف',
    'صباغة',
    'بلاط وسيراميك',
    'تنظيف',
    'صيانة عامة'
  ];

  const [orderForm, setOrderForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    clientLocation: userProfile?.location || ''
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const crafters = await searchCrafters(selectedSpecialty, location);
      
      let filteredResults = crafters;
      if (searchTerm) {
        filteredResults = crafters.filter(crafter =>
          crafter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crafter.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Error searching crafters:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleDirectOrder = (crafter: Crafter) => {
    setSelectedCrafter(crafter);
    setOrderForm(prev => ({
      ...prev,
      category: crafter.specialty
    }));
    setShowOrderForm(true);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!selectedCrafter || !userProfile) return;

    // Validation
    if (!orderForm.title || !orderForm.description || !orderForm.price || !orderForm.clientLocation) {
      setErrorMessage('يرجى ملء جميع الحقول');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = await createOrder({
        ...orderForm,
        price: parseFloat(orderForm.price),
        clientPhone: userProfile.phone
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('حدث خطأ أثناء إرسال الطلب');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProfile = (crafter: Crafter) => {
    navigate('/crafter-profile', { state: { crafter } });
  };

  if (showOrderForm && selectedCrafter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">طلب مباشر إلى {selectedCrafter.name}</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الطلب</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الطلب *</label>
                <input
                  type="text"
                  value={orderForm.title}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: إصلاح دولاب المطبخ"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف الطلب *</label>
                <textarea
                  value={orderForm.description}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="اكتب وصفاً مفصلاً للعمل المطلوب..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                <input
                  type="text"
                  value={selectedCrafter.specialty}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الميزانية المتوقعة *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.ج</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموقع *</label>
                <input
                  type="text"
                  value={orderForm.clientLocation}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, clientLocation: e.target.value }))}
                  placeholder="المدينة، الحي"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإرسال...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                إرسال الطلب للحرفي
              </>
            )}
          </button>
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
                تم إرسال الطلب بنجاح للحرفي وسيتم إشعاره بالطلب.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowOrderForm(false);
                  setSelectedCrafter(null);
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">البحث عن حرفي</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البحث بالاسم أو التخصص</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن حرفي..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التخصص</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">جميع التخصصات</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="المدينة..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  بحث
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">نتائج البحث ({results.length})</h3>
            
            {results.map((crafter) => (
              <div key={crafter.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{crafter.name}</h4>
                      <p className="text-amber-600 font-medium">{crafter.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">{renderStars(crafter.rating)}</div>
                        <span className="text-sm text-gray-600">({crafter.rating})</span>
                      </div>
                    </div>
                  </div>
                  {crafter.verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <Award className="w-3 h-3" />
                      موثق
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{crafter.location}</span>
                  </div>
                  {crafter.experience && (
                    <div className="text-sm text-gray-600">
                      الخبرة: {crafter.experience}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    الطلبات المكتملة: {crafter.completedOrders}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDirectOrder(crafter)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    طلب مباشر
                  </button>
                  <button
                    onClick={() => handleViewProfile(crafter)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    عرض الملف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لم يتم العثور على حرفيين</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث</p>
          </div>
        )}
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
              تم إرسال الطلب بنجاح للحرفي وسيتم إشعاره بالطلب.
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

export default CrafterSearchPage;