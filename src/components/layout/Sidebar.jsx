import { Activity, X } from 'lucide-react';
import { NAV_ITEMS } from '../../config/navigation';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ current, onNavigate, open, onClose }) {
  const { unreadCount, dataMode } = useApp();

  return (
    <>
      {/* Overlay untuk mobile */}
      <div
        className={`fixed inset-0 z-30 bg-canvas/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-canvas-deep transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-line/70 px-5">
          <button
            type="button"
            onClick={() => {
              onNavigate('home');
              onClose();
            }}
            title="Kembali ke Homepage"
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-on-accent shadow-lg shadow-accent/20">
              <Activity size={20} strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-slate-50">Getara</p>
              <p className="text-[11px] text-slate-400">Machine Health Monitoring</p>
            </div>
          </button>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-raised lg:hidden" aria-label="Tutup menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.id === current;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:bg-surface-raised hover:text-slate-100'
                }`}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-accent" />}
                <Icon size={18} className={active ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'alerts' && unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-1.5 py-px font-mono text-[11px] text-rose-300">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-lg border border-dashed border-accent/30 bg-accent/5 px-3 py-3 text-xs">
          <p className="font-semibold text-accent">Prototype v0.1</p>
          <p className="mt-1 text-slate-400">
            Mode data: <span className="font-mono text-accent">{dataMode}</span>. Hardware & model AI belum terintegrasi.
          </p>
        </div>
      </aside>
    </>
  );
}
