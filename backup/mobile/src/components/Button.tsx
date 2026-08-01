import { type ReactNode } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing, radius, fontSize } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  onPress: () => void;
  children: string | ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  size = 'md',
}: ButtonProps) {
  const { c } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    haptics.medium();
    onPress();
  };

  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: fontSize.xs },
    md: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl, fontSize: fontSize.sm },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'], fontSize: fontSize.md },
  };

  const variantStyles = {
    primary: {
      container: { backgroundColor: c.accent },
      text: { color: '#0C0C0E' },
      spinnerColor: '#0C0C0E',
    },
    secondary: {
      container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border },
      text: { color: c.textSecondary },
      spinnerColor: c.textSecondary,
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: c.textSecondary },
      spinnerColor: c.textSecondary,
    },
    danger: {
      container: { backgroundColor: c.danger },
      text: { color: '#FFFFFF' },
      spinnerColor: '#FFFFFF',
    },
  };

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        animatedStyle,
        styles.container,
        vs.container,
        { paddingVertical: ss.paddingVertical, paddingHorizontal: ss.paddingHorizontal },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.spinnerColor} />
      ) : (
        <>
          {icon}
          {typeof children === 'string' ? (
            <Text
              style={[
                styles.text,
                vs.text,
                { fontSize: ss.fontSize, fontFamily: typography.body.semiBold },
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    gap: spacing.sm,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    letterSpacing: -0.2,
  },
});
