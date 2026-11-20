import { useEffect, useState } from 'react';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

const timeIn = (tz: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());

/** A lightweight "terminal" readout: real data from the content files, plus local time in Baku. */
export function StatusCard() {
  const [time, setTime] = useState(() => timeIn('Asia/Baku'));

  useEffect(() => {
    const id = window.setInterval(() => setTime(timeIn('Asia/Baku')), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const rows: [string, string][] = [
    ['role', profile.role],
    ['based', `${profile.location} · ${time} GMT+4`],
    ['stack', 'React · Next.js · TypeScript'],
    ['focus', 'accessibility · performance · testing'],
    ['latest', `${projects[0].title} — ${projects[0].tagline.replace(/\.$/, '')}`],
  ];

  return (
    <div className="card relative overflow-hidden shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)]">
      <div className="flex items-center gap-2 border-b border-line/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-2 font-mono text-[11px] text-muted">~/parvana — status</span>
      </div>
      <dl className="space-y-2.5 p-5 font-mono text-[13px] leading-relaxed">
        <div className="text-muted">
          <span className="text-accent">$</span> whoami --verbose
        </div>
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[64px_1fr] gap-3">
            <dt className="text-muted">{k}</dt>
            <dd className="text-fg">{v}</dd>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 text-muted">
          <span className="text-accent">$</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-fg/70" aria-hidden="true" />
        </div>
      </dl>
    </div>
  );
}
