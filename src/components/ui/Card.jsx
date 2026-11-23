export default function Card({ title, subtitle, icon: Icon, actions, className = '', bodyClassName = '', children }) {
  return (
    <section
      className={`rounded-xl border border-navy-700/70 bg-navy-900/70 shadow-lg shadow-black/20 backdrop-blur ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-700/60 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                <Icon size={16} />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-100">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
