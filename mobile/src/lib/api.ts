import axios from 'axios';
import Constants from 'expo-constants';
import { getToken, deleteToken } from './secureStorage';

const DEFAULT_API_URL = 'https://sabilearn.onrender.com/api/v1';

const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? DEFAULT_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteToken();
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };

// -- endpoint wrapper functions, mirroring the server's /api/v1 contract --

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; level: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  google: (idToken: string) => api.post('/auth/google', { idToken }),
  apple: (idToken: string) => api.post('/auth/apple', { idToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  me: () => api.get('/auth/me'),
};

export const courseApi = {
  list: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  popular: () => api.get('/courses/popular'),
  get: (id: string) => api.get(`/courses/${id}`),
};

export const topicApi = {
  byCourse: (courseId: string) => api.get(`/topics/course/${courseId}`),
  get: (id: string) => api.get(`/topics/${id}`),
};

export const flashcardApi = {
  byTopic: (topicId: string) => api.get(`/flashcards/topic/${topicId}`),
};

export const mcqApi = {
  byTopic: (topicId: string) => api.get(`/mcqs/topic/${topicId}`),
};

export const progressApi = {
  dashboard: () => api.get('/progress'),
  stats: () => api.get('/progress/stats'),
  continueStudying: () => api.get('/progress/continue'),
  needsImprovement: () => api.get('/progress/needs-improvement'),
  submitFlashcardSession: (data: { course: string; topic?: string; flashcardsStudied: number; duration: number; knownCount?: number; reviewCount?: number }) =>
    api.post('/progress/flashcard-session', data),
  submitMcqSession: (data: { course: string; topic?: string; mcqAnswered: number; mcqCorrect: number; score: number; duration: number }) =>
    api.post('/progress/mcq-session', data),
};

export const userApi = {
  profile: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
  updateSettings: (data: Record<string, unknown>) => api.put('/users/me/settings', data),
  deleteAccount: () => api.delete('/users/me'),
  uploadAvatar: (data: FormData) => api.post('/users/me/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  registerPushToken: (data: { token: string; timezoneOffset: number }) => api.post('/users/me/push-token', data),
  removePushToken: (token: string) => api.delete('/users/me/push-token', { data: { token } }),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};

export const searchApi = {
  global: (q: string) => api.get('/search', { params: { q } }),
};

// Payment callback URL scheme
export const PAYMENT_CALLBACK_URL = 'sabilearn://payment-callback';

export const paymentApi = {
  initializeCoursePurchase: (courseId: string) =>
    api.post(`/payments/courses/${courseId}/initialize`, { callbackUrl: PAYMENT_CALLBACK_URL }),
  initializeSubscription: () =>
    api.post('/payments/subscription/initialize', { callbackUrl: PAYMENT_CALLBACK_URL }),
  initializeManualSubscription: () =>
    api.post('/payments/subscription/manual/initialize', { callbackUrl: PAYMENT_CALLBACK_URL }),
  verify: (reference: string) => api.get(`/payments/verify/${reference}`),
  me: () => api.get('/payments/me'),
};
