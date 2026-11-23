// Pemetaan status -> label & warna badge (satu sumber untuk seluruh UI)

export const MACHINE_STATUS = {
  idle: { label: 'Menunggu', tone: 'slate' },
  normal: { label: 'Normal', tone: 'green' },
  warning: { label: 'Waspada', tone: 'amber' },
  anomaly: { label: 'Anomali', tone: 'red' },
};

export const SEVERITY = {
  low: { label: 'Rendah', tone: 'slate', rank: 1 },
  medium: { label: 'Sedang', tone: 'amber', rank: 2 },
  high: { label: 'Tinggi', tone: 'orange', rank: 3 },
  critical: { label: 'Kritis', tone: 'red', rank: 4 },
};

export const ALERT_STATUS = {
  open: { label: 'Terbuka', tone: 'red' },
  acknowledged: { label: 'Diakui', tone: 'amber' },
  resolved: { label: 'Selesai', tone: 'green' },
};

export const CONDITION = {
  normal: { label: 'Normal', tone: 'green' },
  unbalance: { label: 'Unbalance', tone: 'orange' },
  loose: { label: 'Dudukan Longgar', tone: 'violet' },
};

export const CONNECTION = {
  simulated: { label: 'Simulasi', tone: 'accent' },
  connected: { label: 'Terhubung', tone: 'green' },
  disconnected: { label: 'Tidak Terhubung', tone: 'slate' },
  disabled: { label: 'Nonaktif', tone: 'slate' },
  paused: { label: 'Dijeda', tone: 'amber' },
};

// Ambang status dari skor anomali (0–1)
export const SCORE_THRESHOLDS = { warning: 0.35, anomaly: 0.6, critical: 0.85 };

export function statusFromScore(score) {
  if (score >= SCORE_THRESHOLDS.anomaly) return 'anomaly';
  if (score >= SCORE_THRESHOLDS.warning) return 'warning';
  return 'normal';
}

export function severityFromScore(score) {
  if (score >= SCORE_THRESHOLDS.critical) return 'critical';
  if (score >= SCORE_THRESHOLDS.anomaly) return 'high';
  if (score >= SCORE_THRESHOLDS.warning) return 'medium';
  return 'low';
}
