import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { CrafterData } from '@/lib/userDataStructure';
import { Membership, getUserMembership } from '@/lib/membershipService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FeaturedRequest {
  id: string;
  crafterUid: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  notes?: string;
  adminNotes?: string;
  reviewedAt?: string;
  crafterData?: CrafterData;
  membership?: Membership;
}

const AdminFeaturedRequests = () => {
  const [requests, setRequests] = useState<FeaturedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<FeaturedRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const requestsSnapshot = await getDocs(collection(db, 'featured_requests'));
      
      const requestsData: FeaturedRequest[] = await Promise.all(
        requestsSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Fetch crafter data
          const crafterDoc = await getDoc(doc(db, 'users', data.crafterUid));
          const crafterData = crafterDoc.exists() ? crafterDoc.data() as CrafterData : undefined;
          
          // Fetch membership data
          const membership = await getUserMembership(data.crafterUid);

          return {
            id: docSnapshot.id,
            ...data,
            crafterData,
            membership,
          } as FeaturedRequest;
        })
      );

      // Sort: pending first, then by date
      requestsData.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      });

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: FeaturedRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
  };

  const processRequest = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);

      await updateDoc(doc(db, 'featured_requests', selectedRequest.id), {
        status,
        adminNotes,
        reviewedAt: new Date().toISOString(),
      });

      // If approved, add to featured_crafters
      if (status === 'approved') {
        const featuredCollection = collection(db, 'featured_crafters');
        const existingQuery = query(
          featuredCollection,
          where('crafter_uid', '==', selectedRequest.crafterUid)
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (existingSnapshot.empty) {
          await addDoc(featuredCollection, {
            crafter_uid: selectedRequest.crafterUid,
            added_at: new Date().toISOString(),
            added_by: 'admin',
            notes: adminNotes,
          });
        }
      }

      toast({
        title: status === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب',
        description: status === 'approved' 
          ? 'تم إضافة الحرفي إلى قائمة المميزين'
          : 'تم رفض طلب الحرفي',
      });

      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في معالجة الطلب',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">طلبات الظهور المميز</h1>
          <p className="text-muted-foreground mt-1">
            مراجعة واعتماد طلبات الحرفيين للظهور في قائمة أفضل الحرفيين
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">لا توجد طلبات</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {request.crafterData?.name || 'حرفي'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.crafterData?.specialty} - {request.crafterData?.location}
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.status === 'approved'
                          ? 'default'
                          : request.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {request.status === 'pending' && (
                        <>
                          <Clock className="w-3 h-3 ml-1" />
                          قيد المراجعة
                        </>
                      )}
                      {request.status === 'approved' && (
                        <>
                          <CheckCircle className="w-3 h-3 ml-1" />
                          مقبول
                        </>
                      )}
                      {request.status === 'rejected' && (
                        <>
                          <XCircle className="w-3 h-3 ml-1" />
                          مرفوض
                        </>
                      )}
                    </Badge>
                  </div>

                  {request.crafterData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">التقييم: </span>
                        <span className="font-medium">⭐ {request.crafterData.rating.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الطلبات: </span>
                        <span className="font-medium">{request.crafterData.completedOrders}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الخبرة: </span>
                        <span className="font-medium">{request.crafterData.experience}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">العضوية: </span>
                        <Badge variant={request.membership?.type === 'premium' ? 'default' : 'secondary'}>
                          {request.membership?.type === 'premium' ? 'مميزة' : 'مجانية'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {request.notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">ملاحظات الحرفي: </span>
                        {request.notes}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    تاريخ التقديم: {new Date(request.requestedAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <Button
                      onClick={() => handleReview(request)}
                      variant="outline"
                    >
                      مراجعة
                    </Button>
                  )}
                  {request.status !== 'pending' && request.adminNotes && (
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAdminNotes(request.adminNotes || '');
                      }}
                      variant="outline"
                    >
                      عرض الملاحظات
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>مراجعة الطلب</DialogTitle>
            <DialogDescription>
              قم بمراجعة طلب الحرفي واتخاذ القرار المناسب
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold text-foreground">
                  {selectedRequest.crafterData?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.crafterData?.specialty} - {selectedRequest.crafterData?.experience} خبرة
                </p>
                <div className="flex gap-4 text-sm">
                  <span>⭐ {selectedRequest.crafterData?.rating.toFixed(1)}</span>
                  <span>📦 {selectedRequest.crafterData?.completedOrders} طلب مكتمل</span>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    ملاحظات الحرفي:
                  </label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  ملاحظات الإدارة:
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  rows={4}
                  disabled={selectedRequest.status !== 'pending'}
                />
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => processRequest('approved')}
                    disabled={processing}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    {processing ? 'جاري المعالجة...' : 'قبول'}
                  </Button>
                  <Button
                    onClick={() => processRequest('rejected')}
                    disabled={processing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    {processing ? 'جاري المعالجة...' : 'رفض'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeaturedRequests;
