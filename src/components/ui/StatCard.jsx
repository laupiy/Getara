const ACCENT = {
  accent: 'text-accent bg-accent/10',
  cyan: 'text-accent bg-accent/10', // alias lama
  green: 'text-status-normal bg-status-normal/10',
  amber: 'text-status-warning bg-status-warning/10',
  red: 'text-status-critical bg-status-critical/10',
  violet: 'text-violet-300 bg-violet-500/10',
  slate: 'text-slate-300 bg-slate-500/10',
};

export default function StatCard({ label, value, unit, icon: Icon, tone = 'accent', hint, badge, footer }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line/70 bg-surface/70 p-4 shadow-lg shadow-black/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/5 blur-2xl" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${ACCENT[tone] ?? ACCENT.accent}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-semibold text-slate-50">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {badge}
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}
