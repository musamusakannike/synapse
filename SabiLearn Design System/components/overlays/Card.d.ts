import React from 'react';
export interface CardProps {
  children: React.ReactNode;
  interactive?: boolean;
  style?: React.CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
