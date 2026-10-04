// Act II scenes: the sparse autoencoder. Pure data like slice.js. Every toy
// value comes from the trained toy SAE (src/toy/trained.js); every paper
// value from research/facts.md (B1, B3–B7).

import * as toy from '../toy/model.js';
import { TRAINED, SAE, run, featureName, featureIdea, decoderCol } from '../toy/trained.js';

const MID = toy.MIDDLE_FLOOR;
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const R3 = Math.sqrt(3);
// World offset that moves t units straight across the screen (billboards
// such as the funnel are drawn in screen units, so lamps line up with them).
const across = t => [t / R3, -t / R3, 0];

// ---------- workshop layout ----------
export const W0 = [24, -10, 4];                       // funnel mouth
const SRC = add3(W0, across(-1.8));                    // the incoming snapshot
const LAMP0 = 2.9, LAMP_GAP = 0.9, F = SAE.F;
const lampAt = i => add3(W0, across(LAMP0 + i * LAMP_GAP));
const OUT0 = LAMP0 + (F - 1) * LAMP_GAP + 0.6;         // where the decoder half starts
const ROOM2 = { c: add3(W0, across(OUT0 + 5.2)), size: 4.0, L: 2.3 };

const list = toy.listAt('Bridge', MID);
const R = run(list);
const fMax = Math.max(...R.f);
const lit = R.f.map((v, i) => [v, i]).filter(([v]) => v > 1e-6).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
const short = i => ({ 'Golden Gate Bridge': 'Golden Gate', 'tourist landmark': 'landmark', 'bridge (any)': 'bridge', 'San Francisco': 'SF', 'code error': 'code error' }[featureName(i)] || featureName(i));
const lampColor = i => (featureIdea(i) === 'ggb' ? 'bridge' : 'lamp');

// ---------- objects ----------
const column = (id, vals, at, extra = {}) => ({ id, type: 'bars', at, vals, unit: 1.3, bw: 0.36, gap: 0.1, layer: 2, ...extra });
const srcCol = (extra = {}) => column('col-src', list, SRC, { k: ['snapshot-in'], ...extra });
const lamps = (on = () => 0, extra = {}) => Array.from({ length: F }, (_, i) => ({
  id: `lamp-${i}`, type: 'lamp', at: lampAt(i), r: 0.27, c: lampColor(i), on: on(i), layer: 2,
  k: ['lamps', 'features', ...(lit.includes(i) ? ['lit', 'few'] : [])], ...extra,
}));
// Names only under the lit lamps, on separate rows left to right so
// neighbours never collide.
const byPosition = [...lit].sort((a, b) => a - b);
const lampNames = (o = 1) => byPosition.map((i, n) => ({ id: `lamp-name-${i}`, type: 'label', at: add3(lampAt(i), [0, 0, -0.62]), pxo: [0, n * 15], text: short(i), size: 12, weight: 600, layer: 3, o, k: ['lit', 'few'] }));
// Alternate scores sit on two rows so they never run together on narrow phones.
const scores = (vals, extra = {}) => vals.map((v, i) => ({ id: `score-${i}`, type: 'label', at: add3(lampAt(i), [0, 0, 0.75]), pxo: [0, i % 2 ? -15 : 0], text: Math.abs(v) < 0.05 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v).toFixed(1), size: 12, cls: `mono ${v < 0 ? 'gap-text' : ''}`, layer: 3, k: ['scores'], ...extra }));
const gate = i => ({ id: `gate-${i}`, type: 'path', at: add3(lampAt(i), [0, 0, -0.42]), pts: [across(-0.26), across(0.26)], cls: 'gate', layer: 2, k: ['relu'] });
const trapIn = (o = 1) => ({ id: 'trap-in', type: 'trap', at: add3(W0, [0, 0, 0]), w: 2.3, h0: 0.9, h1: 2.6, dir: 1, label: 'encoder', layer: 1, o, k: ['encoder'] });
const trapOut = (o = 1) => ({ id: 'trap-out', type: 'trap', at: add3(W0, across(OUT0)), w: 2.3, h0: 0.9, h1: 2.6, dir: -1, label: 'decoder', layer: 1, o, k: ['decoder'] });
const room2 = () => ({ id: 'room2', type: 'room', at: ROOM2.c, size: ROOM2.size, layer: 0 });

