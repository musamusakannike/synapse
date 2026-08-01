import React from 'react';
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style */
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
