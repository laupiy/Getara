const TONES = {
  // Pill lembut tanpa garis tepi: latar transparan tipis + teks warna senada
  accent: 'bg-accent/10 text-accent',
  cyan: 'bg-accent/10 text-accent',
  blue: 'bg-status-info/10 text-status-info',
  green: 'bg-status-normal/10 text-status-normal',
  amber: 'bg-status-warning/10 text-status-warning',
  orange: 'bg-status-high/10 text-status-high',
  red: 'bg-status-critical/10 text-status-critical',
  violet: 'bg-status-violet/10 text-status-violet',
  slate: 'bg-slate-500/10 text-slate-300',
};

const DOTS = {
  accent: 'bg-accent',
  cyan: 'bg-accent',
  blue: 'bg-status-info',
  green: 'bg-status-normal',
  amber: 'bg-status-warning',
  orange: 'bg-status-high',
  red: 'bg-status-critical',
  violet: 'bg-status-violet',
  slate: 'bg-slate-400',
};

export default function Badge({ tone = 'slate', dot = false, pulse = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${TONES[tone] ?? TONES.slate} ${className}`}
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
    <span className="rounded bg-accent/10 px-1.5 py-px font-mono text-[10px] tracking-wider text-accent/90">
      {label}
    </span>
  );
}

export function NotTested() {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md border border-dashed border-slate-500/50 bg-slate-500/5 px-2 py-0.5 font-mono text-[11px] text-slate-400">
      Belum Diuji
    </span>
  );
}
