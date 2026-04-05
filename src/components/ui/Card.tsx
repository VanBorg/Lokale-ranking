import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

export const Card = ({ selected, className = '', children, ...rest }: CardProps) => (
  <div
    className={`rounded-xl border bg-white p-4 shadow-sm transition-colors ${
      selected
        ? 'border-oranje ring-2 ring-oranje/30'
        : 'border-gray-200 hover:border-gray-300'
    } ${className}`}
    {...rest}
  >
    {children}
  </div>
);
