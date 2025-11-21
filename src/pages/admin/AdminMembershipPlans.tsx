import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, Calendar, Package } from 'lucide-react';
import { getMembershipPlans, createMembershipPlan, updateMembershipPlan } from '@/lib/services/membershipPlanService';
import { MembershipPlan } from '@/lib/types/earnings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminMembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'SAR',
    durationDays: 365,
    features: [''],
    isActive: true
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await getMembershipPlans(false); // Load all plans including inactive
    setPlans(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        await updateMembershipPlan(editingPlan.id!, planData);
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث خطة العضوية',
        });
      } else {
        await createMembershipPlan(planData);
        toast({
          title: 'تم الإنشاء بنجاح',
          description: 'تم إنشاء خطة العضوية الجديدة',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadPlans();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الخطة',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      features: plan.features,
      isActive: plan.isActive
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    try {
      await updateMembershipPlan(plan.id!, { isActive: !plan.isActive });
      toast({
        title: 'تم التحديث',
        description: plan.isActive ? 'تم إيقاف الخطة' : 'تم تفعيل الخطة',
      });
      loadPlans();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة الخطة',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      currency: 'SAR',
      durationDays: 365,
      features: [''],
      isActive: true
    });
    setEditingPlan(null);
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">خطط العضوية</h1>
          <p className="text-muted-foreground mt-1">إدارة خطط العضوية المتاحة للحرفيين</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              إضافة خطة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'تعديل الخطة' : 'خطة عضوية جديدة'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'قم بتعديل تفاصيل الخطة' : 'أضف خطة عضوية جديدة للحرفيين'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">اسم الخطة</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: عضوية بريميوم"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف تفصيلي للخطة"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">السعر</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="499"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="SAR"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">المدة (بالأيام)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                  placeholder="365"
                  required
                />
              </div>

              <div>
                <Label>المميزات</Label>
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="أدخل ميزة"
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="w-full"
                  >
                    <Plus size={16} className="ml-2" />
                    إضافة ميزة
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">تفعيل الخطة</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPlan ? 'تحديث' : 'إنشاء'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.isActive && 'opacity-60'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>
                {!plan.isActive && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">معطلة</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground">{plan.currency}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>{plan.durationDays} يوم</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Package size={16} />
                  المميزات:
                </p>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                  className="flex-1"
                >
                  <Edit size={14} className="ml-1" />
                  تعديل
                </Button>
                <Button
                  variant={plan.isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleToggleActive(plan)}
                  className="flex-1"
                >
                  {plan.isActive ? 'إيقاف' : 'تفعيل'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد خطط عضوية</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة خطة عضوية جديدة للحرفيين</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus size={18} className="ml-2" />
              إضافة أول خطة
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}