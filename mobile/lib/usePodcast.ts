import { useState } from 'react';
import { api } from './api';

export interface PodcastScript {
  script: string;
  articleTitle: string;
  podcastStyle: string;
  wordCount: number;
  estimatedDuration: string;
  timestamp: string;
}

export interface PodcastAudio {
  audioId: string;
  downloadUrl: string;
  fileName: string;
  fileSize: string;
  voiceSettings: {
    gender: string;
    speed: number;
    pitch: number;
  };
  timestamp: string;
}

export interface GeneratedPodcast {
  podcastId: string;
  script: string;
  audioId: string;
  downloadUrl: string;
  fileName: string;
  fileSize: string;
  articleTitle: string;
  podcastStyle: string;
  voiceSettings: {
    gender: string;
    speed: number;
    pitch: number;
  };
  wordCount: number;
  estimatedDuration: string;
  generationTime: string;
  timestamp: string;
}

export interface PodcastHistory {
  podcasts: Array<{
    _id: string;
    articleTitle: string;
    script: string;
    podcastStyle: string;
    voiceSettings: {
      gender: string;
      speed: number;
      pitch: number;
    };
    audioMetadata: {
      audioId?: string;
      fileName?: string;
      fileSize?: string;
      duration?: string;
    };
    analytics: {
      wordCount: number;
      estimatedDuration: string;
      generationTime: number;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const usePodcast = () => {
  const [loading, setLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<GeneratedPodcast | null>(null);
  const [podcastScript, setPodcastScript] = useState<PodcastScript | null>(null);
  const [podcastAudio, setPodcastAudio] = useState<PodcastAudio | null>(null);
  const [podcastHistory, setPodcastHistory] = useState<PodcastHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePodcastScript = async (
    articleTitle: string,
    articleContent: string,
    podcastStyle: string = 'professional'
  ) => {
    setScriptLoading(true);
    setError(null);
    setPodcastScript(null);

    try {
      const response = await api.post('/podcast/script', {
        articleTitle,
        articleContent,
        podcastStyle
      });
      setPodcastScript(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to generate podcast script:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate podcast script');
      throw err;
    } finally {
      setScriptLoading(false);
    }
  };

  const generatePodcastAudio = async (
    script: string,
    voiceGender: string = 'NEUTRAL',
    voiceSpeed: number = 1.0,
    voicePitch: number = 0.0
  ) => {
    setAudioLoading(true);
    setError(null);
    setPodcastAudio(null);

    try {
      const response = await api.post('/podcast/audio', {
        script,
        voiceGender,
        voiceSpeed,
        voicePitch
      });
      setPodcastAudio(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to generate podcast audio:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate podcast audio');
      throw err;
    } finally {
      setAudioLoading(false);
    }
  };

  const generateFullPodcast = async (
    articleTitle: string,
    articleContent: string,
    podcastStyle: string = 'professional',
    voiceGender: string = 'NEUTRAL',
    voiceSpeed: number = 1.0,
    voicePitch: number = 0.0
  ) => {
    setLoading(true);
    setError(null);
    setGeneratedPodcast(null);

    try {
      const response = await api.post('/podcast/generate', {
        articleTitle,
        articleContent,
        podcastStyle,
        voiceGender,
        voiceSpeed,
        voicePitch
      });
      setGeneratedPodcast(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to generate podcast:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate podcast');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPodcastHistory = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/podcast/history?page=${page}&limit=${limit}`);
      setPodcastHistory(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Failed to get podcast history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get podcast history');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPodcastById = async (podcastId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/podcast/${podcastId}`);
      return response.data.podcast;
    } catch (err: any) {
      console.error('Failed to get podcast:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get podcast');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePodcast = async (podcastId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/podcast/${podcastId}`);
      return response.data;
    } catch (err: any) {
      console.error('Failed to delete podcast:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete podcast');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearPodcast = () => {
    setGeneratedPodcast(null);
    setPodcastScript(null);
    setPodcastAudio(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    loading,
    scriptLoading,
    audioLoading,
    generatedPodcast,
    podcastScript,
    podcastAudio,
    podcastHistory,
    error,

    // Actions
    generatePodcastScript,
    generatePodcastAudio,
    generateFullPodcast,
    getPodcastHistory,
    getPodcastById,
    deletePodcast,
    clearPodcast,
    clearError,
    setError
  };
};

export default usePodcast;