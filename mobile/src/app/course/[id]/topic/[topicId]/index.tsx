import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft, IconCards, IconHelpCircle } from '@tabler/icons-react-native';
import { topicApi } from '@/lib/api';
import { Topic, TopicContent } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import LatexRenderer from '@/components/ui/LatexRenderer';
import CodeRenderer from '@/components/ui/CodeRenderer';
import YouTubePlayer from '@/components/ui/YouTubePlayer';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function TopicContentScreen() {
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
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

  if (isLoading) return <LoadingSpinner />;
  if (!topic) return <EmptyState title="Topic not found" />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <Text style={[styles.title, { color: colors.textPrimary }]}>{topic.title}</Text>
        {!!topic.description && <Text style={[styles.description, { color: colors.textSecondary }]}>{topic.description}</Text>}

        <View style={{ gap: spacing.base, marginTop: spacing.base }}>
          {topic.contents.map((content, i) => (
            <ContentBlock key={i} content={content} />
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

function ContentBlock({ content }: { content: TopicContent }) {
  const { colors } = useTheme();

  switch (content.type) {
    case 'latex':
      return <LatexRenderer expression={content.content} />;
    case 'code':
      return <CodeRenderer code={content.content} language={content.language} />;
    case 'youtube':
    case 'video':
      return <YouTubePlayer source={content.content} />;
    case 'image':
      return <Image source={{ uri: content.content }} style={styles.image} resizeMode="cover" />;
    case 'audio':
      // No inline audio player is in scope for this pass; render as a link-style block.
      return (
        <View style={[styles.textBlock, { backgroundColor: colors.surfaceSunken }]}>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Audio: {content.content}</Text>
        </View>
      );
    case 'text':
    default:
      return (
        <View style={styles.textBlock}>
          <Text style={[styles.paragraph, { color: colors.textPrimary }]}>{content.content}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  back: { paddingVertical: spacing.sm },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold, marginBottom: spacing.xs },
  description: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
  textBlock: { paddingVertical: spacing.xs },
  paragraph: { fontSize: fontSizes.base, fontFamily: fontFamilies.sans, lineHeight: fontSizes.base * 1.65 },
  image: { width: '100%', height: 200, borderRadius: radii.md },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
});
