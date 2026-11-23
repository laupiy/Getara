import { SCORE_THRESHOLDS } from '../../utils/status';

/** Bar horizontal skor 0–1 dengan penanda ambang warning & anomaly. */
export default function ScoreBar({ value = 0 }) {
  const pct = Math.round(value * 100);
  const color = value >= SCORE_THRESHOLDS.anomaly ? 'bg-rose-400' : value >= SCORE_THRESHOLDS.warning ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-navy-700">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
        <span className="absolute top-0 h-full w-px bg-amber-300/70" style={{ left: `${SCORE_THRESHOLDS.warning * 100}%` }} />
        <span className="absolute top-0 h-full w-px bg-rose-300/70" style={{ left: `${SCORE_THRESHOLDS.anomaly * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500">
        <span>0</span>
        <span>warn {SCORE_THRESHOLDS.warning}</span>
        <span>anom {SCORE_THRESHOLDS.anomaly}</span>
        <span>1</span>
      </div>
    </div>
  );
}
