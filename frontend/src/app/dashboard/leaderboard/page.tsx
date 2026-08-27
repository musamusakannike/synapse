'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Zap } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { LeaderboardUser } from '@/lib/types';
import Link from 'next/link';

type Timeframe = '24h' | '3d' | '1w' | '1m';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await leaderboardApi.get(timeframe);
        if (!active) return;
        if (response.data?.success) {
          setLeaderboard(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [timeframe]);

  const timeframeLabels: Record<Timeframe, string> = {
    '24h': 'Past 24 Hours',
    '3d': 'Past 3 Days',
    '1w': 'Past 1 Week',
    '1m': 'Past 1 Month',
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--brand-gold-100)] p-3 text-[var(--brand-gold-600)]">
              <Trophy className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-[var(--font-display)] font-bold text-[var(--ink-900)] lg:text-3xl">
                XP Leaderboard
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                See top learners earning XP across SabiLearn.
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector Tabs */}
        <div className="inline-flex self-start rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] p-1 md:self-auto">
          {(['24h', '3d', '1w', '1m'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all md:text-sm ${
                timeframe === tf
                  ? 'bg-[var(--surface-card)] text-[var(--ink-900)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--ink-900)]'
              }`}
            >
              {timeframeLabels[tf]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-[var(--brand-gold)] border-t-transparent" />
          <p className="text-sm font-medium text-[var(--text-muted)]">Loading leaderboard rankings...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-12 text-center">
          <Trophy className="mx-auto mb-3 size-12 text-[var(--ink-300)]" />
          <h3 className="mb-1 text-lg font-bold text-[var(--ink-900)]">No XP Earned Yet</h3>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Be the first to complete a lesson topic or exercise in the {timeframeLabels[timeframe].toLowerCase()}!
          </p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-gold)] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-105"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium Display */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 items-end gap-4 pt-4 md:grid-cols-3">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="relative order-2 flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-6 text-center shadow-xs md:order-1">
                  <div className="absolute -top-4 flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                    2
                  </div>
                  <div className="mb-3 flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100 text-xl font-bold text-slate-700">
                    {topThree[1].avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={topThree[1].avatar} alt={topThree[1].name} className="size-full object-cover" />
                    ) : (
                      topThree[1].name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3 className="max-w-full truncate text-base font-bold text-[var(--ink-900)]">
                    {topThree[1].name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Zap className="size-4 fill-amber-500 text-amber-500" />
                    <span>{topThree[1].periodXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Center / Taller) */}
              {topThree[0] && (
                <div className="relative order-1 flex transform flex-col items-center rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-[var(--surface-card)] p-8 text-center shadow-md md:order-2 md:-translate-y-2">
                  <div className="absolute -top-5 flex size-10 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-base font-extrabold text-slate-950 shadow-md">
                    1
                  </div>
                  <div className="mb-3 flex size-20 items-center justify-center overflow-hidden rounded-full border-3 border-amber-400 bg-amber-100 text-2xl font-extrabold text-amber-800 shadow-sm">
                    {topThree[0].avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={topThree[0].avatar} alt={topThree[0].name} className="size-full object-cover" />
                    ) : (
                      topThree[0].name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="mb-2 rounded-full bg-amber-200/60 px-3 py-1 text-xs font-bold text-amber-900">
                    Top Champion
                  </span>
                  <h3 className="max-w-full truncate text-lg font-extrabold text-[var(--ink-900)]">
                    {topThree[0].name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-extrabold text-amber-600">
                    <Zap className="size-5 fill-amber-500 text-amber-500" />
                    <span>{topThree[0].periodXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="relative order-3 flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-6 text-center shadow-xs">
                  <div className="absolute -top-4 flex size-8 items-center justify-center rounded-full border-2 border-white bg-amber-700 text-sm font-bold text-amber-100 shadow-sm">
                    3
                  </div>
                  <div className="mb-3 flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber-700/30 bg-amber-900/10 text-xl font-bold text-amber-800">
                    {topThree[2].avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={topThree[2].avatar} alt={topThree[2].name} className="size-full object-cover" />
                    ) : (
                      topThree[2].name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3 className="max-w-full truncate text-base font-bold text-[var(--ink-900)]">
                    {topThree[2].name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <Zap className="size-4 fill-amber-500 text-amber-500" />
                    <span>{topThree[2].periodXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-sunken)]/50 px-6 py-4 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center">Rank</span>
                <span>Learner</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="hidden sm:inline">Streak</span>
                <span>XP ({timeframeLabels[timeframe]})</span>
              </div>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {leaderboard.map((user, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--surface-sunken)] ${
                      rank <= 3 ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          rank === 1
                            ? 'bg-amber-400 text-black'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-[var(--surface-sunken)] text-[var(--text-muted)]'
                        }`}
                      >
                        {rank}
                      </span>

                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-gold-100)] text-sm font-bold text-[var(--brand-gold-600)]">
                        {user.avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={user.avatar} alt={user.name} className="size-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--ink-900)]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">
                          {user.level || 'Learner'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-8">
                      {user.currentStreak !== undefined && (
                        <div className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 sm:flex">
                          <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                          <span>{user.currentStreak}d streak</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink-900)]">
                        <Zap className="size-4 fill-amber-500 text-amber-500" />
                        <span>{user.periodXp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
