import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { topicApi, flashcardApi } from '@/lib/api';
import { Flashcard } from '@/lib/types';
import { cacheFlashcards, getCachedFlashcards } from '@/lib/offlineSync';
import FlashcardDeck from '@/components/study/FlashcardDeck';
import StudyChrome from '@/components/common/StudyChrome';

export default function CourseFlashcardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const topicsRes = await topicApi.byCourse(id);
      const topics = topicsRes.data.data as { _id: string }[];
      const results = await Promise.all(topics.map((t) => flashcardApi.byTopic(t._id).catch(() => null)));
      const all = results.flatMap((r) => (r ? (r.data.data as Flashcard[]) : []));
      setFlashcards(all);
      await cacheFlashcards(id, all);
    } catch {
      const cached = await getCachedFlashcards(id);
      setFlashcards(cached);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StudyChrome title="Flashcards">
      <FlashcardDeck courseId={id!} flashcards={flashcards} isLoading={isLoading} />
    </StudyChrome>
  );
}
