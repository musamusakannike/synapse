import { useState } from 'react';
import { api } from './api';

interface GeminiResponse {
  reply: string;
  historyLength?: number;
  fallback?: boolean;
}

const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyLength, setHistoryLength] = useState<number>(0);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  const fetchGeminiReply = async (prompt: string, chatId?: string) => {
    setLoading(true);
    setError(null);
    setReply(null);
    setUsingFallback(false);

    try {
      const requestBody: { prompt: string; chatId?: string } = { prompt };
      if (chatId) {
        requestBody.chatId = chatId;
      }
      
      const response = await api.post('/gemini', requestBody);
      const data: GeminiResponse = response.data;
      
      setReply(data.reply);
      setHistoryLength(data.historyLength || 0);
      setUsingFallback(data.fallback || false);
      
      // Log conversation context info for debugging
      if (data.historyLength && data.historyLength > 0) {
        console.log(`✓ Used conversation history (${data.historyLength} messages)`);
      }
      if (data.fallback) {
        console.log('⚠ Fallback to simple generation (history failed)');
      }
    } catch (err: any) {
      console.error('Failed to fetch Gemini reply:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    reply, 
    error, 
    historyLength,
    usingFallback,
    fetchGeminiReply, 
    setReply 
  };
};

export default useGemini;
