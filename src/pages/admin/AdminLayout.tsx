import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { logout, adminData } = useAdminAuth();

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