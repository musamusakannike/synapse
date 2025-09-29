import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthAPI } from '../../lib/api';
import { saveToken } from '../../lib/auth';
import { colors, commonStyles, spacing, borderRadius, shadows, typography } from '../../styles/theme';

export default function SignInScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    try {
      setLoading(true);
      await AuthAPI.requestCode(email);
      setStep('code');
    } catch (e: any) {
      setError(e?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!code || code.length < 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError('');
    try {
      setLoading(true);
      const { data } = await AuthAPI.verifyCode(email, code);
      const token = data?.accessToken;
      if (!token) throw new Error('Invalid server response');
      await saveToken(token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>SYNAPSE</Text>
          <Text style={styles.title}>{step === 'email' ? 'Welcome back' : 'Verify your email'}</Text>
          <Text style={styles.subtitle}>
            {step === 'email' ? 'Sign in to continue your learning journey' : `We sent a 6-digit code to ${email}`}
          </Text>
        </View>

        {step === 'email' ? (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError('');
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[commonStyles.input, styles.input, !!error && commonStyles.inputError]}
              placeholderTextColor={colors.text.tertiary}
            />
            {!!error && <Text style={commonStyles.error}>{error}</Text>}

            <TouchableOpacity 
              disabled={loading} 
              style={[commonStyles.primaryButton, styles.primaryButton, loading && styles.buttonDisabled]} 
              onPress={sendCode}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} size="small" />
              ) : (
                <Text style={commonStyles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Verification code</Text>
            <TextInput
              value={code}
              onChangeText={(t) => {
                const v = t.replace(/\D/g, '').slice(0, 6);
                setCode(v);
                if (error) setError('');
              }}
              placeholder="000000"
              keyboardType="number-pad"
              style={[commonStyles.input, styles.input, styles.codeInput, !!error && commonStyles.inputError]}
              maxLength={6}
              placeholderTextColor={colors.text.tertiary}
            />
            {!!error && <Text style={commonStyles.error}>{error}</Text>}

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                disabled={loading} 
                style={[commonStyles.secondaryButton, styles.backButton, loading && styles.buttonDisabled]} 
                onPress={() => setStep('email')}
              >
                <Text style={commonStyles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                disabled={loading || code.length < 6} 
                style={[
                  commonStyles.primaryButton, 
                  styles.primaryButton, 
                  styles.verifyButton,
                  (loading || code.length < 6) && styles.buttonDisabled
                ]} 
                onPress={verify}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <Text style={commonStyles.primaryButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => Alert.alert('Help', 'You can also sign in on the web to manage your account or contact support for assistance.')}>
            <Text style={styles.helpText}>Need help? Contact support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[5],
  },
  
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    ...shadows.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  
  brandTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  
  formGroup: {
    marginBottom: spacing[4],
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  
  input: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing[3],
  },
  
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontVariant: ['tabular-nums'],
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
  },
  
  primaryButton: {
    marginTop: spacing[2],
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  
  backButton: {
    flex: 1,
  },
  
  verifyButton: {
    flex: 2,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
