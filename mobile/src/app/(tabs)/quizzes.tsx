import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, Search, Plus, Clock, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Quiz {
  _id: string;
  topic: string;
  title?: string;
  score?: number;
  totalQuestions?: number;
  completed?: boolean;
  createdAt: string;
}

function QuizCard({ quiz, index }: { quiz: Quiz; index: number }) {
  const { c } = useTheme();
  const router = useRouter();

  const date = new Date(quiz.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const scorePercent =
    quiz.score !== undefined && quiz.totalQuestions
      ? Math.round((quiz.score / quiz.totalQuestions) * 100)
      : null;

  const scoreColor =
    scorePercent === null ? c.textMuted :
    scorePercent >= 80 ? c.success :
    scorePercent >= 50 ? c.warning :
    c.danger;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Pressable
        onPress={() => { haptics.light(); router.push(`/quiz/${quiz._id}`); }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? c.bgHover : c.bgSecondary,
            borderColor: c.borderSubtle,
          },
        ]}
      >
        <View style={[styles.cardIcon, { backgroundColor: `${c.success}22` }]}>
          <HelpCircle size={18} color={c.success} strokeWidth={1.5} />
        </View>
        <View style={styles.cardBody}>
          <Text
            style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
            numberOfLines={2}
          >
            {quiz.title || quiz.topic}
          </Text>
          <View style={styles.cardMeta}>
            <Clock size={11} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.metaText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              {date}
            </Text>
            {quiz.totalQuestions ? (
              <>
                <Text style={[styles.dot, { color: c.border }]}>·</Text>
                <Text style={[styles.metaText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                  {quiz.totalQuestions} questions
                </Text>
              </>
            ) : null}
          </View>
        </View>
        {scorePercent !== null ? (
          <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}22`, borderColor: `${scoreColor}44` }]}>
            <CheckCircle size={12} color={scoreColor} strokeWidth={2} />
            <Text style={[styles.scoreText, { color: scoreColor, fontFamily: typography.body.bold }]}>
              {scorePercent}%
            </Text>
          </View>
        ) : (
          <View style={[styles.scoreBadge, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
            <Text style={[styles.scoreText, { color: c.textMuted, fontFamily: typography.body.medium }]}>
              Start
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function QuizzesScreen() {
  const { c } = useTheme();
  const toast = useToast();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const res = await api.get('/api/ai/quiz');
      return (res.data?.quizzes ?? []) as Quiz[];
    },
  });

  const filtered = (data ?? []).filter(
    (q) =>
      (q.title || q.topic)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
          My Quizzes
        </Text>
        <Pressable
          onPress={() => {
            haptics.medium();
            toast.info('Create Quiz', 'Ask the AI on the Home tab to create a quiz for you.');
          }}
          style={[styles.addBtn, { backgroundColor: c.success }]}
        >
          <Plus size={20} color="#0C0C0E" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
        <Search size={16} color={c.textMuted} strokeWidth={1.5} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search quizzes..."
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.textPrimary, fontFamily: typography.body.regular }]}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.skeletons}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <LegendList
          data={filtered}
          keyExtractor={(item: Quiz) => item._id}
          estimatedItemSize={90}
          recycleItems
          contentInset={{ top: spacing.sm, bottom: spacing.lg }}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item, index }: LegendListRenderItemProps<Quiz>) => <QuizCard quiz={item} index={index} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                icon={<HelpCircle size={24} color={c.success} strokeWidth={1.5} />}
                title="No quizzes yet"
                message="Ask the AI on the Home tab to create a quiz on any topic."
              />
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
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
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    paddingVertical: 0,
  },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  skeletons: { padding: spacing.lg, gap: spacing.md },
  empty: { paddingTop: spacing['6xl'] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: spacing.xs },
  cardTitle: {
    fontSize: fontSize.sm,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: { fontSize: fontSize['2xs'] },
  dot: { fontSize: fontSize.xs },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  scoreText: { fontSize: fontSize['2xs'] },
});
