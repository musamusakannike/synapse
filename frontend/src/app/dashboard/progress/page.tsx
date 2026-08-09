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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-1">Your progress</h1>
        <p className="text-sm text-[var(--text-muted)]">Track your study performance and achievements</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                <Icon className="w-5 h-5" style={{ color: stat.tone }} />
              </div>
              <p className="text-2xl font-bold text-[var(--ink-900)]">{stat.value}</p>
              <p className="text-xs text-[var(--ink-300)] mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {stats?.dailyGoal && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[var(--ink-900)]">Today&apos;s goal</h3>
            <span className="text-sm text-[var(--text-muted)]">{stats.dailyGoal.studiedMinutes}/{stats.dailyGoal.minutes} min</span>
          </div>
          <ProgressBar value={stats.dailyGoal.progress} tone={stats.dailyGoal.met ? 'success' : 'gold'} />
          {stats.dailyGoal.met && (
            <p className="text-xs font-medium mt-2" style={{ color: 'var(--success)' }}>Goal reached today. Nice work!</p>
          )}
        </Card>
      )}

      {continueStudying.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">Continue studying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueStudying.map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              const pct = progress.flashcardsTotal > 0 ? (progress.flashcardsStudied / progress.flashcardsTotal) * 100 : 0;
              return (
                <Card key={progress._id} className="p-5">
                  {topic && <p className="text-xs text-[var(--brand-gold-600)] font-semibold uppercase tracking-wide mb-1">{course?.title}</p>}
                  <h3 className="font-semibold text-[var(--ink-900)] mb-1">{topic?.title || course?.title}</h3>
                  <p className="text-xs text-[var(--ink-300)] mb-4">{course?.category}</p>
                  <ProgressBar value={pct} label={`Flashcards ${progress.flashcardsStudied}/${progress.flashcardsTotal}`} />
                  {topic && course && (
                    <Link href={`/dashboard/courses/${course._id}/topics/${topic._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-gold-600)] hover:opacity-80 mt-3">
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
        <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-[var(--warning)]" /> Needs improvement
        </h2>
        {needsImprovement.length === 0 ? (
          <EmptyState icon={<Target className="w-12 h-12" />} title="No weak areas detected" description="Keep studying and your performance will be tracked here." />
        ) : (
          <div className="space-y-3">
            {needsImprovement.map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              return (
                <Card key={progress._id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      {topic && <p className="text-xs text-[var(--brand-gold-600)] font-semibold uppercase tracking-wide mb-0.5">{course?.title}</p>}
                      <h3 className="text-sm font-medium text-[var(--ink-900)]">{topic?.title || course?.title}</h3>
                      <p className="text-xs text-[var(--ink-300)] mt-0.5">{progress.mcqsCorrect} / {progress.mcqsAttempted} correct</p>
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
