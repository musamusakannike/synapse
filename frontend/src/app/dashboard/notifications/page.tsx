'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, Megaphone } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.list();
      setNotifications(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-[var(--success)]" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />;
      case 'announcement': return <Megaphone className="w-5 h-5 text-[var(--brand-gold-600)]" />;
      default: return <Info className="w-5 h-5 text-[var(--text-muted)]" />;
    }
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'just now';
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-1">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={handleMarkAllRead}><CheckCheck className="w-4 h-4" /> Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="w-12 h-12" />} title="No notifications" description="You'll see updates and announcements here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n._id} className={`p-4 ${!n.isRead ? 'border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-100)]/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-[var(--ink-900)]">{n.title}</h3>
                    <span className="text-xs text-[var(--ink-300)] shrink-0">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{n.message}</p>
                  {!n.isRead && (
                    <button onClick={() => handleMarkAsRead(n._id)} className="text-xs text-[var(--brand-gold-600)] hover:opacity-80 mt-2 cursor-pointer">
                      Mark as read
                    </button>
                  )}
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-[var(--brand-gold)] shrink-0 mt-2" />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
