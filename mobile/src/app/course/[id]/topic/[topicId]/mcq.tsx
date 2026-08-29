import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { mcqApi } from '@/lib/api';
import { MCQ } from '@/lib/types';
import { cacheMcqs, getCachedMcqs } from '@/lib/offlineSync';
import McqDeck from '@/components/study/McqDeck';
import StudyChrome from '@/components/common/StudyChrome';

export default function TopicMcqScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!topicId) return;
    try {
      const res = await mcqApi.byTopic(topicId);
      const data: MCQ[] = res.data.data;
      setMcqs(data);
      if (id) await cacheMcqs(`${id}_${topicId}`, data);
    } catch {
      if (id) setMcqs(await getCachedMcqs(`${id}_${topicId}`));
    } finally {
      setIsLoading(false);
    }
  }, [id, topicId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StudyChrome title="Practice">
      <McqDeck courseId={id!} topicId={topicId} mcqs={mcqs} isLoading={isLoading} />
    </StudyChrome>
  );
}
