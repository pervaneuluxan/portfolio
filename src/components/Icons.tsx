import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const ArrowRight = (p: IconProps) => <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const ArrowDown = (p: IconProps) => <svg {...base(p)}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
export const External = (p: IconProps) => <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const Download = (p: IconProps) => <svg {...base(p)}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;
export const Copy = (p: IconProps) => <svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>;
export const Check = (p: IconProps) => <svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>;
export const Close = (p: IconProps) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Menu = (p: IconProps) => <svg {...base(p)}><path d="M4 8h16M4 16h16" /></svg>;
export const Sun = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const Moon = (p: IconProps) => <svg {...base(p)}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></svg>;
export const GitHub = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>
);
export const LinkedIn = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>
);
export const Mail = (p: IconProps) => <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
export const Spinner = (p: IconProps) => (
  <svg {...base(p)} className={`animate-spin ${p.className ?? ''}`}><path d="M21 12a9 9 0 1 1-9-9" /></svg>
);
