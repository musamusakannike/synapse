import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft, IconCards, IconHelpCircle, IconChevronRight } from '@tabler/icons-react-native';
import { courseApi, topicApi } from '@/lib/api';
import { Course, Topic } from '@/lib/types';
import { cacheFlashcards } from '@/lib/offlineSync';
import { useProgressStore } from '@/store/progress.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState<{ totalTopics: number; completedTopics: number; percentComplete: number } | null>(null);
  const { fetchCourseProgress } = useProgressStore();

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [courseRes, topicsRes] = await Promise.all([
        courseApi.get(id),
        topicApi.byCourse(id),
      ]);
      setCourse(courseRes.data.data);
      setTopics(topicsRes.data.data);
      fetchCourseProgress(id).then(setCourseProgress);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchCourseProgress]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <LoadingSpinner />;
  if (!course) return <EmptyState title="Course not found" />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>

        {course.banner ? <Image source={{ uri: course.banner }} style={styles.banner} resizeMode="cover" /> : null}

        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{course.title}</Text>
          <Badge variant={course.difficulty}>{course.difficulty}</Badge>
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{course.longDescription || course.description}</Text>

        {courseProgress && courseProgress.totalTopics > 0 && (
          <View style={styles.progressWrap}>
            <View style={styles.goalHeader}>
              <Text style={[styles.topicMeta, { color: colors.textSecondary }]}>
                {courseProgress.completedTopics} of {courseProgress.totalTopics} topics complete
              </Text>
              <Text style={[styles.topicMeta, { color: colors.textSecondary }]}>{courseProgress.percentComplete}%</Text>
            </View>
            <ProgressBar value={courseProgress.percentComplete} color={colors.success} />
          </View>
        )}

        <View style={styles.actionsRow}>
          <Button
            variant="secondary"
            icon={<IconCards size={16} color={colors.textPrimary} />}
            onPress={() => { haptics.light(); router.push(`/course/${id}/flashcards` as any); }}
            style={{ flex: 1 }}
          >
            All flashcards
          </Button>
          <Button
            variant="secondary"
            icon={<IconHelpCircle size={16} color={colors.textPrimary} />}
            onPress={() => { haptics.light(); router.push(`/course/${id}/mcq` as any); }}
            style={{ flex: 1 }}
          >
            All MCQs
          </Button>
        </View>

        {course.whatYouWillLearn?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What you&apos;ll learn</Text>
            {course.whatYouWillLearn.map((point, i) => (
              <Text key={i} style={[styles.bullet, { color: colors.textSecondary }]}>{'•'} {point}</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Topics</Text>
          {topics.length === 0 ? (
            <EmptyState title="No topics published yet" />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {topics.map((topic, i) => (
                <Card
                  key={topic._id}
                  onPress={() => {
                    haptics.light();
                    router.push(`/course/${id}/topic/${topic._id}` as any);
                  }}
                >
                  <View style={styles.topicRow}>
                    <View style={[styles.topicIndex, { backgroundColor: colors.surfaceSunken }]}>
                      <Text style={[styles.topicIndexText, { color: colors.textSecondary }]}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.topicTitle, { color: colors.textPrimary }]} numberOfLines={1}>{topic.title}</Text>
                      <Text style={[styles.topicMeta, { color: colors.textTertiary }]}>
                        {topic.flashcardCount ?? 0} flashcards {'·'} {topic.mcqCount ?? 0} MCQs
                      </Text>
                    </View>
                    <IconChevronRight size={16} color={colors.textTertiary} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.md },
  back: { paddingVertical: spacing.sm },
  banner: { width: '100%', height: 160, borderRadius: radii.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold },
  description: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.65 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  progressWrap: { gap: spacing.xs },
  goalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold },
  bullet: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topicIndex: { width: 28, height: 28, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  topicIndexText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansSemiBold },
  topicTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansMedium },
  topicMeta: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, marginTop: 2 },
});
