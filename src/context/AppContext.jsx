import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createTelemetrySource,
  fetchAlerts,
  fetchDevices,
  fetchEvaluationResults,
  fetchHistory,
  DATA_MODE,
} from '../services/dataSource';
import { calibrateBaseline, heuristicAnomalyScore } from '../simulation/heuristicScore';
import { computeFeatures } from '../utils/signal';
import { formatTime } from '../utils/format';
import { severityFromScore, statusFromScore } from '../utils/status';

const AppContext = createContext(null);

export const TICK_MS = 500; // interval update simulasi
const TREND_LENGTH = 60; // 60 titik × 0,5 s = 30 detik terakhir
const ALERT_COOLDOWN_MS = 20000;

const ALERT_TYPE = {
  unbalance: 'Unbalance (simulasi)',
  loose: 'Loose Mounting (simulasi)',
  normal: 'Deviasi RMS (simulasi)',
};

const emptyTelemetry = () => ({
  packet: null,
  features: null,
  score: 0,
  ratio: 1,
  status: 'idle',
  xyz: [],
  trend: [],
  packetsReceived: 0,
  startedAt: Date.now(),
});

export function AppProvider({ children }) {
  const [scenario, setScenarioState] = useState('normal');
  const [speed, setSpeedState] = useState('medium');
  const [running, setRunning] = useState(true);
  const [ds18b20Enabled, setDs18b20Enabled] = useState(true);
  const [telemetry, setTelemetry] = useState(emptyTelemetry);

  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Baseline RMS normal dikalibrasi ulang setiap kecepatan berubah
  const baselineRms = useMemo(() => calibrateBaseline(speed), [speed]);

  const sourceRef = useRef(null);
  if (!sourceRef.current) sourceRef.current = createTelemetrySource({ scenario, speed });

  const live = useRef({ scenario, speed, baselineRms, smoothScore: 0, prevStatus: 'idle', lastAlertAt: 0 });
  live.current.scenario = scenario;
  live.current.speed = speed;
  live.current.baselineRms = baselineRms;

  // Muat data dummy awal (lewat lapisan service)
  useEffect(() => {
    let active = true;
    Promise.all([fetchAlerts(), fetchHistory(), fetchDevices(), fetchEvaluationResults()]).then(
      ([a, h, d, e]) => {
        if (!active) return;
        setAlerts(a);
        setHistory(h);
        setDevices(d);
        setEvaluation(e);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const pushAlert = useCallback((alert) => setAlerts((prev) => [alert, ...prev].slice(0, 200)), []);

  const tick = useCallback(() => {
    const L = live.current;
    const packet = sourceRef.current.nextPacket();
    const features = computeFeatures(packet);
    const { score: raw, ratio } = heuristicAnomalyScore(features, L.baselineRms);
    L.smoothScore = 0.6 * L.smoothScore + 0.4 * raw; // perataan (EMA) agar status tidak berkedip
    const score = L.smoothScore;
    const status = statusFromScore(score);

    // Buat alert jika status bukan normal (baru berubah, atau setelah cooldown)
    const now = packet.timestamp;
    if (status !== 'normal' && (L.prevStatus !== status || now - L.lastAlertAt > ALERT_COOLDOWN_MS)) {
      if (now - L.lastAlertAt > 4000) {
        L.lastAlertAt = now;
        pushAlert({
          id: `AL-${now}`,
          timestamp: now,
          severity: severityFromScore(score),
          type: ALERT_TYPE[L.scenario],
          title: status === 'anomaly' ? 'Skor anomali melewati ambang' : 'Getaran mendekati ambang',
          message: `RMS ${ratio.toFixed(2)}× baseline normal, crest factor ${features.crestFactor.toFixed(2)}.`,
          status: 'open',
          read: false,
          source: 'simulation',
          metrics: { score, rmsTotal: features.rmsTotal, crestFactor: features.crestFactor, ratio },
          scenario: L.scenario,
          speed: L.speed,
        });
      }
    }
    L.prevStatus = status;

    const dtMs = 1000 / packet.sampleRate;
    const xyz = packet.samples.x.map((x, i) => ({
      t: Number((i * dtMs).toFixed(1)),
      x,
      y: packet.samples.y[i],
      z: packet.samples.z[i],
    }));

    setTelemetry((prev) => ({
      ...prev,
      packet,
      features,
      score,
      ratio,
      status,
      xyz,
      packetsReceived: prev.packetsReceived + 1,
      trend: [
        ...prev.trend,
        {
          ts: now,
          time: formatTime(now),
          rms: features.rmsTotal,
          rmsX: features.rmsX,
          rmsY: features.rmsY,
          rmsZ: features.rmsZ,
          score,
          temp: packet.temperatureC,
        },
      ].slice(-TREND_LENGTH),
    }));
  }, [pushAlert]);

  useEffect(() => {
    if (!running) return undefined;
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [running, tick]);

  // ---------- Aksi ----------
  const setScenario = useCallback((id) => {
    sourceRef.current.setScenario(id);
    setScenarioState(id);
  }, []);

  const setSpeed = useCallback((id) => {
    sourceRef.current.setSpeed(id);
    setSpeedState(id);
  }, []);

  const toggleRunning = useCallback(() => setRunning((r) => !r), []);

  const resetSimulation = useCallback(() => {
    sourceRef.current.reset();
    Object.assign(live.current, { smoothScore: 0, prevStatus: 'idle', lastAlertAt: 0 });
    setTelemetry(emptyTelemetry());
  }, []);

  const markAlertRead = useCallback(
    (id, read = true) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read } : a))),
    [],
  );
  const markAllRead = useCallback(() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true }))), []);
  const updateAlertStatus = useCallback(
    (id, status) =>
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status, read: true } : a))),
    [],
  );
  const clearResolved = useCallback(() => setAlerts((prev) => prev.filter((a) => a.status !== 'resolved')), []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const value = {
    dataMode: DATA_MODE,
    loading,
    // simulasi
    scenario,
    speed,
    running,
    baselineRms,
    telemetry,
    setScenario,
    setSpeed,
    toggleRunning,
    resetSimulation,
    tickMs: TICK_MS,
    // perangkat
    devices,
    ds18b20Enabled,
    setDs18b20Enabled,
    // alert
    alerts,
    unreadCount,
    markAlertRead,
    markAllRead,
    updateAlertStatus,
    clearResolved,
    // riwayat & evaluasi
    history,
    evaluation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam <AppProvider>');
  return ctx;
}
