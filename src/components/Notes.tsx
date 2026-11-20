import { useState } from 'react';
import { notes, readingTime } from '../data/notes';
import { ArrowDown } from './Icons';
import { Reveal } from './Reveal';
import { Section } from './Section';

export function Notes() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <Section id="notes" index="04" eyebrow="Notes" title="Engineering notes from real builds." intro="Short write-ups on testing, accessibility and interaction details.">
      <div className="grid gap-5 lg:grid-cols-3">
        {notes.map((n, i) => {
          const open = openSlug === n.slug;
          const bodyId = `note-${n.slug}`;
          return (
            <Reveal as="article" key={n.slug} delay={i * 70} className="card flex flex-col p-6 sm:p-7">
              <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span>{n.date}</span>
                <span aria-hidden="true">·</span>
                <span>{readingTime(n)} min read</span>
                <span aria-hidden="true">·</span>
                <span className="text-accent">{n.tags.join(' / ')}</span>
              </p>
              <h3 className="text-xl font-semibold leading-snug tracking-[-0.02em]">{n.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{n.summary}</p>

              <div id={bodyId} hidden={!open} className="mt-5 space-y-3 border-t border-line/10 pt-5 text-[15px] leading-relaxed">
                {n.body.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>

              <button
                type="button"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() => setOpenSlug(open ? null : n.slug)}
                className="mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm font-medium"
              >
                {open ? 'Show less' : 'Read note'}
                <ArrowDown className={`text-accent transition ${open ? 'rotate-180' : ''}`} />
              </button>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
