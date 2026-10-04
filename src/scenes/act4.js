// Act IV scenes: a map of a mind. Everything here illustrates paper results
// (research/facts.md G1–G6, H1–H6, I1–I13); layouts are schematic and say
// so in their captions. No toy numbers are presented as the paper's.

import { add3 } from './slice.js';

const R3 = Math.sqrt(3);
const across = t => [t / R3, -t / R3, 0];
const SCENES = {};

// ---------- IV-1 · Neighbourhoods ----------
const MAP = [0, -34, 0];
// Rings by relatedness, as the paper describes the Golden Gate neighbourhood
// [G2]. Positions are schematic.
const HOODS = [
  { id: 'ggb', name: 'Golden Gate Bridge', ring: 0, pos: [0, 0], c: 'bridge', dy: 30 },
  { id: 'alcatraz', name: 'Alcatraz', ring: 1, pos: [1.8, -1.8], dx: 9, dy: 4, anchor: 'start' },
  { id: 'presidio', name: 'Presidio', ring: 1, pos: [-1.8, 1.8], dx: -9, dy: 4, anchor: 'end' },
  { id: 'tahoe', name: 'Lake Tahoe', ring: 2, pos: [5.6, -0.4] },
  { id: 'yosemite', name: 'Yosemite', ring: 2, pos: [0.5, -5.1], dy: -12 },
  { id: 'solano', name: 'Solano County', ring: 2, pos: [-5.0, -0.3], minor: true },
  { id: 'medoc', name: 'Médoc', ring: 3, pos: [7.2, -6.0], minor: true },
  { id: 'skye', name: 'Isle of Skye', ring: 3, pos: [-6.4, 6.4] },
];
const RING_KEY = ['ggb-center', 'inner', 'middle', 'outer'];
const islands = (o = 1) => [
  { id: 'isle-3', type: 'plane', at: add3(MAP, [-10, -10, -0.06]), w: 20, d: 20, c: 'frame', fo: 0.35, o, layer: 0, k: ['outer'] },
  { id: 'isle-2', type: 'plane', at: add3(MAP, [-7.2, -7.2, -0.04]), w: 14.4, d: 14.4, c: 'frame', fo: 0.55, o, layer: 0, k: ['middle'] },
  { id: 'isle-1', type: 'plane', at: add3(MAP, [-3.4, -3.4, -0.02]), w: 6.8, d: 6.8, c: 'frame', fo: 0.85, o, layer: 0, k: ['inner'] },
];
const SPREAD = 1.25;
const hoodLamp = (h, i, spread) => {
  const row = add3(MAP, across((i - 3.5) * 1.3));
  const at = spread ? add3(MAP, [h.pos[0] * SPREAD, h.pos[1] * SPREAD, 0.5]) : add3(row, [0, 0, 0.5]);
  return { id: `hood-${h.id}`, type: 'lamp', at, r: h.ring ? 0.3 : 0.42, c: h.c || 'lamp', on: 1 - h.ring * 0.18, layer: 2, k: [RING_KEY[h.ring]] };
};
const hoodLabel = (h, o) => ({ id: `hood-name-${h.id}`, type: 'label', at: add3(MAP, [h.pos[0] * SPREAD, h.pos[1] * SPREAD, 0.5]), pxo: [h.dx ?? 0, h.dy ?? 22], anchor: h.anchor, text: h.name, size: 12, weight: h.ring ? 500 : 700, cls: h.minor ? 'minor' : '', o, layer: 3, k: [RING_KEY[h.ring]] });
SCENES['neighbourhoods'] = () => {
  const aria = 'Lamps lift off a row and drift onto a map of islands: the Golden Gate Bridge at the centre; Alcatraz and the Presidio close by; Lake Tahoe, Yosemite and Solano County further out; far-off tourist spots, Médoc and the Isle of Skye, at the edge. Schematic layout.';
  return {
    words: { inner: 'lamp', middle: 'lamp', outer: 'lamp' },
    frames: [
      { objs: HOODS.map((h, i) => hoodLamp(h, i, false)), aria, enter: 0.6 },
      { objs: [...islands(), ...HOODS.map((h, i) => hoodLamp(h, i, true))], dur: 1.2, aria },
      { objs: [...islands(), ...HOODS.map((h, i) => hoodLamp(h, i, true)), ...HOODS.map(h => hoodLabel(h, 1))], dur: 0.4, aria },
    ],
  };
};

