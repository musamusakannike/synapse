import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { topicApi, mcqApi } from '@/lib/api';
import { MCQ } from '@/lib/types';
import { cacheMcqs, getCachedMcqs } from '@/lib/offlineSync';
import McqDeck from '@/components/study/McqDeck';
import StudyChrome from '@/components/common/StudyChrome';

export default function CourseMcqScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const topicsRes = await topicApi.byCourse(id);
      const topics = topicsRes.data.data as { _id: string }[];
      const results = await Promise.all(topics.map((t) => mcqApi.byTopic(t._id).catch(() => null)));
      const all = results.flatMap((r) => (r ? (r.data.data as MCQ[]) : []));
      setMcqs(all);
      await cacheMcqs(id, all);
    } catch {
      const cached = await getCachedMcqs(id);
      setMcqs(cached);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StudyChrome title="Practice">
      <McqDeck courseId={id!} mcqs={mcqs} isLoading={isLoading} />
    </StudyChrome>
  );
}
