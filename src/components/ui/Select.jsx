export const fieldClass =
  'h-9 rounded-lg border border-navy-600 bg-navy-850 px-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400';

export default function Select({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