// ---------- II-1 · A few ingredients at a time ----------
function contributions() {
  return lit.map(i => decoderCol(i).map(v => v * R.f[i]));
}
const PART_X = [0.15, 1.15, 2.15];
const parts = (stage) => contributions().map((vals, n) => {
  const i = lit[n];
  const home = srcCol().at;
  const out = add3(W0, across(PART_X[n] - 0.6));
  return column(`part-${i}`, vals, stage === 'restack' ? home : out, { bw: 0.24, gap: 0.06, c: lampColor(i) === 'bridge' ? 'bridge' : 'lamp', o: stage === 'hidden' ? 0 : stage === 'restack' ? 0 : 1, k: ['few'] });
});
const SCENES = {};
SCENES['ingredients'] = () => {
  const aria = `A row of eight lamps, one per learned feature. Three light up for the Bridge token: ${lit.map(featureName).join(', ')}. The token’s list of three numbers splits into three parts, each tinted like its lamp, and the parts stack back into the original list.`;
  return {
    words: { few: 'lamp', features: 'lamp' },
    frames: [
      { objs: [srcCol(), ...lamps()], aria, enter: 0.8 },
      { objs: [srcCol(), ...lamps(i => R.f[i] / fMax), ...lampNames()], dur: 0.5, aria },
      { objs: [srcCol(), ...lamps(i => R.f[i] / fMax), ...lampNames(), ...parts('out')], dur: 0.8, aria },
      { objs: [srcCol(), ...lamps(i => R.f[i] / fMax), ...lampNames(), ...parts('restack')], dur: 0.6, aria, hold: 0.4 },
    ],
  };
};

// ---------- II-2 · Widen ----------
SCENES['widen'] = () => {
  const aria = 'The middle-floor list of three numbers flows into a teal funnel labelled encoder, which widens into a row of eight lamps. Each lamp gets a score; some scores are below zero.';
  const inside = add3(W0, across(0.6));
  return {
    words: { encoder: 'machine', row: 'lamp' },
    frames: [
      { objs: [srcCol(), trapIn(), ...lamps()], aria, enter: 0.7 },
      { objs: [srcCol({ at: inside, o: 0, s: 0.6 }), trapIn(), ...lamps()], dur: 0.8, aria },
      { objs: [trapIn(), ...lamps(), ...scores(R.pre)], dur: 0.5, aria },
    ].map(f => ({ ...f, objs: f.objs.map(o => (o.id.startsWith('lamp-') ? { ...o, k: [...o.k, 'row'] } : o)) })),
  };
};

// ---------- II-3 · Switch off the negatives ----------
SCENES['relu'] = () => {
  const aria = `Small gates sit under each lamp. Scores below zero drop to the gate and become 0, and their lamps stay dark. ${lit.length} lamps stay lit (${lit.map(featureName).join(', ')}), the faintest one dimly.`;
  const gates = Array.from({ length: F }, (_, i) => gate(i));
  const dropped = R.pre.map((v, i) => (v < 0 ? { at: add3(lampAt(i), [0, 0, -0.42]) } : {}));
  return {
    words: { relu: 'machine', lit: 'lamp' },
    frames: [
      { objs: [trapIn(), ...lamps(), ...scores(R.pre), ...gates], aria, enter: 0.6 },
      { objs: [trapIn(), ...lamps(), ...scores(R.pre).map((o, i) => ({ ...o, ...dropped[i], o: R.pre[i] < 0 ? 0 : 1 })), ...gates], dur: 0.5, aria },
      { objs: [trapIn(), ...lamps(), ...scores(R.f).map((o, i) => ({ ...o, o: R.pre[i] < 0 ? 0.55 : 1 })), ...gates], dur: 0.4, aria },
      { objs: [trapIn(), ...lamps(i => R.f[i] / fMax), ...lampNames(), ...scores(R.f).map((o, i) => ({ ...o, o: R.pre[i] < 0 ? 0.55 : 1 })), ...gates], dur: 0.4, aria },
    ],
  };
};

