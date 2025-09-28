import React from 'react';
import { TrendingUp, Users, FileText, DollarSign, Activity } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/StatsCard';
import { Progress } from '@/components/ui/progress';

export default function AdminAnalytics() {
  const { stats, users, requests, orders, loading } = useAdmin();

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

  // Calculate additional metrics
  const conversionRate = stats.totalRequests > 0 ? (stats.completedOrders / stats.totalRequests) * 100 : 0;
  const averageOrderValue = stats.completedOrders > 0 ? stats.totalRevenue / stats.completedOrders : 0;
  
  // User registration trends (mock data for demo)
  const monthlyData = [
    { month: 'يناير', users: 45, requests: 23, orders: 18 },
    { month: 'فبراير', users: 52, requests: 31, orders: 24 },
    { month: 'مارس', users: 67, requests: 41, orders: 32 },
    { month: 'أبريل', users: 89, requests: 56, orders: 45 },
    { month: 'مايو', users: 134, requests: 78, orders: 61 },
    { month: 'يونيو', users: 156, requests: 92, orders: 73 },
  ];

  // Top performing crafters
  const topCrafters = users
    .filter(user => user.userType === 'crafter')
    .sort((a, b) => (b.completedOrders || 0) - (a.completedOrders || 0))
    .slice(0, 5);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">التقارير والإحصائيات</h1>
      </div>

      {/* Key Metrics */}
      <div className="admin-grid">
        <StatsCard
          title="معدل التحويل"
          value={`${conversionRate.toFixed(1)}%`}
          description="من الطلبات إلى أوامر مكتملة"
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="متوسط قيمة الطلب"
          value={`${averageOrderValue.toFixed(0)} ر.س`}
          description="المتوسط لكل طلب مكتمل"
          icon={DollarSign}
          trend={{ value: 5.4, isPositive: true }}
        />
        <StatsCard
          title="معدل النشاط"
          value={`${((stats.activeOrders / stats.totalUsers) * 100).toFixed(1)}%`}
          description="نسبة المستخدمين النشطين"
          icon={Activity}
        />
        <StatsCard
          title="رضا العملاء"
          value="4.6/5"
          description="متوسط التقييمات"
          icon={Users}
          trend={{ value: 3.1, isPositive: true }}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        
        {/* Monthly Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>النمو الشهري</CardTitle>
            <CardDescription>المستخدمين والطلبات والأوامر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{month.month}</span>
                    <span className="font-medium">{month.users} مستخدم</span>
                  </div>
                  <Progress value={(month.users / 160) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Crafters */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل الحرفيين أداءً</CardTitle>
            <CardDescription>حسب عدد الطلبات المكتملة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCrafters.map((crafter, index) => (
                <div key={crafter.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{crafter.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {crafter.completedOrders || 0} طلب مكتمل
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">⭐ {crafter.rating || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories Performance */}
      <Card>
        <CardHeader>
          <CardTitle>أداء فئات الخدمات</CardTitle>
          <CardDescription>توزيع الطلبات حسب نوع الخدمة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Mock service categories data */}
            {[
              { name: 'تصميم وديكور', requests: 45, percentage: 35 },
              { name: 'إصلاح وصيانة', requests: 38, percentage: 30 },
              { name: 'تفصيل وخياطة', requests: 28, percentage: 22 },
              { name: 'طبخ وحلويات', requests: 17, percentage: 13 },
            ].map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.requests} طلب
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {category.percentage}% من إجمالي الطلبات
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الإيرادات</CardTitle>
          <CardDescription>تفصيل مصادر الدخل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {(stats.totalRevenue * 0.15).toLocaleString()} ر.س
              </div>
              <div className="text-sm text-muted-foreground">عمولات الطلبات (15%)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">0 ر.س</div>
              <div className="text-sm text-muted-foreground">اشتراكات مميزة</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-amber-600">
                {(stats.totalRevenue * 0.05).toLocaleString()} ر.س
              </div>
              <div className="text-sm text-muted-foreground">رسوم إضافية</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}