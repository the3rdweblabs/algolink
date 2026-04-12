// src/components/notifications/NotificationPanel.tsx
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Added for explicit close if needed, though X button is usually present
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NotificationItem, { type Notification } from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BellRing, CheckCheck, Trash2, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkOneAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  unreadCount: number;
}

export default function NotificationPanel({
  notifications,
  onMarkOneAsRead,
  onMarkAllAsRead,
  onClearAll,
  unreadCount
}: NotificationPanelProps) {
  return (
    <DialogContent 
      className={cn(
        "w-full max-w-md flex flex-col p-0 max-h-[90vh] sm:max-h-[85vh]",
        "bg-background/80 dark:bg-neutral-900/80 backdrop-blur-lg border-border/50 shadow-xl" 
      )}
    >
      <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-inherit relative">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <BellRing className="h-6 w-6" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {unreadCount} new
            </span>
          )}
        </DialogTitle>
        <DialogDescription>
          View your recent updates and alerts here.
        </DialogDescription>
      </DialogHeader>
      
      {notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <BellRing className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No notifications yet.</p>
          <p className="text-sm text-muted-foreground/60">Check back later for updates.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto"> 
          <div className="divide-y divide-border/30 pb-4"> 
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkOneAsRead}
              />
            ))}
          </div>
        </ScrollArea>
      )}
      
      {notifications.length > 0 && (
         <DialogFooter className="p-4 border-t border-border/50 bg-muted/30 dark:bg-neutral-800/30 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onMarkAllAsRead} className="w-full sm:w-auto" disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
          <Button variant="destructive" onClick={onClearAll} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" /> Clear all
          </Button>
        </DialogFooter>
      )}
      {/* The X button in DialogContent already handles close. If an explicit button is needed:
      <DialogFooter className="p-4 border-t border-border/30">
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
      */}
    </DialogContent>
  );
}
