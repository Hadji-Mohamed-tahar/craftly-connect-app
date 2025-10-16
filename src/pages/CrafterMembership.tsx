import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, CheckCircle, Clock, XCircle } from 'lucide-react';
import { CrafterData } from '@/lib/userDataStructure';

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
  const [loading, setLoading] = useState(true);
  const [requestNotes, setRequestNotes] = useState('');
  const [featuredRequest, setFeaturedRequest] = useState<FeaturedRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const upgradeToPremium = async () => {
    if (!currentUser || !crafterData) return;

    try {
      setSubmitting(true);
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // سنة واحدة

      await updateDoc(doc(db, 'users', currentUser.uid), {
        membershipType: 'premium',
        membershipExpiresAt: expiresAt.toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'تم الترقية بنجاح',
        description: 'تم ترقية حسابك إلى العضوية المميزة',
      });

      fetchCrafterData();
    } catch (error) {
      console.error('Error upgrading membership:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في ترقية العضوية',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeaturedRequest = async () => {
    if (!currentUser || !crafterData) return;

    if (crafterData.membershipType !== 'premium') {
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

  if (!crafterData) {
    return null;
  }

  const isPremium = crafterData.membershipType === 'premium';
  const canRequestFeatured = isPremium && !featuredRequest;

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
          
          {isPremium && crafterData.membershipExpiresAt && (
            <p className="text-sm text-muted-foreground">
              تنتهي في: {new Date(crafterData.membershipExpiresAt).toLocaleDateString('ar-SA')}
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
                onClick={upgradeToPremium} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'جاري الترقية...' : 'الترقية الآن'}
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

            {featuredRequest ? (
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
      </div>
    </div>
  );
};

export default CrafterMembership;
