import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { appReviewApi } from '@/lib/api';
import { AppReviewConfig, AppReviewStatusResponse, SupportedOS } from '@/lib/types';

const STORAGE_KEY = '@sabilearn_app_review_state';
const CURRENT_OS: SupportedOS = Platform.OS === 'ios' ? 'ios' : 'android';

interface AppReviewState {
  inReview: boolean;
  iosInReview: boolean;
  androidInReview: boolean;
  hiddenComponents: string[];
  customFlags: Record<string, boolean>;
  config: AppReviewConfig | null;
  allConfigs: Record<SupportedOS, AppReviewConfig> | null;
  isLoading: boolean;
  isInitialized: boolean;
  os: SupportedOS;
  devOverride: boolean | null;

  // Actions
  initialize: () => Promise<void>;
  fetchReviewStatus: (force?: boolean) => Promise<void>;
  isComponentHidden: (componentTag: string) => boolean;
  setDevOverride: (override: boolean | null) => void;
}

export const useAppReviewStore = create<AppReviewState>((set, get) => ({
  inReview: false,
  iosInReview: false,
  androidInReview: false,
  hiddenComponents: [],
  customFlags: {},
  config: null,
  allConfigs: null,
  isLoading: false,
  isInitialized: false,
  os: CURRENT_OS,
  devOverride: null,

  initialize: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        set({
          inReview: !!parsed.inReview,
          iosInReview: !!parsed.iosInReview,
          androidInReview: !!parsed.androidInReview,
          hiddenComponents: parsed.hiddenComponents || [],
          customFlags: parsed.customFlags || {},
          config: parsed.config || null,
          allConfigs: parsed.allConfigs || null,
          isInitialized: true,
        });
      }
    } catch {
      // ignore storage read failure
    } finally {
      set({ isInitialized: true });
      // Fetch latest in background
      void get().fetchReviewStatus();
    }
  },

  fetchReviewStatus: async () => {
    try {
      set({ isLoading: true });
      const version = Constants.expoConfig?.version || '1.0.0';
      const res = await appReviewApi.getStatus(CURRENT_OS, version);
      const data: AppReviewStatusResponse = res.data?.data;

      if (data) {
        const iosInReview = !!data.all?.ios?.inReview;
        const androidInReview = !!data.all?.android?.inReview;
        const currentInReview = !!data.inReview;
        const hiddenComponents = Array.isArray(data.hiddenComponents) ? data.hiddenComponents : [];
        const customFlags = data.customFlags || {};
        const config = data.all?.[CURRENT_OS] || null;

        const newState = {
          inReview: currentInReview,
          iosInReview,
          androidInReview,
          hiddenComponents,
          customFlags,
          config,
          allConfigs: data.all || null,
          isLoading: false,
          isInitialized: true,
        };

        set(newState);

        // Cache state locally for instant offline startup
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              inReview: currentInReview,
              iosInReview,
              androidInReview,
              hiddenComponents,
              customFlags,
              config,
              allConfigs: data.all,
            })
          );
        } catch {
          // ignore cache write error
        }
      }
    } catch (error) {
      // Offline or network glitch — retain current/cached state
      set({ isLoading: false });
    }
  },

  isComponentHidden: (componentTag: string) => {
    const { inReview, devOverride, hiddenComponents, customFlags } = get();
    const effectiveInReview = devOverride !== null ? devOverride : inReview;
    if (!effectiveInReview) return false;

    if (hiddenComponents.includes(componentTag)) return true;
    if (customFlags[componentTag] === false) return true;
    return false;
  },

  setDevOverride: (override: boolean | null) => {
    set({ devOverride: override });
  },
}));
