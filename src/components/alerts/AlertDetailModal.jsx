import { CheckCheck, CheckCircle, EyeOff, ShieldCheck } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import KeyValue from '../ui/KeyValue';
import { SimTag, StatusBadge } from '../ui/Badge';
import { ALERT_STATUS, SEVERITY, CONDITION } from '../../utils/status';
import { fmt, formatDateTime } from '../../utils/format';
import { getSpeed } from '../../simulation/vibrationSimulator';
import { useApp } from '../../context/AppContext';

/** Menerima alertId (bukan objek) agar isi modal selalu sinkron dengan state terbaru. */
export default function AlertDetailModal({ alertId, onClose }) {
  const { alerts, markAlertRead, updateAlertStatus } = useApp();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return null;
  const m = alert.metrics ?? {};

  return (
    <Modal
      open={Boolean(alert)}
      onClose={onClose}
      title={alert.title}
      subtitle={`${alert.id} · ${formatDateTime(alert.timestamp)}`}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            icon={alert.read ? EyeOff : CheckCheck}
            onClick={() => markAlertRead(alert.id, !alert.read)}
          >
            {alert.read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
          </Button>
          {alert.status === 'open' && (
            <Button variant="secondary" size="sm" icon={ShieldCheck} onClick={() => updateAlertStatus(alert.id, 'acknowledged')}>
              Acknowledge
            </Button>
          )}
          {alert.status !== 'resolved' && (
            <Button variant="success" size="sm" icon={CheckCircle} onClick={() => updateAlertStatus(alert.id, 'resolved')}>
              Resolve
            </Button>
          )}
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge map={SEVERITY} value={alert.severity} />
        <StatusBadge map={ALERT_STATUS} value={alert.status} />
        <SimTag />
      </div>
      <p className="mb-4 text-sm text-slate-300">{alert.message}</p>
      <KeyValue
        items={[
          ['Jenis anomali', alert.type],
          ['Skenario simulasi', CONDITION[alert.scenario]?.label ?? '—'],
          ['Kecepatan', alert.speed ? `${getSpeed(alert.speed).label} (${getSpeed(alert.speed).rpm} RPM)` : '—'],
          ['Skor anomali (heuristik)', fmt(m.score, 2)],
          ['RMS total', `${fmt(m.rmsTotal, 4)} g`],
          ['Rasio terhadap baseline', `${fmt(m.ratio, 2)}×`],
          ['Crest factor', fmt(m.crestFactor, 2)],
          ['Sumber', alert.source],
        ]}
      />
      <p className="mt-4 rounded-lg border border-dashed border-navy-600 bg-navy-850 p-3 text-xs text-slate-400">
        Alert ini dibuat oleh aturan heuristik pada data simulasi. Jenis anomali diambil dari skenario simulasi yang dipilih,
        bukan hasil klasifikasi model AI.
      </p>
    </Modal>
  );
}
