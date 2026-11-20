import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const readSaved = (): Theme | null => {
  try {
    const v = localStorage.getItem('theme');
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/** Theme that follows the system until the visitor picks one, then persists their choice. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (readSaved()) return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(systemTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable — the choice lasts for this visit */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
