import Lenis from 'lenis';
import { Sky } from './sky.js';
import { projects } from './projects.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const pad = (n) => String(n).padStart(2, '0');

const root = document.documentElement;
root.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none)').matches;

// ---------------------------------------------------------------------------
// Work cards

const cards = $('.cards');
projects.forEach((p, i) => {
  const li = document.createElement('li');
  li.className = 'card';
  const [first, ...rest] = p.title.split(' ');
  li.innerHTML = `
    <a href="${p.url}" target="_blank" rel="noopener" aria-label="${p.title} — ${p.category}, opens the live site">
      <div class="card-frame">
        <picture>
          <source media="(max-width: 600px)" srcset="/projects/mobile/${p.slug}.jpg" />
          <img src="/projects/desktop/${p.slug}.jpg" alt="" loading="lazy" decoding="async" />
        </picture>
        <p class="card-tag label"><span>A.${pad(i + 1)} // ${p.category}</span><span>${p.place}</span></p>
        <span class="card-open" aria-hidden="true">↗</span>
      </div>
      <div class="card-meta">
        <span class="label">${pad(i + 1)}</span>
        <h3>${first}${rest.length ? ` <em>${rest.join(' ')}</em>` : ''}</h3>
        <p>${p.note}</p>
        <span class="tags label">${p.tags.join(' · ')}</span>
      </div>
    </a>`;
  cards.append(li);
});

// ---------------------------------------------------------------------------
// Smooth scroll

const lenis = reduced ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
if (lenis) {
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href').slice(1);
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (target === 0) window.scrollTo(0, 0);
  else target.scrollIntoView();
  history.replaceState(null, '', `#${id}`);
  // move focus for keyboard and screen-reader users
  const focusEl = target === 0 ? $('#top') : target;
  focusEl.setAttribute('tabindex', '-1');
  focusEl.focus({ preventScroll: true });
}));

// ---------------------------------------------------------------------------
// Sky

const hero = $('.hero');
const intro = $('.hero-intro');
const proof = $('.hero-proof');
const sky = new Sky($('.sky'));
sky.start();

if (!touch) {
  $('.hero-sticky').addEventListener('pointermove', (e) => sky.pointerMove(e.clientX, e.clientY));
  $('.hero-sticky').addEventListener('pointerleave', () => sky.pointerLeave());
}

// ---------------------------------------------------------------------------
// Theme

const themeBtn = $('.theme');
const metaTheme = $('meta[name="theme-color"]');
function applyTheme(theme, persist) {
  root.dataset.theme = theme;
  const day = theme === 'day';
  themeBtn.setAttribute('aria-pressed', String(day));
  themeBtn.setAttribute('aria-label', day ? 'Switch to night mode' : 'Switch to day mode');
  metaTheme.content = day ? '#f2ece3' : '#13100e';
  sky.setTheme(theme);
  if (persist) try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
}
applyTheme(root.dataset.theme || 'night', false);
themeBtn.addEventListener('click', () => applyTheme(root.dataset.theme === 'day' ? 'night' : 'day', true));

// ---------------------------------------------------------------------------
// Reveals

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
$$('.display, .reveal, .card, .years-name').forEach((el) => io.observe(el));

requestAnimationFrame(() => {
  $('.hero-name').classList.add('in');
  $$('.hero-intro .reveal-soft').forEach((el) => el.classList.add('in'));
});

// Count-up for numeric stats once the proof panel appears.
let counted = false;
function countUp() {
  if (counted) return;
  counted = true;
  $$('.stat[data-count]').forEach((el) => {
    if (el.dataset.word) return;
    const end = Number(el.dataset.count);
    if (reduced) { el.textContent = end; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const t = clamp((now - t0) / 1100, 0, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ---------------------------------------------------------------------------
// Scroll-linked: hero sequence, card parallax, section rail

const railLinks = $$('.rail a');
const sections = railLinks.map((a) => document.getElementById(a.dataset.spy));
const cardEls = $$('.card');

function onScroll() {
  const y = window.scrollY;
  const vh = innerHeight;

  // Hero: intro hands over to the proof panel while the sky slowly pushes in.
  const span = hero.offsetHeight - vh;
  const p = clamp(y / span, 0, 1);
  const a = 1 - smooth(0.18, 0.4, p);
  const b = smooth(0.42, 0.62, p);
  intro.style.opacity = a;
  intro.style.transform = `translateY(calc(-50% - ${(1 - a) * 60}px))`;
  intro.style.visibility = a < 0.01 ? 'hidden' : '';
  proof.style.opacity = b;
  proof.style.transform = `translateY(calc(-50% + ${(1 - b) * 60}px))`;
  proof.style.visibility = b < 0.01 ? 'hidden' : 'visible';
  if (innerWidth <= 600) {
    intro.style.transform = `translateY(${-(1 - a) * 60}px)`;
    proof.style.transform = `translateY(${(1 - b) * 60}px)`;
  }
  if (b > 0.5) countUp();
  sky.setZoom(1 + p * 0.22);
  sky.setVisible(y < hero.offsetHeight - vh * 0.4);

  // Parallax inside each visible card frame.
  if (!reduced) {
    for (const c of cardEls) {
      const r = c.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const mid = r.top + r.height / 2 - vh / 2;
      c.style.setProperty('--py', `${(-mid * 0.06).toFixed(1)}px`);
    }
  }

  // Section rail
  let active = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * 0.45) active = i; });
  railLinks.forEach((l, i) => l.setAttribute('aria-current', String(i === active)));
}

if (lenis) lenis.on('scroll', onScroll);
else addEventListener('scroll', onScroll, { passive: true });

let resizeTimer;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { sky.resize(); onScroll(); }, 150);
});
onScroll();
