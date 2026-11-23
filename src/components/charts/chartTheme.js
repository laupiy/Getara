export const CHART_COLORS = {
  x: '#22d3ee', // cyan
  y: '#a78bfa', // violet
  z: '#fbbf24', // amber
  total: '#38bdf8', // sky
  score: '#f472b6',
  temp: '#fb923c',
  baseline: '#94a3b8',
  grid: '#1b2d55',
  axis: '#64748b',
};

export const axisProps = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: CHART_COLORS.grid },
};

export const tooltipProps = {
  contentStyle: {
    background: '#0a1428',
    border: '1px solid #233a68',
    borderRadius: 8,
    fontSize: 12,
    color: '#e2e8f0',
  },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { padding: 0 },
  cursor: { stroke: '#233a68' },
};
