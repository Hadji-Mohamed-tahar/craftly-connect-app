import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const { logout, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Double check: must be admin type AND verified as admin
  if (!isAdmin || userProfile?.userType !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <div className="min-h-screen flex w-full bg-background admin-layout">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="admin-header sticky top-0 z-40 w-full border-b">
            <div className="flex h-12 sm:h-14 items-center justify-between px-3 sm:px-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <SidebarTrigger />
                <h2 className="font-semibold text-sm sm:text-base">نظام إدارة المنصة</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="gap-2 text-xs sm:text-sm"
              >
                <LogOut size={14} className="sm:size-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}