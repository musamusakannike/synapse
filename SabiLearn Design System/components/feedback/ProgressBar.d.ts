import React from 'react';
export interface ProgressBarProps {
  /** 0-100 */
  value: number;
  tone?: 'primary' | 'accent';
}
export function ProgressBar(props: ProgressBarProps): JSX.Element;
