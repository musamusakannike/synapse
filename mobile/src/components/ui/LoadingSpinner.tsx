import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  fill?: boolean;
}

export default function LoadingSpinner({ size = 'large', fill = true }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  return (
    <View style={[fill && styles.fill, { backgroundColor: fill ? colors.bgApp : 'transparent' }]}>
      <ActivityIndicator size={size} color={colors.brandPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
