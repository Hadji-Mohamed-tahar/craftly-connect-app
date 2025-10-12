import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CrafterData, SPECIALTIES, SUPPORTED_CITIES } from '@/lib/userDataStructure';
import { Star, MapPin, Award, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const BestCrafters: React.FC = () => {
  const [crafters, setCrafters] = useState<CrafterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBestCrafters();
  }, [selectedCity, selectedSpecialty]);

  const fetchBestCrafters = async () => {
    setLoading(true);
    try {
      // Get featured crafters UIDs
      const featuredRef = collection(db, 'featured_crafters');
      const featuredSnapshot = await getDocs(featuredRef);
      const featuredUIDs = featuredSnapshot.docs.map(doc => doc.data().crafter_uid);

      if (featuredUIDs.length === 0) {
        setCrafters([]);
        setLoading(false);
        return;
      }

      // Get crafter details
      const craftersRef = collection(db, 'users');
      const craftersData: CrafterData[] = [];

      for (const uid of featuredUIDs) {
        const crafterQuery = query(
          craftersRef,
          where('uid', '==', uid),
          where('userType', '==', 'crafter'),
          where('status', '==', 'active')
        );
        
        const crafterSnapshot = await getDocs(crafterQuery);
        crafterSnapshot.forEach((doc) => {
          const data = doc.data() as CrafterData;
          
          // Apply filters
          const cityMatch = selectedCity === 'all' || data.serviceArea?.includes(selectedCity);
          const specialtyMatch = selectedSpecialty === 'all' || data.specialty === selectedSpecialty;
          
          if (cityMatch && specialtyMatch) {
            craftersData.push(data);
          }
        });
      }

      // Sort by rating and completed orders
      craftersData.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.completedOrders - a.completedOrders;
      });

      setCrafters(craftersData);
    } catch (error) {
      console.error('Error fetching crafters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedSpecialty('all');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">أفضل الحرفيين</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              فلترة
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">المدينة</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المدن</SelectItem>
                      {SUPPORTED_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">التخصص</label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع التخصصات</SelectItem>
                      {SPECIALTIES.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  إعادة تعيين
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          </div>
        ) : crafters.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا يوجد حرفيين</h3>
            <p className="text-muted-foreground">لم يتم العثور على حرفيين بالمعايير المحددة</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {crafters.map((crafter, index) => (
              <Card key={crafter.uid} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={crafter.avatar} alt={crafter.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {crafter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{crafter.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {crafter.specialty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{crafter.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{crafter.serviceArea?.join(', ') || crafter.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>{crafter.experience} خبرة</span>
                  </div>

                  <div className="pt-2 text-sm">
                    <span className="text-muted-foreground">عدد الأعمال المنجزة: </span>
                    <span className="font-semibold text-foreground">{crafter.completedOrders}</span>
                  </div>

                  {crafter.certifications && crafter.certifications.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">الشهادات:</p>
                      <div className="flex flex-wrap gap-1">
                        {crafter.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-4" size="sm">
                    عرض الملف الشخصي
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestCrafters;
