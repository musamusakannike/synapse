import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { topicApi, mcqApi } from '@/lib/api';
import { MCQ } from '@/lib/types';
import { cacheMcqs, getCachedMcqs } from '@/lib/offlineSync';
import McqDeck from '@/components/study/McqDeck';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';

export default function CourseMcqScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>All practice questions</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.body}>
        <McqDeck courseId={id!} mcqs={mcqs} isLoading={isLoading} />
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
