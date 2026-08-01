import React from 'react';
export interface LessonCardProps {
  title: string;
  meta: string;
  /** 0-100 */
  progress?: number;
  locked?: boolean;
  onClick?: () => void;
}
export function LessonCard(props: LessonCardProps): JSX.Element;
