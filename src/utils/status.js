// Pemetaan status -> label & warna badge (satu sumber untuk seluruh UI)

export const MACHINE_STATUS = {
  idle: { label: 'Idle', tone: 'slate' },
  normal: { label: 'Normal', tone: 'green' },
  warning: { label: 'Warning', tone: 'amber' },
  anomaly: { label: 'Anomaly', tone: 'red' },
};

export const SEVERITY = {
  low: { label: 'Low', tone: 'slate', rank: 1 },
  medium: { label: 'Medium', tone: 'amber', rank: 2 },
  high: { label: 'High', tone: 'orange', rank: 3 },
  critical: { label: 'Critical', tone: 'red', rank: 4 },
};

export const ALERT_STATUS = {
  open: { label: 'Open', tone: 'red' },
  acknowledged: { label: 'Acknowledged', tone: 'amber' },
  resolved: { label: 'Resolved', tone: 'green' },
};

export const CONDITION = {
  normal: { label: 'Normal', tone: 'green' },
  unbalance: { label: 'Unbalance', tone: 'orange' },
  loose: { label: 'Loose Mounting', tone: 'violet' },
};

export const CONNECTION = {
  simulated: { label: 'Simulated', tone: 'accent' },
  connected: { label: 'Connected', tone: 'green' },
  disconnected: { label: 'Not Connected', tone: 'slate' },
  disabled: { label: 'Disabled', tone: 'slate' },
  paused: { label: 'Paused', tone: 'amber' },
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
