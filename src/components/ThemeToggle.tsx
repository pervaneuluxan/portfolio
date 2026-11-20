import { Moon, Sun } from './Icons';
import type { Theme } from '../hooks/useTheme';

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className="grid size-10 place-items-center rounded-full border border-line/10 bg-surface/70 text-fg transition hover:border-line/30"
    >
      <span className="relative block size-4">
        <Sun className={`absolute inset-0 transition duration-500 ${dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'}`} />
        <Moon className={`absolute inset-0 transition duration-500 ${dark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      </span>
    </button>
  );
}
