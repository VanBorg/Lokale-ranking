import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const Card = ({ selected, className = '', children, ...rest }: CardProps) => (
  <div
    className={`rounded-xl border bg-surface p-4 shadow-sm transition-colors ${
      selected
        ? 'border-brand ring-2 ring-brand/30'
        : 'border-line hover:border-white/20'
    } ${className}`}
    {...rest}
  >
    {children}
  </div>
);
