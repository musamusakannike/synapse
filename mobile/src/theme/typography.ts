// Space Grotesk throughout, per SabiLearn brand rules.
export const fontFamilies = {
  sans: 'SpaceGrotesk-Regular',
  sansMedium: 'SpaceGrotesk-Medium',
  sansSemiBold: 'SpaceGrotesk-SemiBold',
  sansBold: 'SpaceGrotesk-Bold',
  display: 'SpaceGrotesk-Bold',
  displaySemiBold: 'SpaceGrotesk-SemiBold',
  displayBold: 'SpaceGrotesk-Bold',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 38,
  '4xl': 48,
  '5xl': 60,
} as const;

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.65,
};

export const letterSpacing = {
  tight: -0.3,
  normal: 0,
  wide: 0.5,
};

export type FontSizeToken = keyof typeof fontSizes;
export type FontFamilyToken = keyof typeof fontFamilies;
