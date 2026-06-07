/**
 * Sabi Learn — Design Token System
 * Mirrors the web frontend CSS custom properties from globals.css
 */

export const colors = {
  dark: {
    bgPrimary: '#0C0C0E',
    bgSecondary: '#141416',
    bgTertiary: '#1C1C20',
    bgElevated: '#232328',
    bgHover: '#2A2A30',

    textPrimary: '#F5F2ED',
    textSecondary: '#A8A29E',
    textMuted: '#6B6560',

    accent: '#E8A838',
    accentHover: '#F0BD5C',
    accentMuted: 'rgba(232, 168, 56, 0.125)',
    accentSubtle: 'rgba(232, 168, 56, 0.063)',

    border: '#2A2A30',
    borderSubtle: '#1F1F24',

    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',

    glassBg: 'rgba(20, 20, 22, 0.7)',
  },
  light: {
    bgPrimary: '#FCFBF9',
    bgSecondary: '#F5F3EE',
    bgTertiary: '#EAE7E2',
    bgElevated: '#FFFFFF',
    bgHover: '#EFECE6',

    textPrimary: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#8C8A84',

    accent: '#B47F1D',
    accentHover: '#966612',
    accentMuted: 'rgba(180, 127, 29, 0.125)',
    accentSubtle: 'rgba(180, 127, 29, 0.063)',

    border: '#E6E2DB',
    borderSubtle: '#F0EDE8',

    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',

    glassBg: 'rgba(252, 251, 249, 0.75)',
  },
} as const;

export type ThemeMode = 'dark' | 'light';
export type ColorTokens = typeof colors.dark;
export type ColorKey = keyof ColorTokens;

export const typography = {
  display: {
    regular: 'Outfit-Regular',
    medium: 'Outfit-Medium',
    semiBold: 'Outfit-SemiBold',
    bold: 'Outfit-Bold',
    extraBold: 'Outfit-ExtraBold',
  },
  body: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  '2xs': 10,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
