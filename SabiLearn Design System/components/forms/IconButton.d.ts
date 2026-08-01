import React from 'react';
export interface IconButtonProps {
  /** Lucide icon name, e.g. "search", "menu", "x" */
  icon: string;
  size?: number;
  variant?: 'ghost' | 'filled';
  onClick?: () => void;
  'aria-label': string;
}
export function IconButton(props: IconButtonProps): JSX.Element;
