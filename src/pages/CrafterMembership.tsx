import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { CrafterData } from '@/lib/userDataStructure';
import { Membership, getUserMembership, upgradeToPremium } from '@/lib/membershipService';

interface FeaturedRequest {
  id: string;
  crafterUid: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  notes?: string;
  adminNotes?: string;
  reviewedAt?: string;
}

const CrafterMembership = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [crafterData, setCrafterData] = useState<CrafterData | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestNotes, setRequestNotes] = useState('');
  const [featuredRequest, setFeaturedRequest] = useState<FeaturedRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentDemo, setShowPaymentDemo] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    fetchCrafterData();
  }, [currentUser]);

  const fetchCrafterData = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as CrafterData;
        if (data.userType !== 'crafter') {
          navigate('/');
          return;
        }
        setCrafterData(data);
        
        // Get membership data
        const membershipData = await getUserMembership(currentUser.uid);
        setMembership(membershipData);
        
        // Check for existing featured request
        const requestsQuery = query(
          collection(db, 'featured_requests'),
          where('crafterUid', '==', currentUser.uid)
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        if (!requestsSnapshot.empty) {
          const requestData = requestsSnapshot.docs[0].data();
          setFeaturedRequest({
            id: requestsSnapshot.docs[0].id,
            ...requestData,
          } as FeaturedRequest);
        }
      }
    } catch (error) {
      console.error('Error fetching crafter data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    setShowPaymentDemo(true);
  };

  const handleDemoPayment = async () => {
    if (!currentUser) return;

    try {
      setSubmitting(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = await upgradeToPremium(currentUser.uid);
      
      if (success) {
        toast({
          title: 'تم الدفع بنجاح',
          description: 'تم ترقية حسابك إلى العضوية المميزة',
        });
        setShowPaymentDemo(false);
        fetchCrafterData();
      } else {
        throw new Error('Upgrade failed');
      }
    } catch (error) {
      console.error('Error upgrading membership:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في معالجة الدفع',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeaturedRequest = async () => {
    if (!currentUser || !membership) return;

    if (membership.type !== 'premium') {
      toast({
        title: 'عضوية مميزة مطلوبة',
        description: 'يجب أن تكون لديك عضوية مميزة لتقديم هذا الطلب',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      await addDoc(collection(db, 'featured_requests'), {
        crafterUid: currentUser.uid,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        notes: requestNotes,
      });

      toast({
        title: 'تم تقديم الطلب',
        description: 'سيتم مراجعة طلبك من قبل الإدارة قريباً',
      });

      setRequestNotes('');
      fetchCrafterData();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تقديم الطلب',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!crafterData || !membership) {
    return null;
  }

  const isPremium = membership.type === 'premium';
  const isRequestRejected = featuredRequest?.status === 'rejected';
  const canRequestFeatured = isPremium && (!featuredRequest || isRequestRejected);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة العضوية</h1>
          <p className="text-muted-foreground">قم بترقية حسابك للحصول على مزايا إضافية</p>
        </div>

        {/* Current Membership Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">العضوية الحالية</h2>
            <Badge variant={isPremium ? 'default' : 'secondary'} className="text-lg px-4 py-1">
              {isPremium ? (
                <>
                  <Crown className="w-4 h-4 ml-2" />
                  مميزة
                </>
              ) : (
                'مجانية'
              )}
            </Badge>
          </div>
          
          {isPremium && membership.expiresAt && (
            <p className="text-sm text-muted-foreground">
              تنتهي في: {new Date(membership.expiresAt).toLocaleDateString('ar-SA')}
            </p>
          )}
        </Card>

        {/* Membership Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Membership */}
          <Card className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-foreground mb-2">عضوية مجانية</h3>
              <p className="text-3xl font-bold text-primary">مجاناً</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">عرض الملف الشخصي</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">استقبال الطلبات</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">التقييمات والمراجعات</span>
              </li>
            </ul>
          </Card>

          {/* Premium Membership */}
          <Card className="p-6 border-2 border-primary relative">
            <Badge className="absolute top-4 left-4">الأكثر شعبية</Badge>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                عضوية مميزة
              </h3>
              <p className="text-3xl font-bold text-primary">499 ر.س / سنة</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">جميع مزايا العضوية المجانية</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">إمكانية الظهور في قائمة أفضل الحرفيين</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">أولوية في نتائج البحث</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">شارة العضوية المميزة</span>
              </li>
            </ul>
            {!isPremium && (
              <Button 
                onClick={handleUpgradeToPremium} 
                disabled={submitting}
                className="w-full"
              >
                الترقية الآن
              </Button>
            )}
          </Card>
        </div>

        {/* Featured Request Section */}
        {isPremium && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              طلب الظهور في قائمة أفضل الحرفيين
            </h2>

            {featuredRequest && !isRequestRejected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">حالة الطلب:</span>
                  <Badge
                    variant={
                      featuredRequest.status === 'approved'
                        ? 'default'
                        : featuredRequest.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {featuredRequest.status === 'pending' && (
                      <>
                        <Clock className="w-4 h-4 ml-1" />
                        قيد المراجعة
                      </>
                    )}
                    {featuredRequest.status === 'approved' && (
                      <>
                        <CheckCircle className="w-4 h-4 ml-1" />
                        مقبول
                      </>
                    )}
                    {featuredRequest.status === 'rejected' && (
                      <>
                        <XCircle className="w-4 h-4 ml-1" />
                        مرفوض
                      </>
                    )}
                  </Badge>
                </div>

                {featuredRequest.notes && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">ملاحظاتك:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {featuredRequest.notes}
                    </p>
                  </div>
                )}

                {featuredRequest.adminNotes && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">ملاحظات الإدارة:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {featuredRequest.adminNotes}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  تم التقديم في: {new Date(featuredRequest.requestedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {isRequestRejected && featuredRequest && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-destructive mb-2">تم رفض طلبك السابق</p>
                    {featuredRequest.adminNotes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        السبب: {featuredRequest.adminNotes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      يمكنك تقديم طلب جديد مع تحسين ملفك الشخصي بناءً على ملاحظات الإدارة
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  قدم طلباً للظهور في قائمة أفضل الحرفيين. سيتم مراجعة طلبك من قبل الإدارة وإخطارك بالنتيجة.
                </p>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <Textarea
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="أخبرنا لماذا تستحق أن تكون من أفضل الحرفيين..."
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={submitFeaturedRequest} 
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'جاري التقديم...' : 'تقديم الطلب'}
                </Button>
              </div>
            )}
          </Card>
        )}

        {!isPremium && (
          <Card className="p-6 bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">
              قم بالترقية إلى العضوية المميزة للحصول على فرصة الظهور في قائمة أفضل الحرفيين
            </p>
          </Card>
        )}

        {/* Demo Payment Modal */}
        {showPaymentDemo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-primary" />
                دفع تجريبي
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">المبلغ المطلوب</p>
                  <p className="text-2xl font-bold text-foreground">499 ر.س</p>
                  <p className="text-xs text-muted-foreground mt-1">عضوية مميزة لمدة سنة واحدة</p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-3">معلومات البطاقة (تجريبي)</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="رقم البطاقة: 4242 4242 4242 4242"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      disabled
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY: 12/25"
                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                        disabled
                      />
                      <input
                        type="text"
                        placeholder="CVV: 123"
                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    📝 هذا نظام دفع تجريبي. سيتم تفعيل عضويتك المميزة مباشرة بدون دفع فعلي.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPaymentDemo(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleDemoPayment}
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'جاري المعالجة...' : 'تأكيد الدفع'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrafterMembership;
