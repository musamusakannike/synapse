import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';

type Variant = 'default' | 'beginner' | 'intermediate' | 'advanced' | 'success' | 'warning' | 'danger' | 'ai';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const { colors } = useTheme();

  const map: Record<Variant, { bg: string; fg: string }> = {
    default: { bg: colors.surfaceSunken, fg: colors.textSecondary },
    beginner: { bg: colors.successBg, fg: colors.success },
    intermediate: { bg: colors.warningBg, fg: colors.warning },
    advanced: { bg: colors.dangerBg, fg: colors.danger },
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    ai: { bg: colors.brandAiSoft, fg: colors.brandAi },
  };
  const { bg, fg } = map[variant] ?? map.default;

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
