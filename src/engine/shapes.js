// Shape types for the isometric scene. Each type builds its SVG once from
// static props, then update() animates it using only transform and opacity.
//
// Every object is <g class="obj" transform="translate(screen pos)" opacity>
//   <g class="in"> …content… </g>
// </g>
// The inner group is what highlight pulses and dims (CSS), so it never
// fights the tween, which owns the outer transform/opacity.

import { project, faceFill, col, C30, S30 } from './iso.js';

const NS = 'http://www.w3.org/2000/svg';
export function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}
const pts = arr => arr.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
const f2 = v => (Math.round(v * 100) / 100);

// Text that keeps its pixel size whatever the camera zoom.
function fixedText(parent, text, { size = 13, weight, anchor = 'middle', cls = '', fill, dy = 0 } = {}) {
  const t = el('text', { class: `t ${cls}`, 'text-anchor': anchor, 'font-size': size, 'font-weight': weight, dy, fill }, parent);
  t.textContent = text;
  return t;
}

// ---------- types ----------
// Each: build(inner, o, stage) -> handle; update(handle, o, stage) animates.
// `o` is the current (possibly interpolated) object state.

export const TYPES = {
  // An isometric box anchored at its lower back corner (x, y, z).
  box: {
    build(g, o) {
      const { w = 1, d = 1, h = 1, c = 'frame' } = o;
      const P = (x, y, z) => project(x, y, z);
      const top = [P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)];
      const left = [P(0, d, h), P(w, d, h), P(w, d, 0), P(0, d, 0)];
      const right = [P(w, d, h), P(w, 0, h), P(w, 0, 0), P(w, d, 0)];
      el('polygon', { points: pts(left), style: `fill:${faceFill(c, 'left')}` }, g);
      el('polygon', { points: pts(right), style: `fill:${faceFill(c, 'right')}` }, g);
      el('polygon', { points: pts(top), style: `fill:${faceFill(c, 'top')}` }, g);
      if (o.stroke) el('polygon', { points: pts(top), fill: 'none', stroke: col(o.stroke), 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, g);
      if (o.text) {
        const [cx, cy] = P(w / 2, d / 2, h);
        const tg = el('g', { class: 'fixed', 'data-x': cx, 'data-y': cy }, g);
        fixedText(tg, o.text, { size: o.size || 13, weight: 600, dy: '0.35em', cls: o.textCls || '' });
        return { tg };
      }
      return {};
    },
  },

  // A flat diamond on the floor (water, map islands, street).
  plane: {
    build(g, o) {
      const { w = 4, d = 4, c = 'frame' } = o;
      el('polygon', { points: pts([project(0, 0), project(w, 0), project(w, d), project(0, d)]), style: `fill:${col(c)}`, 'fill-opacity': o.fo ?? 1 }, g);
      return {};
    },
  },

  // A word tile: a thin slab with the word on it and an optional number tag.
  tile: {
    build(g, o) {
      const w = o.w ?? 1, d = o.d ?? 0.9, h = 0.22;
      const P = (x, y, z) => project(x, y, z);
      el('polygon', { points: pts([P(0, d, h), P(w, d, h), P(w, d, 0), P(0, d, 0)]), style: `fill:${faceFill('paper', 'left')}` }, g);
      el('polygon', { points: pts([P(w, d, h), P(w, 0, h), P(w, 0, 0), P(w, d, 0)]), style: `fill:${faceFill('paper', 'right')}` }, g);
      el('polygon', { points: pts([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)]), class: 'tile-top', style: `fill:${faceFill('paper', 'top')}` }, g);
      const [cx, cy] = P(w / 2, d / 2, h);
      const tg = el('g', { class: 'fixed', 'data-x': cx, 'data-y': cy }, g);
      fixedText(tg, o.word, { size: o.size || 13, weight: 600, dy: '0.35em', cls: 'tile-word' });
      const tag = el('g', { class: 'fixed tag', 'data-x': cx, 'data-y': cy }, g);
      const tagText = fixedText(tag, o.tag ?? '', { size: 11, dy: '-1.05em', cls: 'mono dim' });
      return { tag, tagText };
    },
    update(h, o) {
      if (h.tagText.textContent !== String(o.tag ?? '')) h.tagText.textContent = o.tag ?? '';
      h.tag.style.opacity = o.tagO ?? (o.tag ? 1 : 0);
    },
  },

  // A short column of bars standing up from the anchor, facing the reader.
  // vals: numbers (positive up); bars scale with transform only.
  bars: {
    build(g, o) {
      const n = o.vals.length, bw = o.bw ?? 0.28, gap = o.gap ?? 0.1, unit = o.unit ?? 1;
      const width = n * bw + (n - 1) * gap;
      const x0 = -width / 2;
      el('line', { x1: x0 - 0.08, x2: -x0 + 0.08, y1: 0, y2: 0, class: 'baseline', 'vector-effect': 'non-scaling-stroke' }, g);
      const bars = [];
      for (let i = 0; i < n; i++) {
        const bx = x0 + i * (bw + gap);
        const bg = el('g', { transform: `translate(${f2(bx)},0)` }, g);
        const segs = (o.segs && o.segs[i]) || null;
        const r = el('rect', { x: 0, y: -unit, width: bw, height: unit, style: `fill:${col(o.c || 'raw')}` }, bg);
        let segEls = null;
        if (segs) {
          segEls = segs.map((s, k) => el('rect', { x: 0, y: -unit + (k * unit) / segs.length, width: bw, height: unit / segs.length, style: `fill:${col(s)}`, opacity: 0 }, bg));
        }
        bars.push({ g: bg, r, segEls, x: bx });
      }
      let bracket = null, bracketLabel = null;
      if (o.hi != null) {
        const bx = x0 + o.hi * (bw + gap);
        bracket = el('rect', { x: bx - 0.07, y: -unit * 1.6, width: bw + 0.14, height: unit * 3.2, rx: 0.06, class: 'bracket', 'vector-effect': 'non-scaling-stroke' }, g);
        const lg = el('g', { class: 'fixed', 'data-x': bx + bw / 2, 'data-y': unit * 1.6 }, g);
        bracketLabel = fixedText(lg, o.hiLabel || `#${o.hi + 1}`, { size: 13, weight: 600, dy: '1.2em' });
      }
      return { bars, unit, bracket };
    },
    update(h, o) {
      h.bars.forEach((b, i) => {
        const v = o.vals[i] ?? 0;
        b.r.setAttribute('transform', `scale(1,${f2(v)})`);
        if (b.segEls) {
          const show = o.segO ?? 0;
          b.r.style.opacity = 1 - show;
          b.segEls.forEach(s => { s.setAttribute('transform', `scale(1,${f2(v)})`); s.setAttribute('opacity', show); });
        }
      });
      if (h.bracket) h.bracket.style.opacity = o.hiO ?? 1;
    },
  },

  // A feature lamp: a bulb whose fill and halo show brightness (on: 0..1).
  lamp: {
    build(g, o) {
      const r = o.r ?? 0.28;
      el('rect', { x: -r * 0.35, y: r * 0.85, width: r * 0.7, height: r * 0.55, class: 'lamp-base' }, g);
      const halo = el('circle', { r: r * 1.75, style: `fill:${col(o.c || 'lamp')}`, class: 'lamp-halo' }, g);
      const ring = el('circle', { r, class: 'lamp-ring', style: `stroke:${col(o.c || 'lamp')}`, 'vector-effect': 'non-scaling-stroke' }, g);
      const bulb = el('circle', { r, style: `fill:${col(o.c || 'lamp')}` }, g);
      let label = null;
      if (o.label) { const lg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': r * 1.5 }, g); label = fixedText(lg, o.label, { size: 12, dy: '1em', cls: 'lamp-label' }); }
      return { halo, bulb, ring, label };
    },
    update(h, o) {
      const on = Math.max(0, Math.min(1, o.on ?? 1));
      h.bulb.setAttribute('opacity', f2(on));
      h.halo.setAttribute('opacity', f2(on * 0.28));
      h.halo.setAttribute('transform', `scale(${f2(0.7 + 0.3 * on)})`);
    },
  },

  // A clamp dial: the needle turns from −5× to +10× (val).
  dial: {
    build(g, o) {
      const r = o.r ?? 0.55;
      el('circle', { r, class: 'dial-face', 'vector-effect': 'non-scaling-stroke' }, g);
      const ticks = o.ticks || [-5, 0, 5, 10];
      for (const t of ticks) {
        const a = dialAngle(t) * Math.PI / 180;
        el('line', { x1: Math.sin(a) * r * 0.78, y1: -Math.cos(a) * r * 0.78, x2: Math.sin(a) * r, y2: -Math.cos(a) * r, class: 'dial-tick', 'vector-effect': 'non-scaling-stroke' }, g);
      }
      const needle = el('g', {}, g);
      el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.85, class: 'dial-needle', 'vector-effect': 'non-scaling-stroke' }, needle);
      el('circle', { r: r * 0.12, class: 'dial-hub' }, g);
      const lg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': r }, g);
      const label = fixedText(lg, '', { size: 13, weight: 600, dy: '1.3em', cls: 'mono' });
      return { needle, label };
    },
    update(h, o) {
      h.needle.setAttribute('transform', `rotate(${f2(dialAngle(o.val ?? 0))})`);
      const txt = `${Math.round(o.val ?? 0)}×`;
      if (h.label.textContent !== txt) h.label.textContent = txt;
    },
  },

  // An arrow from the anchor along a world-space vector v (projected), with an
  // optional lamp at its tip. Shaft and head move by transform only.
  arrow: {
    build(g, o) {
      const shaft = el('g', {}, g);
      el('line', { x1: 0, y1: 0, x2: 1, y2: 0, class: 'arrow-shaft', style: `stroke:${col(o.c || 'lamp')}`, 'stroke-width': o.sw ?? 3, 'vector-effect': 'non-scaling-stroke' }, shaft);
      const head = el('g', {}, g);
      if (!o.nohead) el('polygon', { points: '0,0 -0.26,-0.11 -0.26,0.11', style: `fill:${col(o.c || 'lamp')}` }, head);
      let tip = null, label = null;
      if (o.lamp) {
        tip = el('g', {}, g);
        el('circle', { r: 0.42, style: `fill:${col(o.c || 'lamp')}`, opacity: 0.25 }, tip);
        el('circle', { r: 0.2, style: `fill:${col(o.c || 'lamp')}` }, tip);
      }
      if (o.label) {
        label = el('g', { class: 'fixed' }, g);
        fixedText(label, o.label, { size: 12, weight: 600, anchor: 'start', dy: '0.35em', cls: 'arrow-label' });
      }
      return { shaft, head, tip, label };
    },
    update(h, o) {
      const v = o.v || [1, 0, 0], len = o.len ?? 1;
      const [sx, sy] = project(v[0] * len, v[1] * len, v[2] * len);
      const L = Math.hypot(sx, sy), ang = Math.atan2(sy, sx) * 180 / Math.PI;
      const headLen = o.nohead ? 0 : Math.min(0.26, L * 0.5);
      h.shaft.setAttribute('transform', `rotate(${f2(ang)}) scale(${f2(Math.max(0, L - headLen * 0.6))},1)`);
      h.head.setAttribute('transform', `translate(${f2(sx)},${f2(sy)}) rotate(${f2(ang)}) scale(${f2(L > 0.05 ? 1 : 0)})`);
      if (h.tip) h.tip.setAttribute('transform', `translate(${f2(sx + Math.cos(ang * Math.PI / 180) * 0.3)},${f2(sy + Math.sin(ang * Math.PI / 180) * 0.3)})`);
      if (h.label) {
        const ux = Math.cos(ang * Math.PI / 180), uy = Math.sin(ang * Math.PI / 180);
        h.label.dataset.x = sx + ux * 0.6 + (o.lx ?? 0);
        h.label.dataset.y = sy + uy * 0.6 + (o.ly ?? 0);
      }
    },
  },

  // Upright text, constant pixel size.
  label: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const lines = String(o.text).split('\n');
      const t = el('text', { class: `t ${o.cls || ''}`, 'text-anchor': o.anchor || 'middle', 'font-size': o.size || 13, 'font-weight': o.weight }, tg);
      lines.forEach((ln, i) => { const s = el('tspan', { x: 0, dy: i ? '1.25em' : '0.35em' }, t); s.textContent = ln; });
      return { t };
    },
  },

  // A speech bubble / note card in pixel units, with an optional badge.
  bubble: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const lines = o.lines || [], pad = 10, lh = 17, w = o.w || 200;
      const h = pad * 2 + lines.length * lh + (o.badge ? 22 : 0);
      el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 10, class: 'bubble' }, tg);
      el('path', { d: `M ${-8} 0 L 0 10 L 8 0 Z`, class: 'bubble-tail' }, tg);
      lines.forEach((ln, i) => {
        const t = el('text', { x: -w / 2 + pad, y: -h + pad + 12 + i * lh, class: 't bubble-text', 'font-size': 13 }, tg);
        t.textContent = ln;
      });
      if (o.badge) {
        const bt = el('text', { x: -w / 2 + pad, y: -pad, class: `t badge-text ${o.badgeCls || 'cite'}`, 'font-size': 11, 'font-weight': 700 }, tg);
        bt.textContent = o.badge;
      }
      return {};
    },
  },

  // A vertical meter (I-3's bridge-ness). val 0..1.
  meter: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const H = o.hpx || 90, W = 18;
      el('rect', { x: -W / 2, y: -H, width: W, height: H, rx: 5, class: 'meter-frame' }, tg);
      const fill = el('rect', { x: -W / 2, y: -H, width: W, height: H, rx: 5, style: `fill:${col(o.c || 'bridge')}` }, tg);
      const lab = el('text', { y: 18, class: 't', 'text-anchor': 'middle', 'font-size': 12 }, tg);
      lab.textContent = o.label || '';
      return { fill, H };
    },
    update(h, o) {
      const v = Math.max(0, Math.min(1, o.val ?? 0));
      h.fill.setAttribute('transform', `scale(1,${f2(v)})`); // rect spans −H…0, so this fills from the bottom
    },
  },

  // Odds bars (next-word guesses), in pixel units. rows: [{word, p}].
  odds: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const W = o.wpx || 110, rows = o.rows;
      const fills = rows.map((r, i) => {
        const y = i * 20;
        const t = el('text', { x: -6, y: y + 11, class: 't', 'text-anchor': 'end', 'font-size': 12 }, tg); t.textContent = r.word;
        el('rect', { x: 0, y, width: W, height: 13, rx: 3, class: 'odds-track' }, tg);
        const f = el('rect', { x: 0, y, width: W, height: 13, rx: 3, style: `fill:${col('raw')}` }, tg);
        const pct = el('text', { x: W + 6, y: y + 11, class: 't mono', 'font-size': 11 }, tg);
        if (i === 0) f.classList.add('odds-win');
        return { f, pct };
      });
      return { fills, W };
    },
    update(h, o) {
      h.fills.forEach((r, i) => {
        const p = o.ps ? o.ps[i] : o.rows[i].p;
        r.f.setAttribute('transform', `scale(${f2(Math.max(0.001, p))},1)`);
        const txt = `${Math.round(p * 100)}%`;
        if (r.pct.textContent !== txt) r.pct.textContent = txt;
      });
    },
  },

  // A card with a simple glyph (I-2): bridge, code, sad. flip 0..1 = face shown.
  card: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const inner = el('g', {}, tg);
      el('rect', { x: -42, y: -44, width: 84, height: 88, rx: 9, class: 'card' }, inner);
      drawGlyph(inner, o.glyph);
      const t = el('text', { y: 32, class: 't', 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600 }, inner);
      t.textContent = o.label || '';
      return { inner };
    },
    update(h, o) {
      h.inner.setAttribute('transform', `scale(${f2(Math.max(0.02, o.flip ?? 1))},1)`);
    },
  },

  // The Golden Gate–style bridge, drawn flat on its own little plane.
  bridge: {
    build(g, o) {
      const span = o.span || 5;
      const P = (x, z) => project(x, 0, z);
      const [a0, a1] = [P(0, 0), P(span, 0)];
      const t1 = 0.25 * span, t2 = 0.75 * span, th = 1.6;
      const [p1b, p1t, p2b, p2t] = [P(t1, 0), P(t1, th), P(t2, 0), P(t2, th)];
      const [mid] = [P(span / 2, 0.55)];
      el('path', { d: `M${a0[0]},${a0[1] - 0.25} L${a1[0]},${a1[1] - 0.25}`, class: 'bridge-deck', 'vector-effect': 'non-scaling-stroke' }, g);
      const cable = `M${a0[0]},${a0[1] - 0.25} Q${(a0[0] + p1t[0]) / 2},${p1t[1] + 0.6} ${p1t[0]},${p1t[1]} Q${mid[0]},${mid[1] + 0.9} ${p2t[0]},${p2t[1]} Q${(a1[0] + p2t[0]) / 2},${p2t[1] + 0.6} ${a1[0]},${a1[1] - 0.25}`;
      const glow = el('path', { d: cable, class: 'bridge-glow', 'vector-effect': 'non-scaling-stroke' }, g);
      el('path', { d: cable, class: 'bridge-cable', 'vector-effect': 'non-scaling-stroke' }, g);
      for (const [b, t] of [[p1b, p1t], [p2b, p2t]]) el('line', { x1: b[0], y1: b[1], x2: t[0], y2: t[1], class: 'bridge-tower', 'vector-effect': 'non-scaling-stroke' }, g);
      return { glow };
    },
    update(h, o) { h.glow.setAttribute('opacity', f2(o.glow ?? 0)); },
  },

  // A wireframe room corner for the 3-D toy (I-3, I-4).
  room: {
    build(g, o) {
      const s = o.size || 2.2;
      const P = (x, y, z) => project(x * s, y * s, z * s);
      const edges = [
        [[0, 0, 0], [1, 0, 0]], [[0, 0, 0], [0, 1, 0]], [[0, 0, 0], [0, 0, 1]],
        [[1, 0, 0], [1, 1, 0]], [[0, 1, 0], [1, 1, 0]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [0, 1, 1]],
        [[0, 0, 1], [1, 0, 1]], [[0, 0, 1], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]],
      ];
      for (const [a, b] of edges) {
        const [x1, y1] = P(...a.map(v => v - 0.5)), [x2, y2] = P(...b.map(v => v - 0.5));
        el('line', { x1, y1, x2, y2, class: 'room-edge', 'vector-effect': 'non-scaling-stroke' }, g);
      }
      return {};
    },
  },

  // A camera-flash ring (P3 snapshot).
  flash: {
    build(g) { el('circle', { r: 0.9, class: 'flash', 'vector-effect': 'non-scaling-stroke' }, g); return {}; },
  },

  // A static polyline through world points (relative to the anchor).
  path: {
    build(g, o) {
      const d = o.pts.map((p, i) => `${i ? 'L' : 'M'}${project(...p).map(v => v.toFixed(2)).join(',')}`).join(' ');
      el('path', { d, class: `path ${o.cls || ''}`, style: o.c ? `stroke:${col(o.c)}` : null, 'vector-effect': 'non-scaling-stroke' }, g);
      return {};
    },
  },
};

