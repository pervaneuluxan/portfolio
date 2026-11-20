import { Facade } from './facade.js';
import { buildAtlas, imageUrl } from './atlas.js';
import { faces, person } from './projects.js';

const $ = (s, r = document) => r.querySelector(s);
const COUNT = faces.length;
const PROJECTS = faces.map((f, i) => ({ ...f, i })).filter((f) => f.kind === 'project');
const TOTAL = PROJECTS.length;
const TAU = Math.PI * 2;
const BG = [12 / 255, 11 / 255, 10 / 255];

const mod = (n, m) => ((n % m) + m) % m;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const pad = (n) => String(n).padStart(2, '0');
const projectNumber = (i) => PROJECTS.findIndex((p) => p.i === i) + 1;

const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
const fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
let reduced = reducedMQ.matches;
reducedMQ.addEventListener('change', (e) => { reduced = e.matches; });

const el = {
  stage: $('.stage'),
  frame: $('.frame'),
  canvas: $('.gl'),
  fallback: $('.fallback'),
  hit: $('.hit'),
  title: $('.title'),
  metaLine: $('.meta-line'),
  metaActions: $('.meta-actions'),
  counterNow: $('.counter-now'),
  counterAll: $('.counter-all'),
  ticks: $('.ticks'),
  announcer: $('#announcer'),
  cursor: $('.cursor'),
  cursorLabel: $('.cursor-label'),
  index: $('#index'),
  indexList: $('#index-list'),
  detail: $('#detail'),
  about: $('#about'),
};

// ---------------------------------------------------------------------------
// State

const st = {
  S: 0, target: 0,              // continuous step along the facade
  yaw: 0, pitch: 0, mx: 0, my: 0,
  shiftX: 0, shiftY: 0, zoom: 1, dim: 0,
  goal: { shiftX: 0, shiftY: 0, zoom: 1, dim: 0, yaw: 0 },
  idx: -1,
};
let cols = 0;
let extra, vel, lift, liftT, hold, states;
let facade = null;
let atlas = null;
let rect = { left: 0, top: 0, width: 1, height: 1 };
let mobile = null;

function setCols(n) {
  cols = n;
  extra = new Float32Array(n);
  vel = new Float32Array(n);
  lift = new Float32Array(n);
  liftT = new Float32Array(n);
  hold = new Float32Array(n);
  states = new Float32Array(n * 3);
  facade?.setColumns(n);
}

// Blinds start edge-on (dark), then open in a wave.
function entrance() {
  for (let i = 0; i < cols; i++) {
    extra[i] = reduced ? 0 : -TAU / 4;
    vel[i] = 0;
    hold[i] = reduced ? 0 : 0.35 + (i / cols) * 0.7;
  }
}

// ---------------------------------------------------------------------------
// Layout

function layout() {
  const vw = innerWidth;
  const vh = innerHeight;
  const fr = el.frame.getBoundingClientRect();
  rect = { left: fr.left, top: fr.top, width: fr.width, height: fr.height };
  const wasMobile = mobile;
  mobile = vw < 761 || vw / vh < 0.8;
  const nextCols = mobile ? 9 : Math.round(clamp(vw / 72, 14, 24));
  if (nextCols !== cols) setCols(nextCols);
  if (facade) {
    facade.resize(vw, vh, rect, Math.min(devicePixelRatio || 1, mobile ? 2 : 1.75));
    const aspect = rect.width / rect.height;
    if (wasMobile !== mobile || !atlas) {
      atlas = buildAtlas({ facade, faces, person, mobile, facadeAspect: aspect, onCell: kick });
    } else {
      atlas.redrawCards(aspect);
    }
  } else {
    syncFallback();
  }
  fitTitle();
  applyMode();
  kick();
}

// ---------------------------------------------------------------------------
// Simulation + render loop

const K = 90;
const C = 2 * Math.sqrt(K) * 0.42;

