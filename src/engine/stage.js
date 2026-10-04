// The persistent isometric scene. Objects have stable ids and tween between
// keyframes; a step plays a timeline of beats (keyframes) that can be
// replayed. Under prefers-reduced-motion, a step cross-fades straight to its
// final keyframe instead.

import { project } from './iso.js';
import { TYPES, EXTENT, el } from './shapes.js';

const NS = 'http://www.w3.org/2000/svg';
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// Fields that tween. Anything else is "static": changing it rebuilds the node.
const ANIM = new Set(['at', 'o', 's', 'pxo', 'off', 'deadO', 'litO', 'fill', 'heat', 'drop', 'shadeO', 'vals', 'segO', 'hiO', 'on', 'val', 'v', 'len', 'ps', 'flip', 'glow', 'tagO', 'lx', 'ly']);
const staticKey = o => JSON.stringify(Object.keys(o).filter(k => !ANIM.has(k) && k !== 'id').sort().map(k => [k, o[k]]));

function mix(a, b, t) {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t);
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(v => typeof v === 'number')) return a.map((v, i) => lerp(v, b[i], t));
  return t < 1 ? a : b;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Stage {
  constructor(host, { title = 'Scene' } = {}) {
    this.host = host;
    this.svg = el('svg', { class: 'stage-svg', role: 'img', 'aria-labelledby': 'stage-title stage-desc', preserveAspectRatio: 'xMidYMid meet' });
    const t = el('title', { id: 'stage-title' }, this.svg); t.textContent = title;
    this.desc = el('desc', { id: 'stage-desc' }, this.svg);
    // Hatching for "missed" / error areas (a pattern, not a filter).
    const defs = el('defs', {}, this.svg);
    const pat = el('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 6, height: 6, class: 'hatch-bg' }, pat);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'hatch-line' }, pat);
    const grad = el('linearGradient', { id: 'heatgrad' }, defs);
    el('stop', { offset: '0', class: 'heat-0' }, grad);
    el('stop', { offset: '1', class: 'heat-1' }, grad);
    this.world = el('g', { class: 'world' }, this.svg);
    this.layers = [0, 1, 2, 3].map(i => el('g', { class: `layer l${i}` }, this.world));
    host.appendChild(this.svg);
    this.nodes = new Map();      // id -> { g, inner, handle, type, key, fixed: [] }
    this.state = new Map();      // id -> current object state
    this.cam = { s: 20, tx: 0, ty: 0 };
    this.lastFrame = null;
    this.W = 400; this.H = 300;
    this.timeline = null;
    this.raf = 0;
    this.onEnd = null;
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.W = Math.max(100, Math.round(r.width));
    this.H = Math.max(100, Math.round(r.height));
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    if (this.lastFrame && !this.timeline) Object.assign(this.cam, this.fit(this.lastFrame));
    this.draw();
  }

  get scale() { return this.cam.s; }

  /**
   * Camera that fits a frame's objects (or frame.cam.fit ids) in the stage,
   * counting pixel-sized labels at their real size. Returns { s, tx, ty }.
   */
  fit(frame) {
    const opt = frame.cam || {};
    const ref = opt.fitFrame || frame;
    const ids = opt.fit ? new Set(opt.fit) : null;
    const objs = ref.objs.filter(o => (ids ? ids.has(o.id) : !o.nofit) && (o.o ?? 1) > 0);
    const m = { t: 46, r: 14, b: 14, l: 14, ...(opt.margin || {}) };
    const items = objs.map(o => {
      const e = (EXTENT[o.type] || (() => ({})))(o), at = o.at || [0, 0, 0], os = o.s ?? 1;
      const A = project(...at);
      const pts = (e.pts || [[0, 0, 0]]).map(p => { const q = project(p[0] * os, p[1] * os, p[2] * os); return [A[0] + q[0], A[1] + q[1]]; });
      const lb = e.lb ? [A[0] + e.lb[0] * os, A[1] + e.lb[1] * os, A[0] + e.lb[2] * os, A[1] + e.lb[3] * os] : null;
      let pxAt = A;
      if (e.pxAt) { const q = project(...e.pxAt); pxAt = [A[0] + q[0], A[1] + q[1]]; }
      if (e.pxLocal) pxAt = [A[0] + e.pxLocal[0] * os, A[1] + e.pxLocal[1] * os];
      const px = e.px && o.pxo ? [e.px[0] + o.pxo[0], e.px[1] + o.pxo[1], e.px[2] + o.pxo[0], e.px[3] + o.pxo[1]] : e.px;
      return { pts, lb, px, pxAt };
    });
    const maxS = opt.maxS || 120;
    const availW = this.W - m.l - m.r, availH = this.H - m.t - m.b;
    const boxAt = s => {
      const b = [Infinity, Infinity, -Infinity, -Infinity];
      const grow = (x, y) => { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); };
      for (const it of items) {
        it.pts.forEach(p => grow(p[0] * s, p[1] * s));
        if (it.lb) { grow(it.lb[0] * s, it.lb[1] * s); grow(it.lb[2] * s, it.lb[3] * s); }
        if (it.px) { const ax = it.pxAt[0] * s, ay = it.pxAt[1] * s; grow(ax + it.px[0], ay + it.px[1]); grow(ax + it.px[2], ay + it.px[3]); }
      }
      return b;
    };
    const fits = s => { const b = boxAt(s); return b[2] - b[0] <= availW && b[3] - b[1] <= availH; };
    if (!items.length) return { ...this.cam };
    // Largest zoom at which everything fits (pixel-sized labels don't shrink,
    // so solve by bisection rather than by ratio).
    let lo = 0.5, hi = maxS, s = hi;
    if (!fits(hi)) { for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; } s = lo; }
    const box = boxAt(s);
    const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    return { s, tx: m.l + (this.W - m.l - m.r) / 2 - cx, ty: m.t + (this.H - m.t - m.b) / 2 - cy };
  }

  // ---------- drawing ----------
  ensure(o) {
    let n = this.nodes.get(o.id);
    const key = staticKey(o);
    if (n && n.key === key) return n;
    if (n) n.g.remove();
    const type = TYPES[o.type];
    if (!type) throw new Error(`unknown shape type ${o.type}`);
    const g = el('g', { class: `obj obj-${o.type}`, 'data-id': o.id });
    const inner = el('g', { class: 'in' }, g);
    const handle = type.build(inner, o, this) || {};
    // Hidden until draw() has positioned it and scaled its labels; otherwise
    // the browser can paint it once at the origin with labels at world scale
    // (13px text × zoom = hundreds of pixels).
    g.style.display = 'none';
    n = { g, inner, handle, type, key, fixed: [...g.querySelectorAll('.fixed')], keys: [].concat(o.k || []) };
    this.nodes.set(o.id, n);
    this.layers[o.layer ?? 1].appendChild(g);
    return n;
  }

  order(objs) {
    const sorted = [...objs].sort((a, b) => (a.layer ?? 1) - (b.layer ?? 1) || (a.zi ?? 0) - (b.zi ?? 0) || depth(a) - depth(b));
    for (const o of sorted) { const n = this.nodes.get(o.id); if (n) this.layers[o.layer ?? 1].appendChild(n.g); }
  }

  draw() {
    const sc = this.cam.s;
    this.world.setAttribute('transform', `translate(${this.cam.tx.toFixed(2)},${this.cam.ty.toFixed(2)}) scale(${sc.toFixed(4)})`);
    for (const [id, o] of this.state) {
      const n = this.nodes.get(id); if (!n) continue;
      let [x, y] = project(...(o.at || [0, 0, 0]));
      if (o.pxo) { x += o.pxo[0] / sc; y += o.pxo[1] / sc; }   // fixed pixel offset from the anchor
      const s = o.s ?? 1;
      n.g.setAttribute('transform', `translate(${x.toFixed(3)},${y.toFixed(3)})${s !== 1 ? ` scale(${s.toFixed(3)})` : ''}`);
      n.g.setAttribute('opacity', Math.max(0, Math.min(1, o.o ?? 1)).toFixed(3));
      n.g.style.display = (o.o ?? 1) <= 0.001 ? 'none' : '';
      if (n.type.update) n.type.update(n.handle, o, this);
      const inv = 1 / (sc * s);
      for (const f of n.fixed) f.setAttribute('transform', `translate(${(+f.dataset.x || 0).toFixed(3)},${(+f.dataset.y || 0).toFixed(3)}) scale(${inv.toFixed(4)})`);
    }
  }

  // Apply a keyframe instantly.
  set(frame) {
    this.stop();
    const want = new Map(frame.objs.map(o => [o.id, { o: 1, ...o }]));
    for (const id of [...this.state.keys()]) if (!want.has(id)) this.remove(id);
    for (const o of want.values()) { this.ensure(o); this.state.set(o.id, o); }
    this.lastFrame = frame;
    Object.assign(this.cam, this.fit(frame));
    this.order([...want.values()]);
    this.setDesc(frame.aria);
    this.draw();
  }

  // Update some objects immediately, without a tween (live controls).
  patch(objs) {
    this.stop();
    for (const o of objs) { const full = { o: 1, ...o }; this.ensure(full); this.state.set(o.id, full); }
    this.order([...this.state.values()]);
    this.draw();
  }

  remove(id) { const n = this.nodes.get(id); if (n) n.g.remove(); this.nodes.delete(id); this.state.delete(id); }

  setDesc(text) { if (text != null) this.desc.textContent = text; }

  // ---------- timeline ----------
  /**
   * Play a step: tween from whatever is on screen to frames[0], then through
   * each later frame. frames: [{ objs, cam, dur, aria }].
   */
  play(frames, { onEnd } = {}) {
    this.stop();
    // One steady camera per step: frames without their own camera fit the
    // step's final frame.
    const last = frames[frames.length - 1];
    for (const f of frames) f.cam = { ...(last.cam || {}), ...(f.cam || {}), fitFrame: last };
    this.frames = frames;
    this.onEnd = onEnd || null;
    if (reducedMotion()) { this.crossfadeTo(frames[frames.length - 1]); return; }
    this.timeline = { i: 0, seg: this.segment(frames[0], frames[0].enter ?? 0.7) };
    this.loop();
  }

  replay() {
    if (!this.frames) return;
    const frames = this.frames;
    if (reducedMotion()) {
      this.set(frames[0]);
      clearTimeout(this.replayTimer);
      this.replayTimer = setTimeout(() => this.crossfadeTo(frames[frames.length - 1]), 600);
      return;
    }
    this.set(frames[0]);
    this.play(frames, { onEnd: this.onEnd });
  }

  finish() {
    if (!this.frames) return;
    this.stop();
    this.set(this.frames[this.frames.length - 1]);
  }

  stop() {
    cancelAnimationFrame(this.raf); this.raf = 0; this.timeline = null;
    clearTimeout(this.replayTimer);
    if (this.fading) { this.fading.snap.remove(); this.world.setAttribute('opacity', 1); this.fading = null; }
  }

  segment(frame, dur) {
    const from = new Map();
    for (const [id, o] of this.state) from.set(id, { ...o });
    const to = new Map(frame.objs.map(o => [o.id, { o: 1, ...o }]));
    // Entering objects rise in from slightly below, faded out.
    for (const [id, o] of to) {
      const cur = from.get(id);
      if (!cur || staticKey(cur) !== staticKey(o)) {
        const at = o.at || [0, 0, 0];
        from.set(id, { ...o, o: 0, at: [at[0], at[1], at[2] - 0.3] });
        this.remove(id);
      }
    }
    // Leaving objects sink and fade.
    for (const [id, o] of from) if (!to.has(id)) { const at = o.at || [0, 0, 0]; to.set(id, { ...o, o: 0, at: [at[0], at[1], at[2] - 0.2], _exit: true }); }
    for (const o of to.values()) this.ensure(o);
    this.order([...to.values()]);
    this.setDesc(frame.aria);
    this.lastFrame = frame;
    return { from, to, camFrom: { ...this.cam }, camTo: this.fit(frame), t0: performance.now(), dur: Math.max(0.001, dur) * 1000 };
  }

  loop() {
    const tick = now => {
      const tl = this.timeline; if (!tl) return;
      const { seg } = tl, t = Math.min(1, (now - seg.t0) / seg.dur), e = ease(t);
      for (const [id, b] of seg.to) {
        const a = seg.from.get(id) || b, o = {};
        for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = mix(a[k], b[k], e);
        this.state.set(id, o);
      }
      for (const k of ['s', 'tx', 'ty']) this.cam[k] = lerp(seg.camFrom[k], seg.camTo[k], e);
      this.draw();
      if (t < 1) { this.raf = requestAnimationFrame(tick); return; }
      for (const [id, o] of seg.to) if (o._exit) this.remove(id);
      tl.i++;
      const next = this.frames[tl.i];
      if (!next) { this.timeline = null; this.onEnd && this.onEnd(); return; }
      const hold = next.hold ?? 0.15;
      this.raf = requestAnimationFrame(() => {
        setTimeout(() => { if (this.timeline === tl) { tl.seg = this.segment(next, next.dur ?? 0.8); this.raf = requestAnimationFrame(tick); } }, hold * 1000);
      });
    };
    this.raf = requestAnimationFrame(tick);
  }

  // Reduced motion: snapshot what's on screen, jump to the end state
  // underneath, and cross-fade between the two (opacity only).
  crossfadeTo(frame) {
    const snap = this.world.cloneNode(true);
    snap.classList.add('snapshot');
    this.svg.appendChild(snap);
    this.set(frame);
    this.world.setAttribute('opacity', 0);
    const t0 = performance.now(), dur = 220;
    this.fading = { snap };
    const tick = now => {
      if (!this.fading) return;
      const t = Math.min(1, (now - t0) / dur);
      snap.setAttribute('opacity', (1 - t).toFixed(3));
      this.world.setAttribute('opacity', t.toFixed(3));
      if (t < 1) this.raf = requestAnimationFrame(tick);
      else { snap.remove(); this.fading = null; this.world.setAttribute('opacity', 1); this.onEnd && this.onEnd(); }
    };
    this.raf = requestAnimationFrame(tick);
  }

  // ---------- highlight (scene words) ----------
  highlight(key) {
    this.clearHighlight();
    if (!key) return 0;
    let count = 0;
    for (const n of this.nodes.values()) {
      if (!n.keys.includes(key)) continue;
      n.g.classList.add('hl');
      try {
        const b = n.inner.getBBox(), pad = 0.12;
        const ring = document.createElementNS(NS, 'rect');
        ring.setAttribute('class', 'ring');
        ring.setAttribute('x', b.x - pad); ring.setAttribute('y', b.y - pad);
        ring.setAttribute('width', b.width + 2 * pad); ring.setAttribute('height', b.height + 2 * pad);
        ring.setAttribute('rx', 0.12); ring.setAttribute('vector-effect', 'non-scaling-stroke');
        n.inner.appendChild(ring);
      } catch { /* not rendered yet */ }
      count++;
    }
    if (count) this.svg.classList.add('focusing');
    return count;
  }

  clearHighlight() {
    this.svg.classList.remove('focusing');
    for (const n of this.nodes.values()) { n.g.classList.remove('hl'); n.inner.querySelectorAll('.ring').forEach(r => r.remove()); }
  }

  /** Ids currently drawn (tests use this). */
  ids() { return [...this.state.keys()]; }
}

function depth(o) { const a = o.at || [0, 0, 0]; return a[0] + a[1] + a[2] * 0.01; }
