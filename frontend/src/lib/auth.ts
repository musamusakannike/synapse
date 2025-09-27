export const TOKEN_KEY = "accessToken";

export const isBrowser = () => typeof window !== "undefined";

export const getToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const saveToken = (token: string) => {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

export const logout = () => {
  clearToken();
  // Optionally, you can also redirect the user here
};
