import { View, Text, Image, StyleSheet } from 'react-native';
import { IconBook2 } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { Course } from '@/lib/types';
import Card from './Card';
import Badge from './Badge';

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} padded={false} style={styles.card}>
      {course.banner ? (
        <Image source={{ uri: course.banner }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerFallback, { backgroundColor: colors.surfaceSunken }]}>
          <IconBook2 size={28} color={colors.textTertiary} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{course.title}</Text>
          <Badge variant={course.difficulty}>{course.difficulty}</Badge>
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {course.description}
        </Text>
        <View style={styles.footerRow}>
          <Text style={[styles.category, { color: colors.textTertiary }]}>{course.category}</Text>
          <Text style={[styles.topicCount, { color: colors.textTertiary }]}>
            {course.topicCount ?? 0} topics
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 120,
  },
  bannerFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sansSemiBold,
  },
  description: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans,
    lineHeight: fontSizes.sm * 1.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  category: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  topicCount: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans,
  },
});