// ---------- extents for camera fitting ----------
// Each returns { pts: world points relative to the anchor, lb: local box in
// scene units [x0,y0,x1,y1] (scales with zoom), px: pixel box (constant) }.
const textW = (t, size) => Math.max(...String(t).split('\n').map(l => l.length)) * size * 0.56;
export const EXTENT = {
  box: o => { const { w = 1, d = 1, h = 1 } = o; const pts = []; for (const x of [0, w]) for (const y of [0, d]) for (const z of [0, h]) pts.push([x, y, z]); return { pts }; },
  plane: o => ({ pts: [[0, 0, 0], [o.w || 4, 0, 0], [o.w || 4, o.d || 4, 0], [0, o.d || 4, 0]] }),
  tile: o => { const w = o.w ?? 1, d = o.d ?? 0.9; return { pts: [[0, 0, 0], [w, 0, 0], [w, d, 0], [0, d, 0.22]], px: [-textW(o.word, 13) / 2, -30, textW(o.word, 13) / 2, 10], pxAt: [w / 2, d / 2, 0.22] }; },
  bars: o => { const n = o.vals.length, bw = o.bw ?? 0.28, gap = o.gap ?? 0.1, u = o.unit ?? 1, W = n * bw + (n - 1) * gap; const up = Math.max(0, ...o.vals) * u, dn = Math.max(0, ...o.vals.map(v => -v)) * u; const br = o.hi != null ? u * 1.6 : 0; return { lb: [-W / 2 - 0.1, -Math.max(up, br), W / 2 + 0.1, Math.max(dn, br)], px: o.hi != null ? [-30, 0, 30, 24] : null, pxLocal: [0, u * 1.6] }; },
  lamp: o => { const r = (o.r ?? 0.28) * 1.8; return { lb: [-r, -r, r, r], px: o.label ? [-textW(o.label, 12) / 2, 0, textW(o.label, 12) / 2, 22] : null }; },
  dial: o => { const r = o.r ?? 0.55; return { lb: [-r, -r, r, r], px: [-16, 0, 16, 24], pxLocal: [0, r] }; },
  arrow: o => { const v = o.v || [1, 0, 0], L = o.len ?? 1; const tip = [v[0] * L, v[1] * L, v[2] * L]; return { pts: [[0, 0, 0], tip], px: o.label ? [0, -9, textW(o.label, 12) + 14, 9] : null, pxAt: tip }; },
  label: o => { const w = textW(o.text, o.size || 13), lines = String(o.text).split('\n').length, h = lines * (o.size || 13) * 1.25; const a = o.anchor || 'middle'; const x0 = a === 'start' ? 0 : a === 'end' ? -w : -w / 2; return { px: [x0, -h / 2, x0 + w, h / 2 + (lines - 1) * (o.size || 13) * 0.6] }; },
  bubble: o => { const h = 20 + (o.lines || []).length * 17 + (o.badge ? 22 : 0); return { px: [-(o.w || 200) / 2, -h, (o.w || 200) / 2, 10] }; },
  meter: o => ({ px: [-12, -(o.hpx || 90), 12, 26 + 0] }),
  odds: o => ({ px: [-textW('sunset', 12) - 10, -4, (o.wpx || 110) + 40, o.rows.length * 20] }),
  card: () => ({ px: [-44, -46, 44, 46] }),
  bridge: o => { const sp = o.span || 5; return { pts: [[0, 0, 0], [sp, 0, 0], [sp * 0.25, 0, 1.9], [sp * 0.75, 0, 1.9]] }; },
  room: o => { const h = (o.size || 2.2) / 2; const pts = []; for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) pts.push([x, y, z]); return { pts }; },
  flash: () => ({ lb: [-0.95, -0.95, 0.95, 0.95] }),
  path: o => ({ pts: o.pts }),
};

// −5× … +10× mapped to −120° … +120°.
export function dialAngle(v) { return -120 + ((v + 5) / 15) * 240; }

function drawGlyph(g, kind) {
  if (kind === 'bridge') {
    el('path', { d: 'M-24 6 Q0 -26 24 6 M-14 -9 L-14 12 M14 -9 L14 12 M-26 12 L26 12', class: 'glyph', style: `stroke:${col('bridge')}` }, g);
  } else if (kind === 'code') {
    const t = el('text', { y: 4, class: 't mono glyph-text', 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700 }, g); t.textContent = '{ ! }';
  } else if (kind === 'sad') {
    el('path', { d: 'M0 -20 C 10 -6 12 2 0 10 C -12 2 -10 -6 0 -20 Z', style: `fill:${col('raw')}` }, g);
  }
}

export { C30, S30 };
