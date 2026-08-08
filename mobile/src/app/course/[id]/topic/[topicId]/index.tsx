import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft, IconCards, IconHelpCircle, IconSchool } from '@tabler/icons-react-native';
import { topicApi } from '@/lib/api';
import { Topic } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import InfoStepBlock from '@/components/lesson/InfoStepBlock';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function TopicContentScreen() {
  const { id, topicId, flat } = useLocalSearchParams<{ id: string; topicId: string; flat?: string }>();
  const { colors } = useTheme();
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

  useEffect(() => {
    if (topic && topic.defaultFlow === 'guided' && flat !== '1') {
      router.replace(`/course/${id}/topic/${topicId}/learn` as any);
    }
  }, [topic, flat, id, topicId]);

  if (isLoading) return <LoadingSpinner />;
  if (!topic) return <EmptyState title="Topic not found" />;
  if (topic.defaultFlow === 'guided' && flat !== '1') return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <Text style={[styles.title, { color: colors.textPrimary }]}>{topic.title}</Text>
        {!!topic.description && <Text style={[styles.description, { color: colors.textSecondary }]}>{topic.description}</Text>}

        {topic.contents.length > 0 && (
          <Button
            icon={<IconSchool size={16} color={colors.brandOnPrimary} />}
            onPress={() => { haptics.light(); router.push(`/course/${id}/topic/${topicId}/learn` as any); }}
            style={{ marginTop: spacing.base }}
            fullWidth
          >
            Start lesson
          </Button>
        )}

        <View style={{ gap: spacing.base, marginTop: spacing.base }}>
          {topic.contents.map((content, i) => (
            content.type === 'quiz' && content.quiz ? (
              <Text key={i} style={[styles.paragraph, { color: colors.textPrimary }]}>{content.quiz.question}</Text>
            ) : content.type === 'exercise' && content.exercise ? (
              <Text key={i} style={[styles.paragraph, { color: colors.textPrimary }]}>{content.exercise.instructions}</Text>
            ) : (
              <InfoStepBlock key={i} content={content} />
            )
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Button
            variant="secondary"
            icon={<IconCards size={16} color={colors.textPrimary} />}
            onPress={() => { haptics.light(); router.push(`/course/${id}/topic/${topicId}/flashcards` as any); }}
            style={{ flex: 1 }}
          >
            Flashcards
          </Button>
          <Button
            variant="secondary"
            icon={<IconHelpCircle size={16} color={colors.textPrimary} />}
            onPress={() => { haptics.light(); router.push(`/course/${id}/topic/${topicId}/mcq` as any); }}
            style={{ flex: 1 }}
          >
            Practice quiz
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  back: { paddingVertical: spacing.sm },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold, marginBottom: spacing.xs },
  description: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
  paragraph: { fontSize: fontSizes.base, fontFamily: fontFamilies.sans, lineHeight: fontSizes.base * 1.65 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
});
