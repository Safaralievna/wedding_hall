import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gray-900 text-white shadow-md shadow-gray-900/15 hover:bg-gray-800 active:bg-gray-950',
  secondary:
    'border border-border bg-surface text-gray-700 shadow-sm hover:border-border-strong hover:bg-cream-100',
  ghost: 'text-gray-600 hover:bg-cream-200 hover:text-gray-900',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  outline:
    'border border-rose-400/50 bg-transparent text-gray-800 hover:border-rose-500 hover:bg-rose-400/5',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </button>
  );
}
