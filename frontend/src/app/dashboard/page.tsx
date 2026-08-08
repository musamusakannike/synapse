'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, FileQuestion, Layers, MessageCircleQuestion } from 'lucide-react';
import { courseApi, progressApi } from '@/lib/api';
import { Course, UserProgress, Topic } from '@/lib/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CourseCard from '@/components/ui/CourseCard';
import AIToolCard from '@/components/ui/AIToolCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SummarizerDialog, QuizGeneratorDialog, FlashcardsGeneratorDialog, QAAIDialog } from '@/components/ai/AIToolDialogs';

type ActiveTool = 'summarizer' | 'quiz' | 'flashcards' | 'qa' | null;

export default function DashboardHome() {
  const [continueStudying, setContinueStudying] = useState<UserProgress[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, popularRes] = await Promise.all([progressApi.dashboard(), courseApi.popular()]);
        setContinueStudying(dashRes.data.data.continueStudying || []);
        setPopularCourses(popularRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-1">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Continue where you left off, or explore something new.</p>
      </div>

      {continueStudying.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">Continue studying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueStudying.slice(0, 4).map((progress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              const flashcardPct = progress.flashcardsTotal > 0 ? (progress.flashcardsStudied / progress.flashcardsTotal) * 100 : 0;
              return (
                <Card key={progress._id} className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="min-w-0">
                      {topic && <p className="text-xs font-semibold text-[var(--brand-gold-600)] uppercase tracking-wide mb-1 truncate">{course?.title}</p>}
                      <h3 className="font-semibold text-[var(--ink-900)] text-lg truncate">{topic?.title || course?.title}</h3>
                    </div>
                    {course && <Badge tone="gold">{course.difficulty}</Badge>}
                  </div>
                  <div className="mb-4">
                    <ProgressBar value={flashcardPct} label="Flashcard progress" />
                  </div>
                  <Link
                    href={topic ? `/dashboard/courses/${course?._id}/topics/${topic._id}` : `/dashboard/courses/${course?._id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-gold-600)] hover:opacity-80"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">AI study tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AIToolCard icon={<Sparkles className="w-5 h-5" />} title="Summarizer" description="Turn any lecture note into a short summary." onClick={() => setActiveTool('summarizer')} />
          <AIToolCard icon={<FileQuestion className="w-5 h-5" />} title="Quiz generator" description="Build a quick multiple-choice quiz from a topic." onClick={() => setActiveTool('quiz')} />
          <AIToolCard icon={<Layers className="w-5 h-5" />} title="Flashcards generator" description="Generate a starter deck of flashcards in seconds." onClick={() => setActiveTool('flashcards')} />
          <AIToolCard icon={<MessageCircleQuestion className="w-5 h-5" />} title="Q&A AI" description="Ask a study question and get a plain-English answer." onClick={() => setActiveTool('qa')} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--ink-900)]">Popular courses</h2>
          <Link href="/dashboard/courses" className="text-sm font-semibold text-[var(--brand-gold-600)] hover:opacity-80">
            View all courses
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCourses.map((course) => (
            <CourseCard key={course._id} id={course._id} image={course.banner} level={course.difficulty} title={course.title} category={course.category} topicCount={course.topicCount} />
          ))}
        </div>
      </div>

      <SummarizerDialog open={activeTool === 'summarizer'} onClose={() => setActiveTool(null)} />
      <QuizGeneratorDialog open={activeTool === 'quiz'} onClose={() => setActiveTool(null)} />
      <FlashcardsGeneratorDialog open={activeTool === 'flashcards'} onClose={() => setActiveTool(null)} />
      <QAAIDialog open={activeTool === 'qa'} onClose={() => setActiveTool(null)} />
    </div>
  );
}
