const VARIANTS = {
  primary: 'bg-cyan-500 text-navy-950 hover:bg-cyan-400 shadow shadow-cyan-500/20',
  secondary: 'bg-navy-800 text-slate-200 ring-1 ring-inset ring-navy-600 hover:bg-navy-700',
  ghost: 'text-slate-300 hover:bg-navy-800 hover:text-slate-100',
  danger: 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-400/30 hover:bg-rose-500/20',
  success: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30 hover:bg-emerald-500/20',
  accent: 'bg-accent text-on-accent hover:bg-accent-hover shadow shadow-accent/20',
  outline: 'text-ink ring-1 ring-inset ring-line hover:bg-surface',
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
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