function update(dt) {
  let motion = 0;
  const prevS = st.S;
  st.S = reduced ? st.target : damp(st.S, st.target, 6.5, dt);
  if (Math.abs(st.S - st.target) < 1e-4) st.S = st.target;
  motion += Math.abs(st.S - prevS);

  const base = Math.floor(st.S);
  const f = st.S - base;
  const spread = mobile ? 0.8 : 1.25;
  for (let i = 0; i < cols; i++) {
    const order = cols > 1 ? i / (cols - 1) : 0;
    const local = clamp(f * (1 + spread) - spread * order, 0, 1);
    const L = base + easeInOut(local);

    if (hold[i] > 0) hold[i] -= dt;
    else {
      const a = -K * extra[i] - C * vel[i];
      vel[i] += a * dt;
      extra[i] += vel[i] * dt;
      if (Math.abs(extra[i]) < 1e-4 && Math.abs(vel[i]) < 1e-3) { extra[i] = 0; vel[i] = 0; }
    }
    const pl = lift[i];
    lift[i] = damp(lift[i], liftT[i], 9, dt);
    motion += Math.abs(vel[i]) + Math.abs(lift[i] - pl) + (hold[i] > 0 ? 1 : 0) + Math.abs(extra[i]);

    states[i * 3] = L;
    states[i * 3 + 1] = extra[i];
    states[i * 3 + 2] = lift[i];
  }

  const g = st.goal;
  const parallax = reduced || !fineMQ.matches ? 0 : 1;
  const k = 4.5;
  const sum = () => st.yaw + st.pitch + (st.shiftX + st.shiftY) * 0.01 + st.zoom + st.dim;
  const before = sum();
  st.yaw = damp(st.yaw, g.yaw + st.mx * 0.09 * parallax, k, dt);
  st.pitch = damp(st.pitch, -st.my * 0.06 * parallax, k, dt);
  st.shiftX = damp(st.shiftX, g.shiftX, k, dt);
  st.shiftY = damp(st.shiftY, g.shiftY, k, dt);
  st.zoom = damp(st.zoom, g.zoom, k, dt);
  st.dim = damp(st.dim, g.dim, k, dt);
  motion += Math.abs(sum() - before) * 10;

  // The caption follows the destination so the type turns together with the wall.
  const idx = mod(Math.round(st.target), COUNT);
  if (idx !== st.idx) {
    const dir = st.idx === -1 ? 1 : Math.sign(st.target - st.S) || 1;
    st.idx = idx;
    showFace(idx, dir);
  }
  return motion;
}

let raf = 0;
let last = 0;
let still = 0;
const t0 = performance.now();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  const motion = update(dt);
  if (facade) {
    facade.render({
      states, yaw: st.yaw, pitch: st.pitch, shiftX: st.shiftX, shiftY: st.shiftY,
      zoom: st.zoom, dim: st.dim, time: (now - t0) / 1000, bg: BG,
    });
  }
  still = motion < 1e-4 ? still + 1 : 0;
  if (still > 20 || document.hidden) { raf = 0; return; }
  raf = requestAnimationFrame(frame);
}

function kick() {
  still = 0;
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

// ---------------------------------------------------------------------------
// Navigation

function goTo(i) {
  const cur = Math.round(st.target);
  let d = mod(i - cur, COUNT);
  if (d > COUNT / 2) d -= COUNT;
  st.target = cur + d;
  kick();
}
const step = (n) => { st.target = Math.round(st.target) + n; kick(); };

// ---------------------------------------------------------------------------
// Caption

function splitInto(layer, text) {
  for (const word of text.split(/(\s+)/)) {
    for (const c of word) {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      layer.append(s);
    }
  }
}

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_EXIT = 'cubic-bezier(0.5, 0, 0.2, 1)';

function setTitle(text, dir) {
  const host = el.title;
  host.querySelectorAll('.sr-only').forEach((n) => n.remove());
  const label = document.createElement('span');
  label.className = 'sr-only';
  label.textContent = text;
  host.prepend(label);

  const old = [...host.querySelectorAll('.layer')];
  const layer = document.createElement('span');
  layer.className = 'layer';
  layer.setAttribute('aria-hidden', 'true');
  splitInto(layer, text);
  host.append(layer);
  fitTitle();

  if (reduced) { old.forEach((l) => l.remove()); return; }
  const chars = [...layer.children];
  chars.forEach((c, i) => {
    c.animate(
      [{ transform: `translateY(${dir * 70}%) rotateX(${-dir * 85}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 1000, delay: 220 + i * 30, easing: EASE_OUT, fill: 'backwards' },
    );
  });
  old.forEach((l) => {
    [...l.children].forEach((c, i) => {
      c.animate(
        [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-dir * 70}%) rotateX(${dir * 85}deg)`, opacity: 0 }],
        { duration: 380, delay: i * 14, easing: EASE_EXIT, fill: 'forwards' },
      );
    });
    setTimeout(() => l.remove(), 380 + l.children.length * 14 + 50);
  });
}

