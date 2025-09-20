import { useState } from 'react';
import { api } from './api';

const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGeminiReply = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setReply(null);

    try {
      const response = await api.post('/gemini', { prompt });
      setReply(response.data.reply);
    } catch (err: any) {
      console.error('Failed to fetch Gemini reply:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, reply, error, fetchGeminiReply, setReply };
};

export default useGemini;
