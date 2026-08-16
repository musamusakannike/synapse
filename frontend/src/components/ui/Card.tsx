import React from 'react';

export default function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] bg-[var(--surface-card)] shadow-[var(--shadow-xs)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