function fitTitle() {
  const host = el.title;
  const layer = host.querySelector('.layer:last-of-type');
  host.style.fontSize = '';
  if (!layer) return;
  const avail = host.clientWidth;
  const w = layer.scrollWidth;
  if (w > avail) host.style.fontSize = `${parseFloat(getComputedStyle(host).fontSize) * (avail / w) * 0.98}px`;
}

function button(label, onClick, cls = 'btn') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.innerHTML = label;
  b.addEventListener('click', onClick);
  return b;
}
function link(label, href, cls = 'btn') {
  const a = document.createElement('a');
  a.className = cls;
  a.href = href;
  a.innerHTML = label;
  if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
  return a;
}

let announceTimer;
function showFace(i, dir) {
  const face = faces[i];
  const n = projectNumber(i);
  el.metaLine.replaceChildren();
  el.metaActions.replaceChildren();

  if (face.kind === 'project') {
    setTitle(face.title, dir);
    el.counterNow.textContent = pad(n);
    el.metaLine.innerHTML = `<b>${face.category}</b><span>${face.place}</span>`;
    el.metaActions.append(
      button('View project', () => openDetail(i), 'btn primary'),
      link('Visit site <span aria-hidden="true">↗</span>', face.url),
    );
  } else if (face.slug === 'intro') {
    setTitle('Selected work', dir);
    el.counterNow.textContent = '00';
    el.metaLine.innerHTML = `<b>${TOTAL} projects</b><span>2021 — 2026</span><span>React · Next.js · WebGL</span>`;
    el.metaActions.append(
      button('Start <span aria-hidden="true">→</span>', () => step(1), 'btn primary'),
      button('Index', () => openSheet(el.index)),
    );
  } else {
    setTitle('Say hello', dir);
    el.counterNow.textContent = '∞';
    el.metaLine.innerHTML = `<b>Let’s talk</b><span>${person.city}</span>`;
    el.metaActions.append(
      link('Email me', `mailto:${person.email}`, 'btn primary'),
      link('GitHub <span aria-hidden="true">↗</span>', person.github),
      link('LinkedIn <span aria-hidden="true">↗</span>', person.linkedin),
    );
  }

  el.ticks.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
  el.indexList.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.i) === i)));
  el.hit.setAttribute('aria-label', face.kind === 'project' ? `Open ${face.title}` : face.slug === 'intro' ? 'Start the tour' : 'About me and contact');
  if (el.detail.open && face.kind === 'project') fillDetail(i);
  syncFallback();

  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    el.announcer.textContent = face.kind === 'project' ? `${face.title}, project ${n} of ${TOTAL}. ${face.category}.` : face.slug === 'intro' ? 'Start' : 'Contact';
  }, 350);
}

function syncFallback() {
  if (facade) return;
  const face = faces[mod(Math.round(st.target), COUNT)];
  el.fallback.hidden = face.kind !== 'project';
  if (face.kind === 'project') el.fallback.src = imageUrl(face, innerWidth < 761);
}

// ---------------------------------------------------------------------------
// Sheets

const sheets = [el.index, el.detail, el.about];
let lastFocus = null;

function applyMode() {
  const g = st.goal;
  const open = sheets.find((d) => d.open && d.classList.contains('in'));
  Object.assign(g, { shiftX: 0, shiftY: 0, zoom: 1, dim: 0, yaw: 0 });
  if (!open) { kick(); return; }
  if (mobile) {
    Object.assign(g, { zoom: 0.92, dim: 0.6 });
  } else if (open === el.index) {
    Object.assign(g, { shiftX: Math.min(620, innerWidth * 0.45) * 0.55, zoom: 0.8, yaw: -0.1 });
  } else {
    Object.assign(g, { shiftX: -Math.min(560, innerWidth * 0.45) * 0.55, zoom: 0.8, yaw: 0.12, dim: open === el.about ? 0.45 : 0 });
  }
  kick();
}

