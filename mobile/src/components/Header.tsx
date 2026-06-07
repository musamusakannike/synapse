import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing, fontSize } from '@/constants/theme';
import { haptics } from '@/lib/haptics';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  onBackPress?: () => void;
  transparent?: boolean;
}

export function Header({ title, showBack = true, rightAction, onBackPress, transparent }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  const handleBack = () => {
    haptics.light();
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor: transparent ? 'transparent' : c.bgPrimary,
          borderBottomColor: transparent ? 'transparent' : c.borderSubtle,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <ChevronLeft size={22} color={c.textPrimary} strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text
          style={[styles.title, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : <View style={styles.backPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 36,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    letterSpacing: -0.3,
  },
  rightAction: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});
