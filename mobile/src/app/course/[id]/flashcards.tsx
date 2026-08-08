import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { topicApi, flashcardApi } from '@/lib/api';
import { Flashcard } from '@/lib/types';
import { cacheFlashcards, getCachedFlashcards } from '@/lib/offlineSync';
import FlashcardDeck from '@/components/study/FlashcardDeck';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';

export default function CourseFlashcardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>All flashcards</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.body}>
        <FlashcardDeck courseId={id!} flashcards={flashcards} isLoading={isLoading} />
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
