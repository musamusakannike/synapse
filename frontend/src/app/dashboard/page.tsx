'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, FileQuestion, MessageCircleQuestion, Brain, Play, CheckCircle2, ChevronRight, User as UserIcon } from 'lucide-react';
import { progressApi } from '@/lib/api';
import { Course, UserProgress, Chapter, Topic, ResumptionData } from '@/lib/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AIToolCard from '@/components/ui/AIToolCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SummarizerDialog, QuizGeneratorDialog, QAAIDialog } from '@/components/ai/AIToolDialogs';

type ActiveTool = 'summarizer' | 'quiz' | 'qa' | null;

export default function DashboardHome() {
  const [resumptionData, setResumptionData] = useState<ResumptionData>({ resumptionCards: [], totalUnfinished: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [expandedAuthors, setExpandedAuthors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await progressApi.dashboardResumption();
        if (res.data?.success) {
          setResumptionData(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load dashboard resumption data:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const toggleExpandAuthors = (courseId: string) => {
    setExpandedAuthors((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { resumptionCards, totalUnfinished } = resumptionData;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-1 font-[var(--font-display)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Resume your learning journey or test your knowledge with AI tools.
        </p>
      </div>

      {/* AI Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 text-white p-6 md:p-10 shadow-xl border border-violet-800/30">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-400/30 backdrop-blur-sm">
            <Brain className="w-4 h-4" />
            <span>AI Skill Guidance</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-display)] leading-tight">
            Don't know where to start?
          </h2>

          <p className="text-violet-100/90 text-sm md:text-base leading-relaxed">
            Take our AI-powered skill assessment quiz to get personalized course recommendations tailored to your experience level and goals.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard/ai/quiz"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[var(--brand-gold)] text-slate-950 font-bold text-sm rounded-xl shadow-md hover:bg-amber-400 hover:scale-[1.02] transition-all"
            >
              <span>Start AI Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Course Resumption Section (Max 4 Unfinished Courses) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--ink-900)]">Course Resumption</h2>
            <p className="text-xs text-[var(--text-muted)]">Continue reading from where you left off</p>
          </div>

          {totalUnfinished > 4 && (
            <Link
              href="/dashboard/progress"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-gold-600)] hover:underline"
            >
              <span>See More ({totalUnfinished})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {resumptionCards.length === 0 ? (
          <div className="p-8 text-center bg-[var(--surface-card)] rounded-2xl border border-[var(--line)] space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[var(--brand-gold-600)] mx-auto" />
            <h3 className="font-bold text-[var(--ink-900)] text-base">No active course in progress</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Start a new course today and your progress will automatically appear here for quick resumption.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-gold)] text-black font-semibold text-xs rounded-xl hover:brightness-105 transition-all"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumptionCards.map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const chapter = typeof progress.lastChapter === 'object' ? (progress.lastChapter as Chapter) : null;
              const topic = typeof progress.lastTopic === 'object' ? (progress.lastTopic as Topic) : null;
              const courseId = course?._id || (progress.course as string);
              const isExpanded = expandedAuthors[courseId];

              const authors = course?.authors || [];

              return (
                <Card key={progress._id} className="p-5 flex flex-col justify-between border border-[var(--line)] hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Header: Course Title & Difficulty */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--brand-gold-600)] uppercase tracking-wider mb-1 truncate">
                          {course?.category || 'Course'}
                        </p>
                        <h3 className="font-bold text-[var(--ink-900)] text-lg line-clamp-1">
                          {course?.title || 'Course'}
                        </h3>
                      </div>
                      {course && <Badge tone="gold">{course.difficulty}</Badge>}
                    </div>

                    {/* Authors Display */}
                    {authors.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex -space-x-2 overflow-hidden shrink-0">
                          {authors.slice(0, isExpanded ? authors.length : 3).map((author, aIdx) => (
                            <div
                              key={aIdx}
                              className="w-7 h-7 rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] flex items-center justify-center font-bold text-xs border-2 border-white overflow-hidden shrink-0"
                              title={author.name}
                            >
                              {author.avatar ? (
                                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                              ) : (
                                author.name.charAt(0).toUpperCase()
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {isExpanded ? (
                              authors.map((a) => a.name).join(', ')
                            ) : (
                              <>
                                {authors[0].name}
                                {authors.length > 1 && (
                                  <button
                                    onClick={() => toggleExpandAuthors(courseId)}
                                    className="ml-1 text-[var(--brand-gold-600)] font-semibold hover:underline"
                                  >
                                    +{authors.length - 1} more
                                  </button>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Detail: Exact Chapter, Topic & Page */}
                    <div className="p-3 bg-[var(--surface-sunken)] rounded-xl space-y-1.5 border border-[var(--line)]">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--ink-900)] truncate">
                          {chapter ? `Chapter: ${chapter.title}` : 'Started Chapter'}
                        </span>
                        <span>Page {((progress.lastContentIndex || 0) + 1)}</span>
                      </div>
                      {topic && (
                        <p className="text-xs font-medium text-[var(--ink-700)] truncate">
                          Topic: {topic.title}
                        </p>
                      )}
                      <div className="pt-1">
                        <ProgressBar value={progress.percentCompleted || 0} label={`${progress.percentCompleted || 0}% Complete`} />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Link
                      href={`/dashboard/courses/${courseId}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--brand-gold)] text-slate-950 font-bold text-xs rounded-xl hover:brightness-105 transition-all shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Continue Learning</span>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Study Tools */}
      <div>
        <h2 className="text-lg font-bold text-[var(--ink-900)] mb-4 font-[var(--font-display)]">
          AI Study Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AIToolCard
            icon={<Sparkles className="w-5 h-5" />}
            title="Summarizer"
            description="Turn any lecture note into a clear, short summary."
            onClick={() => setActiveTool('summarizer')}
          />
          <AIToolCard
            icon={<FileQuestion className="w-5 h-5" />}
            title="Quiz Generator"
            description="Generate quick practice quizzes on any subject."
            onClick={() => setActiveTool('quiz')}
          />
          <AIToolCard
            icon={<MessageCircleQuestion className="w-5 h-5" />}
            title="Q&A AI"
            description="Ask any study question and get an instant clear answer."
            onClick={() => setActiveTool('qa')}
          />
        </div>
      </div>

      {/* AI Dialog Modals */}
      <SummarizerDialog open={activeTool === 'summarizer'} onClose={() => setActiveTool(null)} />
      <QuizGeneratorDialog open={activeTool === 'quiz'} onClose={() => setActiveTool(null)} />
      <QAAIDialog open={activeTool === 'qa'} onClose={() => setActiveTool(null)} />
    </div>
  );
}
