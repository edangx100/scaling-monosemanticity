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
      // Brightness tint (III-1): white = off, the feature's colour = brightest.
      const heat = el('polygon', { points: pts([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)]), style: `fill:${col(o.heatC || 'bridge')}`, opacity: 0 }, g);
      const [cx, cy] = P(w / 2, d / 2, h);
      const tg = el('g', { class: 'fixed', 'data-x': cx, 'data-y': cy }, g);
      fixedText(tg, o.word, { size: o.size || 13, weight: 600, dy: '0.35em', cls: 'tile-word' });
      const tag = el('g', { class: 'fixed tag', 'data-x': cx, 'data-y': cy }, g);
      const tagText = fixedText(tag, o.tag ?? '', { size: 11, dy: '-1.05em', cls: 'mono dim' });
      return { tag, tagText, heat };
    },
    update(h, o) {
      if (h.tagText.textContent !== String(o.tag ?? '')) h.tagText.textContent = o.tag ?? '';
      h.tag.style.opacity = o.tagO ?? (o.tag ? 1 : 0);
      h.heat.setAttribute('opacity', f2(Math.max(0, Math.min(1, o.heat ?? 0)) * 0.85));
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
      const v = Math.round(o.val ?? 0), txt = o.off ? 'off' : `${v < 0 ? '−' + Math.abs(v) : v}×`;
      if (h.label.textContent !== txt) h.label.textContent = txt;
    },
  },

  // An arrow from the anchor along a world-space vector v (projected), with an
  // optional lamp at its tip. Shaft and head move by transform only.
  arrow: {
    build(g, o) {
      const shaft = el('g', {}, g);
      el('line', { x1: 0, y1: 0, x2: 1, y2: 0, class: `arrow-shaft${o.dash ? ' dashed' : ''}`, style: `stroke:${col(o.c || 'lamp')}`, 'stroke-width': o.sw ?? 3, 'vector-effect': 'non-scaling-stroke' }, shaft);
      const head = el('g', {}, g);
      if (!o.nohead) el('polygon', { points: '0,0 -0.26,-0.11 -0.26,0.11', style: `fill:${col(o.c || 'lamp')}` }, head);
      let tip = null, label = null;
      if (o.lamp) {
        tip = el('g', {}, g);
        const tr = o.tipR ?? 0.2;
        el('circle', { r: tr * 2.1, style: `fill:${col(o.c || 'lamp')}`, opacity: 0.25 }, tip);
        el('circle', { r: tr, style: `fill:${col(o.c || 'lamp')}` }, tip);
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
      if (h.tip) { const off = (o.tipR ?? 0.2) * 1.5; h.tip.setAttribute('transform', `translate(${f2(sx + Math.cos(ang * Math.PI / 180) * off)},${f2(sy + Math.sin(ang * Math.PI / 180) * off)})`); }
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
        const pct = el('text', { x: W + 6, y: y + 11, class: 't mono', 'font-size': 11, opacity: o.hidePct ? 0 : 1 }, tg);
        if (i === 0 && !o.noWin) f.classList.add('odds-win');
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

  // One half of the SAE funnel, facing the reader: a trapezoid from a narrow
  // mouth (h0) to a wide end (h1) over length w. dir 1 widens to the right.
  trap: {
    build(g, o) {
      const w = o.w || 2, h0 = o.h0 || 0.8, h1 = o.h1 || 2.4, d = o.dir ?? 1;
      const [x0, x1] = d > 0 ? [0, w] : [w, 0];
      el('polygon', { points: `${x0},${-h0 / 2} ${x1},${-h1 / 2} ${x1},${h1 / 2} ${x0},${h0 / 2}`, class: 'trap', style: `fill:${col(o.c || 'machine')}` }, g);
      if (o.label) { const lg = el('g', { class: 'fixed', 'data-x': w / 2, 'data-y': Math.max(h0, h1) / 2 }, g); fixedText(lg, o.label, { size: 12, weight: 600, dy: '1.3em', cls: 'trap-label' }); }
      return {};
    },
  },

  // A shelf of n small lamps (one drawn lamp stands for many features).
  // dead: share greyed with an ×, shown with deadO (0..1); lit: indices that
  // blink on with litO (0..1). Only two groups animate.
  shelf: {
    build(g, o) {
      const n = o.n || 10, gap = o.gap ?? 0.42, r = 0.13;
      el('line', { x1: -0.25, y1: 0.24, x2: (n - 1) * gap + 0.25, y2: 0.24, class: 'shelf-board', 'vector-effect': 'non-scaling-stroke' }, g);
      const base = el('g', {}, g), dead = el('g', {}, g), lit = el('g', {}, g);
      const nDead = Math.round(n * (o.dead || 0)), litSet = new Set(o.lit || []);
      for (let i = 0; i < n; i++) {
        const x = i * gap;
        el('circle', { cx: x, cy: 0, r, class: 'shelf-lamp', 'vector-effect': 'non-scaling-stroke' }, base);
        if (i >= n - nDead) {
          el('circle', { cx: x, cy: 0, r: r * 1.05, class: 'shelf-dead' }, dead);
          el('path', { d: `M${x - r * 0.6},${-r * 0.6} L${x + r * 0.6},${r * 0.6} M${x + r * 0.6},${-r * 0.6} L${x - r * 0.6},${r * 0.6}`, class: 'shelf-x', 'vector-effect': 'non-scaling-stroke' }, dead);
        } else if (litSet.has(i)) {
          el('circle', { cx: x, cy: 0, r: r * 1.9, class: 'shelf-halo' }, lit);
          el('circle', { cx: x, cy: 0, r, class: 'shelf-lit' }, lit);
        }
      }
      if (o.label) { const lg = el('g', { class: 'fixed', 'data-x': -0.4, 'data-y': 0 }, g); fixedText(lg, o.label, { size: 12, weight: 600, anchor: 'end', dy: '0.35em', cls: 'mono' }); }
      return { dead, lit };
    },
    update(h, o) { h.dead.setAttribute('opacity', (o.deadO ?? 1).toFixed(3)); h.lit.setAttribute('opacity', (o.litO ?? 1).toFixed(3)); },
  },

  // A pixel-sized bar split into an explained part and a hatched missed part.
  // share: explained fraction; fill: 0..1 grows it in.
  splitbar: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const W = o.wpx || 180, H = 18, share = o.share ?? 0.65;
      el('rect', { x: 0, y: 0, width: W, height: H, rx: 4, class: 'split-track' }, tg);
      const grow = el('g', {}, tg);
      el('rect', { x: 0, y: 0, width: W * share, height: H, rx: 4, style: `fill:${col('raw')}` }, grow);
      el('rect', { x: W * share, y: 0, width: W * (1 - share), height: H, class: 'split-missed' }, grow);
      const t1 = el('text', { x: 0, y: H + 15, class: 't', 'font-size': 12 }, tg); t1.textContent = o.left || '';
      const t2 = el('text', { x: W, y: H + 15, class: 't dim', 'font-size': 12, 'text-anchor': 'end' }, tg); t2.textContent = o.right || '';
      return { grow };
    },
    update(h, o) { h.grow.setAttribute('transform', `scale(${Math.max(0.001, o.fill ?? 1).toFixed(3)},1)`); },
  },

  // Specificity bins (III-2, schematic): four bins 0–3 with dots dropping in.
  bins: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const BW = 52, GAP = 10, H = 70;
      const counts = o.counts || [2, 2, 3, 9];
      const dots = el('g', {}, tg);
      counts.forEach((n, b) => {
        const x = b * (BW + GAP);
        el('rect', { x, y: 0, width: BW, height: H, rx: 4, class: 'bin' }, tg);
        const t = el('text', { x: x + BW / 2, y: H + 16, class: 't', 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 }, tg); t.textContent = String(b);
        for (let k = 0; k < n; k++) el('circle', { cx: x + 9 + (k % 4) * 11.5, cy: H - 8 - Math.floor(k / 4) * 11, r: 4.2, class: b === 3 ? 'dot-good' : 'dot' }, dots);
      });
      const cap = el('text', { x: (4 * BW + 3 * GAP) / 2, y: -10, class: 't dim', 'text-anchor': 'middle', 'font-size': 12 }, tg); cap.textContent = o.caption || '';
      return { dots };
    },
    update(h, o) { const d = o.drop ?? 1; h.dots.setAttribute('opacity', f2(d)); h.dots.setAttribute('transform', `translate(0,${f2(-40 * (1 - d))})`); },
  },

  // Strip chart (III-6, schematic dots; the 0.3 line and 82% are the paper's).
  strip: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const W = o.wpx || 260, H = 90, x3 = W * 0.3;
      const shade = el('rect', { x: 0, y: 0, width: x3, height: H, class: 'strip-shade' }, tg);
      el('line', { x1: 0, y1: H, x2: W, y2: H, class: 'strip-axis' }, tg);
      el('line', { x1: x3, y1: -6, x2: x3, y2: H + 4, class: 'strip-line' }, tg);
      for (const [v, ty] of [[0, '0'], [0.3, '0.3'], [1, '1']]) { const t = el('text', { x: v * W, y: H + 16, class: 't mono', 'text-anchor': 'middle', 'font-size': 11 }, tg); t.textContent = ty; }
      const ax = el('text', { x: W / 2, y: H + 32, class: 't dim', 'text-anchor': 'middle', 'font-size': 12 }, tg); ax.textContent = 'best match with any neuron';
      const dots = el('g', {}, tg);
      const pts = o.pts || [];
      pts.forEach(([u, v]) => el('circle', { cx: u * W, cy: 8 + v * (H - 16), r: 3.6, class: 'dot-lamp' }, dots));
      const pct = el('text', { x: x3 / 2, y: -10, class: 't', 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, tg); pct.textContent = o.label || '';
      return { dots, shade, pct };
    },
    update(h, o) {
      const d = o.drop ?? 1, sh = o.shadeO ?? 1;
      h.dots.setAttribute('opacity', f2(d)); h.dots.setAttribute('transform', `translate(0,${f2(-30 * (1 - d))})`);
      h.shade.setAttribute('opacity', f2(sh * 0.22)); h.pct.setAttribute('opacity', f2(sh));
    },
  },

  // White-to-colour legend for brightness (III-1).
  legend: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const W = o.wpx || 150;
      el('rect', { x: 0, y: 0, width: W, height: 12, rx: 3, style: 'fill:url(#heatgrad)', class: 'legend-bar' }, tg);
      const a = el('text', { x: 0, y: 28, class: 't dim', 'font-size': 12 }, tg); a.textContent = o.left || 'off';
      const b = el('text', { x: W, y: 28, class: 't dim', 'font-size': 12, 'text-anchor': 'end' }, tg); b.textContent = o.right || 'brightest';
      return {};
    },
  },

  // Concept-frequency bars under a water line (IV-3, schematic). heights 0..1,
  // level 0..1 (animatable); bars above the line carry a lamp.
  water: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const n = o.heights.length, BW = 9, GAP = 3, H = 110, W = n * (BW + GAP) - GAP;
      const lamps = [];
      o.heights.forEach((hh, i) => {
        const x = i * (BW + GAP);
        el('rect', { x, y: H - hh * H, width: BW, height: hh * H, rx: 2, class: 'freq-bar' }, tg);
        lamps.push({ el: el('circle', { cx: x + BW / 2, cy: H - hh * H - 8, r: 4, class: 'dot-lamp' }, tg), h: hh });
      });
      const sea = el('rect', { x: -4, y: 0, width: W + 8, height: H, class: 'water-sea' }, tg);
      const line = el('line', { x1: -4, y1: 0, x2: W + 4, y2: 0, class: 'water-line' }, tg);
      el('line', { x1: 0, y1: H, x2: W, y2: H, class: 'strip-axis' }, tg);
      const a = el('text', { x: 0, y: H + 16, class: 't dim', 'font-size': 12 }, tg); a.textContent = o.left || 'common';
      const b = el('text', { x: W, y: H + 16, class: 't dim', 'font-size': 12, 'text-anchor': 'end' }, tg); b.textContent = o.right || 'rare';
      const lab = el('text', { x: 0, y: -14, class: 't', 'font-size': 12, 'font-weight': 600 }, tg);
      return { lamps, sea, line, lab, H };
    },
    update(h, o) {
      const lv = Math.max(0, Math.min(1, o.level ?? 0)), y = h.H * (1 - lv);
      h.sea.setAttribute('transform', `translate(0,${f2(y)}) scale(1,${f2(Math.max(0.001, lv))})`);
      h.line.setAttribute('transform', `translate(0,${f2(y)})`);
      if (h.lab.textContent !== (o.levelLabel || '')) h.lab.textContent = o.levelLabel || '';
      h.lamps.forEach(l => l.el.setAttribute('opacity', l.h > lv + 0.005 ? f2(o.lampsO ?? 1) : 0));
    },
  },

  // A row of ten slots with some filled (IV-5's top-10 comparison).
  tenrow: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const t = el('text', { x: 0, y: -10, class: 't', 'font-size': 13, 'font-weight': 700 }, tg); t.textContent = o.title || '';
      for (let i = 0; i < 10; i++) el('circle', { cx: 9 + i * 22, cy: 8, r: 8, class: i < (o.filled || 0) ? 'slot-on' : 'slot-off' }, tg);
      const n = el('text', { x: 0, y: 36, class: 't dim', 'font-size': 12 }, tg); n.textContent = o.note || '';
      return {};
    },
  },

  // A labelled drawer front (V-1's cabinet): label only, never contents.
  drawer: {
    build(g, o) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const W = o.wpx || 150;
      el('rect', { x: -W / 2, y: -13, width: W, height: 26, rx: 4, class: 'drawer' }, tg);
      el('rect', { x: -10, y: 4, width: 20, height: 4, rx: 2, class: 'drawer-handle' }, tg);
      const t = el('text', { x: 0, y: -1, class: 't', 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600 }, tg); t.textContent = o.text;
      return {};
    },
  },

  // A padlock (pixel-sized). shut: 0 open … 1 closed.
  lock: {
    build(g) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const shackle = el('path', { d: 'M -8 0 L -8 -9 A 8 8 0 0 1 8 -9 L 8 0', class: 'lock-shackle' }, tg);
      el('rect', { x: -12, y: -2, width: 24, height: 20, rx: 3, class: 'lock-body' }, tg);
      return { shackle };
    },
    update(h, o) { h.shackle.setAttribute('transform', `translate(0,${f2(-6 * (1 - (o.shut ?? 1)))})`); },
  },

  // A simple mask (V-3) that lifts away. lift: 0 on … 1 lifted.
  mask: {
    build(g) {
      const tg = el('g', { class: 'fixed', 'data-x': 0, 'data-y': 0 }, g);
      const m = el('g', {}, tg);
      el('path', { d: 'M -34 -10 Q 0 -30 34 -10 Q 32 16 0 22 Q -32 16 -34 -10 Z', class: 'mask' }, m);
      el('ellipse', { cx: -13, cy: -4, rx: 7, ry: 4, class: 'mask-eye' }, m);
      el('ellipse', { cx: 13, cy: -4, rx: 7, ry: 4, class: 'mask-eye' }, m);
      return { m };
    },
    update(h, o) { const l = o.lift ?? 0; h.m.setAttribute('transform', `translate(${f2(18 * l)},${f2(-46 * l)}) rotate(${f2(-18 * l)})`); h.m.setAttribute('opacity', f2(1 - 0.55 * l)); },
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
  meter: o => { const w = Math.max(12, textW(o.label || '', 12) / 2 + 2); return { px: [-w, -(o.hpx || 90) - 22, w, 26] }; },
  odds: o => ({ px: [-textW('sunset', 12) - 10, -4, (o.wpx || 110) + 40, o.rows.length * 20] }),
  card: () => ({ px: [-44, -46, 44, 46] }),
  bridge: o => { const sp = o.span || 5; return { pts: [[0, 0, 0], [sp, 0, 0], [sp * 0.25, 0, 1.9], [sp * 0.75, 0, 1.9]] }; },
  room: o => { const h = (o.size || 2.2) / 2; const pts = []; for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) pts.push([x, y, z]); return { pts }; },
  flash: () => ({ lb: [-0.95, -0.95, 0.95, 0.95] }),
  path: o => ({ pts: o.pts }),
  drawer: o => ({ px: [-(o.wpx || 150) / 2, -14, (o.wpx || 150) / 2, 14] }),
  lock: () => ({ px: [-13, -20, 13, 19] }),
  mask: () => ({ px: [-36, -76, 56, 24] }),
  water: o => ({ px: [0, -30, o.heights.length * 12, 130] }),
  tenrow: () => ({ px: [0, -26, 222, 42] }),
  bins: () => ({ px: [0, -24, 4 * 52 + 3 * 10, 92] }),
  strip: o => ({ px: [-8, -28, (o.wpx || 260) + 8, 128] }),
  legend: o => ({ px: [0, 0, o.wpx || 150, 34] }),
  trap: o => { const w = o.w || 2, h = Math.max(o.h0 || 0.8, o.h1 || 2.4) / 2; return { lb: [0, -h, w, h], px: o.label ? [-40, 0, 40, 24] : null, pxLocal: [w / 2, h] }; },
  shelf: o => ({ lb: [-0.3, -0.3, ((o.n || 10) - 1) * (o.gap ?? 0.42) + 0.3, 0.3], px: o.label ? [-8 - textW(o.label, 12), -8, 0, 8] : null, pxLocal: [-0.4, 0] }),
  splitbar: o => ({ px: [0, 0, o.wpx || 180, 36] }),
};

// −5× … +10× mapped to −120° … +120°.
export function dialAngle(v) { return -120 + ((v + 5) / 15) * 240; }

function drawGlyph(g, kind) {
  if (kind === 'bridge') {
    el('path', { d: 'M-24 6 Q0 -26 24 6 M-14 -9 L-14 12 M14 -9 L14 12 M-26 12 L26 12', class: 'glyph', style: `stroke:${col('bridge')}` }, g);
  } else if (kind === 'code') {
    const t = el('text', { y: 4, class: 't mono glyph-text', 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700 }, g); t.textContent = '{ ! }';
  } else if (kind === 'photo') {
    el('rect', { x: -26, y: -24, width: 52, height: 36, rx: 3, class: 'photo-frame' }, g);
    el('path', { d: 'M-20 6 Q0 -18 20 6 M-11 -6 L-11 10 M11 -6 L11 10', class: 'glyph', style: `stroke:${col('bridge')}` }, g);
  } else if (kind === 'sad') {
    el('path', { d: 'M0 -20 C 10 -6 12 2 0 10 C -12 2 -10 -6 0 -20 Z', style: `fill:${col('raw')}` }, g);
  }
}

export { C30, S30 };
