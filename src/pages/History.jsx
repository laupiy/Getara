import { useMemo, useState } from 'react';
import { Database, Download, Eye, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSessionProfile } from '../services/dataSource';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select, { fieldClass } from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import KeyValue from '../components/ui/KeyValue';
import { SimTag, StatusBadge } from '../components/ui/Badge';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { CHART_COLORS } from '../components/charts/chartTheme';
import { CONDITION } from '../utils/status';
import { fmt, formatDateTime, formatDuration, toDateInput } from '../utils/format';
import { SPEED_LEVELS, getSpeed } from '../simulation/vibrationSimulator';

const ALL = 'all';

function downloadCsv(rows) {
  const header = ['id', 'startedAt', 'condition', 'speed', 'rpm', 'durationSec', 'sampleRate', 'sampleCount', 'avgRms', 'peakRms', 'maxTempC', 'avgScore', 'source'];
  const lines = rows.map((r) =>
    header.map((h) => (h === 'startedAt' ? new Date(r[h]).toISOString() : r[h])).join(','),
  );
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Getara_history_SIMULASI_${toDateInput(Date.now())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SessionDetail({ session, onClose }) {
  const profile = useMemo(() => (session ? getSessionProfile(session) : []), [session]);
  if (!session) return null;
  const sp = getSpeed(session.speed);
  return (
    <Modal open onClose={onClose} size="xl" title={`Detail Pengujian ${session.id}`} subtitle={formatDateTime(session.startedAt)}>
      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge map={CONDITION} value={session.condition} />
        <SimTag />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <KeyValue
          items={[
            ['Kondisi', CONDITION[session.condition].label],
            ['Kecepatan', `${sp.label} · ${session.rpm} RPM · PWM ${session.pwm}%`],
            ['Durasi', formatDuration(session.durationSec)],
            ['Sample rate (rencana)', `${session.sampleRate} Hz`],
            ['Jumlah sampel', session.sampleCount.toLocaleString('id-ID')],
            ['Operator', session.operator],
          ]}
        />
        <KeyValue
          items={[
            ['RMS rata-rata', `${fmt(session.avgRms, 4)} g`],
            ['RMS puncak', `${fmt(session.peakRms, 4)} g`],
            ['Suhu maks', `${fmt(session.maxTempC, 1)} °C`],
            ['Skor rata-rata (heuristik)', fmt(session.avgScore, 2)],
            ['Sumber', session.source],
          ]}
        />
      </div>
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Profil RMS selama sesi</p>
        <TimeSeriesChart
          data={profile}
          variant="area"
          height={200}
          yUnit="g"
          legend={false}
          yDomain={[0, 'auto']}
          series={[{ key: 'rms', name: 'RMS', color: CHART_COLORS.total }]}
        />
      </div>
      <p className="mt-4 rounded-lg border border-dashed border-line bg-canvas p-3 text-xs text-slate-400">{session.notes}</p>
    </Modal>
  );
}

export default function History() {
  const { history } = useApp();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [condition, setCondition] = useState(ALL);
  const [speed, setSpeed] = useState(ALL);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
    const toTs = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
    const q = query.trim().toLowerCase();
    return history.filter(
      (s) =>
        s.startedAt >= fromTs &&
        s.startedAt <= toTs &&
        (condition === ALL || s.condition === condition) &&
        (speed === ALL || s.speed === speed) &&
        (!q || s.id.toLowerCase().includes(q) || s.operator.toLowerCase().includes(q)),
    );
  }, [history, from, to, condition, speed, query]);

  const resetFilters = () => {
    setFrom('');
    setTo('');
    setCondition(ALL);
    setSpeed(ALL);
    setQuery('');
  };

  const counts = Object.keys(CONDITION).map((c) => [c, filtered.filter((s) => s.condition === c).length]);

  return (
    <>
      <PageHeader
        title="History"
        description="Riwayat sesi pengujian simulasi. Struktur datanya disiapkan untuk sesi perekaman dataset asli."
        actions={
          <Button variant="primary" icon={Download} onClick={() => downloadCsv(filtered)} disabled={!filtered.length}>
            Export CSV ({filtered.length})
          </Button>
        }
      />

      <Card className="mb-6" bodyClassName="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">Dari tanggal</span>
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">Sampai tanggal</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={fieldClass} />
          </label>
          <Select
            label="Kondisi"
            value={condition}
            onChange={setCondition}
            options={[{ value: ALL, label: 'Semua kondisi' }, ...Object.entries(CONDITION).map(([v, c]) => ({ value: v, label: c.label }))]}
          />
          <Select
            label="Kecepatan"
            value={speed}
            onChange={setSpeed}
            options={[{ value: ALL, label: 'Semua kecepatan' }, ...SPEED_LEVELS.map((s) => ({ value: s.id, label: `${s.label} (${s.rpm} RPM)` }))]}
          />
          <label className="flex min-w-[180px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">Cari ID / operator</span>
            <span className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SIM-012"
                className={`${fieldClass} w-full pl-9`}
              />
            </span>
          </label>
          <Button variant="ghost" onClick={resetFilters}>
            Reset filter
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          {counts.map(([c, n]) => (
            <span key={c} className="rounded-md bg-canvas px-2 py-1">
              {CONDITION[c].label}: <span className="font-mono text-slate-200">{n}</span>
            </span>
          ))}
        </div>
      </Card>

      <Card title="Riwayat Pengujian" subtitle={`${filtered.length} sesi`} icon={Database} actions={<SimTag />} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-3 py-3 font-medium">Waktu mulai</th>
                <th className="px-3 py-3 font-medium">Kondisi</th>
                <th className="px-3 py-3 font-medium">RPM</th>
                <th className="px-3 py-3 font-medium">Durasi</th>
                <th className="px-3 py-3 text-right font-medium">RMS rata-rata</th>
                <th className="px-3 py-3 text-right font-medium">Suhu maks</th>
                <th className="px-3 py-3 text-right font-medium">Skor</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-surface-raised/50" onClick={() => setSelected(s)}>
                  <td className="px-5 py-3 font-mono text-xs text-accent">{s.id}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-400">{formatDateTime(s.startedAt)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge map={CONDITION} value={s.condition} />
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-300">{s.rpm}</td>
                  <td className="px-3 py-3 text-slate-300">{formatDuration(s.durationSec)}</td>
                  <td className="px-3 py-3 text-right font-mono text-slate-200">{fmt(s.avgRms, 4)} g</td>
                  <td className="px-3 py-3 text-right font-mono text-slate-200">{fmt(s.maxTempC, 1)} °C</td>
                  <td className="px-3 py-3 text-right font-mono text-slate-200">{fmt(s.avgScore, 2)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(s);
                      }}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="py-10 text-center text-sm text-slate-500">Tidak ada sesi yang cocok dengan filter.</p>}
        </div>
      </Card>

      <SessionDetail session={selected} onClose={() => setSelected(null)} />
    </>
  );
}