// ---------- IV-2 · Features split ----------
const SPLIT = [16, -34, 0];
const COLS = [{ id: '1m', label: '1M dictionary', n: 1 }, { id: '4m', label: '4M', n: 2 }, { id: '34m', label: '34M', n: 11 }];
const colAt = c => add3(SPLIT, across(c * 4.4));
// Lamps of one column, arranged in a small cluster (schematic) [G4].
function sfLamps(c, { from = null, o = 1 } = {}) {
  const n = COLS[c].n;
  return Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2, rr = n === 1 ? 0 : n === 2 ? 0.7 : 1.15;
    const pos = add3(colAt(c), [Math.cos(a) * rr, Math.sin(a) * rr, 1.6]);
    return { id: `sf-${COLS[c].id}-${k}`, type: 'lamp', at: from ? add3(colAt(from), [0, 0, 1.6]) : pos, r: n > 2 ? 0.22 : 0.32, c: 'lamp', on: 1, o, layer: 2, k: ['sf', ...(c === 2 ? ['eleven'] : [])] };
  });
}
const colLabel = c => ({ id: `split-label-${c}`, type: 'label', at: add3(colAt(c), [0, 0, 0]), pxo: [0, 18], text: `${COLS[c].label}: ${COLS[c].n}`, size: 12, weight: 600, layer: 3, k: c === 2 ? ['eleven'] : ['sf'] });
// Earthquake features exist in the 4M and 34M dictionaries only [G6].
const quake = o => [1, 2].map(c => ({ id: `quake-${COLS[c].id}`, type: 'lamp', at: add3(colAt(c), [0, 0, -1.4]), r: 0.24, c: 'lamp', on: 0.8, o, label: 'earthquake', layer: 2, k: ['quake'] }));
SCENES['splitting'] = () => {
  const aria = 'One San Francisco lamp beside the 1M dictionary splits into 2 beside the 4M dictionary, then into 11 beside the 34M. Earthquake lamps appear under the 4M and 34M columns, with nothing like them under the 1M.';
  const base = [0, 1, 2].map(colLabel);
  return {
    words: { sf: 'lamp', eleven: 'lamp', quake: 'lamp' },
    frames: [
      { objs: [...base, ...sfLamps(0), ...sfLamps(1, { from: 0, o: 0 }), ...sfLamps(2, { from: 1, o: 0 })], aria, enter: 0.6 },
      { objs: [...base, ...sfLamps(0), ...sfLamps(1), ...sfLamps(2, { from: 1, o: 0 })], dur: 0.8, aria },
      { objs: [...base, ...sfLamps(0), ...sfLamps(1), ...sfLamps(2)], dur: 1.0, aria },
      { objs: [...base, ...sfLamps(0), ...sfLamps(1), ...sfLamps(2), ...quake(1)], dur: 0.4, aria },
    ],
  };
};

// ---------- IV-3 · What's missing ----------
// 20 London boroughs sorted by how often they appear (schematic heights). The
// 34M line leaves 12 of 20 above it: the paper's "about 60%" [H1]. The 1M and
// 4M lines are schematic, lower coverage in the order the paper reports [H2].
const BOROUGHS = Array.from({ length: 20 }, (_, i) => 0.96 * Math.pow(0.86, i) + 0.03);
// The line sits just under bar k, so exactly k + 1 bars are above it.
const LEVELS = { '1m': BOROUGHS[2] - 0.005, '4m': BOROUGHS[6] - 0.005, '34m': BOROUGHS[11] - 0.005 };
const LEVEL_KEYS = ['1m', '4m', '34m'];
export function waterObjs(key, { lampsO = 1, rise = 1 } = {}) {
  const above = BOROUGHS.filter(h => h > LEVELS[key]).length;
  return [{
    id: 'water', type: 'water', at: [32, -34, 1], pxo: [-120, -60], heights: BOROUGHS.map(h => h * rise), level: rise === 1 ? LEVELS[key] : 0,
    levelLabel: `Water level: ${key.toUpperCase()} · ${above} of 20 above`, lampsO, left: 'mentioned often', right: 'rarely', layer: 3, k: ['sixty', 'waterline'],
  }];
}
export const WATER_DEFAULT = 2;
SCENES['missing'] = () => {
  const aria = 'Twenty bars for London boroughs, sorted from often mentioned to rarely mentioned, with a water line across them. Bars above the line carry a lamp: a feature exists. At the 34M level, 12 of the 20 (60%) are above the water. Bar heights and the 1M and 4M levels are schematic.';
  return {
    words: { sixty: 'lamp', waterline: 'machine' },
    interaction: 'water-slider',
    frames: [
      { objs: waterObjs('34m', { rise: 0.02, lampsO: 0 }), aria, enter: 0.5 },
      { objs: waterObjs('34m', { lampsO: 0 }), dur: 0.6, aria },
      { objs: waterObjs('34m'), dur: 0.4, aria },
    ],
  };
};

