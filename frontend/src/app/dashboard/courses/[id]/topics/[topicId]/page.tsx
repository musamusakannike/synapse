'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const topicId = params.topicId as string;

  useEffect(() => {
    if (courseId && topicId) {
      router.replace(`/dashboard/courses/${courseId}/topics/${topicId}/learn`);
    }
  }, [courseId, topicId, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
