import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, BellOff, CheckCheck, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { SimTag, StatusBadge } from '../components/ui/Badge';
import AlertDetailModal from '../components/alerts/AlertDetailModal';
import { ALERT_STATUS, SEVERITY } from '../utils/status';
import { formatDateTime } from '../utils/format';

const ALL = 'all';

export default function AlertCenter() {
  const { alerts, unreadCount, markAllRead, markAlertRead, clearResolved } = useApp();
  const [severity, setSeverity] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [readFilter, setReadFilter] = useState(ALL);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () =>
      alerts.filter(
        (a) =>
          (severity === ALL || a.severity === severity) &&
          (status === ALL || a.status === status) &&
          (readFilter === ALL || (readFilter === 'unread' ? !a.read : a.read)),
      ),
    [alerts, severity, status, readFilter],
  );

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const highCount = alerts.filter((a) => a.severity === 'high' || a.severity === 'critical').length;

  const open = (a) => {
    setSelected(a.id);
    markAlertRead(a.id);
  };

  return (
    <>
      <PageHeader
        title="Alert Center"
        description="Peringatan yang dibangkitkan dari simulasi. Klik baris untuk melihat detail dan mengubah status."
        actions={
          <>
            <Button icon={CheckCheck} onClick={markAllRead} disabled={unreadCount === 0}>
              Tandai semua dibaca
            </Button>
            <Button variant="danger" icon={Trash2} onClick={clearResolved} disabled={!alerts.some((a) => a.status === 'resolved')}>
              Hapus yang resolved
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total alert" value={alerts.length} icon={Bell} tone="accent" />
        <StatCard label="Belum dibaca" value={unreadCount} icon={BellOff} tone="violet" />
        <StatCard label="Status open" value={openCount} icon={AlertTriangle} tone="red" />
        <StatCard label="High / Critical" value={highCount} icon={AlertTriangle} tone="amber" />
      </div>

      <Card
        title="Daftar Peringatan"
        subtitle={`${filtered.length} dari ${alerts.length} alert`}
        icon={Bell}
        actions={<SimTag />}
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-end gap-3 border-b border-line/60 px-5 py-4">
          <Select
            label="Severity"
            value={severity}
            onChange={setSeverity}
            options={[{ value: ALL, label: 'Semua' }, ...Object.entries(SEVERITY).map(([v, s]) => ({ value: v, label: s.label }))]}
          />
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={[{ value: ALL, label: 'Semua' }, ...Object.entries(ALERT_STATUS).map(([v, s]) => ({ value: v, label: s.label }))]}
          />
          <Select
            label="Dibaca"
            value={readFilter}
            onChange={setReadFilter}
            options={[
              { value: ALL, label: 'Semua' },
              { value: 'unread', label: 'Belum dibaca' },
              { value: 'read', label: 'Sudah dibaca' },
            ]}
          />
          <Button
            variant="ghost"
            onClick={() => {
              setSeverity(ALL);
              setStatus(ALL);
              setReadFilter(ALL);
            }}
          >
            Reset filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="w-6 px-5 py-3" />
                <th className="px-3 py-3 font-medium">Waktu</th>
                <th className="px-3 py-3 font-medium">Peringatan</th>
                <th className="px-3 py-3 font-medium">Jenis anomali</th>
                <th className="px-3 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((a) => (
                <tr key={a.id} className="cursor-pointer transition-colors hover:bg-surface-raised/50" onClick={() => open(a)}>
                  <td className="px-5 py-3">
                    {!a.read && <span className="block h-2 w-2 rounded-full bg-accent" title="Belum dibaca" />}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-400">{formatDateTime(a.timestamp)}</td>
                  <td className={`px-3 py-3 ${a.read ? 'text-slate-300' : 'font-semibold text-slate-50'}`}>{a.title}</td>
                  <td className="px-3 py-3 text-slate-300">{a.type}</td>
                  <td className="px-3 py-3">
                    <StatusBadge map={SEVERITY} value={a.severity} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge map={ALERT_STATUS} value={a.status} dot={false} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        open(a);
                      }}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="py-10 text-center text-sm text-slate-500">Tidak ada alert yang cocok dengan filter.</p>}
        </div>
      </Card>

      <AlertDetailModal alertId={selected} onClose={() => setSelected(null)} />
    </>
  );
}
