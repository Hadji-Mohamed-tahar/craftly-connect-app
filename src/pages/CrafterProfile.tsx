import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CrafterData } from '@/lib/userDataStructure';
import { ArrowRight, Star, MapPin, Award, Clock, Phone, Mail, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CrafterProfile: React.FC = () => {
  const { crafterId } = useParams<{ crafterId: string }>();
  const navigate = useNavigate();
  const [crafter, setCrafter] = useState<CrafterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrafterProfile();
  }, [crafterId]);

  const fetchCrafterProfile = async () => {
    if (!crafterId) return;
    
    setLoading(true);
    try {
      const craftersRef = collection(db, 'users');
      const crafterQuery = query(
        craftersRef,
        where('uid', '==', crafterId),
        where('userType', '==', 'crafter')
      );
      
      const crafterSnapshot = await getDocs(crafterQuery);
      if (!crafterSnapshot.empty) {
        const data = crafterSnapshot.docs[0].data() as CrafterData;
        setCrafter(data);
      }
    } catch (error) {
      console.error('Error fetching crafter profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!crafter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">لم يتم العثور على الملف الشخصي</h3>
          <Button onClick={() => navigate('/best-crafters')}>العودة للقائمة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/best-crafters')}
            className="gap-2 mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={crafter.avatar} alt={crafter.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {crafter.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-bold mb-2">{crafter.name}</h1>
              <Badge variant="secondary" className="mb-3">
                {crafter.specialty}
              </Badge>
              
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-lg">{crafter.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({crafter.completedOrders} طلب)</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Award className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">الخبرة</p>
                <p className="font-semibold">{crafter.experience}</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">الأعمال المنجزة</p>
                <p className="font-semibold">{crafter.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">معلومات الاتصال</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium">{crafter.phone}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{crafter.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">مناطق الخدمة</p>
                <p className="font-medium">{crafter.serviceArea?.join(', ') || crafter.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        {crafter.priceRange && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">نطاق الأسعار</h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">
                  {crafter.priceRange.min} - {crafter.priceRange.max} ريال
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Working Hours */}
        {crafter.workingHours && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">أوقات العمل</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">ساعات العمل</p>
                  <p className="font-medium">
                    من {crafter.workingHours.start} إلى {crafter.workingHours.end}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">أيام العمل</p>
                  <p className="font-medium">{crafter.workingHours.workingDays?.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {crafter.certifications && crafter.certifications.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">الشهادات والمؤهلات</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {crafter.certifications.map((cert, idx) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1">
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Images */}
        {crafter.portfolioImages && crafter.portfolioImages.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">معرض الأعمال</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {crafter.portfolioImages.map((image, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image}
                      alt={`عمل ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1" size="lg">
            طلب خدمة
          </Button>
          <Button variant="outline" size="lg" className="flex-1">
            محادثة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrafterProfile;
