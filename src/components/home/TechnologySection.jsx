import { ArrowRight } from 'lucide-react';
import Section from './Section';
import { TECHNOLOGY } from '../../content/homeContent';
import { AI_MODELS } from '../../content/aiModels';

export default function TechnologySection({ onNavigate }) {
  return (
    <Section
      id="technology"
      eyebrow={TECHNOLOGY.eyebrow}
      title={TECHNOLOGY.title}
      description={TECHNOLOGY.description}
      className="bg-canvas-deep"
    >
      {/* Tiga lapisan teknologi */}
      <div className="grid gap-5 lg:grid-cols-3">
        {TECHNOLOGY.layers.map(({ icon: Icon, title, text, items }, i) => (
          <div key={title} className="flex flex-col rounded-xl border border-line bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon size={20} />
              </span>
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
            </div>
            <h3 className="mt-4 font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            <dl className="mt-5 space-y-3 border-t border-line pt-4">
              {items.map(([name, desc]) => (
                <div key={name}>
                  <dt className="font-mono text-xs font-semibold text-ink">{name}</dt>
                  <dd className="text-xs text-muted">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Ringkasan 3 pendekatan AI (data dari content/aiModels.js) */}
      <div className="mt-10 rounded-xl border border-line bg-surface/50 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="font-semibold text-ink">{TECHNOLOGY.aiTitle}</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted">{TECHNOLOGY.aiNote}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ai')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Lihat rancangan lengkap <ArrowRight size={15} />
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {AI_MODELS.map((m) => (
            <div key={m.id} className="rounded-lg border border-line bg-canvas/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{m.category}</p>
              <p className="mt-1 font-semibold text-ink">{m.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.summary}</p>
              <span className="mt-3 inline-block rounded border border-dashed border-accent/40 px-1.5 py-px text-[10px] text-accent">
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}