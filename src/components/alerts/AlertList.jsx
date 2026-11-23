import { AlertTriangle, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { ALERT_STATUS, SEVERITY } from '../../utils/status';
import { formatDateTime, relativeTime } from '../../utils/format';

const ICON_COLOR = { low: 'text-slate-400', medium: 'text-yellow-300', high: 'text-orange-300', critical: 'text-rose-300' };

/** Daftar alert yang bisa diklik. Dipakai di Overview & Alert Center. */
export default function AlertList({ alerts, onOpen, showStatus = true, emptyText = 'Belum ada alert.' }) {
  if (!alerts.length) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-line/60">
      {alerts.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            onClick={() => onOpen(a)}
            className="group flex w-full items-start gap-3 px-1 py-3 text-left transition-colors hover:bg-surface-raised/50"
          >
            <span className="relative mt-0.5">
              <AlertTriangle size={18} className={ICON_COLOR[a.severity]} />
              {!a.read && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className={`truncate text-sm ${a.read ? 'text-slate-300' : 'font-semibold text-slate-50'}`}>{a.title}</span>
                <StatusBadge map={SEVERITY} value={a.severity} dot={false} />
                {showStatus && <StatusBadge map={ALERT_STATUS} value={a.status} dot={false} />}
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {a.type} · <span title={formatDateTime(a.timestamp)}>{relativeTime(a.timestamp)}</span>
              </span>
            </span>
            <ChevronRight size={16} className="mt-1 text-slate-600 group-hover:text-accent" />
          </button>
        </li>
      ))}
    </ul>
  );
}
