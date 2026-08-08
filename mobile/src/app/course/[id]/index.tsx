import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { IconArrowLeft, IconCards, IconHelpCircle, IconChevronRight, IconLock, IconSparkles } from '@tabler/icons-react-native';
import { courseApi, topicApi, paymentApi } from '@/lib/api';
import { Course, Topic, PaymentStatus } from '@/lib/types';
import { formatKobo } from '@/lib/money';
import { cacheFlashcards } from '@/lib/offlineSync';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [courseRes, topicsRes, paymentRes] = await Promise.all([
        courseApi.get(id),
        topicApi.byCourse(id),
        paymentApi.me(),
      ]);
      setCourse(courseRes.data.data);
      setTopics(topicsRes.data.data);
      setPaymentStatus(paymentRes.data.data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-check on return from the checkout modal so an unlocked course reflects immediately.
  useFocusEffect(
    useCallback(() => {
      paymentApi.me().then((res) => setPaymentStatus(res.data.data)).catch(() => {});
    }, [])
  );

  if (isLoading) return <LoadingSpinner />;
  if (!course) return <EmptyState title="Course not found" />;

  const hasAccess =
    course.isFree || paymentStatus?.subscription.status === 'active' || !!paymentStatus?.purchasedCourseIds.includes(course._id);

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

        {!course.isFree && !hasAccess && (
          <Card style={{ backgroundColor: colors.brandPrimarySoft }}>
            <View style={styles.lockRow}>
              <View style={[styles.lockIcon, { backgroundColor: colors.surfaceCard }]}>
                <IconLock size={18} color={colors.brandPrimaryHover} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lockTitle, { color: colors.textPrimary }]}>Premium course</Text>
                <Text style={[styles.lockMessage, { color: colors.textSecondary }]}>
                  Buy it once for {formatKobo(course.price)}, or get all-access with a monthly subscription.
                </Text>
              </View>
            </View>
            <View style={styles.lockActions}>
              <Button
                variant="secondary"
                size="sm"
                icon={<IconSparkles size={16} color={colors.textPrimary} />}
                onPress={() => { haptics.light(); router.push('/subscribe' as any); }}
                style={{ flex: 1 }}
              >
                Go all-access
              </Button>
              <Button
                size="sm"
                onPress={() => { haptics.light(); router.push({ pathname: '/checkout', params: { type: 'course', courseId: course._id } } as any); }}
                style={{ flex: 1 }}
              >
                Buy for {formatKobo(course.price)}
              </Button>
            </View>
          </Card>
        )}

        <View style={styles.actionsRow}>
          <Button
            variant="secondary"
            icon={<IconCards size={16} color={colors.textPrimary} />}
            disabled={!hasAccess}
            onPress={() => { haptics.light(); router.push(`/course/${id}/flashcards` as any); }}
            style={{ flex: 1 }}
          >
            All flashcards
          </Button>
          <Button
            variant="secondary"
            icon={<IconHelpCircle size={16} color={colors.textPrimary} />}
            disabled={!hasAccess}
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
                    if (!hasAccess) return;
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
                    {hasAccess ? (
                      <IconChevronRight size={16} color={colors.textTertiary} />
                    ) : (
                      <IconLock size={16} color={colors.textTertiary} />
                    )}
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
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold },
  bullet: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topicIndex: { width: 28, height: 28, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  topicIndexText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansSemiBold },
  topicTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansMedium },
  topicMeta: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, marginTop: 2 },
  lockRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  lockIcon: { width: 32, height: 32, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  lockTitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansSemiBold },
  lockMessage: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, marginTop: 2, lineHeight: fontSizes.xs * 1.5 },
  lockActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
