import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'sabilearn_jwt_token';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(JWT_KEY, token);
    }
    return;
  }
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(JWT_KEY);
    }
    return null;
  }
  return await SecureStore.getItemAsync(JWT_KEY);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(JWT_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(JWT_KEY);
}
