import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sabilearn_has_onboarded';

interface OnboardingState {
  hasOnboarded: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasOnboarded: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      set({ hasOnboarded: value === 'true' });
    } catch {
      // default to false
    } finally {
      set({ isInitialized: true });
    }
  },

  completeOnboarding: async () => {
    set({ hasOnboarded: true });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // non-fatal
    }
  },
}));
