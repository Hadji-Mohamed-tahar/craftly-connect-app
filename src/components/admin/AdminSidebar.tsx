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
    title: 'إدارة الطلبات النشطة',
    url: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'المحادثات',
    url: '/admin/chats',
    icon: MessageSquare,
  },
  {
    title: 'التقارير والإحصائيات',
    url: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'المدفوعات',
    url: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'الإشعارات',
    url: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'الأمان',
    url: '/admin/security',
    icon: Shield,
  },
  {
    title: 'الإعدادات',
    url: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar className="border-l border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary">
            لوحة الإدارة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                    >
                      <item.icon size={20} />
                      <span>{item.title}</span>
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