'use client';

import React, { useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Info,
  X,
  Trash2,
  Check,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '@/store/notification.store';
import { Notification } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NotificationDrawer() {
  const {
    isOpen,
    notifications,
    unreadCount,
    isLoading,
    filter,
    closeDrawer,
    setFilter,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press & lock body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeDrawer]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="size-4 text-[var(--success)]" />;
      case 'warning':
        return <AlertTriangle className="size-4 text-[var(--warning)]" />;
      case 'announcement':
        return <Megaphone className="size-4 text-[var(--brand-gold-600)]" />;
      default:
        return <Info className="size-4 text-[var(--brand-violet)]" />;
    }
  };

  const getTypeBackground = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-[var(--success-100)]';
      case 'warning':
        return 'bg-[var(--warning-100)]';
      case 'announcement':
        return 'bg-[var(--brand-gold-100)]';
      default:
        return 'bg-[var(--brand-violet-100)]';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications Drawer"
        className={`fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l border-[var(--line)] bg-[var(--surface-card)] shadow-2xl transition-transform duration-300 ease-in-out sm:w-[440px] md:w-[480px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]">
              <Bell className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-[var(--font-display)] font-bold tracking-tight text-[var(--ink-900)]">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[var(--brand-gold)] px-2 py-0.5 text-[11px] font-bold text-[var(--ink-900)]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                  : 'All notifications caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeDrawer}
              className="flex size-9 items-center justify-center rounded-full text-[var(--ink-500)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]"
              aria-label="Close notifications drawer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Action Bar & Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-page)]/70 px-6 py-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[var(--ink-900)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-[var(--ink-900)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="group flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-gold-600)] transition-colors hover:text-[var(--brand-gold)]"
            >
              <CheckCheck className="size-3.5 transition-transform group-hover:scale-110" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications Content List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {isLoading && notifications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <LoadingSpinner size="md" />
              <p className="text-xs text-[var(--text-muted)]">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-[var(--ink-300)]">
                <Bell className="size-7 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--ink-900)]">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="mt-1 max-w-[240px] text-xs text-[var(--text-muted)]">
                {filter === 'unread'
                  ? 'You have read all your notifications. Check the "All" tab to review past activity.'
                  : 'When updates, achievements, or announcements arrive, they will appear right here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((n) => {
                const isExternal = n.actionUrl?.startsWith('http');
                return (
                  <div
                    key={n._id}
                    className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                      !n.isRead
                        ? 'border-[var(--brand-gold)]/40 bg-[var(--brand-gold-100)]/20 shadow-xs'
                        : 'border-[var(--line)] bg-[var(--surface-card)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-page)]/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type icon badge */}
                      <div
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${getTypeBackground(
                          n.type
                        )}`}
                      >
                        {getIcon(n.type)}
                      </div>

                      {/* Notification details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[var(--ink-900)] leading-snug">
                            {n.title}
                          </h4>
                          <span className="shrink-0 text-[11px] text-[var(--ink-300)]">
                            {formatTime(n.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[var(--text-body)] leading-relaxed">
                          {n.message}
                        </p>

                        {/* Action buttons & Links */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--line)]/50">
                          <div className="flex items-center gap-3">
                            {!n.isRead && (
                              <button
                                onClick={() => markAsRead(n._id)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-gold-600)] transition-colors hover:text-[var(--ink-900)]"
                              >
                                <Check className="size-3" />
                                <span>Mark read</span>
                              </button>
                            )}

                            {n.actionUrl && (
                              isExternal ? (
                                <a
                                  href={n.actionUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-gold-600)] transition-colors hover:underline"
                                  onClick={() => {
                                    if (!n.isRead) markAsRead(n._id);
                                  }}
                                >
                                  <span>View details</span>
                                  <ExternalLink className="size-3" />
                                </a>
                              ) : (
                                <Link
                                  href={n.actionUrl}
                                  onClick={() => {
                                    if (!n.isRead) markAsRead(n._id);
                                    closeDrawer();
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-gold-600)] transition-colors hover:underline"
                                >
                                  <span>View details</span>
                                  <ArrowRight className="size-3" />
                                </Link>
                              )
                            )}
                          </div>

                          <button
                            onClick={() => removeNotification(n._id)}
                            className="text-[var(--ink-300)] opacity-0 transition-all hover:text-[var(--danger)] group-hover:opacity-100 p-1"
                            title="Delete notification"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Unread indicator dot */}
                      {!n.isRead && (
                        <div
                          className="mt-1 size-2 shrink-0 rounded-full bg-[var(--brand-gold)]"
                          title="Unread"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-[var(--line)] bg-[var(--surface-page)] px-6 py-3 text-center">
          <p className="text-[11px] text-[var(--ink-300)]">
            Synapse Learning • Automatic updates enabled
          </p>
        </div>
      </aside>
    </>
  );
}
