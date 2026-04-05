import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-oranje text-white hover:bg-oranje-dark focus-visible:ring-oranje',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
