import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { flashcardApi } from '@/lib/api';
import { Flashcard } from '@/lib/types';
import { cacheFlashcards, getCachedFlashcards } from '@/lib/offlineSync';
import FlashcardDeck from '@/components/study/FlashcardDeck';
import StudyChrome from '@/components/common/StudyChrome';

export default function TopicFlashcardsScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!topicId) return;
    try {
      const res = await flashcardApi.byTopic(topicId);
      const data: Flashcard[] = res.data.data;
      setFlashcards(data);
      if (id) await cacheFlashcards(`${id}_${topicId}`, data);
    } catch {
      if (id) setFlashcards(await getCachedFlashcards(`${id}_${topicId}`));
    } finally {
      setIsLoading(false);
    }
  }, [id, topicId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <StudyChrome title="Flashcards">
      <FlashcardDeck courseId={id!} topicId={topicId} flashcards={flashcards} isLoading={isLoading} />
    </StudyChrome>
  );
}
