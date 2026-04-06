import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Select = ({ label, options, className = '', id, ...rest }: SelectProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
    )}
    <select
      id={id}
      className={`w-full rounded-lg border border-line bg-app px-3 py-2 text-sm text-white focus:border-oranje focus:outline-none focus:ring-2 focus:ring-oranje/30 ${className}`}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
