import { ReactNode } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, radii, spacing, shadows } from '@/theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  inverse?: boolean;
  padded?: boolean;
}

export default function Card({ children, onPress, style, inverse, padded = true }: CardProps) {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.base,
        {
          backgroundColor: inverse ? colors.surfaceInverse : colors.surfaceCard,
          borderRadius: radii.lg,
          padding: padded ? spacing.base : 0,
        },
        shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