// ---------- II-4 · Rebuild the original ----------
export function rebuildObjs({ grow = 1, gap = 1 } = {}) {
  const objs = [room2()];
  let at = add3(ROOM2.c, SAE.bdec, ROOM2.L);
  lit.forEach(i => {
    const v = decoderCol(i).map(x => x * R.f[i]);
    const len = Math.hypot(...v);
    objs.push({ id: `rb-${i}`, type: 'arrow', at, v: v.map(x => x / (len || 1)), len: len * ROOM2.L * grow, c: lampColor(i), lamp: true, tipR: 0.1, sw: 3, layer: 2, k: ['lit-arrows'] });
    at = add3(at, v, ROOM2.L * grow);
  });
  const orig = { id: 'rb-orig', type: 'arrow', at: ROOM2.c, v: list.map(x => x / Math.hypot(...list)), len: Math.hypot(...list) * ROOM2.L, c: 'ink-3', sw: 2, dash: true, layer: 2, k: ['original'] };
  const tip = add3(ROOM2.c, R.rebuilt, ROOM2.L), want = add3(ROOM2.c, list, ROOM2.L);
  const g = want.map((v, k) => v - tip[k]), gl = Math.hypot(...g);
  const mid = tip.map((v, k) => (v + want[k]) / 2);
  objs.push(orig,
    { id: 'rb-gap', type: 'arrow', at: tip, v: g.map(x => x / (gl || 1)), len: gl, c: 'gap', sw: 6, nohead: true, o: gap, layer: 3, k: ['error'] },
    { id: 'rb-orig-label', type: 'label', at: want, pxo: [-12, -2], text: 'original', anchor: 'end', size: 12, cls: 'dim', layer: 3, k: ['original'] },
    { id: 'rb-gap-label', type: 'label', at: mid, pxo: [12, 4], text: 'error', anchor: 'start', size: 12, weight: 700, cls: 'gap-text', o: gap, layer: 3, k: ['error'] });
  return objs;
}
SCENES['rebuild'] = () => {
  const err = Math.hypot(...list.map((v, k) => v - R.rebuilt[k]));
  const aria = `The decoder half of the funnel narrows the lit lamps back into a list. In a small room, the original list is a dashed arrow. The ${lit.length} lit features’ arrows join end to end and land close to it; the leftover gap (${err.toFixed(2)} in the toy) is marked error.`;
  const base = [...lamps(i => R.f[i] / fMax), trapOut()];   // the camera frames the decoder side
  return {
    words: { decoder: 'machine', error: 'bridge' },
    frames: [
      { objs: [...base, room2(), rebuildObjs({ grow: 0 }).find(o => o.id === 'rb-orig')], aria, enter: 0.7 },
      { objs: [...base, ...rebuildObjs({ gap: 0 })], dur: 0.9, aria },
      { objs: [...base, ...rebuildObjs()], dur: 0.4, aria },
    ].map(f => ({ ...f, cam: { fit: ['trap-out', 'room2', `lamp-${F - 1}`] } })),
  };
};

// ---------- II-5 · Learning by rebuilding ----------
export function trainingObjs(dirs, round, { hidden = 1 } = {}) {
  const objs = [{ ...room2(), size: 4.6 }];
  toy.CONCEPTS.forEach(c => objs.push({ id: `hid-${c.id}`, type: 'arrow', at: ROOM2.c, v: toy.DIRS[c.id], len: ROOM2.L * 1.15, c: 'ink-3', sw: 1.6, dash: true, o: hidden, layer: 1, k: ['hidden'] }));
  dirs.forEach((d, i) => objs.push({ id: `learn-${i}`, type: 'arrow', at: ROOM2.c, v: d, len: ROOM2.L, c: lampColor(i), lamp: true, sw: 2.5, layer: 2, k: ['random'] }));
  objs.push({ id: 'round', type: 'label', at: add3(ROOM2.c, [-2.2, -2.2, 2.7]), text: `round ${round}`, size: 13, weight: 700, cls: 'mono', layer: 3, k: ['random'] });
  // Legend: the two kinds of arrow must never be confused.
  objs.push({ id: 'legend-hidden', type: 'label', at: add3(ROOM2.c, [2.3, 2.3, -2.6]), pxo: [0, 0], text: '- - -  hidden idea', size: 12, cls: 'dim', layer: 3, k: ['hidden'] });
  objs.push({ id: 'legend-learned', type: 'label', at: add3(ROOM2.c, [2.3, 2.3, -2.6]), pxo: [0, 16], text: '——●  SAE’s arrow (a feature)', size: 12, cls: 'legend-lamp', layer: 3, k: ['random'] });
  return objs;
}
SCENES['training'] = () => {
  const snaps = TRAINED.snapshots;
  const last = snaps[snaps.length - 1];
  const aria = `Eight faint dashed arrows mark the toy’s hidden ideas. Eight solid lamp-arrows start in random directions and swing round, training round by round, until each sits on a dashed one (round ${last.round}).`;
  return {
    words: { random: 'lamp', hidden: 'ink' },
    liveReplay: true,
    frames: [
      { objs: trainingObjs(snaps[0].dirs, 0, { hidden: 0 }), aria, enter: 0.7 },
      { objs: trainingObjs(snaps[0].dirs, 0), dur: 0.4, aria },
      ...snaps.slice(1).map(s => ({ objs: trainingObjs(s.dirs, s.round), dur: 0.55, aria, hold: 0.05 })),
    ],
  };
};

// ---------- II-6 · Two forces in a tug-of-war ----------
const ROPE = { a: add3(W0, [0, 0, -4.2]), len: 9 };
const ropeAt = t => add3(ROPE.a, across(ROPE.len * t));
export function tugObjs(idx) {
  const s = TRAINED.sweep[idx], maxLit = TRAINED.sweep[0].lit;
  const t = idx / (TRAINED.sweep.length - 1);
  return [
    { id: 'rope', type: 'path', at: ROPE.a, pts: [[0, 0, 0], across(ROPE.len)], cls: 'rope', layer: 1, k: ['knot'] },
    { id: 'm-lit', type: 'meter', at: add3(ROPE.a, [0, 0, 0.2]), pxo: [-34, 0], val: s.lit / maxLit, c: 'lamp', label: 'lamps lit per list', hpx: 110, layer: 3, k: ['lamps-lit'] },
    { id: 'm-lit-v', type: 'label', at: ROPE.a, pxo: [-34, -126], text: s.lit.toFixed(2), size: 12, cls: 'mono', layer: 3, k: ['lamps-lit'] },
    { id: 'm-gap', type: 'meter', at: add3(ropeAt(1), [0, 0, 0.2]), pxo: [34, 0], val: s.gap, c: 'gap', label: 'rebuild gap', hpx: 110, layer: 3, k: ['gap'] },
    { id: 'm-gap-v', type: 'label', at: ropeAt(1), pxo: [34, -126], text: `${(s.gap * 100).toFixed(0)}%`, size: 12, cls: 'mono', layer: 3, k: ['gap'] },
    { id: 'knot', type: 'label', at: ropeAt(0.08 + 0.84 * t), text: `◆ λ = ${s.lambda}`, size: 13, weight: 700, cls: 'halo', layer: 3, k: ['knot'] },
    { id: 'tug-ideas', type: 'label', at: ropeAt(0.5), pxo: [0, 36], text: `features that match an idea: ${s.recovered} of 8`, size: 12, cls: 'dim', layer: 3, k: ['knot'] },
  ];
}
export const TUG_DEFAULT = TRAINED.sweep.findIndex(s => s.lambda === TRAINED.main.lambda);
SCENES['tug'] = () => {
  const n = TRAINED.sweep.length;
  const aria = idx => { const s = TRAINED.sweep[idx]; return `A rope between two meters: lamps lit per input (${s.lit.toFixed(2)}) and rebuild gap (${(s.gap * 100).toFixed(0)}% of the lists’ spread). The knot shows λ = ${s.lambda}. ${s.recovered} of the toy’s 8 features match a hidden idea.`; };
  return {
    words: { 'lamps-lit': 'lamp', gap: 'bridge', knot: 'ink' },
    interaction: 'lambda-slider',
    frames: [
      { objs: tugObjs(TUG_DEFAULT), aria: aria(TUG_DEFAULT), enter: 0.6 },
      { objs: tugObjs(0), dur: 0.6, aria: aria(0) },
      { objs: tugObjs(n - 1), dur: 0.9, aria: aria(n - 1) },
      { objs: tugObjs(TUG_DEFAULT), dur: 0.6, aria: aria(TUG_DEFAULT) },
    ].map(f => ({ ...f, cam: { maxS: 42 } })),   // keep the rope in proportion to the meters on wide screens
  };
};

