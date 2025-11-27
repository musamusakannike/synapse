import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  tabBar: string;
  tabBarActive: string;
  headerBackground: string;
  headerText: string;
  inputBackground: string;
  placeholder: string;
  bottomSheet: string;
  bottomSheetHandle: string;
  shadow: string;
  overlay: string;
}

const lightColors: ThemeColors = {
  primary: '#4285F4',
  background: '#ffffff',
  card: '#ffffff',
  text: '#1f1f1f',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  tabBar: '#ffffff',
  tabBarActive: '#4285F4',
  headerBackground: '#ffffff',
  headerText: '#1f1f1f',
  inputBackground: '#f8f9fa',
  placeholder: '#9e9e9e',
  bottomSheet: '#ffffff',
  bottomSheetHandle: '#cccccc',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Dark colors based on focus-mode.tsx theme
const darkColors: ThemeColors = {
  primary: '#4285F4',
  background: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  tabBar: '#1e293b',
  tabBarActive: '#4285F4',
  headerBackground: '#0f172a',
  headerText: '#f1f5f9',
  inputBackground: '#1e293b',
  placeholder: '#64748b',
  bottomSheet: '#1e293b',
  bottomSheetHandle: '#475569',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isLoading, setIsLoading] = useState(true);

  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return systemColorScheme || 'light';
    }
    return currentTheme;
  };

  const isDark = getEffectiveTheme(theme) === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
