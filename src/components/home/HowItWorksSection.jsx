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
    </Section>
  );
}