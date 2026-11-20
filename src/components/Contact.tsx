import { profile } from '../data/profile';
import { useCopy } from '../hooks/useCopy';
import { ContactForm } from './ContactForm';
import { Check, Copy, External, GitHub, LinkedIn, Mail } from './Icons';
import { Reveal } from './Reveal';
import { Section } from './Section';

const ICONS: Record<string, typeof GitHub> = { GitHub, LinkedIn };

export function Contact() {
  const { state, copy } = useCopy();

  return (
    <Section id="contact" index="05" eyebrow="Contact" title="Let’s build what’s next." intro="Have a role, a product or a tricky interface in mind? Send a note — or grab my email and write directly.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
        <Reveal className="flex flex-col gap-6">
          <div className="card p-6 sm:p-7">
            <p className="eyebrow mb-3">Email</p>
            <a href={`mailto:${profile.email}`} className="link-underline break-all text-xl font-medium tracking-[-0.01em] sm:text-2xl">
              {profile.email}
            </a>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copy(profile.email)}
                className={`btn-ghost ${state === 'copied' ? '!border-ok !text-ok' : ''}`}
                aria-describedby="copy-feedback"
              >
                {state === 'copied' ? <Check /> : <Copy />}
                {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy email'}
              </button>
              <a href={`mailto:${profile.email}`} className="btn-ghost">
                <Mail /> Open mail app
              </a>
            </div>
            <p id="copy-feedback" className="sr-only" aria-live="polite">
              {state === 'copied' ? 'Email address copied to clipboard.' : state === 'failed' ? 'Copying failed. Select the address to copy it manually.' : ''}
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {profile.links.map((l) => {
              const Icon = ICONS[l.label] ?? External;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group flex items-center justify-between gap-3 px-5 py-4 transition hover:border-line/25"
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <Icon width={18} height={18} /> {l.label}
                    </span>
                    <External className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="font-mono text-xs text-muted">
            {profile.location} · {profile.availability}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
