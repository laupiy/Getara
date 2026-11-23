export const fmt = (n, digits = 3) =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : Number(n).toFixed(digits);

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (ts) => `${formatDate(ts)} ${formatTime(ts)}`;

export function formatDuration(sec) {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}j ${m}m ${r}d`;
  if (m) return `${m}m ${r}d`;
  return `${r}d`;
}

// yyyy-mm-dd (zona waktu lokal) untuk input type="date"
export function toDateInput(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function relativeTime(ts) {
  const diff = Math.round((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff} dtk lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}
