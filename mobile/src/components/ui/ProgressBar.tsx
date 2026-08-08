import { View, StyleSheet } from 'react-native';
import { useTheme, radii } from '@/theme';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  trackColor?: string;
  height?: number;
}

export default function ProgressBar({ value, color, trackColor, height = 8 }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={[styles.track, { backgroundColor: trackColor ?? colors.surfaceSunken, height, borderRadius: radii.full }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color ?? colors.brandPrimary,
            borderRadius: radii.full,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
