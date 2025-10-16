import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Wrench, Star, Edit, Crown, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CrafterData } from '../lib/userDataStructure';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const isCrafter = userProfile.userType === 'crafter';
  const crafterData = isCrafter ? (userProfile as CrafterData) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm sticky top-0 z-10 border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">الملف الشخصي</h1>
            <button
              onClick={() => navigate('/edit-profile')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Header Card */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/80 to-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{userProfile.name}</h2>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
            userProfile.userType === 'client' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-primary/90 text-primary-foreground'
          }`}>
            {userProfile.userType === 'client' ? 'عميل' : 'حرفي'}
          </span>
        </div>

        {/* Basic Information */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">المعلومات الأساسية</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الاسم</p>
                <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                <p className="text-sm font-medium text-foreground">{userProfile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الموقع</p>
                <p className="text-sm font-medium text-foreground">{userProfile.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crafter Information */}
        {isCrafter && crafterData && (
          <>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">معلومات الحرفي</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">التخصص</p>
                    <p className="text-sm font-medium text-foreground">{crafterData.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">سنوات الخبرة</p>
                    <p className="text-sm font-medium text-foreground">{crafterData.experience || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">الإحصائيات</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-xl font-bold text-foreground">{crafterData.rating || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">التقييم</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground mb-1">{crafterData.completedOrders || 0}</p>
                      <p className="text-xs text-muted-foreground">الطلبات المكتملة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Section for Crafters */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">العضوية</h3>
                <Crown className={`w-6 h-6 ${crafterData.membershipType === 'premium' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">نوع العضوية الحالية</p>
                  <p className="text-lg font-bold text-foreground">
                    {crafterData.membershipType === 'premium' ? 'عضوية مميزة' : 'عضوية مجانية'}
                  </p>
                  {crafterData.membershipType === 'premium' && crafterData.membershipExpiresAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      تنتهي في: {new Date(crafterData.membershipExpiresAt).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => navigate('/crafter-membership')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  {crafterData.membershipType === 'premium' ? 'إدارة العضوية' : 'ترقية إلى العضوية المميزة'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full bg-card hover:bg-accent text-foreground py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm border border-border"
        >
          <SettingsIcon className="w-5 h-5" />
          الإعدادات
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-destructive/20"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Profile;
