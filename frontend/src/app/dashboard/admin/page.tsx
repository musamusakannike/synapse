'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, BookOpen, CreditCard, HelpCircle, Activity as ActivityIcon, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Analytics {
  totalUsers: number;
  totalCourses: number;
  totalTopics: number;
  totalFlashcards: number;
  totalMcqs: number;
  activeSessions: number;
}
interface CoursePerformance { courseId: string; title: string; category: string; enrollment: number; avgScore: number }
interface RecentActivity {
  _id: string;
  user: { name: string; firstName: string; lastName: string } | string;
  course: { title: string } | string;
  type: 'flashcard' | 'mcq';
  flashcardsStudied: number;
  mcqAnswered: number;
  mcqCorrect: number;
  createdAt: string;
}
interface UserGrowth { date: string; count: number }

function AdminOverview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, p, act, g] = await Promise.all([adminApi.analytics(), adminApi.coursePerformance(), adminApi.recentActivity(), adminApi.userGrowth()]);
        setAnalytics(a.data.data);
        setCoursePerformance(p.data.data);
        setRecentActivity(act.data.data);
        setUserGrowth(g.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <AdminPageHeader title="Admin overview" description="Platform analytics and activity at a glance" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total users" value={analytics?.totalUsers ?? 0} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Total courses" value={analytics?.totalCourses ?? 0} icon={<BookOpen className="w-5 h-5" />} />
        <StatCard label="Total topics" value={analytics?.totalTopics ?? 0} icon={<Layers className="w-5 h-5" />} />
        <StatCard label="Flashcards" value={analytics?.totalFlashcards ?? 0} icon={<CreditCard className="w-5 h-5" />} />
        <StatCard label="MCQs" value={analytics?.totalMcqs ?? 0} icon={<HelpCircle className="w-5 h-5" />} />
        <StatCard label="Active (24h)" value={analytics?.activeSessions ?? 0} icon={<ActivityIcon className="w-5 h-5" />} />
      </div>

      {userGrowth.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">User growth (30 days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="count" stroke="var(--brand-gold-600)" strokeWidth={2} dot={{ fill: 'var(--brand-gold-600)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink-900)]">Top courses</h2>
            <Link href="/dashboard/admin/courses" className="text-sm text-[var(--brand-gold-600)] hover:opacity-80">View all</Link>
          </div>
          <div className="space-y-2">
            {coursePerformance.slice(0, 5).map((c) => (
              <Link key={c.courseId} href={`/dashboard/admin/courses/${c.courseId}`}>
                <Card className="p-4 hover:shadow-[var(--shadow-sm)] transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-[var(--ink-900)] truncate">{c.title}</h3>
                      <p className="text-xs text-[var(--ink-300)] mt-1">{c.category}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-center"><p className="text-[var(--ink-900)] font-semibold">{c.enrollment}</p><p className="text-[var(--ink-300)]">enrolled</p></div>
                      <div className="text-center"><p className="text-[var(--ink-900)] font-semibold">{c.avgScore}%</p><p className="text-[var(--ink-300)]">avg</p></div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {coursePerformance.length === 0 && <p className="text-sm text-[var(--ink-300)] text-center py-8">No courses yet</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink-900)]">Recent activity</h2>
            <Link href="/dashboard/admin/activity" className="text-sm text-[var(--brand-gold-600)] hover:opacity-80">View all</Link>
          </div>
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((a) => {
              const userName = typeof a.user === 'object' ? a.user.name || `${a.user.firstName} ${a.user.lastName}` : 'Unknown';
              const courseTitle = typeof a.course === 'object' ? a.course.title : 'Unknown';
              return (
                <Card key={a._id} className="p-4">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="text-sm text-[var(--ink-900)] truncate">
                      <span className="font-medium">{userName}</span> <span className="text-[var(--text-muted)]">studied</span> <span className="text-[var(--brand-gold-600)]">{courseTitle}</span>
                    </p>
                    <Badge tone={a.type === 'flashcard' ? 'gold' : 'violet'}>{a.type}</Badge>
                  </div>
                  <p className="text-xs text-[var(--ink-300)]">
                    {a.type === 'flashcard' ? `${a.flashcardsStudied} flashcards` : `${a.mcqAnswered} MCQs (${a.mcqCorrect} correct)`} · {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              );
            })}
            {recentActivity.length === 0 && <p className="text-sm text-[var(--ink-300)] text-center py-8">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminOverview />
    </AdminGuard>
  );
}
