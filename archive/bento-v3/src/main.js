import Lenis from 'lenis';
import { projects } from './projects.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// ---------------------------------------------------------------------------
// Work tiles — a repeating size rhythm keeps the grid varied: wide/narrow, three-up, narrow/wide, three-up.

const RHYTHM = [7, 5, 4, 4, 4, 5, 7, 4, 4, 4];
const grid = $('.work-grid');
const spans = projects.map((_, i) => RHYTHM[i % RHYTHM.length]);
// Stretch the final tile so the last row never ends with a gap.
const used = spans.reduce((row, s) => (row + s > 12 ? s : row + s) % 12, 0);
if (used) spans[spans.length - 1] += 12 - used;
projects.forEach((p, i) => {
  const span = spans[i];
  const li = document.createElement('li');
  li.className = `tile work t-${span}${span === 4 ? ' small' : ''}`;
  li.innerHTML = `
    <a href="${p.url}" target="_blank" rel="noopener" aria-label="${p.title} — ${p.category}. Opens the live site.">
      <picture>
        <source media="(max-width: 640px)" srcset="/projects/mobile/${p.slug}.jpg" />
        <img src="/projects/desktop/${p.slug}.jpg" alt="" loading="lazy" decoding="async" />
      </picture>
      <span class="work-top">
        <span class="chip">${pad(i + 1)} · ${p.category}</span>
        <span class="arrow" aria-hidden="true">→</span>
      </span>
      <h3>${p.title}</h3>
      <p class="note">${p.note}</p>
      <span class="tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</span>
    </a>`;
  grid.append(li);
});
$('.js-work-count').textContent = projects.length;

// ---------------------------------------------------------------------------
// Smooth scroll + in-page links

const lenis = reduced ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
if (lenis) {
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : target, { offset: id === 'top' ? 0 : -80, duration: 1.4 });
  else target.scrollIntoView();
  history.replaceState(null, '', `#${id}`);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}));

// ---------------------------------------------------------------------------
// Cursor spotlight: every tile near the pointer lights its border from that side.

const tiles = $$('.tile');
if (finePointer && !reduced) {
  let frame = 0;
  let px = 0;
  let py = 0;
  addEventListener('pointermove', (e) => {
    px = e.clientX;
    py = e.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      for (const t of tiles) {
        const r = t.getBoundingClientRect();
        if (r.bottom < -300 || r.top > innerHeight + 300) continue;
        t.style.setProperty('--mx', `${px - r.left}px`);
        t.style.setProperty('--my', `${py - r.top}px`);
      }
    });
  }, { passive: true });
}

// ---------------------------------------------------------------------------
// Reveal tiles as they enter, staggered by position within their row.

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    io.unobserve(e.target);
    if (e.target.classList.contains('stat')) countUp(e.target);
  }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
tiles.forEach((t) => {
  t.classList.add('reveal-tile');
  const r = t.getBoundingClientRect();
  t.style.setProperty('--d', `${Math.min(0.3, (r.left / innerWidth) * 0.3).toFixed(2)}s`);
  io.observe(t);
});

function countUp(tile) {
  const el = $('.js-count', tile);
  if (!el) return;
  const end = Number(el.dataset.to);
  if (reduced) { el.textContent = end; return; }
  const t0 = performance.now();
  const tick = (now) => {
    const k = Math.min((now - t0) / 1200, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(tick);
  };
  el.textContent = '0';
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Baku clock: time, part of day, and a sun that travels round the dashed orbit.

const timeEl = $('.js-time');
const partEl = $('.js-daypart');
const sunEl = $('.sun');
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Baku', hour: '2-digit', minute: '2-digit', hour12: false });
function tickClock() {
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const h = Number(parts.hour) % 24;
  const m = Number(parts.minute);
  timeEl.textContent = `${pad(h)}:${pad(m)}`;
  timeEl.dateTime = `${pad(h)}:${pad(m)}`;
  const part = h < 5 ? 'Night' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Night';
  partEl.textContent = `${part} in Baku`;
  const day = h >= 6 && h < 19;
  sunEl.style.setProperty('--sun', `${((h * 60 + m) / 1440) * 360 + 180}deg`);
  sunEl.style.setProperty('--sun-color', day ? '#ffc46b' : '#dfe3ff');
  sunEl.style.setProperty('--sun-glow', day ? 'rgba(255, 170, 70, 0.55)' : 'rgba(190, 200, 255, 0.45)');
}
tickClock();
setInterval(tickClock, 15000);

// ---------------------------------------------------------------------------
// Copy email

const copyBtn = $('.js-copy');
const copyStatus = $('#copy-status');
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
    copyBtn.textContent = 'Copied ✓';
    copyBtn.dataset.state = 'done';
    copyStatus.textContent = 'Email address copied to clipboard';
  } catch {
    copyBtn.textContent = 'Copy failed — select it above';
    copyStatus.textContent = 'Could not copy. The address is parvanauluxanova@gmail.com';
  }
  setTimeout(() => { copyBtn.textContent = 'Copy email'; delete copyBtn.dataset.state; }, 2200);
});

// ---------------------------------------------------------------------------
// Nav: highlight the section in view.

const navLinks = $$('.nav [data-spy]');
const sections = navLinks.map((a) => document.getElementById(a.dataset.spy));
function spy() {
  let active = -1;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) active = i; });
  navLinks.forEach((a, i) => a.setAttribute('aria-current', String(i === active)));
}
if (lenis) lenis.on('scroll', spy);
else addEventListener('scroll', spy, { passive: true });
spy();
