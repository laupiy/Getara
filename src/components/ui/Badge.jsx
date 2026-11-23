const TONES = {
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-400/30',
  blue: 'bg-blue-500/10 text-blue-300 ring-blue-400/30',
  green: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-400/30',
  orange: 'bg-orange-500/10 text-orange-300 ring-orange-400/30',
  red: 'bg-rose-500/10 text-rose-300 ring-rose-400/30',
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-400/30',
  slate: 'bg-slate-500/10 text-slate-300 ring-slate-400/25',
};

const DOTS = {
  cyan: 'bg-cyan-400',
  blue: 'bg-blue-400',
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  orange: 'bg-orange-400',
  red: 'bg-rose-400',
  violet: 'bg-violet-400',
  slate: 'bg-slate-400',
};

export default function Badge({ tone = 'slate', dot = false, pulse = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone] ?? TONES.slate} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${DOTS[tone]}`} />}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />
        </span>
      )}
      {children}
    </span>
  );
}

/** Badge dari peta status (lihat utils/status.js) */
export function StatusBadge({ map, value, dot = true, pulse = false }) {
  const item = map[value] ?? { label: value, tone: 'slate' };
  return (
    <Badge tone={item.tone} dot={dot} pulse={pulse}>
      {item.label}
    </Badge>
  );
}

/** Penanda data simulasi — dipakai di seluruh dashboard */
export function SimTag({ label = 'SIMULASI' }) {
  return (
    <span className="rounded border border-dashed border-cyan-400/40 px-1.5 py-px font-mono text-[10px] tracking-wider text-cyan-300/80">
      {label}
    </span>
  );
}

export function NotTested() {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md border border-dashed border-slate-500/50 bg-slate-500/5 px-2 py-0.5 font-mono text-[11px] text-slate-400">
      Not Tested
    </span>
  );
}
