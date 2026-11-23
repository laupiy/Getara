import { useState } from 'react';
import { Activity, Cpu, Loader2, Plug, Radio, Thermometer, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { testDeviceConnection } from '../services/dataSource';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import KeyValue from '../components/ui/KeyValue';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { CONNECTION } from '../utils/status';
import { formatTime } from '../utils/format';

const ICONS = { 'motor-dc-12v': Zap, esp32: Cpu, adxl345: Activity, ds18b20: Thermometer };

function DeviceCard({ device, connection, checking, result, onTest, extraAction }) {
  const Icon = ICONS[device.id] ?? Plug;
  return (
    <Card
      title={device.name}
      subtitle={device.role}
      icon={Icon}
      actions={
        <>
          {device.optional && <Badge tone="violet">Opsional</Badge>}
          <StatusBadge map={CONNECTION} value={connection} pulse={connection === 'simulated'} />
        </>
      }
    >
      <KeyValue mono={false} items={device.specs} />
      <p className="mt-3 text-xs text-slate-500">{device.notes}</p>

      {result && (
        <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-amber-100/80">
          <span className="font-mono text-amber-300">[{formatTime(result.checkedAt)}]</span> {result.message}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" icon={checking ? Loader2 : Plug} onClick={onTest} disabled={checking} className={checking ? '[&_svg]:animate-spin' : ''}>
          {checking ? 'Memeriksa…' : 'Cek koneksi'}
        </Button>
        {extraAction}
      </div>
    </Card>
  );
}

export default function DeviceManagement() {
  const { devices, running, ds18b20Enabled, setDs18b20Enabled, dataMode } = useApp();
  const [checking, setChecking] = useState({});
  const [results, setResults] = useState({});

  const test = async (id) => {
    setChecking((c) => ({ ...c, [id]: true }));
    const r = await testDeviceConnection(id);
    setResults((prev) => ({ ...prev, [id]: r }));
    setChecking((c) => ({ ...c, [id]: false }));
  };

  const connectionOf = (d) => {
    if (d.id === 'ds18b20' && !ds18b20Enabled) return 'disabled';
    return running ? d.connection : 'paused';
  };

  return (
    <>
      <PageHeader
        title="Device Management"
        description="Daftar perangkat prototype dan spesifikasinya. Status koneksi masih berasal dari simulator."
      />

      <Card className="mb-6" title="Jalur Komunikasi (rencana)" icon={Radio} bodyClassName="p-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {['ADXL345', 'I2C', 'ESP32', 'Wi-Fi', 'MQTT Broker', 'Python / API', 'Dashboard'].map((n, i, arr) => (
            <span key={n} className="flex items-center gap-2">
              <span className="rounded-md border border-navy-600 bg-navy-850 px-2.5 py-1 text-slate-200">{n}</span>
              {i < arr.length - 1 && <span className="text-cyan-400/60">→</span>}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          Mode data saat ini: <Badge tone="cyan">{dataMode}</Badge>
          <span>Topik MQTT rencana:</span>
          <code className="rounded bg-navy-850 px-1.5 py-0.5 text-cyan-300">Getara/esp32-vg-01/vibration</code>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {devices.map((d) => (
          <DeviceCard
            key={d.id}
            device={d}
            connection={connectionOf(d)}
            checking={Boolean(checking[d.id])}
            result={results[d.id]}
            onTest={() => test(d.id)}
            extraAction={
              d.id === 'ds18b20' && (
                <Button
                  size="sm"
                  variant={ds18b20Enabled ? 'danger' : 'success'}
                  icon={Thermometer}
                  onClick={() => setDs18b20Enabled(!ds18b20Enabled)}
                >
                  {ds18b20Enabled ? 'Nonaktifkan sensor suhu' : 'Aktifkan sensor suhu'}
                </Button>
              )
            }
          />
        ))}
      </div>
      {!devices.length && <p className="text-sm text-slate-500">Memuat perangkat…</p>}
    </>
  );
}
