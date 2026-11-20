import { useEffect, useRef } from 'react';
import type { Project } from '../data/types';
import { imageFor } from '../lib/style';
import { Close, External, GitHub } from './Icons';

interface Props {
  project: Project | null;
  onClose: () => void;
}

/**
 * Case study in a native modal <dialog>: the browser handles the focus trap, Esc and the inert
 * background; we add the slide-in, scroll lock and a backdrop click to close.
 */
export function CaseStudyDrawer({ project, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (project && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      dialog.scrollTop = 0;
    }
    if (!project && dialog.open) dialog.close();
  }, [project]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onDialogClose = () => {
      document.documentElement.style.overflow = '';
      onClose();
    };
    dialog.addEventListener('close', onDialogClose);
    return () => dialog.removeEventListener('close', onDialogClose);
  }, [onClose]);

  const p = project;

  return (
    <dialog
      ref={ref}
      aria-labelledby="case-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="fixed inset-y-0 right-0 m-0 ml-auto h-full max-h-none w-full max-w-2xl overflow-y-auto overscroll-contain border-l border-line/10 bg-bg p-0 text-fg backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-[drawer-in_0.5s_cubic-bezier(0.22,1,0.36,1)]"
    >
      {p && (
        <article className="min-h-full">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line/10 bg-bg/90 px-6 py-4 backdrop-blur">
            <p className="eyebrow">Case study</p>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="grid size-10 place-items-center rounded-full border border-line/10 hover:border-line/30"
              aria-label="Close case study"
            >
              <Close />
            </button>
          </header>

          <div className="space-y-10 px-6 pb-16 pt-8 sm:px-10">
            <div>
              <p className="eyebrow mb-3">
                {p.period} · {p.role}
              </p>
              <h2 id="case-title" className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-none tracking-[-0.04em]">
                {p.title}
              </h2>
              <p className="mt-3 text-lg text-muted">{p.tagline}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={p.live} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Visit live site <External />
                </a>
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <GitHub /> Source on GitHub
                  </a>
                )}
              </div>
            </div>

            <img src={imageFor(p.slug)} alt={`${p.title} homepage`} className="w-full rounded-2xl border border-line/10" />

            <CaseBlock title="Overview">{p.overview}</CaseBlock>
            <CaseBlock title="Challenge">{p.challenge}</CaseBlock>
            <CaseBlock title="Solution">{p.solution}</CaseBlock>

            <section aria-labelledby="case-highlights">
              <h3 id="case-highlights" className="eyebrow mb-4">Key technical highlights</h3>
              <ul className="space-y-3">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 size-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="case-stack">
              <h3 id="case-stack" className="eyebrow mb-4">Tech stack</h3>
              <ul className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="chip !text-xs">{s}</li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      )}
    </dialog>
  );
}

function CaseBlock({ title, children }: { title: string; children: string }) {
  return (
    <section>
      <h3 className="eyebrow mb-3">{title}</h3>
      <p className="text-[17px] leading-relaxed">{children}</p>
    </section>
  );
}
