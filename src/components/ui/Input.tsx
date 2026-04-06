import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
}

export const Input = ({ label, suffix, className = '', id, ...rest }: InputProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        id={id}
        className={`w-full rounded-lg border border-line bg-app px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-oranje focus:outline-none focus:ring-2 focus:ring-oranje/30 ${suffix ? 'pr-10' : ''} ${className}`}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          {suffix}
        </span>
      )}
    </div>
  </div>
);
