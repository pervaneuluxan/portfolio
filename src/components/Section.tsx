import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionProps {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

export function Section({ id, index, eyebrow, title, intro, aside, children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-line/10 py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="mb-10 grid gap-6 sm:mb-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow mb-4">
              <span className="text-accent">{index}</span> / {eyebrow}
            </p>
            <h2 id={headingId} className="max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              {title}
            </h2>
            {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
          </div>
          {aside}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
