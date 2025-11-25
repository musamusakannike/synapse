import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Base API URL
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
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error reading token from SecureStore:", error);
  }
  return config;
});

// Simple response error normalization
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    const serverMessage = error?.response?.data?.message as string | undefined;
    const message = serverMessage || error?.message || "Request failed";

    // Handle expired/invalid token
    const tokenIssues = [401, 403].includes(status || 0);

    // Simple rate limiter to avoid spamming
    const now = Date.now();
    // @ts-ignore - augment on the api instance for simplicity
    const lastPromptAt: number | undefined = api.__lastAuthPromptAt;
    const shouldPrompt = !lastPromptAt || now - lastPromptAt > 10_000; // 10s window

    if (tokenIssues && shouldPrompt) {
      try {
        await SecureStore.deleteItemAsync("accessToken");
      } catch {}

      // Mark last time we prompted
      // @ts-ignore
      api.__lastAuthPromptAt = now;

      // Emit event to open auth modal (will be handled by AuthContext)
      // For now, we'll just log - the context will handle this
      console.warn("Authentication required - session expired");
    }

    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const AuthAPI = {
  requestCode: (email: string) => api.post("/auth", { email }),
  verifyCode: (email: string, code: string) => api.post("/auth/verify", { email, code }),
  googleSignIn: (idToken: string) => api.post("/auth/google", { idToken }),
  googleSignInWithToken: (accessToken: string, userInfo: any) => api.post("/auth/google-token", { accessToken, userInfo }),
  githubSignIn: (idToken: string) => api.post("/auth/github", { idToken }),
};

// User endpoints
export const UserAPI = {
  getCurrentUser: () => api.get("/users/me"),
};

// Chat endpoints
export const ChatAPI = {
  getUserChats: (page: number = 1, limit: number = 20) => 
    api.get("/chats", { params: { page, limit } }),
  createNewChat: (title?: string, type: string = "general", sourceId?: string) => 
    api.post("/chats/new", { title, type, sourceId }),
  deleteChat: (chatId: string) => 
    api.delete(`/chats/${chatId}`),
  getChatWithMessages: (chatId: string) => 
    api.get(`/chats/${chatId}`),
  sendMessage: (chatId: string, content: string) => 
    api.post(`/chats/${chatId}/message`, { content }),
  bulkDeleteChats: (chatIds: string[]) => 
    api.post("/chats/bulk-delete", { chatIds }),
  updateChatTitle: (chatId: string, title: string) => 
    api.put(`/chats/${chatId}/title`, { title }),
  archiveChat: (chatId: string) => 
    api.put(`/chats/${chatId}/archive`),
  unarchiveChat: (chatId: string) => 
    api.put(`/chats/${chatId}/unarchive`),
  getArchivedChats: (page: number = 1, limit: number = 20) => 
    api.get("/chats/archived", { params: { page, limit } }),
  favoriteChat: (chatId: string) => 
    api.put(`/chats/${chatId}/favorite`),
  unfavoriteChat: (chatId: string) => 
    api.put(`/chats/${chatId}/unfavorite`),
  getFavoriteChats: (page: number = 1, limit: number = 20) => 
    api.get("/chats/favorites", { params: { page, limit } }),
  editMessage: (chatId: string, messageIndex: number, newContent: string) =>
    api.put(`/chats/${chatId}/message/${messageIndex}`, { content: newContent }),
  regenerateResponse: (chatId: string, messageIndex: number) =>
    api.post(`/chats/${chatId}/message/${messageIndex}/regenerate`),
};

// Document endpoints
export const DocumentAPI = {
  uploadDocument: (formData: FormData) => 
    api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getDocument: (documentId: string) => 
    api.get(`/documents/${documentId}`),
  listDocuments: () => 
    api.get("/documents"),
};

// Course endpoints
export const CourseAPI = {
  createCourse: (courseData: {
    title: string;
    description?: string;
    settings?: {
      level?: string;
      includeExamples?: boolean;
      includePracticeQuestions?: boolean;
      detailLevel?: string;
    };
  }) => api.post("/courses", courseData),
  listCourses: () => api.get("/courses"),
  getCourse: (courseId: string) => api.get(`/courses/${courseId}`),
  deleteCourse: (courseId: string) => api.delete(`/courses/${courseId}`),
  regenerateCourse: (courseId: string, settings?: any) => 
    api.post(`/courses/${courseId}/regenerate`, { settings }),
  downloadCoursePDF: (courseId: string) => 
    api.get(`/courses/${courseId}/pdf`, { responseType: "blob" }),
};

// Quiz endpoints
export const QuizAPI = {
  createQuiz: (quizData: {
    title: string;
    description?: string;
    sourceType: "topic" | "document" | "website" | "course";
    sourceId?: string;
    content?: string;
    settings?: {
      numberOfQuestions?: number;
      difficulty?: "easy" | "medium" | "hard" | "mixed";
      includeCalculations?: boolean;
      timeLimit?: number;
    };
  }) => api.post("/quizzes", quizData),
  listQuizzes: () => api.get("/quizzes"),
  getQuiz: (quizId: string) => api.get(`/quizzes/${quizId}`),
  deleteQuiz: (quizId: string) => api.delete(`/quizzes/${quizId}`),
  submitAttempt: (quizId: string, answers: {
    questionIndex: number;
    selectedOption: number;
    timeSpent?: number;
  }[]) => api.post(`/quizzes/${quizId}/attempt`, { answers }),
};

export default api;
