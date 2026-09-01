import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { IconBrandGoogleFilled } from '@tabler/icons-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { fontFamilies, spacing } from '@/theme';
import { isAppleAuthAvailable } from '@/lib/firebase';
import * as haptics from '@/lib/haptics';

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

  const handlePressGoogle = () => {
    if (loading) return;
    haptics.light();
    onGoogle();
  };

  const handlePressApple = () => {
    if (loading) return;
    haptics.light();
    onApple();
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={handlePressGoogle}
        style={({ pressed }) => [
          styles.socialButton,
          pressed && !loading && styles.socialButtonPressed,
          loading && styles.disabledButton,
        ]}
      >
        <IconBrandGoogleFilled size={20} color="#0E0E1A" />
        <Text style={styles.socialButtonText}>Continue with Google</Text>
      </Pressable>

      {appleAvailable && (
        <View style={loading && styles.disabledButton} pointerEvents={loading ? 'none' : 'auto'}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
            cornerRadius={18}
            style={styles.appleButton}
            onPress={handlePressApple}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EB',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    height: 52,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  socialButtonPressed: {
    backgroundColor: '#F7F7F9',
    transform: [{ scale: 0.99 }],
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
    letterSpacing: -0.2,
  },
});


