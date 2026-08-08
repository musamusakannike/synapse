import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconEye, IconEyeOff, IconAlertTriangle } from '@tabler/icons-react-native';
import { useAuthStore } from '@/store/auth.store';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AuthBackground from '@/components/common/AuthBackground';
import Button from '@/components/ui/Button';
import * as haptics from '@/lib/haptics';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, loginWithGoogle, loginWithApple } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (result.success) {
      haptics.success();
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Login failed.');
      haptics.error();
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.success) {
      haptics.success();
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Google login failed.');
      haptics.error();
    }
  };

  const handleApple = async () => {
    setError('');
    setIsLoading(true);
    const result = await loginWithApple();
    setIsLoading(false);
    if (result.success) {
      haptics.success();
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Apple login failed.');
      haptics.error();
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue learning.</Text>
            </View>

            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerBg }]}>
                <IconAlertTriangle size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { borderColor: colors.borderDefault, color: colors.textPrimary }]}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.passwordWrap, { borderColor: colors.borderDefault }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.passwordInput, { color: colors.textPrimary }]}
                />
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
                  {showPassword ? (
                    <IconEyeOff size={18} color={colors.textTertiary} />
                  ) : (
                    <IconEye size={18} color={colors.textTertiary} />
                  )}
                </Pressable>
              </View>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text style={[styles.link, { color: colors.brandPrimaryHover }]}>Forgot password?</Text>
              </Pressable>
            </Link>

            <Button fullWidth loading={isLoading} onPress={handleLogin} style={{ marginTop: spacing.base }}>
              Sign in
            </Button>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            </View>

            <SocialAuthButtons onGoogle={handleGoogle} onApple={handleApple} loading={isLoading} />

            <View style={styles.footerRow}>
              <Text style={{ color: colors.textSecondary, fontFamily: fontFamilies.sans }}>Don&apos;t have an account?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={[styles.link, { color: colors.brandPrimaryHover }]}> Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingVertical: spacing.xl, gap: spacing.base },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displayBold },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  errorText: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium, flexShrink: 1 },
  field: { gap: spacing.xs },
  label: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium },
  input: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.base,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans,
  },
  link: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium, alignSelf: 'flex-end' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.base },
});
