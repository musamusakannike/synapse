'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { topicApi } from '@/lib/api';
import { Topic } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StepPlayer from '@/components/lesson/StepPlayer';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await topicApi.get(topicId);
        setTopic(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [topicId]);

  const handleClose = () => router.push(`/dashboard/courses/${courseId}`);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-page)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--surface-page)]">
        <p className="text-[var(--text-muted)]">Topic not found.</p>
        <button onClick={handleClose} className="cursor-pointer rounded-[var(--radius-sm)] bg-[var(--brand-gold)] px-4 py-2 text-sm font-semibold text-[var(--ink-900)]">
          Go back
        </button>
      </div>
    );
  }

  return (
    <StepPlayer
      topic={topic}
      onClose={handleClose}
    />
  );
}
