import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from './api';
import { signInWithGoogle, signOutFirebase } from './firebase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  premium: boolean;
  subscriptionStatus?: 'free' | 'active' | 'expired';
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  style: string;
  level: string;
  goals: string;
  generationsToday: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await api.get('/api/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data?.token) {
        await setAuthToken(res.data.token);
      }
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: msg };
    }
  }, [refreshUser]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/register', { email, password, name });
      if (res.data?.token) {
        await setAuthToken(res.data.token);
      }
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      return { success: false, error: msg };
    }
  }, [refreshUser]);

  const loginWithGoogleHandler = useCallback(async () => {
    try {
      const idToken = await signInWithGoogle();
      if (!idToken) return { success: false, error: 'Google sign-in cancelled' };

      const res = await api.post('/api/auth/google', { idToken });
      if (res.data?.token) {
        await setAuthToken(res.data.token);
      }
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Google authentication failed';
      return { success: false, error: msg };
    }
  }, [refreshUser]);

  const loginWithAppleHandler = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios') {
        return { success: false, error: 'Apple Sign-In is only available on iOS' };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const fullName = credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined;

      const res = await api.post('/api/auth/apple', {
        identityToken: credential.identityToken,
        fullName: fullName || undefined,
        email: credential.email || undefined,
      });

      if (res.data?.token) {
        await setAuthToken(res.data.token);
      }
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, error: 'Apple sign-in cancelled' };
      }
      const msg = err.response?.data?.error || err.message || 'Apple authentication failed';
      return { success: false, error: msg };
    }
  }, [refreshUser]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to send reset code';
      return { success: false, error: msg };
    }
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    try {
      await api.post('/api/auth/reset-password', { email, otp, newPassword });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to reset password';
      return { success: false, error: msg };
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    try {
      await api.post('/api/auth/resend-otp', { email });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to resend code';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    await clearAuthToken();
    await signOutFirebase();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle: loginWithGoogleHandler,
        loginWithApple: loginWithAppleHandler,
        forgotPassword,
        resetPassword,
        resendOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
