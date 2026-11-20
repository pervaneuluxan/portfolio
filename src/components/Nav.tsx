import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { useActiveSection } from '../hooks/useActiveSection';
import type { Theme } from '../hooks/useTheme';
import { Close, Menu } from './Icons';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'notes', label: 'Notes' },
  { id: 'contact', label: 'Contact' },
];
const IDS = LINKS.map((l) => l.id);

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const active = useActiveSection(IDS);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? 'border-b border-line/10 bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav aria-label="Primary" className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 font-medium" aria-label={`${profile.name}, back to top`}>
          <span className="grid size-9 place-items-center rounded-full bg-fg font-mono text-xs text-bg">{initials}</span>
          <span className="hidden text-sm sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? 'location' : undefined}
                className={`rounded-full px-3.5 py-2 text-sm transition ${
                  active === l.id ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <a href={`mailto:${profile.email}`} className="btn-primary hidden min-h-10 px-4 sm:inline-flex">
            Let’s talk
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line/10 bg-surface/70 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      <div id="mobile-menu" hidden={!open} className="container-page pb-6 md:hidden">
        <ul className="grid gap-1 border-t border-line/10 pt-4">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-surface-2">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
