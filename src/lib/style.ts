import type { CSSProperties } from 'react';

/** Inline style that sets the CSS `--delay` used by fade/reveal animations. */
export const delay = (ms: number): CSSProperties => ({ '--delay': `${ms}ms` }) as CSSProperties;

export const imageFor = (slug: string, variant: 'desktop' | 'mobile' = 'desktop') => `/projects/${variant}/${slug}.jpg`;
