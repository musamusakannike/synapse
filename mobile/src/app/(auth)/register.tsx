import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconAlertTriangle } from '@tabler/icons-react-native';
import { useAuthStore } from '@/store/auth.store';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AuthBackground from '@/components/common/AuthBackground';
import Button from '@/components/ui/Button';
import * as haptics from '@/lib/haptics';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, loginWithGoogle, loginWithApple } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6) {
      setError('Fill in every field. Password needs at least 6 characters.');
      return;
    }
    setIsLoading(true);
    const result = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      level: 'beginner',
    });
    setIsLoading(false);
    if (result.success) {
      haptics.success();
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Registration failed.');
      haptics.error();
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.success) router.replace('/(tabs)');
    else setError(result.error || 'Google sign-up failed.');
  };

  const handleApple = async () => {
    setIsLoading(true);
    const result = await loginWithApple();
    setIsLoading(false);
    if (result.success) router.replace('/(tabs)');
    else setError(result.error || 'Apple sign-up failed.');
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Create your account</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start learning in a few taps.</Text>
            </View>

            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerBg }]}>
                <IconAlertTriangle size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>First name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Ada"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, { borderColor: colors.borderDefault, color: colors.textPrimary }]}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Last name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Lovelace"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, { borderColor: colors.borderDefault, color: colors.textPrimary }]}
                />
              </View>
            </View>

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
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { borderColor: colors.borderDefault, color: colors.textPrimary }]}
              />
            </View>

            <Button fullWidth loading={isLoading} onPress={handleRegister} style={{ marginTop: spacing.sm }}>
              Create account
            </Button>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            </View>

            <SocialAuthButtons onGoogle={handleGoogle} onApple={handleApple} loading={isLoading} />

            <View style={styles.footerRow}>
              <Text style={{ color: colors.textSecondary, fontFamily: fontFamilies.sans }}>Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={[styles.link, { color: colors.brandPrimaryHover }]}> Sign in</Text>
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
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, borderRadius: radii.sm },
  errorText: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium, flexShrink: 1 },
  row: { flexDirection: 'row', gap: spacing.sm },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.base },
  link: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium },
});
