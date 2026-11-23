import { useEffect, useState } from 'react';
import { Bell, Menu, Pause, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../ui/Badge';

export default function Topbar({ title, description, onMenu, onNavigate }) {
  const { running, toggleRunning, unreadCount } = useApp();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-700/70 bg-navy-950/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-300 hover:bg-navy-800 lg:hidden"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
        <p className="hidden truncate text-xs text-slate-500 sm:block">{description}</p>
      </div>

      <Badge tone="cyan" dot pulse={running} className="hidden sm:inline-flex">
        SIMULATION MODE
      </Badge>

      <button
        type="button"
        onClick={toggleRunning}
        title={running ? 'Jeda simulasi' : 'Jalankan simulasi'}
        className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium ring-1 ring-inset transition-colors ${
          running
            ? 'text-emerald-300 ring-emerald-400/30 hover:bg-emerald-500/10'
            : 'text-amber-300 ring-amber-400/30 hover:bg-amber-500/10'
        }`}
      >
        {running ? <Pause size={14} /> : <Play size={14} />}
        <span className="hidden md:inline">{running ? 'Streaming' : 'Paused'}</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('alerts')}
        className="relative rounded-lg p-2 text-slate-300 hover:bg-navy-800"
        aria-label="Buka Alert Center"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <div className="hidden text-right font-mono text-xs leading-tight text-slate-400 md:block">
        <p className="text-slate-200">{now.toLocaleTimeString('id-ID')}</p>
        <p>{now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>
    </header>
  );
}
