import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconBrandGoogleFilled, IconBrandApple } from '@tabler/icons-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { spacing } from '@/theme';
import { isAppleAuthAvailable } from '@/lib/firebase';
import Button from '@/components/ui/Button';

interface SocialAuthButtonsProps {
  onGoogle: () => void;
  onApple: () => void;
  loading?: boolean;
}

export default function SocialAuthButtons({ onGoogle, onApple, loading }: SocialAuthButtonsProps) {
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    isAppleAuthAvailable().then(setAppleAvailable);
  }, []);

  return (
    <View style={styles.container}>
      <Button
        variant="secondary"
        fullWidth
        disabled={loading}
        onPress={onGoogle}
        icon={<IconBrandGoogleFilled size={18} color="#0E0E1A" />}
      >
        Continue with Google
      </Button>
      {appleAvailable && (
        <Button
          variant="secondary"
          fullWidth
          disabled={loading}
          onPress={onApple}
          icon={<IconBrandApple size={18} color="#0E0E1A" />}
        >
          Continue with Apple
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
