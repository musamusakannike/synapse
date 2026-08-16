'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Award, User as UserIcon } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { LeaderboardUser } from '@/lib/types';
import Link from 'next/link';

type Timeframe = '24h' | '3d' | '1w' | '1m';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardApi.get(timeframe);
      if (response.data?.success) {
        setLeaderboard(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeframeLabels: Record<Timeframe, string> = {
    '24h': 'Past 24 Hours',
    '3d': 'Past 3 Days',
    '1w': 'Past 1 Week',
    '1m': 'Past 1 Month',
  };

  const topThree = leaderboard.slice(0, 3);
  const remainingUsers = leaderboard.slice(3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] rounded-2xl">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--ink-900)] font-[var(--font-display)]">
                XP Leaderboard
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                See top learners earning XP across SabiLearn.
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector Tabs */}
        <div className="inline-flex p-1 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-xl self-start md:self-auto">
          {(['24h', '3d', '1w', '1m'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
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
          <div className="w-10 h-10 border-4 border-[var(--brand-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--text-muted)] font-medium">Loading leaderboard rankings...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 text-center bg-[var(--surface-card)] rounded-2xl border border-[var(--line)]">
          <Trophy className="w-12 h-12 text-[var(--ink-300)] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--ink-900)] mb-1">No XP Earned Yet</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Be the first to complete a lesson topic or exercise in the {timeframeLabels[timeframe].toLowerCase()}!
          </p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-gold)] text-black font-semibold text-sm rounded-xl hover:brightness-105 transition-all"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Podium Display */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-2 md:order-1 bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl p-6 text-center shadow-xs flex flex-col items-center relative">
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    2
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl mb-3 overflow-hidden border-2 border-slate-300">
                    {topThree[1].avatar ? (
                      <img src={topThree[1].avatar} alt={topThree[1].name} className="w-full h-full object-cover" />
                    ) : (
                      topThree[1].name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3 className="font-bold text-[var(--ink-900)] text-base truncate max-w-full">
                    {topThree[1].name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{topThree[1].periodXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Center / Taller) */}
              {topThree[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-[var(--surface-card)] border-2 border-amber-300 rounded-2xl p-8 text-center shadow-md flex flex-col items-center relative transform md:-translate-y-2">
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-extrabold text-base flex items-center justify-center border-2 border-white shadow-md">
                    1
                  </div>
                  <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-2xl mb-3 overflow-hidden border-3 border-amber-400 shadow-sm">
                    {topThree[0].avatar ? (
                      <img src={topThree[0].avatar} alt={topThree[0].name} className="w-full h-full object-cover" />
                    ) : (
                      topThree[0].name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="px-3 py-1 bg-amber-200/60 text-amber-900 text-xs font-bold rounded-full mb-2">
                    Top Champion
                  </span>
                  <h3 className="font-extrabold text-[var(--ink-900)] text-lg truncate max-w-full">
                    {topThree[0].name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-sm font-extrabold text-amber-600">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>{topThree[0].periodXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl p-6 text-center shadow-xs flex flex-col items-center relative">
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-700 text-amber-100 text-sm font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    3
                  </div>
                  <div className="w-16 h-16 rounded-full bg-amber-900/10 text-amber-800 flex items-center justify-center font-bold text-xl mb-3 overflow-hidden border-2 border-amber-700/30">
                    {topThree[2].avatar ? (
                      <img src={topThree[2].avatar} alt={topThree[2].name} className="w-full h-full object-cover" />
                    ) : (
                      topThree[2].name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h3 className="font-bold text-[var(--ink-900)] text-base truncate max-w-full">
                    {topThree[2].name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{topThree[2].periodXp.toLocaleString()} XP</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-sunken)]/50 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
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
                    className={`px-6 py-4 flex items-center justify-between hover:bg-[var(--surface-sunken)] transition-colors ${
                      rank <= 3 ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-black'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'text-[var(--text-muted)] bg-[var(--surface-sunken)]'
                        }`}
                      >
                        {rank}
                      </span>

                      <div className="w-10 h-10 rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[var(--ink-900)] truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] capitalize">
                          {user.level || 'Learner'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                      {user.currentStreak !== undefined && (
                        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{user.currentStreak}d streak</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--ink-900)]">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
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
