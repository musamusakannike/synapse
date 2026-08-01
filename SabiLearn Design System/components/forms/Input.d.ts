import React from 'react';
export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  /** Lucide icon name shown at the left */
  icon?: string;
}
export function Input(props: InputProps): JSX.Element;
