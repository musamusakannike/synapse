import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/theme';

interface AuthBackgroundProps {
  children: ReactNode;
}

// Flat warm off-white field per SabiLearn brand rules — no gradients except
// the one hero/login scrim the design system allows, which mobile skips for
// simplicity (solid surface, matching the rest of the app kit's flat fields).
export default function AuthBackground({ children }: AuthBackgroundProps) {
  const { colors } = useTheme();
  return <View style={[styles.container, { backgroundColor: colors.bgApp }]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});
