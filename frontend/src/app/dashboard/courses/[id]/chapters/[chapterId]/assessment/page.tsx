'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chapterApi } from '@/lib/api';
import { Chapter } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AssessmentStepPlayer from '@/components/lesson/AssessmentStepPlayer';

export default function ChapterAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const chapterId = params.chapterId as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await chapterApi.byCourse(courseId);
        const chapters: Chapter[] = res.data.data || [];
        const found = chapters.find((c) => c._id === chapterId);
        setChapter(found || null);
      } catch (e) {
        console.error('Failed to load chapter for assessment:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [courseId, chapterId]);

  const handleClose = () => router.push(`/dashboard/courses/${courseId}`);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-page)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!chapter || !chapter.exercise || !chapter.exercise.questions || chapter.exercise.questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--surface-page)] p-6 text-center">
        <p className="text-[var(--text-muted)]">No assessment available for this chapter.</p>
        <button
          onClick={handleClose}
          className="cursor-pointer rounded-xl bg-[var(--brand-gold)] px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-all hover:brightness-105"
        >
          Return to Course
        </button>
      </div>
    );
  }

  return (
    <AssessmentStepPlayer
      exercise={chapter.exercise}
      courseId={courseId}
      chapterId={chapterId}
      chapterTitle={chapter.title}
      onClose={handleClose}
    />
  );
}
