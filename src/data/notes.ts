import type { Note } from './types';

// Short engineering notes drawn from real projects. Reading time is computed from the body.

export const notes: Note[] = [
  {
    slug: 'three-test-layers',
    title: 'Testing a Kanban board at three layers',
    summary: 'How CardFile splits tests into pure logic, real server actions and full browser runs — and why none of them touch the real database.',
    date: '2026',
    tags: ['Testing', 'Next.js'],
    body: [
      'Board behaviour — moving cards, building columns, stage rules — lives in small pure modules. Vitest and Testing Library cover those modules, the board hook and the components in jsdom, so most bugs are caught in milliseconds.',
      'Integration tests call the real server actions and Mongoose models against an in-memory MongoDB. Auth is replaced with a fake session, so the tests exercise persistence without needing an account.',
      'Playwright then drives the whole app against its own in-memory database and build folder. The rule across all three layers: tests never see the database in .env.local.',
    ],
  },
  {
    slug: 'drag-needs-a-menu',
    title: 'Every drag needs a non-drag path',
    summary: 'Drag-and-drop feels great with a mouse. A column menu makes the same action available to everyone else.',
    date: '2026',
    tags: ['Accessibility', 'UX'],
    body: [
      'In CardFile, cards move between stages by dragging — but each card also has a menu that sends it to any column. It costs one small component and removes the board’s dependence on precise pointer movement.',
      'The same pattern applies anywhere an interaction relies on a gesture: offer a plain, focusable control that does the same thing.',
    ],
  },
  {
    slug: 'accessibility-is-a-component-property',
    title: 'Accessibility is a component property',
    summary: 'Lessons from building compliance tooling: treat focus, labels and contrast as part of the component API, not a final audit.',
    date: '2026',
    tags: ['Accessibility', 'Architecture'],
    body: [
      'Working on a product whose job is to make other websites WCAG-compliant makes one thing obvious: accessibility retrofitted at the end is expensive and fragile.',
      'When a button, dialog or form field ships with its focus behaviour, labelling and states built in, every screen that uses it inherits them. Reviews then check composition rather than re-checking every page.',
    ],
  },
];

export const readingTime = (note: Note) => Math.max(1, Math.round(note.body.join(' ').split(/\s+/).length / 200));
