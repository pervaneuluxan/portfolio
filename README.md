# Pərvanə Uluxanova — Portfolio

Editorial developer portfolio built with **React 18 + TypeScript + Vite + Tailwind CSS**.
Light and dark themes (system default, choice persisted), case studies with filtering and a
deep-linkable drawer, experience timeline, grouped skills, engineering notes and a validated contact form.

## Run

```bash
npm install
npm run dev        # http://localhost:3005
npm run build      # type-check + static build into dist/
npm run preview    # serve the production build
```

## Structure

```
src/
  data/            content — edit these, not the components
    profile.ts       name, headline, availability badge, email, links, CV path
    projects.ts      flagship case studies + "More client work" list
    experience.ts    timeline roles
    skills.ts        skill groups
    notes.ts         engineering notes (reading time is computed)
    types.ts         shared types and the project filter list
  components/      Nav, Hero, StatusCard, Projects, ProjectCard, CaseStudyDrawer,
                   Experience, Skills, Notes, Contact, ContactForm, Footer, Section, Reveal, Icons
  hooks/           useTheme, useActiveSection, useCopy
  lib/             contact validation/sending, style helpers
public/
  projects/        screenshots: desktop/<slug>.jpg (1024×640) and mobile/<slug>.jpg (512×1108)
  Parvana-Uluxanova-CV.pdf, og.png, favicon.svg
```

## Contact form

Copy `.env.example` to `.env.local` and set `VITE_CONTACT_ENDPOINT` to any endpoint that accepts a JSON
POST of `{ name, email, message }` (for example a Formspree form URL). Without it, the form opens the
visitor's email app with the message pre-filled, so it always works.

## Case-study links

Each case study can be linked directly: `/?case=cardfile`, `/?case=corpowid`, and so on.

## Accessibility

Semantic landmarks and one `h1`, skip link, full keyboard support, visible focus, native modal `<dialog>`
for case studies (focus trap, Esc, focus returned to the trigger), `aria-pressed` filters with a live
result count, labelled form fields with inline errors, and `prefers-reduced-motion` support.

Earlier designs are kept in `archive/` (facade, editorial, bento).
