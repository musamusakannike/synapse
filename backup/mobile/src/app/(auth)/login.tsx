import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { typography, spacing, fontSize, radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const { c } = useTheme();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.warning('Missing fields', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    if (result.success) {
      toast.success('Welcome back!');
      router.replace('/(tabs)');
    } else {
      toast.error('Login failed', result.error);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      toast.success('Signed in with Google');
      router.replace('/(tabs)');
    } else if (result.error !== 'Google sign-in cancelled') {
      toast.error('Google sign-in failed', result.error);
    }
    setLoading(false);
  };

  const handleApple = async () => {
    setLoading(true);
    const result = await loginWithApple();
    if (result.success) {
      toast.success('Signed in with Apple');
      router.replace('/(tabs)');
    } else if (result.error !== 'Apple sign-in cancelled') {
      toast.error('Apple sign-in failed', result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: c.accentMuted }]}>
            <Text style={[styles.logoLetter, { color: c.accent, fontFamily: typography.display.extraBold }]}>
              S
            </Text>
          </View>
          <Text style={[styles.logoText, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
            Sabi Learn
          </Text>
        </Animated.View>

        {/* Heading */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.heading, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
            Welcome back
          </Text>
          <Text style={[styles.subheading, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
            Sign in to continue your learning journey.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />

          <Pressable
            onPress={() => {
              haptics.light();
              router.push('/(auth)/forgot-password');
            }}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: c.accent, fontFamily: typography.body.medium }]}>
              Forgot password?
            </Text>
          </Pressable>

          <Button onPress={handleLogin} loading={loading} fullWidth>
            Sign in
          </Button>
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          <Text style={[styles.dividerText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            or
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
        </Animated.View>

        {/* Social Buttons */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.socialCol}>
          <Button onPress={handleGoogle} variant="secondary" fullWidth disabled={loading}>
            <View style={styles.socialInner}>
              <GoogleIcon />
              <Text style={[styles.socialText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                Continue with Google
              </Text>
            </View>
          </Button>

          {Platform.OS === 'ios' && (
            <Button onPress={handleApple} variant="secondary" fullWidth disabled={loading}>
              <View style={styles.socialInner}>
                <AppleIcon color={c.textPrimary} />
                <Text style={[styles.socialText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                  Continue with Apple
                </Text>
              </View>
            </Button>
          )}
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.footer}>
          <Text style={[styles.footerText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            Don't have an account?{' '}
          </Text>
          <Pressable onPress={() => { haptics.light(); router.push('/(auth)/register'); }}>
            <Text style={[styles.footerLink, { color: c.accent, fontFamily: typography.body.semiBold }]}>
              Sign up
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function GoogleIcon() {
  return (
    <Image
      source={{ uri: 'https://www.google.com/favicon.ico' }}
      style={{ width: 18, height: 18 }}
      contentFit="contain"
    />
  );
}

function AppleIcon({ color }: { color: string }) {
  return (
    <Text style={{ fontSize: 18, color, marginTop: -2 }}>
      
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['4xl'],
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 18,
  },
  logoText: {
    fontSize: fontSize.lg,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: fontSize.sm,
    marginBottom: spacing['3xl'],
    lineHeight: 20,
  },
  form: {
    gap: spacing.lg,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontSize: fontSize.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: fontSize.xs,
  },
  socialCol: {
    gap: spacing.md,
  },
  socialInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  socialText: {
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['3xl'],
  },
  footerText: {
    fontSize: fontSize.sm,
  },
  footerLink: {
    fontSize: fontSize.sm,
  },
});
