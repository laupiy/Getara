import { Activity, Cpu, Gauge, Radio, Waves, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import KeyValue from '../components/ui/KeyValue';
import ScoreBar from '../components/ui/ScoreBar';
import ScenarioControls from '../components/ui/ScenarioControls';
import Badge, { SimTag, StatusBadge } from '../components/ui/Badge';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { CHART_COLORS } from '../components/charts/chartTheme';
import { MACHINE_STATUS } from '../utils/status';
import { fmt, formatTime } from '../utils/format';
import { SIM_SAMPLE_RATE, SIM_WINDOW_SIZE } from '../simulation/vibrationSimulator';

export default function LiveMonitoring() {
  const { telemetry, running, tickMs, baselineRms } = useApp();
  const { xyz, trend, features, packet, score, status, packetsReceived } = telemetry;

  const connections = [
    { name: 'ESP32 (esp32-vg-01)', icon: Cpu, state: running ? 'Simulated' : 'Paused', tone: running ? 'accent' : 'amber' },
    { name: 'ADXL345 via I2C', icon: Activity, state: running ? 'Simulated' : 'Paused', tone: running ? 'accent' : 'amber' },
    { name: 'MQTT Broker', icon: Radio, state: 'Not Integrated', tone: 'slate' },
    { name: 'Wi-Fi', icon: WifiOff, state: 'Not Integrated', tone: 'slate' },
  ];

  return (
    <>
      <PageHeader
        title="Live Monitoring"
        description="Sinyal getaran 3 sumbu dari simulator. Ubah skenario untuk melihat perbedaan pola."
        actions={<StatusBadge map={MACHINE_STATUS} value={status} pulse={running} />}
      />

      <Card className="mb-6" bodyClassName="p-4">
        <ScenarioControls />
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card
            title="Getaran X, Y, Z"
            subtitle={`Satu window: ${SIM_WINDOW_SIZE} sampel @ ${SIM_SAMPLE_RATE} Hz (≈${SIM_WINDOW_SIZE} ms) · Z termasuk +1 g gravitasi`}
            icon={Waves}
            actions={<SimTag />}
          >
            <TimeSeriesChart
              data={xyz}
              xKey="t"
              xUnit=" ms"
              yUnit="g"
              height={280}
              series={[
                { key: 'x', name: 'X', color: CHART_COLORS.x },
                { key: 'y', name: 'Y', color: CHART_COLORS.y },
                { key: 'z', name: 'Z', color: CHART_COLORS.z },
              ]}
            />
          </Card>

          <Card title="RMS per Sumbu" subtitle="30 detik terakhir (komponen AC, gravitasi dibuang)" icon={Activity} actions={<SimTag />}>
            <TimeSeriesChart
              data={trend}
              height={260}
              yUnit="g"
              yDomain={[0, 'auto']}
              series={[
                { key: 'rmsX', name: 'RMS X', color: CHART_COLORS.x },
                { key: 'rmsY', name: 'RMS Y', color: CHART_COLORS.y },
                { key: 'rmsZ', name: 'RMS Z', color: CHART_COLORS.z },
                { key: 'rms', name: 'RMS total', color: CHART_COLORS.total },
              ]}
              references={[{ y: baselineRms, label: 'baseline total' }]}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Skor Anomali" subtitle="Aturan heuristik sementara — bukan model AI" icon={Gauge}>
            <p className="mb-3 font-mono text-3xl font-semibold text-slate-50">{fmt(score, 2)}</p>
            <ScoreBar value={score} />
            <div className="mt-4">
              <KeyValue
                items={[
                  ['RMS X', `${fmt(features?.rmsX, 4)} g`],
                  ['RMS Y', `${fmt(features?.rmsY, 4)} g`],
                  ['RMS Z', `${fmt(features?.rmsZ, 4)} g`],
                  ['Peak', `${fmt(features?.peak, 4)} g`],
                  ['Crest factor', fmt(features?.crestFactor, 2)],
                ]}
              />
            </div>
          </Card>

          <Card title="Informasi Sensor" icon={Activity}>
            <KeyValue
              items={[
                ['Sensor', 'ADXL345 (3-axis)'],
                ['Rentang (rencana)', '±4 g'],
                ['ODR rencana perangkat', '1600 Hz'],
                ['Laju simulasi tampilan', `${SIM_SAMPLE_RATE} Hz`],
                ['Interval update', `${tickMs} ms`],
                ['Paket terakhir (seq)', packet?.seq ?? '—'],
                ['Waktu paket', packet ? formatTime(packet.timestamp) : '—'],
                ['Total paket', packetsReceived],
              ]}
            />
          </Card>

          <Card title="Status Koneksi Perangkat" icon={Wifi}>
            <ul className="space-y-2.5">
              {connections.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    <c.icon size={15} className="text-slate-500" />
                    {c.name}
                  </span>
                  <Badge tone={c.tone} dot pulse={c.tone === 'accent'}>
                    {c.state}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              "Simulated" = data dibangkitkan di browser. Koneksi MQTT akan ditambahkan pada tahap integrasi hardware.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