function openSheet(d) {
  if (!d.open) lastFocus = document.activeElement;
  sheets.forEach((s) => { if (s !== d && s.open) { s.classList.remove('in'); s.close(); } });
  if (!d.open) d.showModal();
  el.cursor.classList.remove('big');
  requestAnimationFrame(() => { d.classList.add('in'); applyMode(); });
  document.body.classList.add('sheet-open');
}

function closeSheet(d) {
  if (!d.open) return;
  d.classList.remove('in');
  applyMode();
  document.body.classList.remove('sheet-open');
  setTimeout(() => {
    if (!d.classList.contains('in')) {
      d.close();
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
  }, reduced ? 0 : 520);
}

for (const d of sheets) {
  d.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(d); });
  d.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeSheet(d);
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSheet(d);
    }
  });
}

function fillDetail(i) {
  const p = faces[i];
  const n = projectNumber(i);
  $('.detail-num', el.detail).textContent = `Project ${pad(n)} / ${pad(TOTAL)}`;
  $('.detail-title', el.detail).textContent = p.title;
  $('.detail-cat', el.detail).textContent = `${p.category} — ${p.place}`;
  $('.detail-note', el.detail).textContent = p.note;
  $('.detail-tags', el.detail).replaceChildren(...p.tags.map((t) => Object.assign(document.createElement('li'), { textContent: t })));
  $('.detail-actions a', el.detail).href = p.url;
}

function openDetail(i) {
  goTo(i);
  fillDetail(i);
  openSheet(el.detail);
}

$('[data-step]', el.detail).addEventListener('click', () => {
  // skip the typeset cards while browsing projects
  let i = mod(Math.round(st.target) + 1, COUNT);
  while (faces[i].kind !== 'project') i = mod(i + 1, COUNT);
  goTo(i);
  fillDetail(i);
});

// ---------------------------------------------------------------------------
// Static UI

el.counterAll.textContent = pad(TOTAL);

faces.forEach((f, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', f.kind === 'project' ? f.title : f.slug === 'intro' ? 'Start' : 'Contact');
  b.addEventListener('click', () => goTo(i));
  li.append(b);
  el.ticks.append(li);
});

PROJECTS.forEach((p, k) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.i = p.i;
  b.innerHTML = `<span class="n">${pad(k + 1)}</span><span class="t">${p.title}</span><span class="c">${p.category}</span>`;
  const preview = () => goTo(p.i);
  b.addEventListener('pointerenter', preview);
  b.addEventListener('focus', preview);
  b.addEventListener('click', () => { fillDetail(p.i); openSheet(el.detail); goTo(p.i); });
  li.append(b);
  el.indexList.append(li);
});

document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => openSheet($(`#${b.dataset.open}`))));
document.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.goto))));

// ---------------------------------------------------------------------------
// Input

const anySheet = () => sheets.some((d) => d.open);

function activate() {
  if (st.idx < 0) return;
  const face = faces[st.idx];
  if (face.kind === 'project') openDetail(st.idx);
  else if (face.slug === 'intro') step(1);
  else openSheet(el.about);
}

// One gesture turns the facade one step: the wheel previews the turn live,
// commits past a threshold, then stays locked until the gesture (and trackpad inertia) ends.
let wheelAnchor = null;
let wheelLocked = false;
let wheelTimer = 0;
addEventListener('wheel', (e) => {
  if (anySheet()) return;
  e.preventDefault();
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    if (!wheelLocked && wheelAnchor !== null) {
      const delta = st.target - wheelAnchor;
      st.target = Math.abs(delta) < 0.06 ? wheelAnchor : wheelAnchor + Math.sign(delta);
    }
    wheelAnchor = null;
    wheelLocked = false;
    kick();
  }, 180);
  if (wheelLocked) return;
  if (wheelAnchor === null) wheelAnchor = Math.round(st.target);
  let d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (e.deltaMode === 1) d *= 16;
  st.target += clamp(d, -120, 120) * 0.0022;
  const delta = st.target - wheelAnchor;
  if (Math.abs(delta) > 0.22) {
    st.target = wheelAnchor + Math.sign(delta);
    wheelLocked = true;
  }
  kick();
}, { passive: false });

