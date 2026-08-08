import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { flashcardApi } from '@/lib/api';
import { Flashcard } from '@/lib/types';
import { cacheFlashcards, getCachedFlashcards } from '@/lib/offlineSync';
import FlashcardDeck from '@/components/study/FlashcardDeck';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';

export default function TopicFlashcardsScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Flashcards</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.body}>
        <FlashcardDeck courseId={id!} topicId={topicId} flashcards={flashcards} isLoading={isLoading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  title: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold },
  body: { flex: 1, paddingHorizontal: spacing.xl },
});
