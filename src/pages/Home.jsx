import { Activity, LayoutDashboard } from 'lucide-react';
import Button from '../components/ui/Button';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import TechnologySection from '../components/home/TechnologySection';
import { DASHBOARD_START } from '../config/navigation';
import { HOME_NAV } from '../content/homeContent';

// Scroll ke section memakai scrollIntoView (bukan href="#id"),
// karena hash URL sudah dipakai oleh router halaman.
const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Home({ onNavigate }) {
  const openDashboard = () => onNavigate(DASHBOARD_START);

  return (
    <div className="min-h-full bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line/60 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-on-accent">
              <Activity size={20} strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight">Getara</span>
              <span className="block text-[11px] text-muted">Smart Machine Health Monitoring</span>
            </span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              {HOME_NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <Button variant="accent" icon={LayoutDashboard} onClick={openDashboard}>
              <span className="hidden sm:inline">Explore Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <HeroSection onExplore={openDashboard} onLearnMore={() => scrollToSection('about')} />
        <AboutSection />
        <HowItWorksSection />
        <TechnologySection onNavigate={onNavigate} />
      </main>
    </div>
  );
}