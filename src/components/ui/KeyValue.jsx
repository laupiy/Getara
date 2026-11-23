/** Daftar label–nilai, dipakai untuk info sensor, ringkasan, dan spesifikasi. */
export default function KeyValue({ items, mono = true }) {
  return (
    <dl className="divide-y divide-line/60">
      {items.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 py-2 text-sm">
          <dt className="text-slate-400">{k}</dt>
          <dd className={`text-right text-slate-100 ${mono ? 'font-mono text-[13px]' : ''}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
