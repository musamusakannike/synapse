import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconBook,
  IconTrendingUp,
  IconArrowRight,
  IconSparkles,
  IconBrain,
  IconCards,
  IconMessageCircle,
} from '@tabler/icons-react-native';
import { useProgressStore } from '@/store/progress.store';
import { useAuthStore } from '@/store/auth.store';
import { courseApi } from '@/lib/api';
import { Course, UserProgress, Topic } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import AIToolCard from '@/components/ui/AIToolCard';
import AIToolDialog, { AIToolKind } from '@/components/ai/AIToolDialogs';
import OfflineBanner from '@/components/common/OfflineBanner';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function DashboardHome() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { dashboard, isLoading, fetchDashboard } = useProgressStore();
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [aiTool, setAiTool] = useState<AIToolKind | null>(null);

  useEffect(() => {
    fetchDashboard();
    fetchPopularCourses();
  }, [fetchDashboard]);

  const fetchPopularCourses = async () => {
    try {
      const res = await courseApi.popular();
      setPopularCourses(res.data.data);
    } catch {
      // silently fail — offline or server error
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await Promise.all([fetchDashboard(), fetchPopularCourses()]);
    setRefreshing(false);
  }, [fetchDashboard]);

  if (isLoading && !dashboard) {
    return <LoadingSpinner />;
  }

  const continueStudying = dashboard?.continueStudying || [];
  const s = makeStyles(colors);

  const aiTools: { kind: AIToolKind; title: string; description: string; icon: React.ReactNode }[] = [
    { kind: 'summarizer', title: 'Summarizer', description: 'Turn any lecture note into a short summary', icon: <IconSparkles size={20} color="#FFFFFF" /> },
    { kind: 'quiz', title: 'Quiz generator', description: 'Generate a quick multiple-choice quiz', icon: <IconBrain size={20} color="#FFFFFF" /> },
    { kind: 'flashcards', title: 'Flashcards generator', description: 'Build flashcards from any topic', icon: <IconCards size={20} color="#FFFFFF" /> },
    { kind: 'qa', title: 'Q&A AI', description: 'Ask a question, get a direct answer', icon: <IconMessageCircle size={20} color="#FFFFFF" /> },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <OfflineBanner />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} colors={[colors.brandPrimary]} />}
      >
        <View style={s.header}>
          <Text style={s.title}>Hi{user?.firstName ? `, ${user.firstName}` : ''}</Text>
          <Text style={s.subtitle}>Continue your learning journey</Text>
        </View>

        {continueStudying.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitlePadded}>Continue studying</Text>
            <View style={s.cardList}>
              {continueStudying.slice(0, 4).map((progress) => {
                const course = typeof progress.course === 'object' ? (progress.course as Course) : null;
                const topic = typeof progress.topic === 'object' ? (progress.topic as Topic) : null;
                const flashcardProgress = progress.flashcardsTotal > 0 ? (progress.flashcardsStudied / progress.flashcardsTotal) * 100 : 0;
                return (
                  <Card
                    key={progress._id}
                    onPress={() => {
                      haptics.light();
                      if (topic && course) router.push(`/course/${course._id}/topic/${topic._id}` as any);
                      else if (course) router.push(`/course/${course._id}` as any);
                    }}
                  >
                    <View style={s.cardHeader}>
                      <View style={{ flex: 1 }}>
                        {course && <Text style={s.cardOverline} numberOfLines={1}>{course.title}</Text>}
                        <Text style={s.cardTitle} numberOfLines={1}>{topic?.title || course?.title || 'Course'}</Text>
                      </View>
                      {course && <Badge variant={course.difficulty}>{course.difficulty}</Badge>}
                    </View>
                    <View style={s.progressSection}>
                      <View style={s.progressHeader}>
                        <Text style={s.progressLabelText}>Flashcard progress</Text>
                        <Text style={s.progressLabelText}>{Math.round(flashcardProgress)}%</Text>
                      </View>
                      <ProgressBar value={flashcardProgress} />
                    </View>
                    <View style={s.continueLink}>
                      <Text style={s.continueLinkText}>Continue</Text>
                      <IconArrowRight size={16} color={colors.brandPrimaryHover} />
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitlePadded}>AI tools</Text>
          <View style={s.aiGrid}>
            {aiTools.map((tool) => (
              <View key={tool.kind} style={s.aiGridItem}>
                <AIToolCard icon={tool.icon} title={tool.title} description={tool.description} onPress={() => setAiTool(tool.kind)} />
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Popular courses</Text>
            <Pressable onPress={() => { haptics.light(); router.push('/(tabs)/courses'); }}>
              <Text style={s.viewAllLink}>View all</Text>
            </Pressable>
          </View>
          {popularCourses.length === 0 ? (
            <EmptyState icon={<IconBook size={44} color={colors.textTertiary} />} title="No courses available yet" description="Check back later for study content." />
          ) : (
            <View style={s.cardList}>
              {popularCourses.map((course) => (
                <Card key={course._id} onPress={() => { haptics.light(); router.push(`/course/${course._id}` as any); }}>
                  <View style={s.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle} numberOfLines={1}>{course.title}</Text>
                      <Text style={s.progressLabelText}>{course.category}</Text>
                    </View>
                    <Badge>{course.topicCount || 0} topics</Badge>
                  </View>
                  <Text style={s.topicDesc} numberOfLines={2}>{course.description}</Text>
                  <View style={s.continueLink}>
                    <Text style={s.continueLinkText}>View course</Text>
                    <IconArrowRight size={14} color={colors.brandPrimaryHover} />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <AIToolDialog kind={aiTool} onClose={() => setAiTool(null)} />
    </SafeAreaView>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgApp },
    scroll: { flex: 1 },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
    title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold, color: c.textPrimary, marginBottom: spacing.xs },
    subtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, color: c.textSecondary },
    section: { marginTop: spacing.xl },
    sectionTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary },
    sectionTitlePadded: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary, marginBottom: spacing.md, paddingHorizontal: spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.md },
    cardList: { paddingHorizontal: spacing.xl, gap: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
    cardOverline: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: c.brandPrimaryHover, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
    cardTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary },
    progressSection: { gap: spacing.xs, marginBottom: spacing.sm },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabelText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, color: c.textSecondary },
    continueLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    continueLinkText: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium, color: c.brandPrimaryHover },
    aiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, gap: spacing.md },
    aiGridItem: { width: '47%', flexGrow: 1 },
    viewAllLink: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, color: c.brandPrimaryHover },
    topicDesc: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, color: c.textSecondary, marginBottom: spacing.sm, lineHeight: 20 },
  });
}
