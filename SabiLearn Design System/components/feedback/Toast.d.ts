import React from 'react';
export interface ToastProps {
  children: React.ReactNode;
  tone?: 'success' | 'info' | 'error';
}
export function Toast(props: ToastProps): JSX.Element;
