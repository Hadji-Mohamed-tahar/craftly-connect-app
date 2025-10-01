import React from 'react';
import { Users, FileText, ShoppingCart, TrendingUp, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { stats, loading, users, orders } = useAdmin();

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const recentUsers = users.slice(-5).reverse();
  const activeOrders = orders.filter(order => order.status === 'inProgress').slice(-5);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">لوحة التحكم الإدارية</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            إدارة شاملة لجميع عمليات المنصة
          </p>
        </div>
        <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
          تحديث البيانات
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="admin-grid">
        <StatsCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers}
          description="العدد الكلي للمسجلين"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="الزبائن"
          value={stats.totalClients}
          description="المستخدمين الطالبين للخدمات"
          icon={Users}
        />
        <StatsCard
          title="الحرفيين"
          value={stats.totalCrafters}
          description="مقدمي الخدمات"
          icon={Users}
        />
        <StatsCard
          title="الطلبات الكلية"
          value={orders.length}
          description="جميع طلبات الخدمات"
          icon={FileText}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="الطلبات النشطة"
          value={stats.activeOrders}
          description="قيد التنفيذ حاليًا"
          icon={Clock}
        />
        <StatsCard
          title="الطلبات المكتملة"
          value={stats.completedOrders}
          description="تم إنجازها بنجاح"
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="إجمالي الأرباح"
          value={`${stats.totalRevenue.toLocaleString()} ر.س`}
          description="من العمولات والاشتراكات"
          icon={DollarSign}
          trend={{ value: 23, isPositive: true }}
        />
        <StatsCard
          title="النمو الشهري"
          value={`${stats.monthlyGrowth}%`}
          description="مقارنة بالشهر الماضي"
          icon={TrendingUp}
          trend={{ value: stats.monthlyGrowth, isPositive: true }}
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              المستخدمين الجدد
            </CardTitle>
            <CardDescription>آخر 5 مستخدمين مسجلين</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={user.userType === 'crafter' ? 'default' : 'secondary'}>
                  {user.userType === 'crafter' ? 'حرفي' : 'زبون'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              الطلبات النشطة
            </CardTitle>
            <CardDescription>قيد التنفيذ حاليًا</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.title || 'طلب خدمة'}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.amount ? `${order.amount} ر.س` : 'لم يحدد السعر'}
                  </p>
                </div>
                <Badge>نشط</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}