let drag = null;
let lastPointer = null;

el.stage.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, anchor: Math.round(st.target), moved: false, t: performance.now(), d: 0, id: e.pointerId };
});

el.stage.addEventListener('pointermove', (e) => {
  const inside = e.clientX >= rect.left && e.clientX <= rect.left + rect.width && e.clientY >= rect.top && e.clientY <= rect.top + rect.height;
  if (e.pointerType === 'mouse') {
    st.mx = e.clientX / innerWidth - 0.5;
    st.my = e.clientY / innerHeight - 0.5;
    // Brush: pointer speed nudges nearby slats, like a hand across blinds.
    if (lastPointer && !drag && !reduced) {
      const dx = e.clientX - lastPointer.x;
      const pos = ((e.clientX - rect.left) / rect.width) * cols;
      for (let i = 0; i < cols; i++) {
        const dist = i + 0.5 - pos;
        const fall = inside ? Math.exp(-(dist * dist) / 1.8) : 0;
        vel[i] = clamp(vel[i] + dx * 0.09 * fall, -14, 14);
        liftT[i] = fall * Math.min(10, rect.width * 0.007);
      }
    }
    lastPointer = { x: e.clientX, y: e.clientY };
    kick();
  }
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 8) return;
  if (!drag.moved) el.stage.setPointerCapture(drag.id);
  drag.moved = true;
  const horizontal = Math.abs(dx) > Math.abs(dy);
  drag.d = horizontal ? -dx / (rect.width * 0.55) : -dy / (rect.height * 0.6);
  st.target = drag.anchor + clamp(drag.d, -1.4, 1.4);
  kick();
});

const endDrag = () => {
  if (!drag) return;
  if (drag.moved) {
    const quick = performance.now() - drag.t < 280;
    const d = drag.d;
    st.target = Math.abs(d) > (quick ? 0.04 : 0.18) ? drag.anchor + Math.sign(d) : drag.anchor;
    el.hit.dataset.suppress = '1';
    setTimeout(() => delete el.hit.dataset.suppress, 0);
    kick();
  }
  drag = null;
};
el.stage.addEventListener('pointerup', endDrag);
el.stage.addEventListener('pointercancel', endDrag);
el.stage.addEventListener('pointerleave', () => {
  liftT.fill(0);
  lastPointer = null;
  kick();
});

el.hit.addEventListener('click', () => {
  if (el.hit.dataset.suppress) return;
  activate();
});

addEventListener('keydown', (e) => {
  if (anySheet() || e.metaKey || e.ctrlKey || e.altKey) return;
  const map = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 };
  if (e.key in map) { e.preventDefault(); step(map[e.key]); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  else if (e.key === 'End') { e.preventDefault(); goTo(COUNT - 1); }
});

// Cursor
if (fineMQ.matches) {
  addEventListener('pointermove', (e) => {
    el.cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    const overHit = e.target === el.hit && !drag && st.idx >= 0;
    el.cursor.classList.toggle('big', overHit);
    if (overHit) {
      const face = faces[st.idx];
      el.cursorLabel.textContent = face.kind === 'project' ? 'Open' : face.slug === 'intro' ? 'Start' : 'Hello';
    }
  });
  document.addEventListener('pointerleave', () => el.cursor.classList.add('hide'));
  document.addEventListener('pointerenter', () => el.cursor.classList.remove('hide'));
}

let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

// ---------------------------------------------------------------------------
// Boot

async function boot() {
  try {
    facade = new Facade(el.canvas);
  } catch {
    facade = null;
    el.canvas.hidden = true;
  }
  const fonts = Promise.all([
    document.fonts.load('italic 100px "Instrument Serif"'),
    document.fonts.load('100px "Instrument Serif"'),
    document.fonts.load('20px "Geist Mono"'),
  ]);
  await Promise.race([fonts, new Promise((r) => setTimeout(r, 2500))]);
  layout();
  entrance();
  requestAnimationFrame(() => document.body.classList.add('ready'));
  kick();
}

boot();
