import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AdminRequests() {
  const { requests, updateRequestStatus, loading } = useAdmin();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = async (requestId: string, status: string) => {
    try {
      await updateRequestStatus(requestId, status);
      toast({
        title: 'تم تحديث حالة الطلب',
        description: `تم تغيير حالة الطلب إلى "${getStatusLabel(status)}"`,
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في تحديث حالة الطلب',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'approved': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock size={12} className="ml-1" />معلق</Badge>;
      case 'approved':
        return <Badge><CheckCircle size={12} className="ml-1" />مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle size={12} className="ml-1" />مرفوض</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle size={12} className="ml-1" />مكتمل</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-fade-in admin-loading">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin ml-2"></div>
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">إدارة الطلبات</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 w-full sm:w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الطلبات</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="approved">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="admin-grid sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">طلبات معلقة</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">طلبات مقبولة</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-muted-foreground">طلبات مرفوضة</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">طلبات مكتملة</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle>قائمة الطلبات ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent className="table-container">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>عنوان الطلب</TableHead>
                <TableHead>الزبون</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>عدد العروض</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.title || 'طلب خدمة'}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {request.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {request.clientName || 'غير محدد'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status || 'pending')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {request.proposals?.length || 0} عرض
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye size={14} className="ml-1" />
                        عرض
                      </Button>
                      <Select
                        value={request.status || 'pending'}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">معلق</SelectItem>
                          <SelectItem value="approved">قبول</SelectItem>
                          <SelectItem value="rejected">رفض</SelectItem>
                          <SelectItem value="completed">إكمال</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}