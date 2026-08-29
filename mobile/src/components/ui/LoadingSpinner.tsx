import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  fill?: boolean;
}

export default function LoadingSpinner({ size = 'large', fill = true }: LoadingSpinnerProps) {
  return (
    <View style={[fill && styles.fill, { backgroundColor: fill ? '#FFFFFF' : 'transparent' }]}>
      <ActivityIndicator size={size} color="#FF8A1E" />
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
