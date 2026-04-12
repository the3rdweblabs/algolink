// src/app/actions/notificationActions.ts
'use server';

import db from '@/lib/db';
import { getUserIdFromSession } from '@/lib/auth';
import { randomUUID } from 'crypto';
import type { Notification } from '@/components/notifications/NotificationItem';
import { revalidatePath } from 'next/cache';

export async function getNotifications(): Promise<Notification[]> {
  const userId = await getUserIdFromSession();
  if (!userId) return [];

  try {
    const stmt = db.prepare(`
      SELECT id, type, title, message, read, created_at as timestamp 
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    const rows = stmt.all(userId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      type: row.type as 'info' | 'success' | 'warning' | 'message',
      title: row.title,
      message: row.message,
      read: Boolean(row.read),
      timestamp: new Date(row.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  const userId = await getUserIdFromSession();
  if (!userId) return { success: false };

  try {
    const stmt = db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  const userId = await getUserIdFromSession();
  if (!userId) return { success: false };

  try {
    const stmt = db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?');
    stmt.run(userId);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false };
  }
}

export async function clearAllNotifications() {
  const userId = await getUserIdFromSession();
  if (!userId) return { success: false };

  try {
    const stmt = db.prepare('DELETE FROM notifications WHERE user_id = ?');
    stmt.run(userId);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return { success: false };
  }
}

// Helper function to be called from other server actions
export async function addNotification(userId: string, type: 'info' | 'success' | 'warning' | 'message', title: string, message: string) {
  try {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, read)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    stmt.run(id, userId, type, title, message);
    return { success: true, id };
  } catch (error) {
    console.error('Error adding notification:', error);
    return { success: false };
  }
}
