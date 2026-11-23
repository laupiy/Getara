export default function SegmentedControl({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-navy-700 bg-navy-850 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-md font-medium transition-colors ${pad} ${
              active
                ? 'bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/40'
                : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
