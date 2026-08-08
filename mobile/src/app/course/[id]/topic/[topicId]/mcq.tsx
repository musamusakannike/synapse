import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { mcqApi } from '@/lib/api';
import { MCQ } from '@/lib/types';
import { cacheMcqs, getCachedMcqs } from '@/lib/offlineSync';
import McqDeck from '@/components/study/McqDeck';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';

export default function TopicMcqScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Practice quiz</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.body}>
        <McqDeck courseId={id!} topicId={topicId} mcqs={mcqs} isLoading={isLoading} />
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
