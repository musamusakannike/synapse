import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

interface AuthHeaderProps {
  onBack?: () => void;
  fallbackRoute?: '/(auth)/onboarding' | '/(auth)/login' | '/(auth)/register';
}

export default function AuthHeader({ onBack, fallbackRoute = '/(auth)/onboarding' }: AuthHeaderProps) {
  const handleBack = () => {
    haptics.light();
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute);
    }
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    height: 48,
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
});
