import { useState } from 'react';
import { api } from './api';

export interface GeneratedWebsite {
  htmlCode: string;
  prompt: string;
  timestamp: string;
}

const useWebsiteGen = () => {
  const [loading, setLoading] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState<GeneratedWebsite | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateWebsite = async (prompt: string, websiteType: string = 'simple') => {
    setLoading(true);
    setError(null);
    setGeneratedWebsite(null);

    try {
      const response = await api.post('/website/generate', { prompt, websiteType });
      setGeneratedWebsite(response.data);
    } catch (err: any) {
      console.error('Failed to generate website:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate website');
    } finally {
      setLoading(false);
    }
  };

  const clearWebsite = () => {
    setGeneratedWebsite(null);
    setError(null);
  };

  return { 
    loading, 
    generatedWebsite, 
    error, 
    generateWebsite, 
    clearWebsite,
    setError
  };
};

export default useWebsiteGen;