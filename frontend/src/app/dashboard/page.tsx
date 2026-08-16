'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, FileQuestion, MessageCircleQuestion, Brain, Play, CheckCircle2, ChevronRight } from 'lucide-react';
import { progressApi } from '@/lib/api';
import { Course, Chapter, Topic, ResumptionData } from '@/lib/types';
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
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-1 text-2xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Resume your learning journey or test your knowledge with AI tools.
        </p>
      </div>

      {/* AI Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-800/30 bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 p-6 text-white shadow-xl md:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300 backdrop-blur-sm">
            <Brain className="size-4" />
            <span>AI Skill Guidance</span>
          </div>

          <h2 className="text-2xl leading-tight font-[var(--font-display)] font-extrabold md:text-3xl">
            Don&apos;t know where to start?
          </h2>

          <p className="text-sm leading-relaxed text-violet-100/90 md:text-base">
            Take our AI-powered skill assessment quiz to get personalized course recommendations tailored to your experience level and goals.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard/ai/quiz"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--brand-gold)] px-6 py-3 text-sm font-bold text-slate-950 shadow-md transition-all hover:scale-[1.02] hover:bg-amber-400"
            >
              <span>Start AI Quiz</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 size-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 -mb-16 size-64 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* Course Resumption Section (Max 4 Unfinished Courses) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
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
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>

        {resumptionCards.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-8 text-center">
            <CheckCircle2 className="mx-auto size-10 text-[var(--brand-gold-600)]" />
            <h3 className="text-base font-bold text-[var(--ink-900)]">No active course in progress</h3>
            <p className="mx-auto max-w-md text-xs text-[var(--text-muted)]">
              Start a new course today and your progress will automatically appear here for quick resumption.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-gold)] px-5 py-2.5 text-xs font-semibold text-black transition-all hover:brightness-105"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {resumptionCards.map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const chapter = typeof progress.lastChapter === 'object' ? (progress.lastChapter as Chapter) : null;
              const topic = typeof progress.lastTopic === 'object' ? (progress.lastTopic as Topic) : null;
              const courseId = course?._id || (progress.course as string);
              const isExpanded = expandedAuthors[courseId];

              const authors = course?.authors || [];

              return (
                <Card key={progress._id} className="flex flex-col justify-between border border-[var(--line)] p-5 transition-shadow hover:shadow-md">
                  <div className="space-y-3">
                    {/* Header: Course Title & Difficulty */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="mb-1 truncate text-xs font-bold tracking-wider text-[var(--brand-gold-600)] uppercase">
                          {course?.category || 'Course'}
                        </p>
                        <h3 className="line-clamp-1 text-lg font-bold text-[var(--ink-900)]">
                          {course?.title || 'Course'}
                        </h3>
                      </div>
                      {course && <Badge tone="gold">{course.difficulty}</Badge>}
                    </div>

                    {/* Authors Display */}
                    {authors.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex shrink-0 -space-x-2 overflow-hidden">
                          {authors.slice(0, isExpanded ? authors.length : 3).map((author, aIdx) => (
                            <div
                              key={aIdx}
                              className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[var(--brand-gold-100)] text-xs font-bold text-[var(--brand-gold-600)]"
                              title={author.name}
                            >
                              {author.avatar ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={author.avatar} alt={author.name} className="size-full object-cover" />
                              ) : (
                                author.name.charAt(0).toUpperCase()
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-[var(--text-muted)]">
                            {isExpanded ? (
                              authors.map((a) => a.name).join(', ')
                            ) : (
                              <>
                                {authors[0].name}
                                {authors.length > 1 && (
                                  <button
                                    onClick={() => toggleExpandAuthors(courseId)}
                                    className="ml-1 font-semibold text-[var(--brand-gold-600)] hover:underline"
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
                    <div className="space-y-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] p-3">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span className="truncate font-semibold text-[var(--ink-900)]">
                          {chapter ? `Chapter: ${chapter.title}` : 'Started Chapter'}
                        </span>
                        <span>Page {((progress.lastContentIndex || 0) + 1)}</span>
                      </div>
                      {topic && (
                        <p className="truncate text-xs font-medium text-[var(--ink-700)]">
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-gold)] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-xs transition-all hover:brightness-105"
                    >
                      <Play className="size-3.5 fill-black" />
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
        <h2 className="mb-4 text-lg font-[var(--font-display)] font-bold text-[var(--ink-900)]">
          AI Study Tools
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AIToolCard
            icon={<Sparkles className="size-5" />}
            title="Summarizer"
            description="Turn any lecture note into a clear, short summary."
            onClick={() => setActiveTool('summarizer')}
          />
          <AIToolCard
            icon={<FileQuestion className="size-5" />}
            title="Quiz Generator"
            description="Generate quick practice quizzes on any subject."
            onClick={() => setActiveTool('quiz')}
          />
          <AIToolCard
            icon={<MessageCircleQuestion className="size-5" />}
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
