import React from 'react';
export interface QuizOptionCardProps {
  label: string;
  state?: 'default' | 'selected' | 'correct' | 'incorrect';
  onClick?: () => void;
}
export function QuizOptionCard(props: QuizOptionCardProps): JSX.Element;
