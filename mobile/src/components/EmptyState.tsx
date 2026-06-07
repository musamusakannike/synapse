import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing, fontSize } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { c } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: c.accentMuted }]}>{icon}</View>
      <Text style={[styles.title, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: c.textMuted, fontFamily: typography.body.regular }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button onPress={onAction} size="sm" style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.md,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.sm,
  },
});
