'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Clock, BookOpen, Target, TrendingDown } from 'lucide-react';
import { progressApi } from '@/lib/api';
import { ProgressStats, UserProgress, Course, Topic } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [needsImprovement, setNeedsImprovement] = useState<UserProgress[]>([]);
  const [continueStudying, setContinueStudying] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, needsRes, continueRes] = await Promise.all([
          progressApi.stats(),
          progressApi.needsImprovement(),
          progressApi.continueStudying(),
        ]);
        setStats(statsRes.data.data);
        setNeedsImprovement(needsRes.data.data);
        setContinueStudying(continueRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const statCards = [
    { label: 'Day streak', value: stats?.streak || 0, icon: Flame, tone: 'var(--warning)', bg: 'var(--warning-100)' },
    { label: "Today's study time", value: `${Math.floor((stats?.todayStudyTime || 0) / 60)}m ${(stats?.todayStudyTime || 0) % 60}s`, icon: Clock, tone: 'var(--brand-gold-600)', bg: 'var(--brand-gold-100)' },
    { label: 'Total sessions', value: stats?.totalSessions || 0, icon: BookOpen, tone: 'var(--success)', bg: 'var(--success-100)' },
    { label: 'Avg accuracy', value: `${stats?.avgAccuracy || 0}%`, icon: Target, tone: 'var(--danger)', bg: 'var(--danger-100)' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-[var(--ink-900)]">Your progress</h1>
        <p className="text-sm text-[var(--text-muted)]">Track your study performance and achievements</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="mb-3 flex size-10 items-center justify-center rounded-[var(--radius-md)]" style={{ background: stat.bg }}>
                <Icon className="size-5" style={{ color: stat.tone }} />
              </div>
              <p className="text-2xl font-bold text-[var(--ink-900)]">{stat.value}</p>
              <p className="mt-1 text-xs text-[var(--ink-300)]">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {stats?.dailyGoal && (
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-[var(--ink-900)]">Today&apos;s goal</h3>
            <span className="text-sm text-[var(--text-muted)]">{stats.dailyGoal.studiedMinutes}/{stats.dailyGoal.minutes} min</span>
          </div>
          <ProgressBar value={stats.dailyGoal.progress} tone={stats.dailyGoal.met ? 'success' : 'gold'} />
          {stats.dailyGoal.met && (
            <p className="mt-2 text-xs font-medium" style={{ color: 'var(--success)' }}>Goal reached today. Nice work!</p>
          )}
        </Card>
      )}

      {continueStudying.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--ink-900)]">Continue studying</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {continueStudying.map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              const totalFc = progress.flashcardsTotal || 0;
              const studiedFc = progress.flashcardsStudied || 0;
              const pct = totalFc > 0 ? (studiedFc / totalFc) * 100 : progress.percentCompleted || 0;
              return (
                <Card key={progress._id} className="p-5">
                  {topic && <p className="mb-1 text-xs font-semibold tracking-wide text-[var(--brand-gold-600)] uppercase">{course?.title}</p>}
                  <h3 className="mb-1 font-semibold text-[var(--ink-900)]">{topic?.title || course?.title}</h3>
                  <p className="mb-4 text-xs text-[var(--ink-300)]">{course?.category}</p>
                  <ProgressBar value={pct} label={totalFc > 0 ? `Flashcards ${studiedFc}/${totalFc}` : `${progress.percentCompleted || 0}% complete`} />
                  {topic && course && (
                    <Link href={`/dashboard/courses/${course._id}/topics/${topic._id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-gold-600)] hover:opacity-80">
                      Continue
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--ink-900)]">
          <TrendingDown className="size-5 text-[var(--warning)]" /> Needs improvement
        </h2>
        {needsImprovement.length === 0 ? (
          <EmptyState icon={<Target className="size-12" />} title="No weak areas detected" description="Keep studying and your performance will be tracked here." />
        ) : (
          <div className="space-y-3">
            {needsImprovement.map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              return (
                <Card key={progress._id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      {topic && <p className="mb-0.5 text-xs font-semibold tracking-wide text-[var(--brand-gold-600)] uppercase">{course?.title}</p>}
                      <h3 className="text-sm font-medium text-[var(--ink-900)]">{topic?.title || course?.title}</h3>
                      <p className="mt-0.5 text-xs text-[var(--ink-300)]">{progress.mcqsCorrect} / {progress.mcqsAttempted} correct</p>
                    </div>
                    <Badge tone="warning">{progress.accuracy}% accuracy</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
