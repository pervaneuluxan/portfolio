import type { Project } from '../data/types';
import { delay, imageFor } from '../lib/style';
import { ArrowRight, External } from './Icons';

interface Props {
  project: Project;
  index: number;
  onOpen: (slug: string, trigger: HTMLElement) => void;
}

export function ProjectCard({ project, index, onOpen }: Props) {
  const p = project;
  return (
    <article
      className="animate-fade-up card group flex flex-col overflow-hidden transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)]"
      style={delay(index * 70)}
      aria-labelledby={`card-${p.slug}`}
    >
      <button
        type="button"
        onClick={(e) => onOpen(p.slug, e.currentTarget)}
        className="relative block aspect-[16/10] overflow-hidden border-b border-line/10 bg-surface-2"
        aria-label={`Read the ${p.title} case study`}
      >
        <picture>
          <source media="(max-width: 640px)" srcSet={imageFor(p.slug, 'mobile')} />
          <img
            src={imageFor(p.slug)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.035]"
          />
        </picture>
        <span className="chip absolute left-3 top-3 !bg-bg/80 backdrop-blur">{p.period}</span>
      </button>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="eyebrow mb-2">{p.role}</p>
          <h3 id={`card-${p.slug}`} className="text-2xl font-semibold tracking-[-0.03em]">
            {p.title}
          </h3>
          <p className="mt-2 text-muted">{p.tagline}</p>
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {p.stack.slice(0, 4).map((s) => (
            <li key={s} className="chip">{s}</li>
          ))}
          {p.stack.length > 4 && <li className="chip">+{p.stack.length - 4}</li>}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
          <button type="button" onClick={(e) => onOpen(p.slug, e.currentTarget)} className="group/btn inline-flex items-center gap-2 text-sm font-medium">
            Read case study <ArrowRight className="text-accent transition group-hover/btn:translate-x-1" />
          </button>
          <a href={p.live} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
            Live site <External />
            <span className="sr-only">(opens {p.title} in a new tab)</span>
          </a>
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
              GitHub <External />
              <span className="sr-only">(opens the {p.title} repository in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
