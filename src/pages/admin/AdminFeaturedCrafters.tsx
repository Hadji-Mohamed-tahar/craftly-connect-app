import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CrafterData } from '@/lib/userDataStructure';
import { Star, MapPin, Award, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface FeaturedCrafter {
  id: string;
  crafter_uid: string;
  added_by: string;
  added_at: any;
  notes?: string;
}

const AdminFeaturedCrafters: React.FC = () => {
  const [featuredCrafters, setFeaturedCrafters] = useState<(FeaturedCrafter & { crafterData?: CrafterData })[]>([]);
  const [allCrafters, setAllCrafters] = useState<CrafterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedCrafters();
    fetchAllCrafters();
  }, []);

  const fetchFeaturedCrafters = async () => {
    try {
      const featuredRef = collection(db, 'featured_crafters');
      const snapshot = await getDocs(featuredRef);
      
      const featured: (FeaturedCrafter & { crafterData?: CrafterData })[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeaturedCrafter));

      // Get crafter details
      for (const featured_crafter of featured) {
        const craftersRef = collection(db, 'users');
        const q = query(
          craftersRef,
          where('uid', '==', featured_crafter.crafter_uid),
          where('userType', '==', 'crafter')
        );
        
        const crafterSnapshot = await getDocs(q);
        if (!crafterSnapshot.empty) {
          featured_crafter.crafterData = crafterSnapshot.docs[0].data() as CrafterData;
        }
      }

      setFeaturedCrafters(featured);
    } catch (error) {
      console.error('Error fetching featured crafters:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الحرفيين المميزين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCrafters = async () => {
    try {
      const craftersRef = collection(db, 'users');
      const q = query(
        craftersRef,
        where('userType', '==', 'crafter'),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      const crafters: CrafterData[] = [];
      
      snapshot.forEach((doc) => {
        crafters.push(doc.data() as CrafterData);
      });

      setAllCrafters(crafters);
    } catch (error) {
      console.error('Error fetching all crafters:', error);
    }
  };

  const addFeaturedCrafter = async (crafterUid: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({
          title: 'خطأ',
          description: 'يجب تسجيل الدخول أولاً',
          variant: 'destructive',
        });
        return;
      }

      // Check if already featured
      const existing = featuredCrafters.find(fc => fc.crafter_uid === crafterUid);
      if (existing) {
        toast({
          title: 'تحذير',
          description: 'هذا الحرفي مميز بالفعل',
          variant: 'destructive',
        });
        return;
      }

      await addDoc(collection(db, 'featured_crafters'), {
        crafter_uid: crafterUid,
        added_by: currentUser.uid,
        added_at: serverTimestamp(),
      });

      toast({
        title: 'نجح',
        description: 'تمت إضافة الحرفي إلى القائمة المميزة',
      });

      setIsAddDialogOpen(false);
      fetchFeaturedCrafters();
    } catch (error) {
      console.error('Error adding featured crafter:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة الحرفي المميز',
        variant: 'destructive',
      });
    }
  };

  const removeFeaturedCrafter = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'featured_crafters', id));
      
      toast({
        title: 'نجح',
        description: 'تمت إزالة الحرفي من القائمة المميزة',
      });

      fetchFeaturedCrafters();
    } catch (error) {
      console.error('Error removing featured crafter:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة الحرفي المميز',
        variant: 'destructive',
      });
    }
  };

  const filteredCrafters = allCrafters.filter(crafter => 
    crafter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crafter.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCrafters = filteredCrafters.filter(crafter => 
    !featuredCrafters.some(fc => fc.crafter_uid === crafter.uid)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الحرفيين المميزين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة الحرفيين الذين يظهرون في قائمة أفضل الحرفيين
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة حرفي مميز
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة حرفي مميز</DialogTitle>
              <DialogDescription>
                اختر حرفياً لإضافته إلى قائمة الحرفيين المميزين
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="ابحث عن حرفي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="space-y-3">
                {availableCrafters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا يوجد حرفيين متاحين
                  </p>
                ) : (
                  availableCrafters.map((crafter) => (
                    <Card key={crafter.uid} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={crafter.avatar} alt={crafter.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {crafter.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{crafter.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary" className="text-xs">
                                  {crafter.specialty}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {crafter.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addFeaturedCrafter(crafter.uid)}
                          >
                            إضافة
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      ) : featuredCrafters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا يوجد حرفيين مميزين</h3>
            <p className="text-muted-foreground mb-4">قم بإضافة حرفيين لعرضهم في قائمة أفضل الحرفيين</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة حرفي مميز
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {featuredCrafters.map((featured) => (
            <Card key={featured.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={featured.crafterData?.avatar} alt={featured.crafterData?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {featured.crafterData?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{featured.crafterData?.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {featured.crafterData?.specialty}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFeaturedCrafter(featured.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{featured.crafterData?.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">• {featured.crafterData?.completedOrders} عمل منجز</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{featured.crafterData?.serviceArea?.join(', ') || featured.crafterData?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>{featured.crafterData?.experience}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedCrafters;
