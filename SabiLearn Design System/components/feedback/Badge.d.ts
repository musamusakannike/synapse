import React from 'react';
export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}
export function Badge(props: BadgeProps): JSX.Element;
