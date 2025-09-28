import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Shield,
  Bell,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const adminMenuItems = [
  {
    title: 'لوحة التحكم',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'إدارة المستخدمين',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'إدارة الطلبات',
    url: '/admin/requests',
    icon: FileText,
  },
  {
    title: 'التقارير والإحصائيات',
    url: '/admin/analytics',
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar className="border-l border-border" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base sm:text-lg font-bold text-primary px-2 py-4">
            لوحة الإدارة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-[1.02]'
                        }`
                      }
                    >
                      <item.icon size={18} className="shrink-0" />
                      <span className="text-sm sm:text-base truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}