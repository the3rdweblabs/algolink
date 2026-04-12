// src/components/notifications/NotificationItem.tsx
'use client';

import type React from 'react';
import { AlertCircle, CheckCircle2, Info, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'], className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'info':
      return <Info className={cn("h-5 w-5 text-blue-500", className)} />;
    case 'success':
      return <CheckCircle2 className={cn("h-5 w-5 text-green-500", className)} />;
    case 'warning':
      return <AlertCircle className={cn("h-5 w-5 text-yellow-500", className)} />;
    case 'message':
    default:
      return <MessageSquareText className={cn("h-5 w-5 text-primary", className)} />;
  }
};

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-4 border-b border-border/30",
        notification.read ? "opacity-70 hover:opacity-100" : "bg-transparent hover:bg-accent/20 dark:hover:bg-neutral-700/30",
        "transition-opacity duration-200"
      )}
    >
      <NotificationIcon type={notification.type} className="mt-1 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{notification.title}</p>
          {!notification.read && onMarkAsRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs text-primary hover:underline focus:outline-none"
              aria-label={`Mark notification "${notification.title}" as read`}
            >
              Mark read
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground/70">
          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(notification.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

