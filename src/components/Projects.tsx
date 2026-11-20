import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { moreWork, projects } from '../data/projects';
import { PROJECT_FILTERS, type ProjectFilter } from '../data/types';
import { CaseStudyDrawer } from './CaseStudyDrawer';
import { External } from './Icons';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './Reveal';
import { Section } from './Section';

const CASE_PARAM = 'case';

const readCaseFromUrl = () => {
  const slug = new URLSearchParams(window.location.search).get(CASE_PARAM);
  return projects.some((p) => p.slug === slug) ? slug : null;
};

export function Projects() {
  const [filter, setFilter] = useState<ProjectFilter>('All');
  const [openSlug, setOpenSlug] = useState<string | null>(readCaseFromUrl);
  const trigger = useRef<HTMLElement | null>(null);

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.filters.includes(filter))),
    [filter],
  );
  const counts = useMemo(
    () => Object.fromEntries(PROJECT_FILTERS.map((f) => [f, f === 'All' ? projects.length : projects.filter((p) => p.filters.includes(f)).length])),
    [],
  );

  // Keep ?case=slug in the URL so a case study can be linked directly.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (openSlug) url.searchParams.set(CASE_PARAM, openSlug);
    else url.searchParams.delete(CASE_PARAM);
    window.history.replaceState(null, '', url);
  }, [openSlug]);

  const open = useCallback((slug: string, el: HTMLElement) => {
    trigger.current = el;
    setOpenSlug(slug);
  }, []);

  const close = useCallback(() => {
    setOpenSlug(null);
    trigger.current?.focus();
  }, []);

  return (
    <Section
      id="work"
      index="01"
      eyebrow="Selected work"
      title="Case studies from products and client launches."
      intro="A full-stack product of my own, a SaaS I architected from scratch, and production sites for hospitality, government and a national campaign."
    >
      <Reveal className="mb-8 flex flex-wrap items-center gap-2" delay={80}>
        <span id="filter-label" className="eyebrow mr-2">Filter</span>
        <div role="group" aria-labelledby="filter-label" className="flex flex-wrap gap-2">
          {PROJECT_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                filter === f ? 'border-fg bg-fg text-bg' : 'border-line/15 text-muted hover:border-line/30 hover:text-fg'
              }`}
            >
              {f}
              <span className={`font-mono text-[11px] ${filter === f ? 'text-bg/70' : 'text-muted/70'}`}>{counts[f]}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
        {filter === 'All' ? '' : ` in ${filter}`}.
      </p>

      <div key={filter} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} onOpen={open} />
        ))}
      </div>

      <Reveal className="mt-16">
        <h3 className="eyebrow mb-4">More client work</h3>
        <ul className="divide-y divide-line/10 border-y border-line/10">
          {moreWork.map((m) => (
            <li key={m.slug}>
              <a
                href={m.live}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-4 transition sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:px-2 sm:hover:bg-surface-2/60"
              >
                <span className="text-lg font-medium tracking-[-0.02em]">{m.title}</span>
                <span className="hidden text-sm text-muted sm:block">{m.category}</span>
                <span className="col-start-1 font-mono text-xs text-muted sm:col-start-auto">{m.stack}</span>
                <External className="col-start-2 row-span-2 row-start-1 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:col-start-auto sm:row-span-1 sm:row-start-auto" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <CaseStudyDrawer project={projects.find((p) => p.slug === openSlug) ?? null} onClose={close} />
    </Section>
  );
}
