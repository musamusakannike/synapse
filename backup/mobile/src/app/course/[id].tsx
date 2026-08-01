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
  CheckCircle2,
  Circle,
  BookMarked,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Lesson {
  title: string;
  description: string;
  isCompleted?: boolean;
  generatedLessonId?: string;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  level: string;
  style: string;
  outline: { modules: Module[] };
  createdAt: string;
  isPublic?: boolean;
}

// ─── Module Section ────────────────────────────────────────────────────────────
function ModuleSection({
  mod,
  modIndex,
  onLessonPress,
}: {
  mod: Module;
  modIndex: number;
  onLessonPress: (lesson: Lesson, moduleTitle: string) => void;
}) {
  const { c } = useTheme();
  const [expanded, setExpanded] = useState(true);

  const completedCount = mod.lessons.filter((l) => l.isCompleted).length;

  return (
    <Animated.View
      entering={FadeInDown.delay(modIndex * 80).duration(400)}
      style={[styles.moduleCard, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
    >
      {/* Module header */}
      <Pressable
        onPress={() => { haptics.light(); setExpanded((v) => !v); }}
        style={styles.moduleHeader}
      >
        <View style={[styles.moduleIcon, { backgroundColor: c.accentMuted }]}>
          <BookMarked size={14} color={c.accent} strokeWidth={1.5} />
        </View>
        <View style={styles.moduleHeaderText}>
          <Text
            style={[styles.moduleTitle, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}
            numberOfLines={2}
          >
            {mod.title}
          </Text>
          <Text style={[styles.moduleMeta, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            {completedCount}/{mod.lessons.length} lessons
          </Text>
        </View>
        {expanded ? (
          <ChevronDown size={16} color={c.textMuted} strokeWidth={1.5} />
        ) : (
          <ChevronRight size={16} color={c.textMuted} strokeWidth={1.5} />
        )}
      </Pressable>

      {/* Lessons list */}
      {expanded && (
        <View style={[styles.lessonsList, { borderTopColor: c.borderSubtle }]}>
          {mod.lessons.map((lesson, lessonIndex) => (
            <LessonRow
              key={`${modIndex}-${lessonIndex}`}
              lesson={lesson}
              lessonIndex={lessonIndex}
              isLast={lessonIndex === mod.lessons.length - 1}
              onPress={() => onLessonPress(lesson, mod.title)}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// ─── Lesson Row ────────────────────────────────────────────────────────────────
function LessonRow({
  lesson,
  lessonIndex,
  isLast,
  onPress,
}: {
  lesson: Lesson;
  lessonIndex: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();

  return (
    <Pressable
      onPress={() => { haptics.light(); onPress(); }}
      style={[
        styles.lessonRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: c.borderSubtle },
      ]}
    >
      {/* Completion indicator */}
      <View style={styles.lessonStatus}>
        {lesson.isCompleted ? (
          <CheckCircle2 size={18} color={c.success} strokeWidth={1.5} />
        ) : (
          <Circle size={18} color={c.textMuted} strokeWidth={1.5} />
        )}
      </View>

      {/* Lesson info */}
      <View style={styles.lessonInfo}>
        <Text
          style={[
            styles.lessonTitle,
            {
              color: lesson.isCompleted ? c.textSecondary : c.textPrimary,
              fontFamily: typography.body.medium,
            },
          ]}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>
        {lesson.description ? (
          <Text
            style={[styles.lessonDesc, { color: c.textMuted, fontFamily: typography.body.regular }]}
            numberOfLines={1}
          >
            {lesson.description}
          </Text>
        ) : null}
      </View>

      {/* Arrow — only show if lesson content exists */}
      {lesson.generatedLessonId ? (
        <ChevronRight size={14} color={c.accent} strokeWidth={1.5} />
      ) : (
        <ChevronRight size={14} color={c.borderSubtle} strokeWidth={1.5} />
      )}
    </Pressable>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
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

  const handleLessonPress = (lesson: Lesson, moduleTitle: string) => {
    if (lesson.generatedLessonId) {
      router.push(`/course/lesson/${lesson.generatedLessonId}` as any);
    } else if (course?._id) {
      router.push({
        pathname: '/course/lesson/generate',
        params: {
          courseId: course._id,
          moduleTitle,
          lessonTitle: lesson.title,
        },
      } as any);
    }
  };

  // Derived stats
  const modules = course?.outline?.modules ?? [];
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.isCompleted).length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isComplete = totalLessons > 0 && completedLessons === totalLessons;

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
          {/* Hero card */}
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

            {/* Stats row */}
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Layers size={14} color={c.accent} strokeWidth={1.5} />
                <Text style={[styles.heroStatText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                  {modules.length} module{modules.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: c.border }]} />
              <View style={styles.heroStat}>
                <BookOpen size={14} color={c.textMuted} strokeWidth={1.5} />
                <Text style={[styles.heroStatText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                  {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
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

            {/* Progress bar */}
            {totalLessons > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                    {completedLessons} of {totalLessons} lessons
                  </Text>
                  <Text
                    style={[
                      styles.progressPct,
                      { color: isComplete ? c.success : c.accent, fontFamily: typography.body.semiBold },
                    ]}
                  >
                    {percent}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: c.bgElevated }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percent}%` as any,
                        backgroundColor: isComplete ? c.success : c.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressHint, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                  {isComplete ? '🎉 Course complete — nice work!' : `~${(totalLessons - completedLessons) * 8}m of study left`}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Modules label */}
          <Text style={[styles.sectionLabel, { color: c.textMuted, fontFamily: typography.body.semiBold }]}>
            MODULES & LESSONS
          </Text>

          {/* Module cards */}
          <View style={styles.modulesList}>
            {modules.map((mod, modIndex) => (
              <ModuleSection
                key={modIndex}
                mod={mod}
                modIndex={modIndex}
                onLessonPress={handleLessonPress}
              />
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

  // ── Hero ──────────────────────────────────────────────────────────────────
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
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
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

  // ── Progress ─────────────────────────────────────────────────────────────
  progressSection: {
    width: '100%',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { fontSize: fontSize.xs },
  progressPct: { fontSize: fontSize.xs },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressHint: {
    fontSize: fontSize['2xs'],
    marginTop: spacing.xxs,
  },

  // ── Section label ────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: fontSize['2xs'],
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  modulesList: { gap: spacing.sm },
  moduleCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  moduleIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleHeaderText: {
    flex: 1,
    gap: 2,
  },
  moduleTitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  moduleMeta: {
    fontSize: fontSize['2xs'],
  },

  // ── Lessons ───────────────────────────────────────────────────────────────
  lessonsList: {
    borderTopWidth: 1,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  lessonStatus: {
    flexShrink: 0,
  },
  lessonInfo: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  lessonDesc: {
    fontSize: fontSize['2xs'],
    lineHeight: 16,
  },
});
