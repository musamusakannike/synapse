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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await notificationApi.list();
        if (active) setNotifications(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

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
      case 'success': return <CheckCircle className="size-5 text-[var(--success)]" />;
      case 'warning': return <AlertTriangle className="size-5 text-[var(--warning)]" />;
      case 'announcement': return <Megaphone className="size-5 text-[var(--brand-gold-600)]" />;
      default: return <Info className="size-5 text-[var(--text-muted)]" />;
    }
  };

  const formatTime = (date: string, nowTime = new Date().getTime()) => {
    const diff = nowTime - new Date(date).getTime();
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-[var(--ink-900)]">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={handleMarkAllRead}><CheckCheck className="size-4" /> Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="size-12" />} title="No notifications" description="You'll see updates and announcements here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n._id} className={`p-4 ${!n.isRead ? 'border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-100)]/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-[var(--ink-900)]">{n.title}</h3>
                    <span className="shrink-0 text-xs text-[var(--ink-300)]">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    {!n.isRead && (
                      <button onClick={() => handleMarkAsRead(n._id)} className="cursor-pointer text-xs font-medium text-[var(--brand-gold-600)] hover:opacity-80">
                        Mark as read
                      </button>
                    )}
                    {n.actionUrl && (
                      <a
                        href={n.actionUrl}
                        target={n.actionUrl.startsWith('http') ? '_blank' : undefined}
                        rel={n.actionUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-xs font-semibold text-[var(--brand-gold-600)] hover:underline"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
                {!n.isRead && <div className="mt-2 size-2 shrink-0 rounded-full bg-[var(--brand-gold)]" />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
