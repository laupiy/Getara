export default function SegmentedControl({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-canvas p-1">
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
                ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40'
                : 'text-slate-400 hover:bg-surface-raised hover:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
