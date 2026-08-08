import React from 'react';

export default function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[var(--surface-card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
