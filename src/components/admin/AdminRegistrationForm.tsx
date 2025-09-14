import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Shield, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { registerAdmin, AdminRegistrationData } from '../../lib/adminRegistration';

const AdminRegistrationForm: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdminRegistrationData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'support',
    department: '',
    employeeId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerAdmin(formData);
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء حساب الإدمن بنجاح",
      });
      
      // إعادة تعيين النموذج
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'support',
        department: '',
        employeeId: ''
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء حساب الإدمن",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          إضافة إدمن جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل *</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="اسم الإدمن"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="admin@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10"
                  placeholder="كلمة مرور قوية"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="+966501234567"
                  required
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">الدور الوظيفي *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">مدير عام</SelectItem>
                  <SelectItem value="moderator">مشرف</SelectItem>
                  <SelectItem value="support">دعم فني</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">رقم الموظف</Label>
              <Input
                id="employeeId"
                type="text"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="EMP001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">القسم</Label>
            <div className="relative">
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="pl-10"
                placeholder="الدعم الفني، إدارة المحتوى، المبيعات..."
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">الصلاحيات حسب الدور:</h4>
            <div className="text-sm text-muted-foreground">
              {formData.role === 'super_admin' && (
                <p>• مدير عام: جميع الصلاحيات (إدارة المستخدمين، الطلبات، التحليلات، النظام)</p>
              )}
              {formData.role === 'moderator' && (
                <p>• مشرف: إدارة المستخدمين والطلبات والتحليلات والإشعارات</p>
              )}
              {formData.role === 'support' && (
                <p>• دعم فني: إدارة الطلبات وعرض التحليلات</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الإنشاء...
              </div>
            ) : (
              'إنشاء حساب الإدمن'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminRegistrationForm;