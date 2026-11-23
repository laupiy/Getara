import { useState } from 'react';
import Section from './Section';
import PrototypeIllustration from './PrototypeIllustration';
import { HOW_IT_WORKS } from '../../content/homeContent';

export default function HowItWorksSection() {
  const [active, setActive] = useState(null);
  const { components } = HOW_IT_WORKS;

  return (
    <Section id="how-it-works" eyebrow={HOW_IT_WORKS.eyebrow} title={HOW_IT_WORKS.title} description={HOW_IT_WORKS.description}>
      <div className="rounded-2xl border border-line bg-surface/50 p-3 sm:p-5">
        <PrototypeIllustration active={active} onActive={setActive} components={components} />
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-0 w-6 border-t-2 border-dashed border-accent" /> Aliran data (rencana)
          </span>
          <span className="rounded border border-dashed border-line px-1.5 py-px font-mono text-[10px]">
            Ilustrasi arsitektur — hardware belum terintegrasi
          </span>
        </div>
      </div>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onMouseLeave={() => setActive(null)}>
        {components.map((c, i) => {
          const on = active === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
                onClick={() => setActive(on ? null : c.id)}
                aria-pressed={on}
                className={`flex h-full w-full gap-4 rounded-xl border p-4 text-left transition-colors ${
                  on ? 'border-accent/60 bg-accent/5' : 'border-line bg-surface hover:border-accent/30'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold ${
                    on ? 'border-accent bg-accent text-on-accent' : 'border-accent/60 text-accent'
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{c.name}</span>
                    <span className="rounded border border-line px-1.5 py-px text-[10px] text-muted">{c.status}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-accent">{c.role}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted">{c.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}