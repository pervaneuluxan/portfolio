// Fills the facade's texture atlas: typeset cards are drawn immediately,
// project screenshots stream in and replace their placeholders.

const INK = '#efe9df';
const BG = '#0c0b0a';
const ACCENT = '#ff5b2e';

export const atlasLayout = (mobile, count) => {
  const cols = 4;
  const rows = Math.ceil(count / cols);
  return mobile ? { cellW: 512, cellH: 1108, cols, rows, count } : { cellW: 1024, cellH: 640, cols, rows, count };
};

// The part of a cell the facade actually shows (mirrors the crop in the vertex shader).
function visibleRect(cellW, cellH, facadeAspect) {
  const ia = cellW / cellH;
  if (facadeAspect > ia) {
    const h = cellH * (ia / facadeAspect);
    return { x: 0, y: 0, w: cellW, h };
  }
  const w = cellW * (facadeAspect / ia);
  return { x: (cellW - w) / 2, y: 0, w, h: cellH };
}

function grid(ctx, r, step) {
  ctx.strokeStyle = 'rgba(239,233,223,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = r.x + step; x < r.x + r.w; x += step) { ctx.moveTo(x + 0.5, r.y); ctx.lineTo(x + 0.5, r.y + r.h); }
  for (let y = r.y + step; y < r.y + r.h; y += step) { ctx.moveTo(r.x, y + 0.5); ctx.lineTo(r.x + r.w, y + 0.5); }
  ctx.stroke();
}

function fitFont(ctx, text, family, maxW, maxSize, style = '') {
  let size = maxSize;
  ctx.font = `${style} ${size}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) size = Math.floor(maxSize * (maxW / w));
  return size;
}

function drawCard(ctx, slug, cell, facadeAspect, person, count) {
  const { cellW, cellH } = cell;
  const r = visibleRect(cellW, cellH, facadeAspect);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, cellW, cellH);
  const pad = Math.round(r.w * 0.05);
  grid(ctx, r, Math.round(r.w / 12));

  const serif = '"Instrument Serif", Georgia, serif';
  const mono = '"Geist Mono", ui-monospace, monospace';
  const monoSize = Math.max(11, Math.round(r.w * 0.016));
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(239,233,223,0.6)';
  ctx.font = `${monoSize}px ${mono}`;

  const left = r.x + pad;
  const right = r.x + r.w - pad;
  const top = r.y + pad;

  if (slug === 'intro') {
    ctx.fillText('INDEX OF FACADES', left, top + monoSize);
    ctx.textAlign = 'right';
    ctx.fillText(`(01 — ${String(count).padStart(2, '0')})`, right, top + monoSize);
    ctx.textAlign = 'left';

    const avail = right - left;
    const base2 = r.y + r.h * 0.8;
    const fitH = (base2 - (top + monoSize * 3)) / 1.84;
    const s1 = fitFont(ctx, person.first, serif, avail, Math.round(r.h * 0.42), 'italic');
    const s2 = fitFont(ctx, person.last, serif, avail, Math.round(r.h * 0.42));
    const size = Math.floor(Math.min(s1, s2, fitH));
    const base1 = base2 - size * 0.92;
    ctx.fillStyle = INK;
    ctx.font = `italic ${size}px ${serif}`;
    ctx.fillText(person.first, left - size * 0.02, base1);
    ctx.font = `${size}px ${serif}`;
    ctx.fillText(person.last, left - size * 0.02, base2);

    ctx.fillStyle = 'rgba(239,233,223,0.6)';
    ctx.font = `${monoSize}px ${mono}`;
    ctx.fillText('FRONT-END DEVELOPER — REACT · TYPESCRIPT · NEXT.JS', left, base2 + monoSize * 2.6);

    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(right - monoSize * 0.5, top + monoSize * 3.4, monoSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillText('NEXT FACADE', left, top + monoSize);
    ctx.textAlign = 'right';
    ctx.fillText('↺ LOOPS TO START', right, top + monoSize);
    ctx.textAlign = 'left';
    const avail = right - left;
    const lines = ['Let’s build', 'what’s next.'];
    const size = Math.min(...lines.map((l) => fitFont(ctx, l, serif, avail, Math.round(r.h * 0.3))));
    ctx.fillStyle = INK;
    const y = r.y + r.h * 0.66;
    ctx.font = `${size}px ${serif}`;
    ctx.fillText(lines[0], left, y - size * 0.9);
    ctx.font = `italic ${size}px ${serif}`;
    ctx.fillText(lines[1], left, y);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(left, y + size * 0.22, Math.min(avail, size * 2.2), Math.max(2, size * 0.025));
  }
}

function drawPlaceholder(ctx, cell, face, i) {
  ctx.fillStyle = '#151311';
  ctx.fillRect(0, 0, cell.cellW, cell.cellH);
  ctx.fillStyle = 'rgba(239,233,223,0.25)';
  ctx.font = `${Math.round(cell.cellW * 0.03)}px "Geist Mono", monospace`;
  ctx.fillText(`${String(i).padStart(2, '0')} — ${face.title.toUpperCase()}`, cell.cellW * 0.05, cell.cellW * 0.08);
}

function drawCover(ctx, img, cell) {
  const { cellW: w, cellH: h } = cell;
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.drawImage(img, (w - dw) / 2, 0, dw, dh); // anchor to the top of the page
}

export function buildAtlas({ facade, faces, person, mobile, facadeAspect, onCell }) {
  let cell = atlasLayout(mobile, faces.length);
  const fit = facade.maxTexture / (cell.cellW * cell.cols);
  if (fit < 1) cell = { ...cell, cellW: Math.floor(cell.cellW * fit), cellH: Math.floor(cell.cellH * fit) };
  facade.setAtlas(cell);
  const canvas = document.createElement('canvas');
  canvas.width = cell.cellW;
  canvas.height = cell.cellH;
  const ctx = canvas.getContext('2d');
  const projectCount = faces.filter((f) => f.kind === 'project').length;

  const redrawCards = (aspect) => {
    faces.forEach((face, i) => {
      if (face.kind !== 'card') return;
      drawCard(ctx, face.slug, cell, aspect, person, projectCount);
      facade.uploadCell(i, canvas);
    });
  };
  redrawCards(facadeAspect);
  faces.forEach((face, i) => {
    if (face.kind !== 'project') return;
    drawPlaceholder(ctx, cell, face, i);
    facade.uploadCell(i, canvas);
  });

  const loaded = Promise.all(faces.map((face, i) => {
    if (face.kind !== 'project') return null;
    const img = new Image();
    img.decoding = 'async';
    img.src = imageUrl(face, mobile);
    return img.decode().then(() => {
      ctx.clearRect(0, 0, cell.cellW, cell.cellH);
      drawCover(ctx, img, cell);
      facade.uploadCell(i, canvas);
      onCell?.(i);
    }).catch(() => {});
  }));
  return { redrawCards, loaded };
}

export const imageUrl = (face, mobile) => `${import.meta.env.BASE_URL}projects/${mobile ? 'mobile' : 'desktop'}/${face.slug}.jpg`;
