import { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ChevronLeft, Mail, KeyRound, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { typography, spacing, fontSize, radius } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

type Step = 'email' | 'otp' | 'done';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, resetPassword, resendOtp } = useAuth();
  const { c } = useTheme();
  const toast = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<TextInput[]>([]);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.warning('Enter your email', 'Please provide the email address for your account');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email.trim());
    if (result.success) {
      setStep('otp');
      startResendCooldown();
      toast.info('Code sent', `A 6-digit code was sent to ${email.trim()}`);
    } else {
      toast.error('Failed to send code', result.error);
    }
    setLoading(false);
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digits = val.replace(/\D/g, '').slice(0, 1);
    const updated = [...otp];
    updated[idx] = digits;
    setOtp(updated);
    if (digits && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.warning('Incomplete code', 'Please enter all 6 digits of the code');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Weak password', 'New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await resetPassword(email.trim(), code, newPassword);
    if (result.success) {
      setStep('done');
      haptics.success();
    } else {
      toast.error('Reset failed', result.error);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const result = await resendOtp(email.trim());
    if (result.success) {
      startResendCooldown();
      setOtp(['', '', '', '', '', '']);
      toast.info('New code sent', 'Check your email for the new code');
    } else {
      toast.error('Could not resend code', result.error);
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
        {/* Back */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Pressable
            onPress={() => {
              haptics.light();
              if (step === 'otp') setStep('email');
              else router.back();
            }}
            style={styles.backBtn}
          >
            <ChevronLeft size={20} color={c.textSecondary} strokeWidth={2} />
            <Text style={[styles.backText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
              Back
            </Text>
          </Pressable>
        </Animated.View>

        {step === 'email' && (
          <>
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.iconRow}>
              <View style={[styles.iconWrap, { backgroundColor: c.accentMuted }]}>
                <Mail size={26} color={c.accent} strokeWidth={1.5} />
              </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Text style={[styles.heading, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
                Forgot password?
              </Text>
              <Text style={[styles.subheading, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                Enter your email and we'll send you a 6-digit reset code.
              </Text>
            </Animated.View>
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
              <Button onPress={handleSendOtp} loading={loading} fullWidth>
                Send reset code
              </Button>
            </Animated.View>
          </>
        )}

        {step === 'otp' && (
          <>
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.iconRow}>
              <View style={[styles.iconWrap, { backgroundColor: c.accentMuted }]}>
                <KeyRound size={26} color={c.accent} strokeWidth={1.5} />
              </View>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Text style={[styles.heading, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
                Enter code
              </Text>
              <Text style={[styles.subheading, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                We sent a 6-digit code to{' '}
                <Text style={{ color: c.accent }}>{email}</Text>
              </Text>
            </Animated.View>

            {/* OTP boxes */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(r) => { if (r) otpRefs.current[idx] = r; }}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, idx)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: c.bgSecondary,
                      borderColor: digit ? c.accent : c.border,
                      color: c.textPrimary,
                      fontFamily: typography.display.bold,
                    },
                  ]}
                />
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.form}>
              <Input
                label="New password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                textContentType="newPassword"
              />
              <Button onPress={handleResetPassword} loading={loading} fullWidth>
                Reset password
              </Button>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.resendRow}>
              <Text style={[styles.resendText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
                Didn't receive the code?{' '}
              </Text>
              <Pressable onPress={handleResend} disabled={resendCooldown > 0 || loading}>
                <Text
                  style={[
                    styles.resendLink,
                    {
                      color: resendCooldown > 0 ? c.textMuted : c.accent,
                      fontFamily: typography.body.semiBold,
                    },
                  ]}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </Text>
              </Pressable>
            </Animated.View>
          </>
        )}

        {step === 'done' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.doneContainer}>
            <View style={[styles.iconWrap, { backgroundColor: `${c.success}22` }]}>
              <CheckCircle size={32} color={c.success} strokeWidth={1.5} />
            </View>
            <Text style={[styles.heading, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
              Password reset!
            </Text>
            <Text style={[styles.subheading, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
              Your password has been updated successfully. You can now sign in with your new password.
            </Text>
            <Button
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              style={{ marginTop: spacing.xl }}
            >
              Back to Sign in
            </Button>
          </Animated.View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing['3xl'],
    alignSelf: 'flex-start',
  },
  backText: { fontSize: fontSize.sm },
  iconRow: {
    marginBottom: spacing['2xl'],
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: fontSize['2xl'],
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing['3xl'],
  },
  form: { gap: spacing.lg },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: fontSize.xl,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
    flexWrap: 'wrap',
  },
  resendText: { fontSize: fontSize.sm },
  resendLink: { fontSize: fontSize.sm },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    gap: spacing.md,
  },
});
