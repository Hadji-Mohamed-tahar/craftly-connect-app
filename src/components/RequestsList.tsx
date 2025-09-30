import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Clock, User, MessageCircle, DollarSign, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useProposals, ServiceRequest } from '../contexts/ProposalContext';
import { useAuth } from '../contexts/AuthContext';

interface RequestsListProps {
  requests: ServiceRequest[];
  showProposalButton?: boolean;
  title?: string;
}

const RequestsList: React.FC<RequestsListProps> = ({ 
  requests, 
  showProposalButton = false,
  title = "الطلبات المتاحة"
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { createProposal } = useProposals();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [proposalData, setProposalData] = useState({
    price: '',
    duration: '',
    notes: ''
  });

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">في انتظار الموافقة</Badge>;
      case 'open':
        return <Badge variant="default" className="bg-green-100 text-green-800">مفتوح للعروض</Badge>;
      case 'closed':
        return <Badge variant="secondary">مغلق</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-600">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleProposal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setProposalData({
      price: '',
      duration: '',
      notes: ''
    });
    setShowProposalModal(true);
  };

  const handleSubmitProposal = async () => {
    if (!selectedRequest || !proposalData.price || !proposalData.duration) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      setShowErrorModal(true);
      return;
    }

    setSubmitting(true);
    try {
      await createProposal({
        requestId: selectedRequest.id,
        price: parseFloat(proposalData.price),
        duration: proposalData.duration,
        notes: proposalData.notes
      });
      
      setShowProposalModal(false);
      setShowSuccessModal(true);
      setProposalData({
        price: '',
        duration: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
      setErrorMessage('حدث خطأ أثناء إرسال العرض');
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500">لا توجد طلبات متاحة في الوقت الحالي</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {request.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">التصنيف: </span>
                    <Badge variant="outline">{request.category}</Badge>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">الوصف:</span>
                    <p className="text-gray-600 mt-1">{request.description}</p>
                  </div>

                  {request.images && request.images.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">الصور المرفقة: </span>
                      <span className="text-sm text-gray-500">({request.images.length} صور)</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {/* زر عرض التفاصيل متاح للجميع */}
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/request/${request.id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      عرض التفاصيل
                    </Button>

                    {/* زر تقديم عرض للحرفيين فقط */}
                    {showProposalButton && userProfile?.userType === 'crafter' && request.status === 'open' && (
                      <Button 
                        onClick={() => handleProposal(request)}
                        className="flex-1"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        تقديم عرض
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Proposal Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تقديم عرض</DialogTitle>
            <DialogDescription>
              قدم عرضك لطلب: {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر (د.ج) *</Label>
              <Input
                id="price"
                type="number"
                value={proposalData.price}
                onChange={(e) => setProposalData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="مثال: 5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">المدة المتوقعة *</Label>
              <Input
                id="duration"
                type="text"
                value={proposalData.duration}
                onChange={(e) => setProposalData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="مثال: 3 أيام"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                value={proposalData.notes}
                onChange={(e) => setProposalData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أي ملاحظات أو تفاصيل إضافية..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowProposalModal(false)}
              disabled={submitting}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmitProposal}
              disabled={submitting}
            >
              {submitting ? 'جارٍ الإرسال...' : 'إرسال العرض'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <DialogTitle>تم إرسال العرض بنجاح</DialogTitle>
            </div>
            <DialogDescription>
              تم إرسال عرضك بنجاح. سيتم إشعار العميل وسيمكنه مراجعة عرضك.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)}>حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <DialogTitle>خطأ</DialogTitle>
            </div>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorModal(false)}>حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestsList;