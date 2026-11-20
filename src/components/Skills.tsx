import { skills } from '../data/skills';
import { Reveal } from './Reveal';
import { Section } from './Section';

export function Skills() {
  return (
    <Section
      id="skills"
      index="03"
      eyebrow="Skills"
      title="Capabilities, grouped by how I use them."
      intro="No percentage bars — just the tools I ship with, organised around the work."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line/10 bg-line/10 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g, i) => (
          <Reveal key={g.title} delay={i * 60} className="bg-surface p-6 sm:p-7">
            <h3 className="mb-4 flex items-center gap-3 font-semibold">
              <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
              {g.title}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {g.items.map((s) => (
                <li key={s} className="rounded-lg border border-line/10 bg-surface-2/60 px-2.5 py-1.5 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
        <Reveal delay={skills.length * 60} className="flex flex-col justify-between gap-6 bg-surface-2/50 p-6 sm:p-7">
          <p className="text-lg font-medium leading-snug tracking-[-0.01em]">
            Accessibility isn’t a final audit. It’s how the components are built from the start.
          </p>
          <p className="font-mono text-xs text-muted">This page: semantic landmarks, keyboard support, visible focus, reduced-motion aware.</p>
        </Reveal>
      </div>
    </Section>
  );
}
