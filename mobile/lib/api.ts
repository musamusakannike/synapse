import axios from 'axios';
import { getToken } from './auth';

export const API_BASE_URL = 'https://synapse-tzlh.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const AuthAPI = {
  requestCode: (email: string) => api.post('/auth', { email }),
  verifyCode: (email: string, code: string) => api.post('/auth/verify', { email, code }),
  googleSignIn: (idToken: string) => api.post('/auth/google', { idToken }),
};

export const DocumentAPI = {
  upload: (form: FormData) =>
    api.post('/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: () => api.get('/documents'),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
  reprocess: (id: string) => api.post(`/documents/${id}/reprocess`),
};

export const ChatAPI = {
  list: () => api.get('/chats'),
  get: (id: string) => api.get(`/chats/${id}`),
  create: (data?: any) => api.post('/chats/new', data || {}),
  sendMessage: (id: string, content: string) => api.post(`/chats/${id}/message`, { content }),
  updateTitle: (id: string, title: string) => api.put(`/chats/${id}/title`, { title }),
  delete: (id: string) => api.delete(`/chats/${id}`),
};

export const TopicAPI = {
  list: () => api.get('/topics'),
  get: (id: string) => api.get(`/topics/${id}`),
  create: (data: { title: string; description?: string; content?: string; customizations?: Record<string, any> }) =>
    api.post('/topics', data),
  update: (
    id: string,
    data: { title?: string; description?: string; content?: string; customizations?: Record<string, any> }
  ) => api.put(`/topics/${id}`, data),
  delete: (id: string) => api.delete(`/topics/${id}`),
  regenerate: (id: string, customizations?: Record<string, any>) =>
    api.post(`/topics/${id}/generate`, customizations ? { customizations } : {}),
};

export const QuizAPI = {
  list: () => api.get('/quizzes'),
  get: (id: string) => api.get(`/quizzes/${id}`),
  create: (data: {
    title: string;
    description?: string;
    sourceType?: 'topic' | 'document' | 'website';
    sourceId?: string;
    sourceModel?: string;
    content?: string;
    settings?: {
      numberOfQuestions?: number;
      difficulty?: string;
      includeCalculations?: boolean;
      timeLimit?: number;
    };
  }) => api.post('/quizzes', data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  submitAttempt: (
    id: string,
    answers: { questionIndex: number; selectedOption: number; timeSpent?: number }[]
  ) => api.post(`/quizzes/${id}/attempt`, { answers }),
};

export const WebsiteAPI = {
  list: () => api.get('/websites'),
  get: (id: string) => api.get(`/websites/${id}`),
  create: (url: string) => api.post('/websites', { url }),
  delete: (id: string) => api.delete(`/websites/${id}`),
  rescrape: (id: string) => api.post(`/websites/${id}/rescrape`),
};

export const WikipediaAPI = {
  search: (q: string, lang: string = 'en', limit: number = 20) =>
    api.get(`/wikipedia/search`, { params: { q, lang, limit } }),
  page: (title: string, lang: string = 'en') =>
    api.get(`/wikipedia/page/${encodeURIComponent(title)}`, { params: { lang } }),
  import: (title: string, lang: string = 'en') => api.post(`/wikipedia/import`, { title, lang }),
};

export default api;
