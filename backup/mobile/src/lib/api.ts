import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://sabilearn.online';
const TOKEN_KEY = 'sabilearn_auth_token';

/**
 * Axios instance configured for the Sabi Learn API.
 * - Injects Bearer token from secure store
 * - Auto-retries on network failures
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry on transient failures
axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 502 ||
      error.response?.status === 503
    );
  },
});

// Request interceptor — inject auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore may fail on some devices — continue without token
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stale token
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {}
    }
    return Promise.reject(error);
  }
);

// Token management helpers
export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
