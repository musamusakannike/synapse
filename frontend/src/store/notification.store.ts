'use client';

import { create } from 'zustand';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/lib/types';

interface NotificationState {
  isOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  filter: 'all' | 'unread';
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setFilter: (filter: 'all' | 'unread') => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  isOpen: false,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  filter: 'all',

  openDrawer: () => {
    set({ isOpen: true });
    get().fetchNotifications();
  },

  closeDrawer: () => set({ isOpen: false }),

  toggleDrawer: () => {
    const nextState = !get().isOpen;
    set({ isOpen: nextState });
    if (nextState) {
      get().fetchNotifications();
    }
  },

  setFilter: (filter) => set({ filter }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationApi.list();
      const list: Notification[] = res.data?.data || [];
      const unread = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    const prev = get().notifications;
    const updated = prev.map((n) => (n._id === id ? { ...n, isRead: true } : n));
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });

    try {
      await notificationApi.markRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert if failed
      set({ notifications: prev, unreadCount: prev.filter((n) => !n.isRead).length });
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    const prev = get().notifications;
    const updated = prev.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });

    try {
      await notificationApi.markAllRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Revert if failed
      set({ notifications: prev, unreadCount: prev.filter((n) => !n.isRead).length });
    }
  },

  removeNotification: async (id: string) => {
    // Optimistic update
    const prev = get().notifications;
    const updated = prev.filter((n) => n._id !== id);
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });

    try {
      await notificationApi.remove(id);
    } catch (err) {
      console.error('Failed to remove notification:', err);
      // Revert if failed
      set({ notifications: prev, unreadCount: prev.filter((n) => !n.isRead).length });
    }
  },
}));
