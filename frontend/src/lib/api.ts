import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sabilearn_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sabilearn_token');
      localStorage.removeItem('sabilearn_user');
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// -- endpoint wrapper functions, mirroring the /api/v1 contract --

export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; level: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  google: (idToken: string) => api.post('/auth/google', { idToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  me: () => api.get('/auth/me'),
};

export const courseApi = {
  list: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  popular: () => api.get('/courses/popular'),
  get: (id: string) => api.get(`/courses/${id}`),
  create: (data: FormData) => api.post('/courses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/courses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id: string) => api.delete(`/courses/${id}`),
};

export const topicApi = {
  byCourse: (courseId: string) => api.get(`/topics/course/${courseId}`),
  get: (id: string) => api.get(`/topics/${id}`),
  create: (data: Partial<import('./types').Topic>) => api.post('/topics', data),
  update: (id: string, data: Partial<import('./types').Topic>) => api.put(`/topics/${id}`, data),
  remove: (id: string) => api.delete(`/topics/${id}`),
  reorder: (data: { course: string; order: string[] }) => api.put('/topics/reorder', data),
};

export const flashcardApi = {
  byTopic: (topicId: string) => api.get(`/flashcards/topic/${topicId}`),
  create: (data: Partial<import('./types').Flashcard>) => api.post('/flashcards', data),
  bulkCreate: (data: { topic: string; flashcards: { question: string; answer: string }[] }) => api.post('/flashcards/bulk', data),
  update: (id: string, data: Partial<import('./types').Flashcard>) => api.put(`/flashcards/${id}`, data),
  remove: (id: string) => api.delete(`/flashcards/${id}`),
};

export const mcqApi = {
  byTopic: (topicId: string) => api.get(`/mcqs/topic/${topicId}`),
  create: (data: Partial<import('./types').MCQ>) => api.post('/mcqs', data),
  bulkCreate: (data: { topic: string; mcqs: Partial<import('./types').MCQ>[] }) => api.post('/mcqs/bulk', data),
  update: (id: string, data: Partial<import('./types').MCQ>) => api.put(`/mcqs/${id}`, data),
  remove: (id: string) => api.delete(`/mcqs/${id}`),
};

export const progressApi = {
  dashboard: () => api.get('/progress'),
  stats: () => api.get('/progress/stats'),
  continueStudying: () => api.get('/progress/continue'),
  needsImprovement: () => api.get('/progress/needs-improvement'),
  submitFlashcardSession: (data: { course: string; topic: string; flashcardsStudied: number; duration: number }) =>
    api.post('/progress/flashcard-session', data),
  submitMcqSession: (data: { course: string; topic: string; mcqAnswered: number; mcqCorrect: number; score: number; duration: number }) =>
    api.post('/progress/mcq-session', data),
};

export const paymentApi = {
  initializeCoursePurchase: (courseId: string) => api.post(`/payments/courses/${courseId}/initialize`),
  initializeSubscription: () => api.post('/payments/subscription/initialize'),
  initializeManualSubscription: () => api.post('/payments/subscription/manual/initialize'),
  verify: (reference: string) => api.get(`/payments/verify/${reference}`),
  me: () => api.get('/payments/me'),
};

export const userApi = {
  profile: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
  updateSettings: (data: Record<string, unknown>) => api.put('/users/me/settings', data),
  deleteAccount: () => api.delete('/users/me'),
  uploadAvatar: (data: FormData) => api.post('/users/me/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params?: Record<string, unknown>) => api.get('/users', { params }),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  remove: (id: string) => api.delete(`/users/${id}`),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  create: (data: Record<string, unknown>) => api.post('/notifications', data),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};

export const searchApi = {
  global: (q: string) => api.get('/search', { params: { q } }),
};

export const mediaApi = {
  upload: (data: FormData) => api.post('/media/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const adminApi = {
  analytics: () => api.get('/admin/analytics'),
  coursePerformance: () => api.get('/admin/course-performance'),
  userGrowth: () => api.get('/admin/user-growth'),
  recentActivity: () => api.get('/admin/recent-activity'),
};
