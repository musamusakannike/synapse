import { create } from 'zustand';
import api from '@/lib/api';
import { DashboardData, ProgressStats, UserProgress } from '@/lib/types';
import { isOnline, queueSession } from '@/lib/offlineSync';

interface ProgressState {
  dashboard: DashboardData | null;
  stats: ProgressStats | null;
  continueStudying: UserProgress[];
  needsImprovement: UserProgress[];
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchContinueStudying: () => Promise<void>;
  fetchNeedsImprovement: () => Promise<void>;
  submitFlashcardSession: (data: { course: string; topic?: string; flashcardsStudied: number; duration: number; knownCount: number; reviewCount: number }) => Promise<void>;
  submitMcqSession: (data: { course: string; topic?: string; mcqAnswered: number; mcqCorrect: number; duration: number; score: number }) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  dashboard: null,
  stats: null,
  continueStudying: [],
  needsImprovement: [],
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/progress');
      set({ dashboard: res.data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProgress: async () => {
    try {
      const res = await api.get('/progress/stats');
      set({ stats: res.data.data });
    } catch {
      // silently fail
    }
  },

  fetchContinueStudying: async () => {
    try {
      const res = await api.get('/progress/continue');
      set({ continueStudying: res.data.data });
    } catch {
      // silently fail
    }
  },

  fetchNeedsImprovement: async () => {
    try {
      const res = await api.get('/progress/needs-improvement');
      set({ needsImprovement: res.data.data });
    } catch {
      // silently fail
    }
  },

  submitFlashcardSession: async (data) => {
    try {
      const online = await isOnline();
      if (!online) {
        await queueSession('/progress/flashcard-session', data);
        return;
      }
      await api.post('/progress/flashcard-session', data);
    } catch {
      // silently fail
    }
  },

  submitMcqSession: async (data) => {
    try {
      const online = await isOnline();
      if (!online) {
        await queueSession('/progress/mcq-session', data);
        return;
      }
      await api.post('/progress/mcq-session', data);
    } catch {
      // silently fail
    }
  },
}));
