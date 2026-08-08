import { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { IconArrowRight } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing, shadows } from '@/theme';
import * as haptics from '@/lib/haptics';

interface AIToolCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

// AI-only surface: violet fill per brand rule (AI surfaces are the sole use
// of --brand-violet).
export default function AIToolCard({ icon, title, description, onPress }: AIToolCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.brandAi, opacity: pressed ? 0.92 : 1 },
        shadows.sm,
      ]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      <View style={styles.footer}>
        <Text style={styles.cta}>Open tool</Text>
        <IconArrowRight size={16} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.base,
    minHeight: 148,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sansSemiBold,
    color: '#FFFFFF',
    marginTop: spacing.sm,
  },
  description: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sans,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs / 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  cta: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansMedium,
    color: '#FFFFFF',
  },
});
