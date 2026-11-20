import { profile } from '../data/profile';

export function Footer() {
  return (
    <footer className="border-t border-line/10">
      <div className="container-page flex flex-col gap-4 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Built with React, TypeScript & Tailwind CSS</p>
        <nav aria-label="Footer" className="flex gap-5">
          {profile.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-fg">
              {l.label}
            </a>
          ))}
          <a href="#top" className="link-underline hover:text-fg">
            Back to top ↑
          </a>
        </nav>
      </div>
    </footer>
  );
}
