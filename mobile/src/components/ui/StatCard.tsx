import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontFamilies, spacing } from '@/theme';
import { INK, MUTED, TINT_GLASS } from '@/theme/brand';
import GlassSurface from './GlassSurface';

interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  accent?: string;
  tintColor?: string;
}

export default function StatCard({ icon, label, value, accent, tintColor }: StatCardProps) {
  return (
    <GlassSurface style={styles.card} tintColor={tintColor ?? TINT_GLASS} glassEffectStyle="clear">
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: (accent ?? '#FF8A1E') + '29' }]}>{icon}</View>
      ) : null}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: 20,
    padding: spacing.base,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 22,
    fontFamily: fontFamilies.sansBold,
    color: INK,
    letterSpacing: -0.4,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamilies.sansMedium,
    color: MUTED,
    marginTop: 2,
  },
});
