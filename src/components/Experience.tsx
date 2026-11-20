import { experience } from '../data/experience';
import { Reveal } from './Reveal';
import { Section } from './Section';

export function Experience() {
  return (
    <Section
      id="experience"
      index="02"
      eyebrow="Experience"
      title="Five years of production front‑end."
      intro="Agency delivery and product ownership at Gocreative, with mentoring and engineering foundations before that."
    >
      <ol className="relative border-l border-line/10 sm:ml-[180px]">
        {experience.map((r, i) => (
          <Reveal as="li" key={`${r.org}-${r.context}`} delay={i * 60} className="relative pb-12 pl-8 last:pb-0 sm:pl-10">
            <span
              className={`absolute -left-[5px] top-2 size-[9px] rounded-full border ${i === 0 ? 'border-accent bg-accent' : 'border-line/30 bg-bg'}`}
              aria-hidden="true"
            />
            <p className="mb-2 font-mono text-xs text-muted sm:absolute sm:-left-[180px] sm:top-1 sm:mb-0 sm:w-[150px] sm:text-right">{r.period}</p>
            <h3 className="text-xl font-semibold tracking-[-0.02em]">
              {r.title} <span className="text-muted">· {r.org}</span>
            </h3>
            <p className="mt-1 text-sm text-accent">{r.context}</p>
            <ul className="mt-4 max-w-2xl space-y-2.5 text-[15px] leading-relaxed text-muted">
              {r.points.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <span className="mt-[11px] h-px w-3 flex-none bg-line/30" aria-hidden="true" />
                  {pt}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
