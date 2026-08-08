import { create } from 'zustand';
import { Platform } from 'react-native';
import { getAuth, signInWithCredential, signOut, GoogleAuthProvider, AppleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import api from '@/lib/api';
import { getToken, saveToken, deleteToken } from '@/lib/secureStorage';
import { User, IUserSettings } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; level: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithApple: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (data: Partial<IUserSettings>) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
}

export const DEFAULT_SETTINGS: IUserSettings = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyProgress: true,
  language: 'en',
  studyReminders: true,
  streakAlerts: true,
  reminderHour: 19,
  reminderMinute: 0,
  timezoneOffset: 0,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const token = await getToken();
      if (token) {
        await get().fetchMe();
      }
    } catch {
      await deleteToken();
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        await saveToken(res.data.token);
        if (res.data.user) {
          set({ user: res.data.user, isAuthenticated: true });
        } else {
          await get().fetchMe();
        }
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.data.message || 'Login failed.' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message || err.message || 'Login failed. Please try again.' };
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        await saveToken(res.data.token);
        if (res.data.user) {
          set({ user: res.data.user, isAuthenticated: true });
        } else {
          await get().fetchMe();
        }
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.data.message || 'Registration failed.' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message || err.message || 'Registration failed. Please try again.' };
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken || (signInResult as any).idToken;
      if (!idToken) {
        set({ isLoading: false });
        return { success: false, error: 'Google sign-in failed. No ID token received.' };
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const authInstance = getAuth();
      await signInWithCredential(authInstance, googleCredential);
      const firebaseIdToken = await authInstance.currentUser?.getIdToken();
      if (!firebaseIdToken) {
        set({ isLoading: false });
        return { success: false, error: 'Failed to get Firebase token.' };
      }
      const res = await api.post('/auth/google', { idToken: firebaseIdToken });
      if (res.data.success) {
        await saveToken(res.data.token);
        if (res.data.user) {
          set({ user: res.data.user, isAuthenticated: true });
        } else {
          await get().fetchMe();
        }
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.data.message || 'Google login failed.' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message || err.message || 'Google login failed. Please try again.' };
    }
  },

  loginWithApple: async () => {
    set({ isLoading: true });
    try {
      const nonce = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
      const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
        nonce: hashedNonce,
      });
      const { identityToken } = appleAuthRequestResponse;
      if (!identityToken) {
        set({ isLoading: false });
        return { success: false, error: 'Apple sign-in failed. No identity token received.' };
      }
      const appleCredential = AppleAuthProvider.credential(identityToken, nonce);
      const authInstance = getAuth();
      await signInWithCredential(authInstance, appleCredential);
      const firebaseIdToken = await authInstance.currentUser?.getIdToken();
      if (!firebaseIdToken) {
        set({ isLoading: false });
        return { success: false, error: 'Failed to get Firebase token.' };
      }
      const res = await api.post('/auth/apple', { idToken: firebaseIdToken });
      if (res.data.success) {
        await saveToken(res.data.token);
        if (res.data.user) {
          set({ user: res.data.user, isAuthenticated: true });
        } else {
          await get().fetchMe();
        }
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.data.message || 'Apple login failed.' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message || err.message || 'Apple login failed. Please try again.' };
    }
  },

  logout: async () => {
    try {
      await deleteToken();
      if (Platform.OS !== 'web') {
        try {
          await signOut(getAuth());
          await GoogleSignin.revokeAccess();
        } catch {
          // Firebase sign-out may fail if not signed in via Firebase
        }
      }
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      const res = await api.delete('/users/me');
      if (res.data.success) {
        await deleteToken();
        if (Platform.OS !== 'web') {
          try {
            await signOut(getAuth());
            await GoogleSignin.revokeAccess();
          } catch {}
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: res.data.message || 'Failed to delete account.' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to delete account.' };
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true });
      }
    } catch {
      await deleteToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/users/me', data);
      if (res.data.success) {
        set({ user: res.data.data });
        return { success: true };
      }
      return { success: false, error: res.data.message || 'Failed to update profile.' };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Failed to update profile.' };
    }
  },

  updateSettings: async (data) => {
    const previous = get().user;
    if (!previous) return { success: false, error: 'Not signed in.' };

    // Applied optimistically so toggles respond instantly, then rolled back if
    // the write fails — a switch that lags a round trip feels broken.
    const merged = { ...DEFAULT_SETTINGS, ...previous.settings, ...data };
    set({ user: { ...previous, settings: merged } });

    try {
      const res = await api.put('/users/me/settings', data);
      if (res.data.success) {
        set({
          user: {
            ...get().user!,
            settings: { ...merged, ...(res.data.data?.settings || {}) },
          },
        });
        return { success: true };
      }
      set({ user: previous });
      return { success: false, error: res.data.message || 'Failed to update settings.' };
    } catch (err: any) {
      set({ user: previous });
      return { success: false, error: err.response?.data?.message || 'Failed to update settings.' };
    }
  },
}));