// ---------- IV-4 · Switch one off ----------
const JOHN = [0, -48, 0];
// Lamps under the sentence: the two the paper found mattered most for "sad"
// [I5], and two that were merely bright (the words "be" and "alone") [I6].
const JOHN_LAMPS = [
  { id: 'alone-feel', name: 'wanting to be alone', key: 'alone', c: 'lamp' },
  { id: 'sadness', name: 'sadness', key: 'sadness', c: 'lamp' },
  { id: 'be', name: 'the word “be”', key: 'lit4', c: 'lamp' },
  { id: 'alone-word', name: 'the word “alone”', key: 'lit4', c: 'lamp' },
];
const johnLampAt = i => add3(JOHN, across((i - 1.5) * 2.4));
function johnObjs({ off = [], labels = 1, on = 1 } = {}) {
  const sad = 0.78 - 0.26 * off.length;     // schematic bar sizes
  const objs = [
    { id: 'john-text', type: 'label', at: add3(JOHN, [0, 0, 2.6]), text: 'John says, “I want to be alone right now.”\nJohn feels…', size: 13, weight: 600, layer: 3 },
    { id: 'john-odds', type: 'odds', at: add3(JOHN, [0, 0, -1.6]), pxo: [-50, 0], rows: [{ word: 'pull toward “sad”', p: 0 }], ps: [sad], noWin: true, hidePct: true, wpx: 110, layer: 3, k: ['switch'] },
  ];
  JOHN_LAMPS.forEach((l, i) => {
    objs.push({ id: `john-${l.id}`, type: 'lamp', at: add3(johnLampAt(i), [0, 0, 1.0]), r: 0.34, c: l.c, on: off.includes(i) ? 0.12 : on, layer: 2, k: [l.key, ...(off.includes(i) ? ['switch'] : [])] });
    objs.push({ id: `john-name-${l.id}`, type: 'label', at: add3(johnLampAt(i), [0, 0, 1.0]), pxo: [0, 26 + (i % 2) * 15], text: l.name, size: 12, weight: i < 2 ? 700 : 400, o: labels, layer: 3, k: [l.key] });
    if (off.includes(i)) objs.push({ id: `john-slash-${l.id}`, type: 'path', at: add3(johnLampAt(i), [0, 0, 1.0]), pts: [[-0.35, 0.35, 0.45], [0.35, -0.35, -0.45]], cls: 'slash', layer: 3, k: ['switch'] });
  });
  return objs;
}
SCENES['ablation'] = () => {
  const aria = 'Under the sentence “John says, I want to be alone right now. John feels…”, four lamps are lit: wanting to be alone, sadness, the word “be” and the word “alone”. A bar shows the pull toward “sad” rather than “happy”. The first lamp is switched off with a slash and the bar shrinks; then the second, and it shrinks again. Bar sizes are schematic.';
  return {
    words: { switch: 'ink', alone: 'lamp', sadness: 'lamp' },
    frames: [
      { objs: johnObjs({ labels: 0 }), aria, enter: 0.6 },
      { objs: johnObjs({ labels: 0, off: [0] }), dur: 0.6, aria },
      { objs: johnObjs({ labels: 0, off: [0, 1] }), dur: 0.6, aria },
      { objs: johnObjs({ off: [0, 1] }), dur: 0.4, aria },
    ],
  };
};

