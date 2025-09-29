import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import RequestForm from '../components/RequestForm';
import RequestsList from '../components/RequestsList';
import ProposalsList from '../components/ProposalsList';
import { useProposals } from '../contexts/ProposalContext';
import { useAuth } from '../contexts/AuthContext';

const ClientRequests: React.FC = () => {
  const { userProfile } = useAuth();
  const { requests, proposals } = useProposals();
  const [activeTab, setActiveTab] = useState('my-requests');

  if (userProfile?.userType !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">هذه الصفحة متاحة للعملاء فقط</p>
        </div>
      </div>
    );
  }

  // Filter requests and proposals for this client
  const clientRequests = requests.filter(r => r.clientId === userProfile.uid);
  const clientRequestIds = clientRequests.map(r => r.id);
  const clientProposals = proposals.filter(p => clientRequestIds.includes(p.requestId));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
            <Button 
              onClick={() => setActiveTab('new-request')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              طلب جديد
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-requests">طلباتي ({clientRequests.length})</TabsTrigger>
              <TabsTrigger value="proposals">العروض المستلمة ({clientProposals.length})</TabsTrigger>
              <TabsTrigger value="new-request">طلب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="my-requests" className="mt-6">
              <RequestsList 
                requests={clientRequests}
                title="طلباتي"
              />
            </TabsContent>

            <TabsContent value="proposals" className="mt-6">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">العروض المستلمة</h2>
                  <p className="text-gray-600 mb-6">اختر من بين العروض المقدمة من الحرفيين لطلباتك المعتمدة</p>
                  
                  <ProposalsList 
                    proposals={clientProposals}
                    title=""
                    showAcceptReject={true}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="new-request" className="mt-6">
              <RequestForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientRequests;