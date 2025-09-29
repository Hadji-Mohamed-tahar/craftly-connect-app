import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Star, User, Clock, DollarSign, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useProposals, Proposal } from '../contexts/ProposalContext';
import { useAuth } from '../contexts/AuthContext';

interface ProposalsListProps {
  proposals: Proposal[];
  title?: string;
  showAcceptReject?: boolean;
}

const ProposalsList: React.FC<ProposalsListProps> = ({ 
  proposals, 
  title = "العروض المستلمة",
  showAcceptReject = false
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { acceptProposal, rejectProposal } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [processing, setProcessing] = useState(false);

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      case 'frozen':
        return <Badge variant="secondary">مجمد</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAction = (proposal: Proposal, action: 'accept' | 'reject') => {
    setSelectedProposal(proposal);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedProposal) return;

    setProcessing(true);
    try {
      if (actionType === 'accept') {
        await acceptProposal(selectedProposal.id, selectedProposal.requestId);
      } else {
        await rejectProposal(selectedProposal.id);
      }
      setShowConfirmModal(false);
    } catch (error) {
      console.error(`Error ${actionType}ing proposal:`, error);
    } finally {
      setProcessing(false);
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد عروض</h3>
            <p className="text-gray-500">لا توجد عروض متاحة في الوقت الحالي</p>
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
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {proposal.crafterName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{proposal.crafterSpecialty}</span>
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(proposal.crafterRating))}
                          <span className="text-sm">({proposal.crafterRating.toFixed(1)})</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(proposal.createdAt)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(proposal.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">السعر:</span>
                      <p className="text-lg font-bold text-green-600">{proposal.price.toLocaleString()} د.ج</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">المدة المتوقعة:</span>
                      <p className="text-gray-600">{proposal.duration}</p>
                    </div>
                  </div>

                  {proposal.notes && (
                    <div>
                      <span className="font-medium text-gray-700">ملاحظات:</span>
                      <p className="text-gray-600 mt-1">{proposal.notes}</p>
                    </div>
                  )}

                  {proposal.updatedAt && (
                    <div className="text-sm text-gray-500">
                      آخر تحديث: {formatDate(proposal.updatedAt)}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/chat/${proposal.requestId}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      محادثة
                    </Button>

                    {showAcceptReject && userProfile?.userType === 'client' && proposal.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleAction(proposal, 'accept')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          قبول
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleAction(proposal, 'reject')}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              {actionType === 'accept' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <DialogTitle>
                {actionType === 'accept' ? 'تأكيد قبول العرض' : 'تأكيد رفض العرض'}
              </DialogTitle>
            </div>
            <DialogDescription>
              {actionType === 'accept' 
                ? `هل أنت متأكد من قبول عرض ${selectedProposal?.crafterName}؟ سيتم تجميد باقي العروض وبدء العمل رسمياً.`
                : `هل أنت متأكد من رفض عرض ${selectedProposal?.crafterName}؟ لن يتمكن من تعديل العرض بعد الرفض.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              disabled={processing}
            >
              إلغاء
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={processing}
              variant={actionType === 'accept' ? 'default' : 'destructive'}
            >
              {processing ? 'جارٍ المعالجة...' : (actionType === 'accept' ? 'تأكيد القبول' : 'تأكيد الرفض')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProposalsList;