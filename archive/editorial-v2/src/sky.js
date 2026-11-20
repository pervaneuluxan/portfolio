// Procedural sky for the hero: drifting cloud banks, twinkling stars, the odd
// shooting star. Cloud banks drift slightly with the pointer for depth.

const PALETTE = {
  night: {
    top: '#07070d', mid: '#15121c', bottom: '#13100e',
    cloud: [104, 94, 130], cloudA: 0.62, glow: 'rgba(196, 180, 255, 0.10)', star: 1,
  },
  day: {
    top: '#9fb4cc', mid: '#d9dde0', bottom: '#f2ece3',
    cloud: [255, 252, 246], cloudA: 0.78, glow: 'rgba(255, 214, 160, 0.35)', star: 0,
  },
};

const rand = (a, b) => a + Math.random() * (b - a);
const mix = (a, b, t) => a + (b - a) * t;
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, t) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  return `rgb(${x.map((v, i) => Math.round(mix(v, y[i], t))).join(',')})`;
};

// One soft cloud bank, pre-rendered once (white), tinted at draw time via alpha + composite.
function makeCloud(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const puffs = Math.round(w / 26);
  for (let i = 0; i < puffs; i++) {
    const x = rand(w * 0.08, w * 0.92);
    const y = h * 0.62 - Math.sin((x / w) * Math.PI) * h * rand(0.12, 0.34);
    const r = rand(h * 0.16, h * 0.42) * Math.sin((x / w) * Math.PI + 0.2);
    const grad = g.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.22)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, Math.max(1, r), 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

function tint(src, rgb) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = `rgb(${rgb.join(',')})`;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export class Sky {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dayness = document.documentElement.dataset.theme === 'day' ? 1 : 0;
    this.dayTarget = this.dayness;
    this.zoom = 1;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0, on: false };
    this.shooting = null;
    this.nextShot = 2;
    this.visible = true;
    this.running = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return; // not laid out yet (e.g. hidden tab); resize runs again later
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);

    const count = Math.round((w * h) / 1700);
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.pow(Math.random(), 1.4) * 0.92,
      r: Math.random() < 0.06 ? rand(1.1, 1.8) : rand(0.3, 0.9),
      p: rand(0, Math.PI * 2), s: rand(0.6, 2.2),
    }));
    // a few bright four-point stars
    this.flares = Array.from({ length: Math.max(3, Math.round(w / 360)) }, () => ({
      x: rand(0.05, 0.95), y: rand(0.05, 0.6), r: rand(5, 10), p: rand(0, 6),
    }));
    const bankW = Math.max(600, w * 0.9);
    this.clouds = Array.from({ length: 8 }, (_, i) => {
      const base = makeCloud(Math.round(bankW * rand(0.6, 1.1)), Math.round(h * rand(0.28, 0.45)));
      return {
      night: tint(base, PALETTE.night.cloud), day: tint(base, PALETTE.day.cloud), w: base.width, h: base.height,
      x: rand(-0.4, 1), y: 0.3 + i * 0.09 + rand(-0.05, 0.05), v: rand(0.004, 0.012) * (i % 2 ? 1 : -1),
      depth: 0.5 + i * 0.12,
      };
    });

    if (!this.pointer.on) this.centerPointer();
    this.draw(0);
  }

  centerPointer() {
    this.pointer.tx = this.w / 2;
    this.pointer.ty = this.h / 2;
    if (!this.pointer.x) { this.pointer.x = this.pointer.tx; this.pointer.y = this.pointer.ty; }
  }

  setTheme(theme) { this.dayTarget = theme === 'day' ? 1 : 0; this.start(); }
  setZoom(z) { this.zoom = z; if (!this.running) this.draw(this.t || 0); }
  setVisible(v) { this.visible = v; if (v) this.start(); }

  pointerMove(x, y) { this.pointer.on = true; this.pointer.tx = x; this.pointer.ty = y; this.start(); }
  pointerLeave() { this.pointer.on = false; this.centerPointer(); this.start(); }

  start() {
    if (this.running || !this.visible) return;
    this.running = true;
    let last = performance.now();
    const loop = (now) => {
      if (!this.visible) { this.running = false; return; }
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      this.update(dt);
      this.draw(now / 1000);
      if (this.reduced && Math.abs(this.dayness - this.dayTarget) < 0.001 && Math.hypot(this.pointer.x - this.pointer.tx, this.pointer.y - this.pointer.ty) < 0.5) {
        this.running = false;
        return;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    if (!this.clouds) return;
    this.dayness += (this.dayTarget - this.dayness) * (1 - Math.exp(-3 * dt));
    if (Math.abs(this.dayness - this.dayTarget) < 0.001) this.dayness = this.dayTarget;
    const p = this.pointer;
    const k = this.reduced ? 1 : 1 - Math.exp(-10 * dt);
    p.x += (p.tx - p.x) * k;
    p.y += (p.ty - p.y) * k;
    if (this.reduced) return;
    for (const c of this.clouds) {
      c.x += c.v * dt;
      if (c.x > 1.2) c.x = -1;
      if (c.x < -1.2) c.x = 1;
    }
    this.nextShot -= dt;
    if (!this.shooting && this.nextShot < 0 && this.dayness < 0.5) {
      this.shooting = { x: rand(0.4, 0.95), y: rand(0.04, 0.25), t: 0, len: rand(70, 140) };
      this.nextShot = rand(4, 9);
    }
    if (this.shooting) {
      this.shooting.t += dt / 0.9;
      if (this.shooting.t > 1) this.shooting = null;
    }
  }

  paint(ctx, t) {
    const cx = this.w / 2;
    const cy = this.h / 2;
    const { w, h } = this;
    const d = this.dayness;
    const N = PALETTE.night;
    const D = PALETTE.day;
    const z = this.zoom;

    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, mixHex(N.top, D.top, d));
    grad.addColorStop(0.55, mixHex(N.mid, D.mid, d));
    grad.addColorStop(1, mixHex(N.bottom, D.bottom, d));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.translate(cx, cy);
    ctx.scale(z, z);
    ctx.translate(-cx, -cy);

    // sun / moon glow, top right
    const gx = w * 0.82;
    const gy = h * 0.16;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.5);
    glow.addColorStop(0, d > 0.5 ? D.glow : N.glow);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // stars
    const starA = 1 - d;
    if (starA > 0.01) {
      ctx.fillStyle = '#fff';
      for (const s of this.stars) {
        const tw = this.reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.s + s.p);
        ctx.globalAlpha = starA * tw * (s.r > 1 ? 1 : 0.75);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const f of this.flares) {
        const tw = this.reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.3 + f.p);
        ctx.globalAlpha = starA * tw;
        const x = f.x * w;
        const y = f.y * h;
        const r = f.r * tw;
        const g2 = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
        g2.addColorStop(0, 'rgba(255,255,255,0.9)');
        g2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y);
        ctx.fill();
      }
      const sh = this.shooting;
      if (sh) {
        const dx = -0.8;
        const dy = 0.6;
        const hx = sh.x * w + dx * sh.len * 2 * sh.t;
        const hy = sh.y * h + dy * sh.len * 2 * sh.t;
        const lg = ctx.createLinearGradient(hx, hy, hx - dx * sh.len, hy - dy * sh.len);
        lg.addColorStop(0, 'rgba(255,255,255,0.95)');
        lg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = starA * Math.sin(sh.t * Math.PI);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx - dx * sh.len, hy - dy * sh.len);
        ctx.stroke();
      }
    }

    // clouds: crossfade the night- and day-tinted banks
    for (const c of this.clouds) {
      const px = c.x * w + (this.pointer.x - w / 2) * 0.015 * c.depth;
      const py = c.y * h - c.h / 2;
      if (d < 0.999) { ctx.globalAlpha = N.cloudA * (1 - d); ctx.drawImage(c.night, px, py); }
      if (d > 0.001) { ctx.globalAlpha = D.cloudA * d; ctx.drawImage(c.day, px, py); }
    }
    ctx.restore();
  }

  draw(t) {
    if (!this.clouds) return;
    this.t = t;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.paint(ctx, t);
  }
}
