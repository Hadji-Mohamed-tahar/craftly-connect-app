import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Shield, Trash2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const { users, updateUserStatus, deleteUser, loading } = useAdmin();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      await updateUserStatus(userId, { verified });
      toast({
        title: verified ? 'تم التحقق من المستخدم' : 'تم إلغاء التحقق',
        description: 'تم تحديث حالة المستخدم بنجاح',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في تحديث حالة المستخدم',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟`)) {
      try {
        await deleteUser(userId);
        toast({
          title: 'تم حذف المستخدم',
          description: 'تم حذف المستخدم من النظام',
        });
      } catch (error) {
        toast({
          title: 'حدث خطأ',
          description: 'فشل في حذف المستخدم',
          variant: 'destructive',
        });
      }
    }
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      await updateUserStatus(userId, { blocked });
      toast({
        title: blocked ? 'تم حظر المستخدم' : 'تم إلغاء حظر المستخدم',
        description: 'تم تحديث حالة المستخدم بنجاح',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'فشل في تحديث حالة المستخدم',
        variant: 'destructive',
      });
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
        <h1 className="text-xl sm:text-2xl font-bold">إدارة المستخدمين</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8 w-full sm:w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستخدمين</SelectItem>
              <SelectItem value="client">الزبائن</SelectItem>
              <SelectItem value="crafter">الحرفيين</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle>قائمة المستخدمين ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="table-container">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.userType === 'crafter' ? 'default' : 'secondary'}>
                      {user.userType === 'crafter' ? 'حرفي' : 'زبون'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {user.verified && (
                        <Badge variant="outline" className="w-fit">
                          <UserCheck size={12} className="ml-1" />
                          موثق
                        </Badge>
                      )}
                      {user.blocked && (
                        <Badge variant="destructive" className="w-fit">
                          <UserX size={12} className="ml-1" />
                          محظور
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.userType === 'crafter' && (
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{user.rating || 0}</span>
                        <span className="text-muted-foreground text-sm">
                          ({user.completedOrders || 0} طلب)
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleVerifyUser(user.id, !user.verified)}
                        >
                          <UserCheck className="ml-2 h-4 w-4" />
                          {user.verified ? 'إلغاء التوثيق' : 'توثيق المستخدم'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBlockUser(user.id, !user.blocked)}
                        >
                          <Shield className="ml-2 h-4 w-4" />
                          {user.blocked ? 'إلغاء الحظر' : 'حظر المستخدم'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف المستخدم
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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