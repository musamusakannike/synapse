// SabiLearn design tokens — ported 1:1 from design/tokens/colors.css.
export const ink900 = '#0E0E1A';
export const ink700 = '#35354A';
export const ink500 = '#6B6B80';
export const ink300 = '#A9A9BC';
export const ink100 = '#DEDAD0';

export const surfacePage = '#F5F3EE';
export const surfaceCardRaw = '#FFFFFF';
export const surfaceSunken = '#ECE8DF';
export const surfaceInverse = '#0E0E1A';

export const line = '#DEDAD0';
export const lineStrong = '#C7C2B6';

export const brandGold = '#F2A900';
export const brandGold600 = '#D89400';
export const brandGold100 = '#FBDDB0';

export const brandViolet = '#5B4FE8';
export const brandViolet600 = '#4A3FD1';
export const brandViolet100 = '#E7E3FB';

export const success = '#1F9D55';
export const successBg = '#DDF3E4';
export const danger = '#E5484D';
export const dangerBg = '#FBE1E2';
export const warning = '#E8890C';
export const warningBg = '#FBEAD2';

export interface ThemeColors {
  bgApp: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  surfaceCard: string;
  surfaceOverlay: string;
  surfaceInverse: string;

  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textLink: string;

  brandPrimary: string;
  brandPrimaryHover: string;
  brandPrimarySoft: string;
  brandOnPrimary: string;

  brandAi: string;
  brandAiHover: string;
  brandAiSoft: string;
  brandOnAi: string;

  brandAccent: string;
  focusRing: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;

  white: string;
}

export const lightColors: ThemeColors = {
  bgApp: surfacePage,
  surface: surfaceCardRaw,
  surfaceRaised: surfaceCardRaw,
  surfaceSunken,
  surfaceCard: surfaceCardRaw,
  surfaceOverlay: 'rgba(14, 14, 26, 0.5)',
  surfaceInverse,

  borderSubtle: line,
  borderDefault: line,
  borderStrong: lineStrong,

  textPrimary: ink900,
  textSecondary: ink700,
  textTertiary: ink500,
  textInverse: '#FFFFFF',
  textLink: brandGold600,

  brandPrimary: brandGold,
  brandPrimaryHover: brandGold600,
  brandPrimarySoft: brandGold100,
  brandOnPrimary: ink900,

  brandAi: brandViolet,
  brandAiHover: brandViolet600,
  brandAiSoft: brandViolet100,
  brandOnAi: '#FFFFFF',

  brandAccent: brandGold,
  focusRing: brandGold,

  success,
  successBg,
  warning,
  warningBg,
  danger,
  dangerBg,

  white: '#FFFFFF',
};

// Design system is light-only for now; dark mirrors light (see ThemeProvider).
export const darkColors: ThemeColors = lightColors;

export type ColorToken = keyof ThemeColors;
