import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconCheck, IconArrowLeft } from '@tabler/icons-react-native';
import { authApi } from '@/lib/api';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import AuthBackground from '@/components/common/AuthBackground';
import Button from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.container}>
        <Button variant="ghost" size="sm" onPress={() => router.back()} style={styles.back}>
          <IconArrowLeft size={16} color={colors.textSecondary} />
        </Button>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Reset your password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the email on your account and we&apos;ll send you a reset link.
        </Text>

        {sent ? (
          <View style={[styles.successBox, { backgroundColor: colors.successBg }]}>
            <IconCheck size={18} color={colors.success} />
            <Text style={[styles.successText, { color: colors.success }]}>
              If an account exists for {email}, a reset link is on its way.
            </Text>
          </View>
        ) : (
          <>
            {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
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
            <Button fullWidth loading={isLoading} onPress={handleSubmit}>Send reset link</Button>
          </>
        )}
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.xl, gap: spacing.base },
  back: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displayBold },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
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
  error: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium },
  successBox: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.base, borderRadius: radii.md },
  successText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
});
