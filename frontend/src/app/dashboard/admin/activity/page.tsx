'use client';

import React, { useEffect, useState } from 'react';
import { Activity as ActivityIcon, CreditCard, HelpCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface RecentActivity {
  _id: string;
  user: { name: string; firstName: string; lastName: string } | string;
  course: { title: string } | string;
  type: 'flashcard' | 'mcq';
  flashcardsStudied: number;
  mcqAnswered: number;
  mcqCorrect: number;
  score: number;
  createdAt: string;
}

function AdminActivityContent() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flashcard' | 'mcq'>('all');

  useEffect(() => {
    adminApi.recentActivity().then((res) => setActivities(res.data.data || [])).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter((a) => a.type === filter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AdminPageHeader title="Recent activity" description="Latest study sessions across the platform" />

      <Tabs
        tabs={[{ value: 'all', label: 'All' }, { value: 'flashcard', label: 'Flashcards' }, { value: 'mcq', label: 'MCQs' }]}
        active={filter}
        onChange={(v) => setFilter(v as any)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ActivityIcon className="w-12 h-12" />} title="No activity" description="No study sessions recorded yet." />
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const userName = (a.user && typeof a.user === 'object') ? (a.user.name || `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || 'Unknown') : (typeof a.user === 'string' ? a.user : 'Unknown');
            const courseTitle = (a.course && typeof a.course === 'object') ? (a.course.title || 'Unknown') : (typeof a.course === 'string' ? a.course : 'Unknown');
            return (
              <Card key={a._id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${a.type === 'flashcard' ? 'bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]' : 'bg-[var(--brand-violet-100)] text-[var(--brand-violet-600)]'}`}>
                      {a.type === 'flashcard' ? <CreditCard className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--ink-900)]">
                        <span className="font-medium">{userName}</span> <span className="text-[var(--text-muted)]">studied</span> <span className="text-[var(--brand-gold-600)]">{courseTitle}</span>
                      </p>
                      <p className="text-xs text-[var(--ink-300)] mt-1">
                        {a.type === 'flashcard' ? `${a.flashcardsStudied} flashcards studied` : `${a.mcqAnswered} MCQs answered (${a.mcqCorrect} correct, ${a.score}% score)`} · {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge tone={a.type === 'flashcard' ? 'gold' : 'violet'}>{a.type}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminActivityPage() {
  return (
    <AdminGuard>
      <AdminActivityContent />
    </AdminGuard>
  );
}
