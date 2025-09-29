import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthAPI } from '../../lib/api';
import { saveToken } from '../../lib/auth';

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
        <Text style={styles.title}>{step === 'email' ? 'Welcome' : 'Enter verification code'}</Text>
        <Text style={styles.subtitle}>
          {step === 'email' ? 'Sign in with your email' : `We sent a code to ${email}`}
        </Text>

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
              style={[styles.input, !!error && styles.inputError]}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity disabled={loading} style={styles.primaryBtn} onPress={sendCode}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Continue</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formGroup}>
            <Text style={styles.label}>6-digit code</Text>
            <TextInput
              value={code}
              onChangeText={(t) => {
                const v = t.replace(/\D/g, '').slice(0, 6);
                setCode(v);
                if (error) setError('');
              }}
              placeholder="000000"
              keyboardType="number-pad"
              style={[styles.input, styles.codeInput, !!error && styles.inputError]}
              maxLength={6}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.row}>
              <TouchableOpacity disabled={loading} style={styles.secondaryBtn} onPress={() => setStep('email')}>
                <Text style={styles.secondaryText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={loading || code.length < 6} style={styles.primaryBtn} onPress={verify}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Verify & Continue</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={() => Alert.alert('Tip', 'You can also sign in on the web to manage your account.')}>
          <Text style={styles.tip}>Need help? Contact support.</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 6 },
  formGroup: { marginTop: 20 },
  label: { fontSize: 12, color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  codeInput: { textAlign: 'center', letterSpacing: 4, fontVariant: ['tabular-nums'] },
  inputError: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  error: { color: '#dc2626', marginTop: 6, fontSize: 12 },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryText: { color: '#111827', fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tip: { textAlign: 'center', color: '#6b7280', marginTop: 16, fontSize: 12 },
});
