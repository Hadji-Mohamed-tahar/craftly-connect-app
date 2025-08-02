import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Bell, CheckCircle, AlertCircle, DollarSign, MessageCircle } from 'lucide-react';
import { useProposals, Notification } from '../contexts/ProposalContext';

const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationAsRead, getUnreadNotificationsCount } = useProposals();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'proposal_received':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'proposal_accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'proposal_rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'request_closed':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'order_started':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'order_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'الآن';
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} يوم`;
    }
  };

  const unreadCount = getUnreadNotificationsCount();
  const recentNotifications = notifications.slice(0, 10);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">الإشعارات</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 10 && (
              <div className="p-3 border-t">
                <Button variant="ghost" className="w-full text-sm">
                  عرض جميع الإشعارات
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;