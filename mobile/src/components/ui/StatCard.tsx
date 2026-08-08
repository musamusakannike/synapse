import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing, shadows } from '@/theme';

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}

export default function StatCard({ icon, label, value, accent }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard }, shadows.xs]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: (accent ?? colors.brandPrimary) + '1A' }]}>
          {icon}
        </View>
      ) : null}
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing.base,
    minWidth: 120,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSizes.xl,
    fontFamily: fontFamilies.displaySemiBold,
  },
  label: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans,
    marginTop: spacing.xs / 2,
  },
});
