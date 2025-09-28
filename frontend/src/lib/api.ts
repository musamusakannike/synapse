import axios from "axios";

// Base API URL
export const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Attach token on each request if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Simple response error normalization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const AuthAPI = {
  requestCode: (email: string) => api.post("/auth", { email }),
  verifyCode: (email: string, code: string) => api.post("/auth/verify", { email, code }),
};

// Document endpoints
export const DocumentAPI = {
  upload: (formData: FormData) => api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  list: () => api.get("/documents"),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
  reprocess: (id: string) => api.post(`/documents/${id}/reprocess`),
};

// Chat endpoints
export const ChatAPI = {
  list: () => api.get("/chats"),
  get: (id: string) => api.get(`/chats/${id}`),
  create: () => api.post("/chats/new"),
  sendMessage: (id: string, content: string) => api.post(`/chats/${id}/message`, { content }),
  updateTitle: (id: string, title: string) => api.put(`/chats/${id}/title`, { title }),
  delete: (id: string) => api.delete(`/chats/${id}`),
};

// Topic endpoints
export const TopicAPI = {
  list: () => api.get("/topics"),
  get: (id: string) => api.get(`/topics/${id}`),
  create: (data: { title: string; description: string; difficulty: string }) => api.post("/topics", data),
  update: (id: string, data: { title: string; description: string; difficulty: string }) => api.put(`/topics/${id}`, data),
  delete: (id: string) => api.delete(`/topics/${id}`),
  regenerate: (id: string) => api.post(`/topics/${id}/generate`),
};

// Quiz endpoints
export const QuizAPI = {
  list: () => api.get("/quizzes"),
  get: (id: string) => api.get(`/quizzes/${id}`),
  create: (data: { title: string; description: string; difficulty: string; topic: string }) => api.post("/quizzes", data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  submitAttempt: (id: string, answers: number[]) => api.post(`/quizzes/${id}/attempt`, { answers }),
};

// Website endpoints
export const WebsiteAPI = {
  list: () => api.get("/websites"),
  get: (id: string) => api.get(`/websites/${id}`),
  create: (url: string) => api.post("/websites", { url }),
  delete: (id: string) => api.delete(`/websites/${id}`),
  rescrape: (id: string) => api.post(`/websites/${id}/rescrape`),
};

export default api;
