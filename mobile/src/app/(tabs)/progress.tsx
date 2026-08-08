import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconFlame, IconClock, IconTarget, IconStack2 } from '@tabler/icons-react-native';
import { useProgressStore } from '@/store/progress.store';
import { Course, Topic, UserProgress } from '@/lib/types';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { stats, needsImprovement, isLoading, fetchProgress, fetchNeedsImprovement } = useProgressStore();

  useEffect(() => {
    fetchProgress();
    fetchNeedsImprovement();
  }, [fetchProgress, fetchNeedsImprovement]);

  if (isLoading && !stats) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Your progress</Text>

        <View style={styles.statsGrid}>
          <StatCard icon={<IconFlame size={18} color={colors.warning} />} label="Day streak" value={stats?.streak ?? 0} accent={colors.warning} />
          <StatCard icon={<IconClock size={18} color={colors.brandPrimaryHover} />} label="Minutes today" value={stats?.todayStudyTime ?? 0} accent={colors.brandPrimary} />
          <StatCard icon={<IconTarget size={18} color={colors.success} />} label="Avg accuracy" value={`${Math.round(stats?.avgAccuracy ?? 0)}%`} accent={colors.success} />
          <StatCard icon={<IconStack2 size={18} color={colors.brandAi} />} label="Flashcards studied" value={stats?.totalFlashcards ?? 0} accent={colors.brandAi} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Needs improvement</Text>
        {needsImprovement.length === 0 ? (
          <EmptyState title="You're on top of things" description="Nothing needs extra attention right now." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {needsImprovement.map((progress: UserProgress) => {
              const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
              const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
              return (
                <Card
                  key={progress._id}
                  onPress={() => {
                    haptics.light();
                    if (topic && course) router.push(`/course/${course._id}/topic/${topic._id}` as any);
                  }}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{topic?.title || course?.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{Math.round(progress.accuracy ?? 0)}% accuracy</Text>
                  <ProgressBar value={progress.accuracy ?? 0} color={colors.danger} />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.lg },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold, marginTop: spacing.sm },
  cardTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, marginBottom: spacing.xs },
  cardSubtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, marginBottom: spacing.sm },
});
