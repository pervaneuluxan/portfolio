import type { SkillGroup } from './types';

export const skills: SkillGroup[] = [
  {
    title: 'Frontend & UI Engineering',
    items: ['React', 'Next.js (App Router)', 'TypeScript', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Tailwind CSS', 'SCSS', 'GSAP', 'Responsive design', 'Figma-to-code'],
  },
  {
    title: 'Architecture & State',
    items: ['Reusable component libraries', 'Component-driven design', 'Scalable frontend structure', 'Redux Toolkit', 'Zustand', 'Context API'],
  },
  {
    title: 'Data & Backend',
    items: ['REST API integration', 'Next.js server actions', 'MongoDB / Mongoose', 'Better Auth', 'CMS theme development'],
  },
  {
    title: 'Accessibility & Performance',
    items: ['WCAG-compliant solutions', 'Keyboard & screen-reader support', 'Page-load optimisation', 'Performance profiling'],
  },
  {
    title: 'Testing, Tooling & Workflow',
    items: ['Jest', 'Vitest', 'React Testing Library', 'Playwright', 'Vite', 'Webpack', 'Git & GitHub', 'JIRA', 'Scrum', 'Code review', 'UAT'],
  },
];
