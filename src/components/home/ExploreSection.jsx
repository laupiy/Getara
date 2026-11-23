import { ArrowRight, ChevronRight } from 'lucide-react';
import Section from './Section';
import DashboardPreview from './DashboardPreview';
import Button from '../ui/Button';
import { NAV_ITEMS, DASHBOARD_START } from '../../config/navigation';
import { EXPLORE } from '../../content/homeContent';

export default function ExploreSection({ onNavigate }) {
  const openOverview = () => onNavigate(DASHBOARD_START);

  return (
    <Section id="explore" eyebrow={EXPLORE.eyebrow} title={EXPLORE.title} description={EXPLORE.description}>
      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DashboardPreview onOpen={openOverview} />
          <p className="mt-3 text-xs text-muted">{EXPLORE.note}</p>
        </div>

        <div className="lg:col-span-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Halaman dashboard</p>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {NAV_ITEMS.map(({ id, label, desc, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised"
                >
                  <Icon size={17} className="shrink-0 text-muted group-hover:text-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{label}</span>
                    <span className="block truncate text-xs text-muted">{desc}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted group-hover:text-accent" />
                </button>
              </li>
            ))}
          </ul>

          <Button variant="accent" icon={ArrowRight} onClick={openOverview} className="mt-5 h-11 w-full px-5">
            Buka Ringkasan
          </Button>
        </div>
      </div>
    </Section>
  );
}