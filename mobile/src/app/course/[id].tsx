import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Layers,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Lesson {
  _id: string;
  title: string;
  content?: string;
  summary?: string;
}

interface Course {
  _id: string;
  title: string;
  topic: string;
  lessons: Lesson[];
  createdAt: string;
}

function LessonItem({
  lesson,
  index,
}: {
  lesson: Lesson;
  index: number;
}) {
  const { c } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={[styles.lessonCard, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
    >
      <Pressable
        onPress={() => { haptics.light(); setExpanded((v) => !v); }}
        style={styles.lessonHeader}
      >
        <View style={[styles.lessonNum, { backgroundColor: c.accentMuted }]}>
          <Text style={[styles.lessonNumText, { color: c.accent, fontFamily: typography.display.bold }]}>
            {index + 1}
          </Text>
        </View>
        <Text
          style={[styles.lessonTitle, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {lesson.title}
        </Text>
        {expanded ? (
          <ChevronDown size={16} color={c.textMuted} strokeWidth={1.5} />
        ) : (
          <ChevronRight size={16} color={c.textMuted} strokeWidth={1.5} />
        )}
      </Pressable>

      {expanded && (lesson.content || lesson.summary) ? (
        <View style={[styles.lessonBody, { borderTopColor: c.borderSubtle }]}>
          <Text
            style={[styles.lessonContent, { color: c.textSecondary, fontFamily: typography.body.regular }]}
          >
            {lesson.content || lesson.summary}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { c } = useTheme();

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await api.get(`/api/ai/course?id=${id}`);
      return res.data?.course;
    },
    enabled: !!id,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
          numberOfLines={1}
        >
          Course Details
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : !course ? (
        <View style={styles.loadingState}>
          <Text style={[{ color: c.textMuted, fontFamily: typography.body.regular, fontSize: fontSize.sm }]}>
            Course not found.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Hero */}
          <Animated.View
            entering={FadeIn.duration(400)}
            style={[styles.hero, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
          >
            <View style={[styles.heroIcon, { backgroundColor: c.accentMuted }]}>
              <BookOpen size={24} color={c.accent} strokeWidth={1.5} />
            </View>
            <Text style={[styles.heroTitle, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
              {course.title}
            </Text>
            {course.topic ? (
              <Text style={[styles.heroTopic, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                {course.topic}
              </Text>
            ) : null}

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Layers size={14} color={c.accent} strokeWidth={1.5} />
                <Text style={[styles.heroStatText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                  {course.lessons?.length ?? 0} lessons
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: c.border }]} />
              <View style={styles.heroStat}>
                <Clock size={14} color={c.textMuted} strokeWidth={1.5} />
                <Text style={[styles.heroStatText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                  {new Date(course.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Lessons */}
          <Text
            style={[styles.lessonsLabel, { color: c.textMuted, fontFamily: typography.body.semiBold }]}
          >
            LESSONS
          </Text>
          <View style={styles.lessonsList}>
            {(course.lessons ?? []).map((lesson, idx) => (
              <LessonItem key={lesson._id ?? idx} lesson={lesson} index={idx} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  hero: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  heroTopic: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroStatText: { fontSize: fontSize.xs },
  statDivider: {
    width: 1,
    height: 14,
  },
  lessonsLabel: {
    fontSize: fontSize['2xs'],
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  lessonsList: { gap: spacing.sm },
  lessonCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  lessonNum: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lessonNumText: { fontSize: fontSize.sm },
  lessonTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  lessonBody: {
    padding: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  lessonContent: {
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
});
