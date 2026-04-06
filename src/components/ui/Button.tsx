import type { ButtonHTMLAttributes } from 'react';
import { buttonVariants } from '../../design/variants';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses = buttonVariants as Record<Variant, string>;

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
