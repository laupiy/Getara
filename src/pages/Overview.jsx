import { useState } from 'react';
import { Activity, ArrowRight, Bell, Gauge, ShieldCheck, Thermometer, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import KeyValue from '../components/ui/KeyValue';
import ScoreBar from '../components/ui/ScoreBar';
import { SimTag, StatusBadge } from '../components/ui/Badge';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { CHART_COLORS } from '../components/charts/chartTheme';
import AlertList from '../components/alerts/AlertList';
import AlertDetailModal from '../components/alerts/AlertDetailModal';
import { MACHINE_STATUS } from '../utils/status';
import { fmt, formatDuration } from '../utils/format';
import { getScenario, getSpeed } from '../simulation/vibrationSimulator';

const STATUS_TEXT = {
  idle: 'Simulasi belum berjalan atau sedang di-reset.',
  normal: 'Pola getaran berada di sekitar baseline normal.',
  warning: 'Getaran mulai menyimpang dari baseline. Perlu diperhatikan.',
  anomaly: 'Pola getaran jauh dari baseline normal. Indikasi anomali.',
};

export default function Overview({ onNavigate }) {
  const { telemetry, baselineRms, scenario, speed, running, alerts, ds18b20Enabled, markAlertRead } = useApp();
  const [selected, setSelected] = useState(null);
  const { features, score, status, trend, packet, ratio, packetsReceived, startedAt } = telemetry;
  const sp = getSpeed(speed);
  const statusTone = MACHINE_STATUS[status]?.tone ?? 'slate';

  const openAlert = (a) => {
    setSelected(a.id);
    markAlertRead(a.id);
  };

  return (
    <>
      <PageHeader
        title="Overview"
        description="Ringkasan kondisi motor DC 12V berdasarkan data getaran simulasi."
        actions={
          <Button variant="primary" icon={Activity} onClick={() => onNavigate('live')}>
            Buka Live Monitoring
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Machine Status"
          value={MACHINE_STATUS[status]?.label ?? '—'}
          icon={ShieldCheck}
          tone={statusTone === 'slate' ? 'slate' : statusTone}
          badge={<StatusBadge map={MACHINE_STATUS} value={status} pulse={running && status !== 'normal'} />}
          hint={running ? 'Streaming' : 'Paused'}
        />
        <StatCard
          label="Vibration RMS"
          value={fmt(features?.rmsTotal, 3)}
          unit="g"
          icon={TrendingUp}
          tone="accent"
          badge={<SimTag />}
          hint={`${fmt(ratio, 2)}× baseline`}
        />
        <StatCard
          label="Motor Temperature"
          value={ds18b20Enabled ? fmt(packet?.temperatureC, 1) : 'Off'}
          unit={ds18b20Enabled ? '°C' : ''}
          icon={Thermometer}
          tone="amber"
          badge={<SimTag />}
          hint={ds18b20Enabled ? 'DS18B20 (opsional)' : 'Sensor dinonaktifkan'}
        />
        <StatCard
          label="Anomaly Score"
          value={fmt(score, 2)}
          icon={Gauge}
          tone="violet"
          badge={<SimTag label="HEURISTIK" />}
          footer={<ScoreBar value={score} />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Tren Getaran (RMS)"
          subtitle="30 detik terakhir · garis putus-putus = baseline normal"
          icon={TrendingUp}
          actions={<SimTag />}
        >
          <TimeSeriesChart
            data={trend}
            variant="area"
            height={280}
            yUnit="g"
            series={[{ key: 'rms', name: 'RMS total', color: CHART_COLORS.total }]}
            references={[{ y: baselineRms, label: 'baseline' }]}
            legend={false}
            yDomain={[0, 'auto']}
          />
        </Card>

        <Card title="Ringkasan Kondisi Mesin" icon={ShieldCheck}>
          <div className={`mb-4 rounded-lg border p-3 text-sm ${
            status === 'anomaly'
              ? 'border-rose-400/30 bg-rose-500/5 text-rose-200'
              : status === 'warning'
                ? 'border-yellow-400/30 bg-yellow-500/5 text-yellow-200'
                : 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200'
          }`}>
            {STATUS_TEXT[status]}
          </div>
          <KeyValue
            items={[
              ['Skenario simulasi', getScenario(scenario).label],
              ['Kecepatan', `${sp.label} · ${sp.rpm} RPM · PWM ${sp.pwm}%`],
              ['Baseline RMS normal', `${fmt(baselineRms, 4)} g`],
              ['Crest factor', fmt(features?.crestFactor, 2)],
              ['Paket diterima', packetsReceived],
              ['Durasi sesi', formatDuration((Date.now() - startedAt) / 1000)],
            ]}
          />
        </Card>
      </div>

      <Card
        className="mt-6"
        title="Recent Alerts"
        subtitle="5 peringatan terbaru"
        icon={Bell}
        actions={
          <Button size="sm" variant="ghost" icon={ArrowRight} onClick={() => onNavigate('alerts')}>
            Lihat semua
          </Button>
        }
        bodyClassName="px-4 py-1"
      >
        <AlertList alerts={alerts.slice(0, 5)} onOpen={openAlert} />
      </Card>

      <AlertDetailModal alertId={selected} onClose={() => setSelected(null)} />
    </>
  );
}
