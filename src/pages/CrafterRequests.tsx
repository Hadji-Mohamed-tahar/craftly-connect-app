import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import RequestsList from '../components/RequestsList';
import ProposalsList from '../components/ProposalsList';
import { useProposals } from '../contexts/ProposalContext';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  'جميع التخصصات',
  'نجارة',
  'سباكة', 
  'كهرباء',
  'دهان',
  'بلاط وأرضيات',
  'تكييف وتبريد',
  'حدادة',
  'زجاج ونوافذ',
  'حدائق وزراعة',
  'أخرى'
];

const CrafterRequests: React.FC = () => {
  const { userProfile } = useAuth();
  const { requests, proposals } = useProposals();
  const [activeTab, setActiveTab] = useState('available-requests');
  const [categoryFilter, setCategoryFilter] = useState('جميع التخصصات');
  const [locationFilter, setLocationFilter] = useState('');

  if (userProfile?.userType !== 'crafter') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600">هذه الصفحة متاحة للحرفيين فقط</p>
        </div>
      </div>
    );
  }

  // Filter available requests (open requests)
  const availableRequests = requests.filter(r => r.status === 'open');
  
  // Apply filters
  const filteredRequests = availableRequests.filter(request => {
    const matchesCategory = categoryFilter === 'جميع التخصصات' || request.category === categoryFilter;
    const matchesLocation = !locationFilter || request.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesCategory && matchesLocation;
  });

  // Get crafter's proposals
  const crafterProposals = proposals.filter(p => p.crafterId === userProfile.uid);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">الطلبات المتاحة</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available-requests">
                الطلبات المتاحة ({filteredRequests.length})
              </TabsTrigger>
              <TabsTrigger value="my-proposals">
                عروضي ({crafterProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available-requests" className="mt-6">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">التخصص</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">الموقع</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="ابحث بالموقع..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <RequestsList 
                requests={filteredRequests}
                title={`الطلبات المتاحة (${filteredRequests.length})`}
                showProposalButton={true}
              />
            </TabsContent>

            <TabsContent value="my-proposals" className="mt-6">
              <ProposalsList 
                proposals={crafterProposals}
                title="عروضي المرسلة"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CrafterRequests;