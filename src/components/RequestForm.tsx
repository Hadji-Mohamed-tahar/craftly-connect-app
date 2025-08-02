import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useProposals } from '../contexts/ProposalContext';
import { useAuth } from '../contexts/AuthContext';

const categories = [
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

const RequestForm: React.FC = () => {
  const { userProfile } = useAuth();
  const { createRequest } = useProposals();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    images: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      setShowErrorModal(true);
      return;
    }

    if (userProfile?.userType !== 'client') {
      setErrorMessage('فقط العملاء يمكنهم إرسال الطلبات');
      setShowErrorModal(true);
      return;
    }

    setSubmitting(true);
    try {
      await createRequest(formData);
      setFormData({
        title: '',
        description: '',
        location: '',
        category: '',
        images: []
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating request:', error);
      setErrorMessage('حدث خطأ أثناء إرسال الطلب');
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For now, just store file names as placeholder
    // In production, you would upload to Firebase Storage
    const newImages = Array.from(files).map(file => file.name);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (userProfile?.userType !== 'client') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">غير مصرح</h2>
            <p className="text-gray-600">فقط العملاء يمكنهم إرسال طلبات الخدمة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>طلب خدمة جديد</CardTitle>
          <CardDescription>
            املأ النموذج أدناه لإرسال طلب خدمة للحرفيين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الطلب *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="مثال: إصلاح مشكلة في السباكة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">نوع الخدمة *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الخدمة" />
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
              <Label htmlFor="description">وصف تفصيلي للمشكلة *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="اشرح المشكلة بالتفصيل..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع *</Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="المدينة أو الحي"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>الصور (اختياري - حتى 5 صور)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">اضغط لرفع الصور</span>
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative bg-gray-100 rounded-lg p-2 text-sm">
                      <span>{image}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <DialogTitle>تم إرسال الطلب بنجاح</DialogTitle>
            </div>
            <DialogDescription>
              تم إرسال طلبك بنجاح. سيتم عرضه للحرفيين وستتلقى عروضاً قريباً.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)}>حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <DialogTitle>خطأ</DialogTitle>
            </div>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorModal(false)}>حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestForm;