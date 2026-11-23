import { useState } from 'react';
import { Info } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ current, page, onNavigate, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full">
      <Sidebar current={current} onNavigate={onNavigate} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={page.label} description={page.desc} onMenu={() => setMenuOpen(true)} onNavigate={onNavigate} />
        <div className="border-b border-accent/10 bg-accent/5 px-4 py-2 sm:px-6">
          <p className="flex items-center gap-2 text-xs text-accent/90">
            <Info size={14} className="shrink-0" />
            Semua data di dashboard ini adalah data simulasi untuk demonstrasi konsep. Bukan hasil sensor atau model AI sungguhan.
          </p>
        </div>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
