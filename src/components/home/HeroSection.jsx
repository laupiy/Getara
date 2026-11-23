import { ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import HeroVisual from './HeroVisual';
import { HERO } from '../../content/homeContent';

export default function HeroSection({ onExplore, onLearnMore }) {
  return (
    <section className="relative overflow-hidden">
      {/* Cahaya latar halus */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {HERO.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-6xl">{HERO.title}</h1>
          <p className="mt-3 text-lg font-medium text-accent sm:text-xl">{HERO.tagline}</p>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">{HERO.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" icon={ArrowRight} onClick={onExplore} className="h-11 px-5">
              Explore Dashboard
            </Button>
            <Button variant="outline" icon={ChevronDown} onClick={onLearnMore} className="h-11 px-5">
              Learn More
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
            {HERO.highlights.map((h) => (
              <div key={h.label}>
                <dt className="font-mono text-sm font-semibold text-ink">{h.value}</dt>
                <dd className="mt-1 text-xs text-muted">{h.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}