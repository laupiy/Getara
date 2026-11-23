import { Pause, Play, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SCENARIOS, SPEED_LEVELS, getScenario } from '../../simulation/vibrationSimulator';
import SegmentedControl from './SegmentedControl';
import Button from './Button';

/** Kontrol simulasi: skenario kondisi motor, kecepatan, jalankan/jeda, reset. */
export default function ScenarioControls({ compact = false }) {
  const { scenario, setScenario, speed, setSpeed, running, toggleRunning, resetSimulation } = useApp();
  const sc = getScenario(scenario);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-400">Skenario motor</p>
          <SegmentedControl
            value={scenario}
            onChange={setScenario}
            options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))}
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-400">Kecepatan (PWM)</p>
          <SegmentedControl
            value={speed}
            onChange={setSpeed}
            options={SPEED_LEVELS.map((s) => ({ value: s.id, label: `${s.label} · ${s.rpm / 1000}k RPM` }))}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={running ? 'secondary' : 'primary'} icon={running ? Pause : Play} onClick={toggleRunning}>
            {running ? 'Jeda' : 'Jalankan'}
          </Button>
          <Button variant="ghost" icon={RotateCcw} onClick={resetSimulation} title="Kosongkan grafik dan mulai ulang simulasi">
            Reset
          </Button>
        </div>
      </div>
      {!compact && (
        <p className="text-xs text-slate-400">
          <span className="font-medium text-slate-300">{sc.label}:</span> {sc.short} Pola simulasi: {sc.signature}
        </p>
      )}
    </div>
  );
}
