const VARIANTS = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface-raised text-slate-200 hover:bg-line',
  ghost: 'text-slate-300 hover:bg-surface-raised hover:text-slate-100',
  danger: 'bg-status-critical/10 text-status-critical hover:bg-status-critical/20',
  success: 'bg-status-normal/10 text-status-normal hover:bg-status-normal/20',
  // Tema baru (Industrial Slate + Orange)
  accent: 'bg-accent text-on-accent hover:bg-accent-hover',
  outline: 'text-ink bg-surface/60 hover:bg-surface-raised',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