// ---------- II-7 · Read the receipts ----------
// Paper values (facts.md B1, B3–B6). Shelf lengths are schematic; dead shares
// are drawn to scale.
const SHELVES = [
  { id: '1m', label: '1,048,576', n: 8, dead: 0.02 },
  { id: '4m', label: '4,194,304', n: 16, dead: 0.35 },
  { id: '34m', label: '33,554,432', n: 34, dead: 0.65 },
];
const SHELF0 = add3(W0, [0, 0, -2.5]);
const shelfObj = (s, r, { deadO = 0, litO = 0 } = {}) => ({
  id: `shelf-${s.id}`, type: 'shelf', at: add3(SHELF0, [0, 0, -r * 1.25]), n: s.n, dead: s.dead, lit: [1, 5, 11, 19].filter(x => x < s.n * (1 - s.dead)), label: s.label, deadO, litO, layer: 2, k: [`shelf`, 'dead', 'fewer'],
});
SCENES['receipts'] = () => {
  const bar = fill => ({ id: 'explained', type: 'splitbar', at: add3(SHELF0, [0, 0, -4.1]), share: 0.65, fill, wpx: 200, left: 'explained: at least 65%', right: 'missed', layer: 3, k: ['unexplained'] });
  const aria = 'Three shelves of small lamps: short, medium and very long, labelled 1,048,576, 4,194,304 and 33,554,432. Only a few lamps light on each. A share of each shelf is greyed out with crosses as dead: a sliver, about a third, nearly two-thirds. Below, a bar: at least 65% explained, the rest hatched as missed.';
  const sh = (o, n = 3) => SHELVES.slice(0, n).map((s, r) => shelfObj(s, r, o));
  return {
    words: { shelves: 'lamp', fewer: 'lamp', dead: 'ink', unexplained: 'bridge' },
    frames: [
      { objs: sh({}, 1), aria, enter: 0.6 },
      { objs: sh({}, 2), dur: 0.4, aria, hold: 0.05 },
      { objs: sh({}, 3), dur: 0.4, aria },
      { objs: sh({ litO: 1 }), dur: 0.5, aria },
      { objs: sh({ litO: 1, deadO: 1 }), dur: 0.6, aria },
      { objs: [...sh({ litO: 1, deadO: 1 }), bar(0.001)], dur: 0.2, aria, hold: 0 },
      { objs: [...sh({ litO: 1, deadO: 1 }), bar(1)], dur: 0.6, aria },
    ].map(f => ({ ...f, objs: f.objs.map(o => (o.type === 'shelf' ? { ...o, k: [...o.k, 'shelves'] } : o)) })),
  };
};

// ---------- Recap II ----------
SCENES['recap-2'] = () => {
  const aria = 'The whole machine: a snapshot list enters the encoder, spreads into eight lamps of which a few light, the decoder narrows them back, and in the room the lit arrows rebuild the original list, with a small error.';
  const objs = [
    srcCol({ k: ['snapshot'] }),
    { ...trapIn(), k: ['funnel', 'encoder'] },
    ...lamps(i => R.f[i] / fMax).map(o => ({ ...o, k: [...o.k, 'lamps'] })),
    { ...trapOut(), k: ['funnel', 'decoder'] },
    ...rebuildObjs().filter(o => o.type !== 'label').map(o => ({ ...o, k: [...[].concat(o.k || []), 'rebuild'] })),   // overview: no labels in the small room
  ];
  return { words: { snapshot: 'raw', funnel: 'machine', lamps: 'lamp', rebuild: 'lamp' }, frames: [{ objs, aria, enter: 1.0 }] };
};

export const ACT2_SCENES = SCENES;

/** Toy values the Act II copy refers to ({toy:name}). */
export const ACT2_TOY_VALUES = {
  trainRounds: () => String(TRAINED.main.steps),
};
