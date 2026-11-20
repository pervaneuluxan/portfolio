// Kinetic facade: a row of triangular prisms (trivision louvers) rendered with
// raw WebGL2 + instancing. Each prism face samples one cell of a texture atlas;
// which project a face shows is derived from the slat's step value in the shader,
// so the wall can turn forever while only ever holding three faces per slat.

const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;   // unit prism (side = 1, height 1)
layout(location=1) in vec3 aNrm;
layout(location=2) in vec3 aFsv;   // face id, s across face, v up face
layout(location=3) in float aCol;  // instance: column
layout(location=4) in vec3 aState; // instance: step L, extra angle, lift

uniform mat4 uProj, uView, uModel;
uniform vec4 uGrid;   // slat width, gap, height, columns
uniform vec4 uAtlas;  // atlas cols, atlas rows, face count, cell aspect
uniform float uFacadeAspect;

out vec2 vUv;
out vec3 vN;
out float vS, vV, vMid;

const float TAU = 6.28318530718;
const float INRADIUS = 0.28867513; // 1 / (2 * sqrt(3))

void main() {
  float L = aState.x;
  float ang = -L * TAU / 3.0 + aState.y;
  float mid = abs(sin(ang * 1.5)); // 0 when a face is square to camera
  float c = cos(ang), s = sin(ang);

  vec3 p = aPos;
  p.xz *= uGrid.x * (1.0 - 0.1 * mid);
  p = vec3(p.x * c + p.z * s, p.y * uGrid.z, -p.x * s + p.z * c);
  p.z += aState.z - uGrid.x * INRADIUS - mid * uGrid.x * 0.3;
  p.x += (aCol - (uGrid.w - 1.0) * 0.5) * (uGrid.x + uGrid.y);

  vec3 n = vec3(aNrm.x * c + aNrm.z * s, 0.0, -aNrm.x * s + aNrm.z * c);
  vN = mat3(uModel) * n;

  // Face f shows the step k nearest to L with k ≡ f (mod 3).
  float f = aFsv.x;
  float k = f + 3.0 * floor((L - f) / 3.0 + 0.5);
  k = mod(k, uAtlas.z);

  float u = (aCol + aFsv.y) / uGrid.w;
  float v = aFsv.z;
  float ia = uAtlas.w;
  if (uFacadeAspect > ia) v = 1.0 - (1.0 - v) * ia / uFacadeAspect; // crop height, keep the top
  else u = 0.5 + (u - 0.5) * uFacadeAspect / ia;
  u = clamp(u, 0.002, 0.998);
  v = clamp(v, 0.002, 0.998);
  float cx = mod(k, uAtlas.x), cy = floor(k / uAtlas.x);
  vUv = vec2((cx + u) / uAtlas.x, (cy + 1.0 - v) / uAtlas.y);

  vS = aFsv.y;
  vV = aFsv.z;
  vMid = mid;
  gl_Position = uProj * uView * uModel * vec4(p, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
in vec3 vN;
in float vS, vV, vMid;
uniform sampler2D uTex;
uniform float uDim, uTime;
uniform vec3 uBg;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec3 col = texture(uTex, vUv).rgb;
  vec3 n = normalize(vN);
  vec3 ld = normalize(vec3(-0.55, 0.35, 0.75));
  float facing = clamp(n.z, 0.0, 1.0);
  float diff = max(dot(n, ld), 0.0);
  float light = mix(0.1, 1.0, pow(facing, 1.7)) * mix(0.7, 1.0, diff);

  float edge = smoothstep(0.0, 0.1, vS) * smoothstep(1.0, 0.9, vS);
  light *= mix(1.0, mix(0.5, 1.0, edge), vMid);
  vec3 h = normalize(ld + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, h), 0.0), 48.0) * 0.28 * vMid;

  col = col * light + spec;
  col *= mix(0.7, 1.0, smoothstep(0.0, 0.008, vS) * smoothstep(1.0, 0.992, vS)); // seam
  col *= mix(0.5, 1.0, smoothstep(0.0, 0.4, vV)); // floor for the caption
  col = mix(col, uBg, uDim);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.03;
  outColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

function prismGeometry() {
  const pos = [], nrm = [], fsv = [], idx = [];
  const r = 1 / (2 * Math.sqrt(3));
  for (let f = 0; f < 3; f++) {
    const phi = (f * Math.PI * 2) / 3;
    const n = [Math.sin(phi), 0, Math.cos(phi)];
    const t = [Math.cos(phi), 0, -Math.sin(phi)];
    const base = pos.length / 3;
    for (const [s, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      pos.push(n[0] * r + t[0] * (s - 0.5), v - 0.5, n[2] * r + t[2] * (s - 0.5));
      nrm.push(...n);
      fsv.push(f, s, v);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), fsv: new Float32Array(fsv), idx: new Uint16Array(idx) };
}

// Column-major mat4 helpers
const mul = (a, b) => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
};
const translate = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const scale = (s) => new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
const perspective = (fov, aspect, near, far) => {
  const f = 1 / Math.tan(fov / 2);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0]);
};

export class Facade {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('webgl2');
    this.gl = gl;
    this.canvas = canvas;

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    this.prog = prog;
    this.u = {};
    for (const name of ['uProj', 'uView', 'uModel', 'uGrid', 'uAtlas', 'uFacadeAspect', 'uTex', 'uDim', 'uTime', 'uBg'])
      this.u[name] = gl.getUniformLocation(prog, name);

    const geo = prismGeometry();
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const attr = (loc, data, size) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buf;
    };
    attr(0, geo.pos, 3);
    attr(1, geo.nrm, 3);
    attr(2, geo.fsv, 3);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);
    this.indexCount = geo.idx.length;

    this.colBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuf);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(3, 1);
    this.stateBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuf);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(4, 1);
    gl.bindVertexArray(null);

    this.tex = null;
    this.cols = 0;
    this.maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  }

  setColumns(n) {
    const gl = this.gl;
    this.cols = n;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from({ length: n }, (_, i) => i), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(n * 3), gl.DYNAMIC_DRAW);
  }

  setAtlas({ cellW, cellH, cols, rows, count }) {
    const gl = this.gl;
    if (this.tex) gl.deleteTexture(this.tex);
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, cellW * cols, cellH * rows);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.atlas = { cellW, cellH, cols, rows, count };
  }

  uploadCell(i, source) {
    const gl = this.gl;
    const { cellW, cellH, cols } = this.atlas;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, (i % cols) * cellW, Math.floor(i / cols) * cellH, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  // Viewport in CSS px; `rect` is the facade frame in CSS px.
  resize(vw, vh, rect, dpr) {
    this.canvas.width = Math.round(vw * dpr);
    this.canvas.height = Math.round(vh * dpr);
    this.vw = vw;
    this.vh = vh;
    this.rect = rect;
    const fov = (28 * Math.PI) / 180;
    this.dist = vh / 2 / Math.tan(fov / 2); // 1 world unit = 1 CSS px at z = 0
    this.proj = perspective(fov, vw / vh, 10, this.dist * 4);
    this.view = translate(0, 0, -this.dist);
  }

  render({ states, yaw, pitch, shiftX, shiftY, zoom, dim, time, bg }) {
    const gl = this.gl;
    const { rect, cols } = this;
    const gap = Math.max(1, rect.width * 0.001);
    const slatW = (rect.width - gap * (cols - 1)) / cols;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(this.prog);

    const cx = rect.left + rect.width / 2 - this.vw / 2 + shiftX;
    const cy = -(rect.top + rect.height / 2 - this.vh / 2) + shiftY;
    const model = mul(mul(mul(translate(cx, cy, 0), rotY(yaw)), rotX(pitch)), scale(zoom));

    gl.uniformMatrix4fv(this.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(this.u.uView, false, this.view);
    gl.uniformMatrix4fv(this.u.uModel, false, model);
    gl.uniform4f(this.u.uGrid, slatW, gap, rect.height, cols);
    const a = this.atlas;
    gl.uniform4f(this.u.uAtlas, a.cols, a.rows, a.count, a.cellW / a.cellH);
    gl.uniform1f(this.u.uFacadeAspect, rect.width / rect.height);
    gl.uniform1f(this.u.uDim, dim);
    gl.uniform1f(this.u.uTime, time);
    gl.uniform3f(this.u.uBg, bg[0], bg[1], bg[2]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.u.uTex, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, states);
    gl.bindVertexArray(this.vao);
    gl.drawElementsInstanced(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0, cols);
    gl.bindVertexArray(null);
  }
}
