import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Notes } from './components/Notes';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-50 -translate-y-[200%] rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <Nav theme={theme} onToggleTheme={toggle} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <Notes />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
