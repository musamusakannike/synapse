import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

interface OnboardingHeaderProps {
  progress: number; // 0 to 1 (e.g. 0.25, 0.5, 0.75, 1.0)
  onBack: () => void;
}

export default function OnboardingHeader({ progress, onBack }: OnboardingHeaderProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  const handleBack = () => {
    haptics.light();
    onBack();
  };

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <IconArrowLeft size={26} color="#111118" strokeWidth={2.4} />
      </Pressable>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${clamped * 100}%`,
              backgroundColor: '#FF8A1E',
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#EAEAEA',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
});
