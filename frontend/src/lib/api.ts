import axios from "axios";
import { uiBus } from "@/lib/uiBus";

// Base API URL
// export const API_BASE_URL = "http://localhost:5000/api";
export const API_BASE_URL = "https://synapse-tzlh.onrender.com/api";

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
    const status = error?.response?.status as number | undefined;
    const serverMessage = error?.response?.data?.message as string | undefined;
    const message = serverMessage || error?.message || "Request failed";

    // Handle expired/invalid token -> open auth modal and show toast once in a while
    const tokenIssues = [401, 403].includes(status || 0);
    const tokenMessageHints = [
      "token",
      "expired",
      "unauthorized",
      "invalid",
      "authentication",
    ];

    // Simple rate limiter to avoid spamming modal/toast
    const now = Date.now();
    // @ts-ignore - augment on the api instance for simplicity
    const lastPromptAt: number | undefined = api.__lastAuthPromptAt;
    const shouldPrompt = !lastPromptAt || now - lastPromptAt > 10_000; // 10s window

    if (tokenIssues && shouldPrompt) {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      } catch {}

      // Mark last time we prompted
      // @ts-ignore
      api.__lastAuthPromptAt = now;

      // Show comprehensive toast
      uiBus.emit("toast", {
        type: "warning",
        message:
          "Your session has expired for security reasons. Please sign in again to continue. This helps protect your account and data.",
        durationMs: 8000,
      });

      // Open Auth modal
      uiBus.emit("open-auth-modal");
    }

    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const AuthAPI = {
  requestCode: (email: string) => api.post("/auth", { email }),
  verifyCode: (email: string, code: string) => api.post("/auth/verify", { email, code }),
  googleSignIn: (idToken: string) => api.post("/auth/google", { idToken }),
  githubSignIn: (idToken: string) => api.post("/auth/github", { idToken }),
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
  // Convenience: start or reuse a chat bound to this document and send a message.
  // Creates a chat (type: 'document') then posts the message and returns the send response.
  chat: async (id: string, content: string) => {
    // create a chat tied to the document
    const createRes = await api.post(`/chats/new`, { type: "document", sourceId: id });
    const chatId = createRes?.data?.chat?.id;
    if (!chatId) {
      throw new Error("Failed to create or locate chat for document");
    }
    // send the message to the chat
    return api.post(`/chats/${chatId}/message`, { content });
  },
};

// Chat endpoints
export const ChatAPI = {
  list: () => api.get("/chats"),
  get: (id: string) => api.get(`/chats/${id}`),
  create: (data?: any) => api.post("/chats/new", data || {}),
  sendMessage: (id: string, content: string) => api.post(`/chats/${id}/message`, { content }),
  updateTitle: (id: string, title: string) => api.put(`/chats/${id}/title`, { title }),
  delete: (id: string) => api.delete(`/chats/${id}`),
};

// Topic endpoints (align with server: { title, description?, content?, customizations? })
export const TopicAPI = {
  list: () => api.get("/topics"),
  get: (id: string) => api.get(`/topics/${id}`),
  create: (data: { title: string; description?: string; content?: string; customizations?: Record<string, any> }) =>
    api.post("/topics", data),
  update: (
    id: string,
    data: { title?: string; description?: string; content?: string; customizations?: Record<string, any> }
  ) => api.put(`/topics/${id}`, data),
  delete: (id: string) => api.delete(`/topics/${id}`),
  regenerate: (id: string, customizations?: Record<string, any>) =>
    api.post(`/topics/${id}/generate`, customizations ? { customizations } : {}),
};

// Quiz endpoints (align with server contracts)
export const QuizAPI = {
  list: () => api.get("/quizzes"),
  get: (id: string) => api.get(`/quizzes/${id}`),
  create: (data: {
    title: string;
    description?: string;
    sourceType?: "topic" | "document" | "website";
    sourceId?: string;
    sourceModel?: string;
    content?: string;
    settings?: {
      numberOfQuestions?: number;
      difficulty?: string;
      includeCalculations?: boolean;
      timeLimit?: number;
    };
  }) => api.post("/quizzes", data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  submitAttempt: (
    id: string,
    answers: { questionIndex: number; selectedOption: number; timeSpent?: number }[]
  ) => api.post(`/quizzes/${id}/attempt`, { answers }),
};

// Website endpoints
export const WebsiteAPI = {
  list: () => api.get("/websites"),
  get: (id: string) => api.get(`/websites/${id}`),
  create: (url: string) => api.post("/websites", { url }),
  delete: (id: string) => api.delete(`/websites/${id}`),
  rescrape: (id: string) => api.post(`/websites/${id}/rescrape`),
};

// Flashcard endpoints
export const FlashcardAPI = {
  list: () => api.get("/flashcards"),
  get: (id: string) => api.get(`/flashcards/${id}`),
  generate: (data: {
    title?: string;
    description?: string;
    sourceType: "topic" | "document" | "website" | "manual";
    sourceId?: string;
    settings?: {
      numberOfCards?: number;
      difficulty?: "easy" | "medium" | "hard" | "mixed";
      includeDefinitions?: boolean;
      includeExamples?: boolean;
      focusAreas?: string[];
    };
  }) => api.post("/flashcards/generate", data),
  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      flashcards?: Array<{
        front: string;
        back: string;
        difficulty?: "easy" | "medium" | "hard";
        tags?: string[];
      }>;
    }
  ) => api.put(`/flashcards/${id}`, data),
  delete: (id: string) => api.delete(`/flashcards/${id}`),
  updateStudyStats: (id: string, score: number, sessionDuration?: number) =>
    api.post(`/flashcards/${id}/study-stats`, { score, sessionDuration }),
};

// Wikipedia endpoints
export const WikipediaAPI = {
  search: (q: string, lang: string = "en", limit: number = 20) =>
    api.get(`/wikipedia/search`, { params: { q, lang, limit } }),
  page: (title: string, lang: string = "en") =>
    api.get(`/wikipedia/page/${encodeURIComponent(title)}`, { params: { lang } }),
  import: (title: string, lang: string = "en") =>
    api.post(`/wikipedia/import`, { title, lang }),
};

export default api;
