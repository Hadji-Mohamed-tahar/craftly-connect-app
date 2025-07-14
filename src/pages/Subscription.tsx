
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Star, Shield, Zap, X, Lock } from 'lucide-react';
import { useOrders } from '../contexts/FirebaseOrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { subscription, subscribe, hasActiveSubscription } = useOrders();
  const { userProfile } = useAuth();

  const plans = [
    {
      id: 'free',
      name: 'العضوية المجانية',
      price: 0,
      duration: 'دائمة',
      type: 'free' as const,
      current: !hasActiveSubscription(),
      features: [
        'عرض الطلبات العامة المحدودة',
        'التقديم على 3 طلبات شهرياً',
        'الدعم الأساسي'
      ],
      limitations: [
        'لا يمكن عرض تفاصيل العملاء',
        'لا يمكن الوصول للدردشة',
        'محدودية في الطلبات'
      ],
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-gray-400 to-gray-500'
    },
    {
      id: 'premium',
      name: 'العضوية المميزة',
      price: 99,
      duration: 'شهرياً',
      type: 'premium' as const,
      popular: true,
      comingSoon: true,
      features: [
        'عرض جميع تفاصيل الطلبات',
        'التواصل المباشر مع العملاء',
        'قبول طلبات غير محدودة',
        'الدردشة الفورية',
        'إشعارات فورية',
        'دعم فني متميز',
        'أولوية في البحث',
        'شارة "حرفي متميز"'
      ],
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-amber-400 to-yellow-500'
    }
  ];

  const handleSubscribe = (planName: string, price: number, type: 'free' | 'premium') => {
    if (type === 'premium') {
      alert('العضوية المميزة ستكون متاحة قريباً في النسخة القادمة من التطبيق!');
      return;
    }
    // Subscribe logic for future implementation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">خطط الاشتراك</h1>
            <div className="w-9" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Current Subscription */}
        {hasActiveSubscription() && subscription && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">الاشتراك النشط</h3>
                  <p className="text-green-600">{subscription.planName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-bold">{subscription.price} ر.س</p>
                <p className="text-sm text-green-600">
                  صالح حتى: {new Date(subscription.endDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-2xl p-8 mb-6">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">خطط العضوية</h2>
            <p className="text-amber-100">اختر الخطة التي تناسب احتياجاتك كحرفي</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-800">وصول فوري</h4>
              <p className="text-sm text-gray-600">للطلبات الجديدة</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-800">تقييم مميز</h4>
              <p className="text-sm text-gray-600">من العملاء</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-lg mb-2 mx-auto w-fit">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-800">دعم متميز</h4>
              <p className="text-sm text-gray-600">24/7</p>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 ${
                plan.current ? 'border-green-300 bg-green-50' : 
                plan.popular ? 'border-amber-300 relative hover:shadow-md' : 
                plan.comingSoon ? 'border-gray-200 opacity-75' :
                'border-gray-200 hover:shadow-md'
              }`}
            >
              {plan.popular && !plan.comingSoon && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    الأكثر شعبية
                  </span>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    العضوية الحالية
                  </span>
                </div>
              )}
              {plan.comingSoon && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    قريباً
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.gradient} text-white`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                    <p className="text-gray-600">{plan.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600">ر.س</span>
                  </div>
                  {plan.price === 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      مجانية للأبد
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">المميزات المتاحة:</h4>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-3">القيود:</h4>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span className="text-gray-600">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.name, plan.price, plan.type)}
                disabled={plan.current || plan.comingSoon}
                className={`w-full py-3 text-lg font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  plan.current
                    ? 'bg-green-500 text-white cursor-default'
                    : plan.comingSoon
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {plan.current ? (
                  <>
                    <Check className="w-5 h-5" />
                    العضوية الحالية
                  </>
                ) : plan.comingSoon ? (
                  <>
                    <Lock className="w-5 h-5" />
                    قريباً
                  </>
                ) : (
                  'اختيار الخطة'
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">الأسئلة الشائعة</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">متى يبدأ الاشتراك؟</h4>
              <p className="text-gray-600 text-sm">يبدأ الاشتراك فور إتمام عملية الدفع ويستمر للمدة المحددة.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">هل يمكنني إلغاء الاشتراك؟</h4>
              <p className="text-gray-600 text-sm">نعم، يمكنك إلغاء الاشتراك في أي وقت من خلال الإعدادات.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">ما طرق الدفع المتاحة؟</h4>
              <p className="text-gray-600 text-sm">نقبل جميع البطاقات الائتمانية والحوالات البنكية المحلية.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
