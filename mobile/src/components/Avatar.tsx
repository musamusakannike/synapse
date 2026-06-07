import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography, fontSize } from '@/constants/theme';

interface AvatarProps {
  name?: string;
  size?: number;
}

export function Avatar({ name, size = 36 }: AvatarProps) {
  const { c } = useTheme();
  const initial = name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.accentMuted,
        },
      ]}
    >
      <Text
        style={[
          styles.initial,
          {
            color: c.accent,
            fontFamily: typography.display.bold,
            fontSize: size * 0.4,
          },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    letterSpacing: 0,
  },
});
