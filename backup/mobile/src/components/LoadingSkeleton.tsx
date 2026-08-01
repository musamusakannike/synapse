import { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius: br, style }: SkeletonProps) {
  const { c } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: br ?? radius.sm,
          backgroundColor: c.bgTertiary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Pre-built skeleton for card-like items */
export function CardSkeleton() {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
      <Skeleton width="60%" height={14} />
      <Skeleton width="100%" height={10} style={{ marginTop: spacing.sm }} />
      <Skeleton width="40%" height={10} style={{ marginTop: spacing.xs }} />
    </View>
  );
}

/** Skeleton list for loading states */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
