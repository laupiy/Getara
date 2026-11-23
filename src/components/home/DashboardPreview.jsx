import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from '../../config/navigation';
import { MACHINE_STATUS } from '../../utils/status';
import { fmt, relativeTime } from '../../utils/format';

const STATUS_TEXT = {
  idle: 'text-muted',
  normal: 'text-status-normal',
  warning: 'text-status-warning',
  anomaly: 'text-status-critical',
};

/** Sparkline RMS ringan (SVG murni) dari data tren simulasi. */
function Sparkline({ data, baseline }) {
  const W = 300;
  const H = 80;
  if (data.length < 2) {
    return <div className="flex h-20 items-center justify-center text-xs text-muted">Menunggu data…</div>;
  }
  const max = Math.max(baseline, ...data.map((d) => d.rms)) * 1.25;
  const x = (i) => (i / (data.length - 1)) * W;
  const y = (v) => H - (v / max) * H;
  const line = data.map((d, i) => `${x(i).toFixed(1)},${y(d.rms).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-20 w-full">
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="#f59e0b" opacity="0.06" />
      <line x1="0" x2={W} y1={y(baseline)} y2={y(baseline)} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <polyline points={line} fill="none" stroke="#f59e0b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Tile({ label, value, unit, valueClass = 'text-ink' }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold ${valueClass}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
      </p>
    </div>
  );
}

/** Miniatur dashboard Overview dengan data live dari simulasi. Klik untuk membuka dashboard. */
export default function DashboardPreview({ onOpen }) {
  const { telemetry, baselineRms, alerts, ds18b20Enabled } = useApp();
  const { status, features, score, trend, packet } = telemetry;
  const latestAlert = alerts[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Buka dashboard Overview"
      className="group block w-full overflow-hidden rounded-xl border border-line bg-canvas text-left shadow-2xl shadow-black/40 transition-colors hover:border-accent/50"
    >
      {/* Bingkai browser */}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <div className="flex gap-1.5">
          {['#ef4444', '#eab308', '#22c55e'].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full opacity-70" style={{ background: c }} />
          ))}
        </div>
        <span className="flex-1 truncate rounded-md bg-canvas px-3 py-1 font-mono text-[11px] text-muted">
          localhost:5173/#/overview
        </span>
        <span className="hidden rounded border border-dashed border-accent/50 px-1.5 py-px font-mono text-[10px] text-accent sm:inline">
          SIMULASI
        </span>
      </div>

      <div className="flex">
        {/* Mini sidebar */}
        <div className="hidden w-12 shrink-0 flex-col items-center gap-3 border-r border-line bg-canvas-deep py-4 sm:flex">
          {NAV_ITEMS.map(({ id, icon: Icon }, i) => (
            <span
              key={id}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${i === 0 ? 'bg-accent/15 text-accent' : 'text-muted'}`}
            >
              <Icon size={14} />
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label="Status" value={MACHINE_STATUS[status]?.label ?? '—'} valueClass={STATUS_TEXT[status]} />
            <Tile label="RMS" value={fmt(features?.rmsTotal, 3)} unit="g" />
            <Tile label="Suhu" value={ds18b20Enabled ? fmt(packet?.temperatureC, 1) : 'Off'} unit={ds18b20Enabled ? '°C' : ''} />
            <Tile label="Skor" value={fmt(score, 2)} />
          </div>

          <div className="rounded-lg border border-line bg-surface p-3">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-medium text-ink">Tren RMS</span>
              <span className="text-muted">garis putus-putus = baseline</span>
            </div>
            <Sparkline data={trend} baseline={baselineRms} />
          </div>

          {latestAlert && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs">
              <span className="truncate text-ink">
                <span className="mr-2 text-accent">●</span>
                {latestAlert.title}
              </span>
              <span className="shrink-0 text-muted">{relativeTime(latestAlert.timestamp)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}