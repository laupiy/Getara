import { Activity, X } from 'lucide-react';
import { NAV_ITEMS, HOME_PAGE } from '../../config/navigation';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ current, onNavigate, open, onClose }) {
  const { unreadCount, dataMode } = useApp();

  return (
    <>
      {/* Overlay untuk mobile */}
      <div
        className={`fixed inset-0 z-30 bg-navy-950/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-navy-700/70 bg-navy-900 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-navy-700/70 px-5">
          {/* Logo: klik untuk kembali ke Homepage */}
          <button
            type="button"
            onClick={() => {
              onNavigate(HOME_PAGE);
              onClose();
            }}
            title="Kembali ke Homepage"
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-navy-950 shadow-lg shadow-cyan-500/20">
              <Activity size={20} strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-slate-50">Getara</p>
              <p className="text-[11px] text-slate-400">Machine Health Monitoring</p>
            </div>
          </button>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 lg:hidden" aria-label="Tutup menu">
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
                  active ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-400 hover:bg-navy-800 hover:text-slate-100'
                }`}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-cyan-400" />}
                <Icon size={18} className={active ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'alerts' && unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-1.5 py-px font-mono text-[11px] text-rose-300">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-lg border border-dashed border-cyan-400/30 bg-cyan-500/5 px-3 py-3 text-xs">
          <p className="font-semibold text-cyan-200">Prototype v0.1</p>
          <p className="mt-1 text-slate-400">
            Mode data: <span className="font-mono text-cyan-300">{dataMode}</span>. Hardware & model AI belum terintegrasi.
          </p>
        </div>
      </aside>
    </>
  );
}