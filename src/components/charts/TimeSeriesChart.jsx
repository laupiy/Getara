import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS, axisProps, tooltipProps } from './chartTheme';

/**
 * Grafik deret waktu reusable.
 * @param {Array} data
 * @param {string} xKey
 * @param {{key:string,name:string,color:string}[]} series
 * @param {'line'|'area'} variant
 * @param {{y:number,label:string,color?:string}[]} references
 */
export default function TimeSeriesChart({
  data,
  xKey = 'time',
  series,
  variant = 'line',
  height = 260,
  yDomain = ['auto', 'auto'],
  yUnit = '',
  xUnit = '',
  references = [],
  legend = true,
  digits = 3,
}) {
  const Chart = variant === 'area' ? AreaChart : LineChart;
  const formatter = (v) => (typeof v === 'number' ? `${v.toFixed(digits)}${yUnit ? ` ${yUnit}` : ''}` : v);

  return (
    <div style={{ height }} className="w-full">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-line text-sm text-slate-500">
          Menunggu data simulasi…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} {...axisProps} minTickGap={28} unit={xUnit} />
            <YAxis {...axisProps} domain={yDomain} width={56} tickFormatter={(v) => Number(v).toFixed(2)} />
            <Tooltip {...tooltipProps} formatter={formatter} />
            {legend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} iconType="plainline" />}
            {references.map((r) => (
              <ReferenceLine
                key={r.label}
                y={r.y}
                stroke={r.color ?? CHART_COLORS.baseline}
                strokeDasharray="5 4"
                label={{ value: r.label, fill: r.color ?? CHART_COLORS.baseline, fontSize: 10, position: 'insideTopRight' }}
              />
            ))}
            {series.map((s) =>
              variant === 'area' ? (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#grad-${s.key})`}
                  isAnimationActive={false}
                  dot={false}
                />
              ) : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={1.75}
                  dot={false}
                  isAnimationActive={false}
                />
              ),
            )}
          </Chart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
