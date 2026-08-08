export { lightColors, darkColors, type ThemeColors, type ColorToken } from './colors';
export { spacing, type SpacingToken } from './spacing';
export { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing, type FontSizeToken, type FontFamilyToken } from './typography';
export { radii, type RadiusToken } from './radii';
export { ThemeProvider, useTheme, type ThemeMode } from './ThemeProvider';

// Soft, colorless shadow presets (design/tokens/effects.css).
export const shadows = {
  xs: { shadowColor: '#0E0E1A', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sm: { shadowColor: '#0E0E1A', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md: { shadowColor: '#0E0E1A', shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  lg: { shadowColor: '#0E0E1A', shadowOpacity: 0.14, shadowRadius: 40, shadowOffset: { width: 0, height: 16 }, elevation: 8 },
  xl: { shadowColor: '#0E0E1A', shadowOpacity: 0.18, shadowRadius: 60, shadowOffset: { width: 0, height: 24 }, elevation: 12 },
} as const;
