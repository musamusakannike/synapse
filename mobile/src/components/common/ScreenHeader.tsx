import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { fontFamilies, spacing } from '@/theme';
import { INK, MUTED } from '@/theme/brand';
import GlassIconButton from './GlassIconButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, showBack, onBack, right }: ScreenHeaderProps) {
  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.wrap}>
      {(showBack || right) && (
        <View style={styles.topRow}>
          {showBack ? (
            <GlassIconButton onPress={handleBack} accessibilityLabel="Go back">
              <IconArrowLeft size={22} color={INK} />
            </GlassIconButton>
          ) : (
            <View style={styles.spacer} />
          )}
          {right ?? <View style={styles.spacer} />}
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  spacer: {
    width: 46,
    height: 46,
  },
  title: {
    fontSize: 34,
    fontFamily: fontFamilies.sansBold,
    color: INK,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFamilies.sans,
    color: MUTED,
    marginTop: 4,
    lineHeight: 21,
  },
});
