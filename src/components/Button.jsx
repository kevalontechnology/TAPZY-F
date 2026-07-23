import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon: Icon,
  onClick,
  className = '',
}) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30',
    outline: 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2 text-xs font-bold rounded-xl',
    lg: 'px-5 py-2.5 text-sm font-bold rounded-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
