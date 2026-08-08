'use client';

import { create } from 'zustand';
import api, { authApi, userApi } from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { User, IUserSettings } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; level: string }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (settings: Partial<IUserSettings>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('sabilearn_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('sabilearn_token') : false,
  isLoading: false,

  login: async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('sabilearn_token', token);
      localStorage.setItem('sabilearn_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    try {
      const res = await authApi.register(data);
      const { token, user } = res.data;
      localStorage.setItem('sabilearn_token', token);
      localStorage.setItem('sabilearn_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.errors?.join(' ') || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  },

  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await authApi.google(idToken);
      const { token, user } = res.data;
      localStorage.setItem('sabilearn_token', token);
      localStorage.setItem('sabilearn_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in popup was closed before completing.' };
      }
      const message = error.response?.data?.message || 'Google sign-in failed. Please try again.';
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('sabilearn_token');
    localStorage.removeItem('sabilearn_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await authApi.me();
      const user = res.data.user;
      localStorage.setItem('sabilearn_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('sabilearn_token');
      localStorage.removeItem('sabilearn_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await userApi.updateProfile(data);
      const user = res.data.data;
      localStorage.setItem('sabilearn_user', JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed.';
      return { success: false, error: message };
    }
  },

  updateSettings: async (settings) => {
    try {
      const res = await userApi.updateSettings(settings);
      const updatedSettings = res.data.data.settings;
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, settings: updatedSettings };
        localStorage.setItem('sabilearn_user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Settings update failed.';
      return { success: false, error: message };
    }
  },
}));

void api;