// ---------- IV-5 · A chain of ideas ----------
const KOBE = [16, -48, 0];
const CHAIN = [
  { id: 'kobe', name: 'Kobe Bryant' }, { id: 'lakers', name: 'Lakers' }, { id: 'la', name: 'Los Angeles' },
  { id: 'california', name: 'California' }, { id: 'capital', name: '“capital”' },
];
const chainAt = i => add3(KOBE, across(i * 2.3));
export function kobeObjs(mode = 'attribution', lit = CHAIN.length) {
  const objs = [];
  CHAIN.forEach((c, i) => {
    objs.push({ id: `kobe-${c.id}`, type: 'lamp', at: add3(chainAt(i), [0, 0, 1.2]), r: 0.32, c: 'lamp', on: i < lit ? 1 : 0.1, layer: 2, k: ['chain'] });
    objs.push({ id: `kobe-name-${c.id}`, type: 'label', at: add3(chainAt(i), [0, 0, 1.2]), pxo: [0, 24 + (i % 2) * 15], text: c.name, size: 12, weight: 600, o: i < lit ? 1 : 0.3, layer: 3, k: ['chain'] });
    if (i) objs.push({ id: `kobe-link-${i}`, type: 'path', at: add3(chainAt(i - 1), [0, 0, 1.2]), pts: [across(0.45), across(2.3 - 0.45)], cls: 'link', o: i < lit ? 1 : 0.2, layer: 1, k: ['chain'] });
  });
  objs.push({ id: 'kobe-answer', type: 'tile', at: add3(chainAt(CHAIN.length), [-0.2, -0.4, 0.6]), w: 3.4, word: 'Sacramento', tag: 'answer', tagO: 1, o: lit >= CHAIN.length ? 1 : 0, layer: 1, k: ['chain'] });
  const bright = mode === 'brightness';
  objs.push({ id: 'kobe-ten', type: 'tenrow', at: add3(KOBE, [0, 0, -1.4]), pxo: [-20, 46], title: bright ? 'Top 10 by brightness' : 'Top 10 by attribution', filled: bright ? 3 : 8, note: bright ? 'Only 3 of the 10 features that mattered most. (Lakers: 70th brightest.)' : '8 of the 10 features that mattered most.', layer: 3, k: ['brightest', 'attribution'] });
  return objs;
}
SCENES['chain'] = () => {
  const aria = 'A chain of linked lamps, Kobe Bryant, Lakers, Los Angeles, California and “capital”, lights link by link and leads to a tile reading Sacramento. Below, ten slots for the top 10 features: ranked by attribution, 8 of them are among the 10 that mattered most; ranked by brightness, only 3 are, and the Lakers feature is only the 70th brightest.';
  return {
    words: { chain: 'lamp', brightest: 'ink', attribution: 'machine' },
    interaction: 'rank-toggle',
    frames: [
      { objs: kobeObjs('brightness', 0), aria, enter: 0.6 },
      { objs: kobeObjs('brightness', 2), dur: 0.4, aria, hold: 0.05 },
      { objs: kobeObjs('brightness', 4), dur: 0.4, aria, hold: 0.05 },
      { objs: kobeObjs('brightness', 5), dur: 0.4, aria, hold: 0.5 },
      { objs: kobeObjs('attribution', 5), dur: 0.5, aria },
    ],
  };
};

// ---------- Recap IV ----------
// A small 3-D version of IV-3's chart for the overview: blocks for concepts,
// a translucent water plane, lamps on the blocks that rise above it.
function recapWater() {
  const W0 = [30, -34, 0], objs = [];
  BOROUGHS.slice(0, 10).forEach((hh, i) => {
    const at = add3(W0, across(i * 0.7));
    objs.push({ id: `rw-${i}`, type: 'box', at, w: 0.45, d: 0.45, h: hh * 3, c: 'raw-dim', layer: 1, k: ['water'] });
    if (hh * 3 > 1.2) objs.push({ id: `rw-lamp-${i}`, type: 'lamp', at: add3(at, [0.22, 0.22, hh * 3 + 0.3]), r: 0.16, c: 'lamp', on: 1, layer: 2, k: ['water'] });
  });
  objs.push({ id: 'rw-sea', type: 'plane', at: add3(W0, [-0.4, -0.4 - 6.5 / R3, 1.2]), w: 0.4 + 6.5 / R3 + 0.4, d: 1.3 + 6.5 / R3, c: 'machine', fo: 0.22, layer: 2, k: ['water'] });
  return objs;
}
SCENES['recap-4'] = () => {
  const aria = 'Side by side: the island map around the Golden Gate Bridge, the San Francisco lamp splitting 1, 2, 11, the water line over the boroughs, and the Kobe chain to Sacramento.';
  // Pull the four groups closer together for the overview (positions only).
  const shift = (list, d) => list.map(o => ({ ...o, at: add3(o.at || [0, 0, 0], d) }));
  const objs = [
    ...islands().map(o => ({ ...o, k: ['map'] })), ...HOODS.map((h, i) => ({ ...hoodLamp(h, i, true), k: ['map'] })),
    ...shift([...sfLamps(0), ...sfLamps(1), ...sfLamps(2)].map(o => ({ ...o, k: ['split'] })), [-7, 3, 0]),
    ...shift(recapWater(), [-16, 6, 0]),
    ...shift(kobeObjs('attribution').filter(o => o.type !== 'tenrow' && o.type !== 'label').map(o => ({ ...o, k: ['chain4'] })), [-6, 9, 0]),
  ];
  return { words: { map: 'lamp', split: 'lamp', water: 'machine', chain4: 'lamp' }, frames: [{ objs, aria, enter: 1.0 }] };
};

export const ACT4_SCENES = SCENES;
export const ACT4_TOY_VALUES = {};
export const WATER_KEYS = LEVEL_KEYS;
