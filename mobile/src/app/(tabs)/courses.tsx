import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Plus, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Course {
  _id: string;
  title: string;
  topic: string;
  createdAt: string;
  lessons?: Array<{ title: string }>;
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const { c } = useTheme();
  const router = useRouter();

  const date = new Date(course.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lessonCount = course.lessons?.length ?? 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Pressable
        onPress={() => { haptics.light(); router.push(`/course/${course._id}`); }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? c.bgHover : c.bgSecondary,
            borderColor: c.borderSubtle,
          },
        ]}
      >
        <View style={[styles.cardIcon, { backgroundColor: c.accentMuted }]}>
          <BookOpen size={18} color={c.accent} strokeWidth={1.5} />
        </View>
        <View style={styles.cardBody}>
          <Text
            style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
            numberOfLines={2}
          >
            {course.title}
          </Text>
          {course.topic ? (
            <Text
              style={[styles.cardTopic, { color: c.textMuted, fontFamily: typography.body.regular }]}
              numberOfLines={1}
            >
              {course.topic}
            </Text>
          ) : null}
          <View style={styles.cardMeta}>
            <Clock size={11} color={c.textMuted} strokeWidth={1.5} />
            <Text style={[styles.cardDate, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              {date}
            </Text>
            {lessonCount > 0 && (
              <>
                <Text style={[styles.dot, { color: c.border }]}>·</Text>
                <Text style={[styles.cardDate, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                  {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CoursesScreen() {
  const { c } = useTheme();
  const toast = useToast();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api.get('/api/ai/course');
      return (res.data?.courses ?? []) as Course[];
    },
  });

  const filtered = (data ?? []).filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.topic?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
          My Courses
        </Text>
        <Pressable
          onPress={() => {
            haptics.medium();
            toast.info('Create Course', 'Ask the AI assistant to create a course for you from the Home tab.');
          }}
          style={[styles.addBtn, { backgroundColor: c.accent }]}
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
          placeholder="Search courses..."
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
        <FlashList
          data={filtered}
          keyExtractor={(item) => item._id}
          estimatedItemSize={100}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={c.accent}
              colors={[c.accent]}
            />
          }
          renderItem={({ item, index }) => <CourseCard course={item} index={index} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                icon={<BookOpen size={24} color={c.accent} strokeWidth={1.5} />}
                title="No courses yet"
                message="Go to the Home tab and ask the AI to generate a course for you."
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
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  skeletons: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  empty: { paddingTop: spacing['6xl'] },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  cardTopic: { fontSize: fontSize.xs },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  cardDate: { fontSize: fontSize['2xs'] },
  dot: { fontSize: fontSize.xs },
});
