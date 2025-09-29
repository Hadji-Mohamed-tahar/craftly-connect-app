import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, MessageCircle, CheckCircle, X } from 'lucide-react';
import { useProposals } from '../contexts/ProposalContext';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ProposalsList from '../components/ProposalsList';
import OrderProgress from '../components/OrderProgress';

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, proposals } = useProposals();
  const { userProfile, currentUser } = useAuth();
  
  const request = requests.find(r => r.id === id);
  const requestProposals = proposals.filter(p => p.requestId === id);
  
  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">الطلب غير موجود</h2>
          <Button onClick={() => navigate('/client-requests')}>
            العودة للطلبات
          </Button>
        </div>
      </div>
    );
  }

  const isMyRequest = userProfile?.userType === 'client' && request.clientId === currentUser?.uid;
  const canViewProposals = isMyRequest && request.status === 'open';
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">في انتظار الموافقة</Badge>;
      case 'open':
        return <Badge className="bg-green-100 text-green-800">مفتوح للعروض</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">مكتمل</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/client-requests')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">تفاصيل الطلب</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Request Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{request.title}</CardTitle>
                {getStatusBadge(request.status)}
              </div>
              <div className="text-lg font-medium text-green-600">
                طلب خدمة
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">{request.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>الفئة: {request.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date(request.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{request.location}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Progress */}
        {isMyRequest && (
          <OrderProgress 
            status={request.status as any}
            title="حالة الطلب"
            showDetails={true}
          />
        )}

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              معلومات العميل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-800">{request.clientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-800">{request.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Section - Only for clients with approved requests */}
        {canViewProposals && (
          <Card>
            <CardHeader>
              <CardTitle>العروض المقدمة ({requestProposals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {requestProposals.length > 0 ? (
                <ProposalsList 
                  proposals={requestProposals}
                  title=""
                  showAcceptReject={true}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-500">لم يتم استلام أي عروض بعد</p>
                  <p className="text-gray-400 text-sm">سيتم إشعارك عند وصول عروض جديدة</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Messages */}
        {request.status === 'pending' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">في انتظار الموافقة</h3>
                <p className="text-yellow-700">
                  طلبك قيد المراجعة من قبل فريق الإدارة. سيتم إشعارك فور الموافقة عليه.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {request.status === 'open' && requestProposals.length === 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-800 mb-2">متاح للحرفيين</h3>
                <p className="text-blue-700">
                  طلبك معتمد ومتاح للحرفيين. ستصلك العروض قريباً.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;