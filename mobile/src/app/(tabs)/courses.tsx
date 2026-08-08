import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSearch, IconBook } from '@tabler/icons-react-native';
import { courseApi } from '@/lib/api';
import { Course } from '@/lib/types';
import { cacheCourses, getCachedCourses } from '@/lib/offlineSync';
import CourseCard from '@/components/ui/CourseCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function CoursesScreen() {
  const { colors } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      const res = await courseApi.list();
      const data: Course[] = res.data.data;
      setCourses(data);
      await cacheCourses(data);
    } catch {
      const cached = await getCachedCourses();
      setCourses(cached);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await loadCourses();
    setRefreshing(false);
  }, [loadCourses]);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Courses</Text>
        <View style={[styles.searchBar, { borderColor: colors.borderDefault, backgroundColor: colors.surfaceCard }]}>
          <IconSearch size={16} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search courses"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} colors={[colors.brandPrimary]} />}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={() => { haptics.light(); router.push(`/course/${item._id}` as any); }} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <EmptyState icon={<IconBook size={44} color={colors.textTertiary} />} title="No courses found" description="Try a different search, or check back later." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: spacing.base },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: fontSizes.sm, fontFamily: fontFamilies.sans },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
});
