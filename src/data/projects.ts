import type { MoreProject, Project } from './types';

// Flagship case studies. Facts come from the CV, the public CardFile repository and what each live site
// actually loads; the narrative (challenge / solution wording) is a first draft to tune in your own voice.
// Images live in /public/projects/{desktop|mobile}/{slug}.jpg.

export const projects: Project[] = [
  {
    slug: 'cardfile',
    title: 'CardFile',
    tagline: 'A private Kanban board for a job search.',
    period: '2026',
    role: 'Design, full-stack build, testing',
    filters: ['Next.js / React', 'Full-Stack'],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'MongoDB / Mongoose', 'Better Auth', 'dnd-kit', 'Tailwind CSS', 'Vitest', 'Playwright'],
    live: 'https://card-file.vercel.app/',
    repo: 'https://github.com/pervaneuluxan/CardFile',
    overview:
      'CardFile keeps every application in one place: save a role, log where you applied, and move the card down five stages — Wish List, Applied, Interviewing, Offer, Rejected. Each board is visible only to its owner.',
    challenge:
      'Job searches sprawl across spreadsheets, inboxes and notes. The board had to feel instant to rearrange, keep each user’s data private, and stay reliable enough to trust with a real search.',
    solution:
      'A Next.js App Router app with server actions writing to MongoDB through Mongoose, sessions handled by Better Auth, and drag-and-drop built on dnd-kit — with a column menu as a non-drag alternative. Board logic lives in small pure modules so it can be tested without a browser.',
    highlights: [
      'Three test layers: Vitest + Testing Library for board logic and components, integration tests that run real server actions against an in-memory MongoDB, and Playwright end-to-end runs on their own isolated database.',
      'Every private value lives in environment variables; the repo documents each one and nothing secret is committed.',
      'Every card can be moved by dragging or from its menu, so the board works without a pointer.',
      'Dark and light themes, generated icons and a share image for clean link previews.',
    ],
  },
  {
    slug: 'corpowid',
    title: 'Corpowid',
    tagline: 'Accessibility, consent and compliance in one platform.',
    period: '2024 — 2026',
    role: 'Front-end architecture, accessibility tooling',
    filters: ['Next.js / React'],
    stack: ['React', 'TypeScript', 'Component library', 'WCAG 2.x', 'Jest', 'Playwright'],
    live: 'https://corpowid.ai/',
    overview:
      'Corpowid is Gocreative’s internal startup product: one interface for website accessibility, cookie consent and legal compliance, delivered to customers’ sites through an embeddable widget.',
    challenge:
      'Start a product frontend from zero that could grow quickly without becoming brittle — while the product itself is about accessibility, so the tooling had to meet the standard it sells.',
    solution:
      'I built the frontend architecture from scratch around reusable, accessible UI components, keeping structure and maintainability as the foundation. I designed and delivered the accessibility solutions that help customers make their websites WCAG-compliant, working closely with backend engineers and UI/UX designers.',
    highlights: [
      'Owned the frontend codebase structure from the first commit.',
      'Reusable component structures that keep the application responsive and fast as features grow.',
      'Deep, hands-on work across accessibility, performance and privacy requirements.',
      'Unit, integration and end-to-end tests with Jest and Playwright.',
    ],
  },
  {
    slug: 'artriverfront',
    title: 'Art Riverfront',
    tagline: 'A boutique art hotel in Tbilisi — “Art in every stay”.',
    period: '2026',
    role: 'Front-end implementation',
    filters: ['CMS sites', 'Motion / GSAP'],
    stack: ['October CMS theme', 'Bootstrap', 'GSAP + ScrollTrigger', 'Splide', 'Datepicker', 'intl-tel-input', 'GLightbox'],
    live: 'https://www.artriverfront.com/',
    overview:
      'The hotel’s site leads with mood and art — rooms, dining, the art collection and events — while keeping booking within reach on every screen.',
    challenge:
      'A design-led hotel site has to feel editorial and cinematic without slowing down the one thing that pays for it: the booking request.',
    solution:
      'A custom CMS theme with scroll-driven GSAP motion and Splide galleries, plus a booking bar with date pickers, guest counts and international phone input that stays usable on mobile.',
    highlights: [
      'Scroll-triggered motion that supports the content instead of hiding it.',
      'Booking inputs built for real guests: date ranges, adults/children and international numbers.',
      'Multilingual content managed by the client through the CMS.',
    ],
  },
  {
    slug: 'shusha',
    title: 'Shusha State Reserve',
    tagline: 'The official site of Azerbaijan’s cultural capital.',
    period: 'Public sector',
    role: 'Front-end implementation',
    filters: ['CMS sites'],
    stack: ['October CMS theme', 'Bootstrap', 'Splide', 'Fancybox', 'Input masks', 'AZ / EN / RU'],
    live: 'https://shusha.gov.az/az',
    overview:
      'The Shusha City State Reserve’s site brings together news, a photo gallery, historic monuments, notable figures and a 360° virtual tour of the city.',
    challenge:
      'A public institution’s site serves a wide audience in three languages and carries a lot of visual heritage content that has to stay easy to browse.',
    solution:
      'A trilingual CMS theme with gallery lightboxes, sliders for monuments and places, and structured sections the reserve’s team can keep up to date.',
    highlights: [
      'Azerbaijani, English and Russian versions from one theme.',
      'Image-heavy gallery and monument pages with lightbox browsing.',
      'Entry point to the city’s 360° virtual tour.',
    ],
  },
  {
    slug: 'pepsi',
    title: 'Pepsi Promo',
    tagline: '“Pepsi al, hədiyyə qazan” — buy, scan, win.',
    period: 'Campaign',
    role: 'Front-end implementation',
    filters: ['CMS sites', 'Motion / GSAP'],
    stack: ['October CMS theme', 'Bootstrap', 'jQuery', 'GSAP', 'html5-qrcode'],
    live: 'https://promo.pepsi.az/',
    overview:
      'A national promo where buyers register codes from their purchase and enter prize draws. Almost all traffic comes from phones.',
    challenge:
      'Entering promo codes by hand on a phone is slow and error-prone — and every abandoned entry is a lost participant.',
    solution:
      'A mobile-first flow with sign-up and sign-in, and in-browser QR scanning through the phone camera so codes can be captured without typing.',
    highlights: [
      'Camera-based QR code capture in the browser.',
      'Thumb-first layout: large targets and a short path from landing to entry.',
      'Light GSAP motion for the campaign visuals.',
    ],
  },
];

export const moreWork: MoreProject[] = [
  { slug: 'incluser', title: 'Incluser', category: 'Accessibility extension · product site', live: 'https://incluser.com/', stack: 'CMS theme · GSAP · Lottie' },
  { slug: 'beldersoy', title: 'Beldersoy Resort & Spa', category: 'Hospitality · Uzbekistan', live: 'https://beldersoy.com/', stack: 'CMS theme · GSAP · video' },
  { slug: 'cch', title: 'Caspian Capital Holding', category: 'Holding · development', live: 'https://cch.az/', stack: 'CMS theme · GSAP' },
  { slug: 'arthotelbaku', title: 'Art Gallery Hotel', category: 'Hospitality · Baku', live: 'https://www.arthotelbaku.com/', stack: 'CMS theme · jQuery' },
  { slug: 'oerusta', title: 'Erusta Hukuk Bürosu', category: 'Law firm · Türkiye', live: 'https://www.oerusta.av.tr/', stack: 'CMS theme · GSAP' },
  { slug: 'absheron', title: 'Absheron Hotel Group', category: 'Hotel group · Azerbaijan', live: 'https://www.absheronhotelgroup.com/', stack: 'CMS theme · video' },
];
