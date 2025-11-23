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
  githubSignIn: (idToken: string) => api.post("/auth/github", { idToken }),
};

export default api;
