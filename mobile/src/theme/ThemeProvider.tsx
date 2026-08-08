import { createContext, useContext, type ReactNode } from 'react';
import { lightColors, darkColors, type ThemeColors } from './colors';

// SabiLearn's design system only defines a light palette today. The
// ThemeProvider shape (mode/isDark/setMode) is kept for future dark-mode
// support, but it always resolves to the light tokens for now.
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value: ThemeContextValue = {
    colors: lightColors,
    mode: 'light',
    isDark: false,
    setMode: () => {},
    toggle: () => {},
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export { darkColors };
