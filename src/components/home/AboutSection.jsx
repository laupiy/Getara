import { CheckCircle } from 'lucide-react';
import Section from './Section';
import { ABOUT } from '../../content/homeContent';

export default function AboutSection() {
  return (
    <Section id="about" eyebrow={ABOUT.eyebrow} title={ABOUT.title} description={ABOUT.description} className="bg-canvas-deep">
      <div className="grid gap-5 md:grid-cols-3">
        {ABOUT.pillars.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-line bg-surface p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon size={20} />
            </span>
            <h3 className="mt-4 font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-6">
          <h3 className="font-semibold text-ink">{ABOUT.symptomsTitle}</h3>
          <ul className="mt-4 space-y-3">
            {ABOUT.symptoms.map((s) => (
              <li key={s} className="flex gap-3 text-sm text-muted">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-dashed border-line bg-surface/50 p-6">
          <h3 className="font-semibold text-ink">Ruang lingkup prototype</h3>
          <dl className="mt-4 space-y-4">
            {ABOUT.scope.map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex gap-3">
                <Icon size={16} className="mt-0.5 shrink-0 text-muted" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-ink">{label}</dt>
                  <dd className="mt-0.5 text-sm text-muted">{text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}