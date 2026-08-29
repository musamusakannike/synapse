import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconFlame, IconClock, IconTarget, IconStack2, IconArrowRight } from '@tabler/icons-react-native';
import { useProgressStore } from '@/store/progress.store';
import { Course, Topic, UserProgress } from '@/lib/types';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import GlassSurface from '@/components/ui/GlassSurface';
import ScreenBackdrop from '@/components/common/ScreenBackdrop';
import ScreenHeader from '@/components/common/ScreenHeader';
import { fontFamilies, spacing } from '@/theme';
import { ACCENT, AI, INK, MUTED, TINT_AI, TINT_GLASS, TINT_ORANGE } from '@/theme/brand';
import * as haptics from '@/lib/haptics';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { stats, needsImprovement, isLoading, fetchProgress, fetchNeedsImprovement } = useProgressStore();

  useEffect(() => {
    fetchProgress();
    fetchNeedsImprovement();
  }, [fetchProgress, fetchNeedsImprovement]);

  if (isLoading && !stats) return <LoadingSpinner />;

  return (
    <View collapsable={false} style={styles.container}>
      <ScreenBackdrop />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Progress" subtitle="How your practice is compounding." />

        <View style={styles.statsGrid}>
          <StatCard icon={<IconFlame size={18} color={ACCENT} />} label="Day streak" value={stats?.streak ?? 0} accent={ACCENT} tintColor={TINT_ORANGE} />
          <StatCard icon={<IconClock size={18} color={ACCENT} />} label="Minutes today" value={stats?.todayStudyTime ?? 0} accent={ACCENT} tintColor={TINT_ORANGE} />
          <StatCard icon={<IconTarget size={18} color={AI} />} label="Avg accuracy" value={`${Math.round(stats?.avgAccuracy ?? 0)}%`} accent={AI} tintColor={TINT_AI} />
          <StatCard icon={<IconStack2 size={18} color={AI} />} label="Flashcards studied" value={stats?.totalFlashcards ?? 0} accent={AI} tintColor={TINT_AI} />
        </View>

        {!!stats?.dailyGoal && (
          <GlassSurface style={styles.goalCard} tintColor={TINT_GLASS}>
            <View style={styles.goalHeader}>
              <Text style={styles.cardTitle}>Today&apos;s goal</Text>
              <Text style={styles.cardMeta}>
                {stats.dailyGoal.studiedMinutes}/{stats.dailyGoal.minutes} min
              </Text>
            </View>
            <ProgressBar
              value={stats.dailyGoal.progress}
              color={stats.dailyGoal.met ? '#1F9D55' : ACCENT}
              trackColor="rgba(14,14,26,0.08)"
            />
            {stats.dailyGoal.met && <Text style={styles.goalMetText}>Goal reached today. Nice work!</Text>}
          </GlassSurface>
        )}

        <Text style={styles.sectionTitle}>Needs improvement</Text>
        {needsImprovement.length === 0 ? (
          <EmptyState title="You're on top of things" description="Nothing needs extra attention right now." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {needsImprovement.map((progress: UserProgress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              return (
                <Pressable
                  key={progress._id}
                  onPress={() => {
                    haptics.light();
                    if (topic && course) router.push(`/course/${course._id}/topic/${topic._id}` as any);
                  }}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <GlassSurface style={styles.studyCard} isInteractive tintColor={TINT_GLASS}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {topic?.title || course?.title}
                    </Text>
                    <Text style={styles.cardMeta}>{Math.round(progress.accuracy ?? 0)}% accuracy</Text>
                    <ProgressBar value={progress.accuracy ?? 0} color="#E5484D" trackColor="rgba(14,14,26,0.08)" />
                    <View style={styles.continueLink}>
                      <Text style={styles.continueLinkText}>Review</Text>
                      <IconArrowRight size={16} color={ACCENT} />
                    </View>
                  </GlassSurface>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.sansBold,
    color: INK,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  goalCard: { borderRadius: 20, padding: spacing.base, overflow: 'hidden', marginBottom: spacing.lg },
  goalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { fontSize: 17, fontFamily: fontFamilies.sansBold, color: INK, letterSpacing: -0.2, marginBottom: 4 },
  cardMeta: { fontSize: 13, fontFamily: fontFamilies.sans, color: MUTED, marginBottom: spacing.sm },
  goalMetText: { fontSize: 14, fontFamily: fontFamilies.sansMedium, color: '#1F9D55', marginTop: spacing.sm },
  studyCard: { borderRadius: 20, padding: spacing.base, overflow: 'hidden' },
  continueLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  continueLinkText: { fontSize: 14, fontFamily: fontFamilies.sansBold, color: INK },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
