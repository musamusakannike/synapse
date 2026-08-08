import { ReactNode } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ai';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth,
  onPress,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? colors.brandPrimary :
    variant === 'ai' ? colors.brandAi :
    variant === 'secondary' ? colors.surface :
    'transparent';

  const textColor =
    variant === 'primary' ? colors.brandOnPrimary :
    variant === 'ai' ? colors.brandOnAi :
    variant === 'secondary' ? colors.textPrimary :
    colors.brandPrimary;

  const borderColor = variant === 'secondary' ? colors.borderDefault : 'transparent';

  const padV = size === 'sm' ? spacing.sm : size === 'lg' ? spacing.base : spacing.md;
  const padH = size === 'sm' ? spacing.base : size === 'lg' ? spacing.xl : spacing.lg;
  const fontSize = size === 'sm' ? fontSizes.sm : fontSizes.base;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={(e) => {
        haptics.light();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: radii.md,
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
          transform: pressed && !isDisabled ? [{ translateY: -1 }] : undefined,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: textColor, fontSize }]}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamilies.sansMedium,
  },
});
