import { useEffect, useState, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { topicApi } from '@/lib/api';
import { Topic } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import StepPlayer from '@/components/lesson/StepPlayer';

export default function TopicLearnScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!topicId) return;
    try {
      const res = await topicApi.get(topicId);
      setTopic(res.data.data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <LoadingSpinner />;
  if (!topic) return <EmptyState title="Topic not found" />;

  const handleClose = () => {
    if (topic.defaultFlow === 'guided') {
      router.replace(`/course/${id}` as any);
    } else {
      router.back();
    }
  };

  return (
    <StepPlayer
      topic={topic}
      onClose={handleClose}
      altViewHref={topic.defaultFlow === 'guided' ? `/course/${id}/topic/${topicId}?flat=1` : undefined}
    />
  );
}
