// Warna grafik tema Industrial Slate + Orange.
// Orange untuk garis utama (RMS total); sumbu X/Y/Z memakai warna yang mudah dibedakan.
export const CHART_COLORS = {
  x: '#38bdf8', // sky
  y: '#a78bfa', // violet
  z: '#2dd4bf', // teal
  total: '#f59e0b', // accent (garis utama)
  score: '#f472b6',
  temp: '#fb923c',
  baseline: '#94a3b8',
  grid: '#2f3b48',
  axis: '#94a3b8',
};

export const axisProps = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: CHART_COLORS.grid },
};

export const tooltipProps = {
  contentStyle: {
    background: '#161c24',
    border: '1px solid #374151',
    borderRadius: 8,
    fontSize: 12,
    color: '#f8fafc',
  },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { padding: 0 },
  cursor: { stroke: '#374151' },
};
