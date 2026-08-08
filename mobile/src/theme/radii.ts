// design/tokens/effects.css radius scale.
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radii;
