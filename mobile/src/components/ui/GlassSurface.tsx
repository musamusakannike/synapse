import { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { isLiquidGlassSupported, useLiquidGlass } from '@/hooks/useLiquidGlass';

const ACCENT_FALLBACK_BORDER = '#E8E8EE';

interface GlassSurfaceProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fallbackStyle?: StyleProp<ViewStyle>;
  glassEffectStyle?: 'clear' | 'regular';
  tintColor?: string;
  isInteractive?: boolean;
}

/**
 * Native Liquid Glass on iOS 26+; onboarding-style white card everywhere else.
 * Never set opacity to 0 on this view — it kills the glass effect.
 */
export default function GlassSurface({
  children,
  style,
  fallbackStyle,
  glassEffectStyle = 'regular',
  tintColor,
  isInteractive,
}: GlassSurfaceProps) {
  const glass = useLiquidGlass();
  if (glass) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={isInteractive}
        colorScheme="light"
      >
        {children}
      </GlassView>
    );
  }

  return <View style={[styles.fallback, fallbackStyle, style]}>{children}</View>;
}

interface GlassClusterProps {
  children?: ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

/** Merges nearby glass views on iOS 26+; row + gap fallback otherwise. */
export function GlassCluster({ children, spacing = 10, style }: GlassClusterProps) {
  if (isLiquidGlassSupported()) {
    return (
      <GlassContainer spacing={spacing} style={style}>
        {children}
      </GlassContainer>
    );
  }
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: ACCENT_FALLBACK_BORDER,
  },
});
