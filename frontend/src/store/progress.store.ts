'use client';

import { create } from 'zustand';
import { progressApi } from '@/lib/api';
import { DashboardData, ProgressStats, UserProgress } from '@/lib/types';

interface ProgressState {
  dashboardData: DashboardData | null;
  progressStats: ProgressStats | null;
  continueStudying: UserProgress[];
  needsImprovement: UserProgress[];
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchContinueStudying: () => Promise<void>;
  fetchNeedsImprovement: () => Promise<void>;
  submitFlashcardSession: (data: { course: string; topic: string; flashcardsStudied: number; duration: number }) => Promise<void>;
  submitMcqSession: (data: { course: string; topic: string; mcqAnswered: number; mcqCorrect: number; score: number; duration: number }) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  dashboardData: null,
  progressStats: null,
  continueStudying: [],
  needsImprovement: [],
  isLoading: false,

  fetchDashboard: async () => {
    try {
      const res = await progressApi.dashboard();
      set({ dashboardData: res.data.data });
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  },

  fetchProgress: async () => {
    try {
      const res = await progressApi.stats();
      set({ progressStats: res.data.data });
    } catch (error) {
      console.error('Failed to fetch progress stats:', error);
    }
  },

  fetchContinueStudying: async () => {
    try {
      const res = await progressApi.continueStudying();
      set({ continueStudying: res.data.data });
    } catch (error) {
      console.error('Failed to fetch continue studying:', error);
    }
  },

  fetchNeedsImprovement: async () => {
    try {
      const res = await progressApi.needsImprovement();
      set({ needsImprovement: res.data.data });
    } catch (error) {
      console.error('Failed to fetch needs improvement:', error);
    }
  },

  submitFlashcardSession: async (data) => {
    try {
      await progressApi.submitFlashcardSession(data);
    } catch (error) {
      console.error('Failed to submit flashcard session:', error);
    }
  },

  submitMcqSession: async (data) => {
    try {
      await progressApi.submitMcqSession(data);
    } catch (error) {
      console.error('Failed to submit MCQ session:', error);
    }
  },
}));
