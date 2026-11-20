import { profile } from '../data/profile';
import { delay } from '../lib/style';
import { ArrowDown, Download } from './Icons';
import { StatusCard } from './StatusCard';

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_65%)]" aria-hidden="true" />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <p className="animate-fade-up chip mb-8 !text-xs" style={delay(0)}>
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            {profile.availability}
          </p>

          <h1 id="hero-title" className="animate-fade-up" style={delay(80)}>
            <span className="mb-4 block font-mono text-sm text-muted">
              {profile.name} · {profile.role}
            </span>
            <span className="block text-[clamp(2.6rem,6.4vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              {profile.headline}
            </span>
          </h1>

          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-muted" style={delay(160)}>
            {profile.valueProp}
          </p>

          <div className="animate-fade-up mt-9 flex flex-wrap gap-3" style={delay(240)}>
            <a href="#work" className="btn-primary group">
              View selected work <ArrowDown className="transition group-hover:translate-y-0.5" />
            </a>
            <a href={profile.cvUrl} download className="btn-ghost">
              Download CV <Download />
            </a>
          </div>

          <p className="animate-fade-up mt-8 font-mono text-xs text-muted" style={delay(320)}>
            {profile.location}
          </p>
        </div>

        <div className="animate-fade-up" style={delay(300)}>
          <StatusCard />
        </div>
      </div>
    </section>
  );
}
