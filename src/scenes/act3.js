// Act III scenes: are the features real? Pure data like the other acts.
// Toy values come from the trained toy SAE; paper values from
// research/facts.md (C1–C14, D1–D11, E1–E8, F1–F4) and are only ever
// labels or schematic marks, never computed.

import * as toy from '../toy/model.js';
import { run, featureIdea, decoderCol, featureMax } from '../toy/trained.js';
import { tiles, floors, climbAt, column, SIDE, TOWER, roofZ, add3 } from './slice.js';

const MID = toy.MIDDLE_FLOOR;
const R3 = Math.sqrt(3);
const across = t => [t / R3, -t / R3, 0];
const WORDS = toy.SENTENCE;

// ---------- the toy's Golden Gate feature ----------
const GGB = [...Array(8).keys()].find(i => featureIdea(i) === 'ggb');
// Its strongest natural brightness over toy data: the unit for "10×" (as in
// the paper, where clamps are multiples of the max over the SAE's data [D2]).
// Computed on first use, not at page load.
const ggbMax = () => featureMax(GGB);
const heatOf = w => run(toy.listAt(w, MID)).f[GGB] / ggbMax();

// ---------- III-1 · What lights it up ----------
const LAMP_AT = [6.5, -2.5, 2.6];
const ggbLamp = (on = 1, extra = {}) => ({ id: 'ggb-lamp', type: 'lamp', at: LAMP_AT, r: 0.42, c: 'bridge', on, layer: 2, k: ['ggb-lamp'], ...extra });
const nameTag = (o = 1) => ({ id: 'ggb-name', type: 'label', at: add3(LAMP_AT, [0, 0, -0.85]), text: 'named: “Golden Gate Bridge”', size: 12, weight: 600, o, layer: 3, k: ['ggb-lamp'] });
const SCENES = {};
SCENES['lights'] = () => {
  const heated = (upTo = WORDS.length) => tiles().map((t, i) => ({ ...t, heat: i < upTo ? heatOf(WORDS[i]) : 0, tagO: 0 }));
  const legend = { id: 'legend', type: 'legend', at: add3(LAMP_AT, [0, 0, 1.2]), pxo: [-75, -40], wpx: 150, left: 'off', right: 'brightest', layer: 3, k: ['legend'] };
  const aria = `Our sentence returns as tiles, each tinted from white (off) to orange (brightest) by how brightly the toy’s Golden Gate Bridge feature lights on it: ${WORDS.filter(w => heatOf(w) > 0.05).join(', ')} glow; the rest stay white. A lamp hangs above with a name tag, “Golden Gate Bridge”.`;
  return {
    words: { 'ggb-lamp': 'bridge', legend: 'bridge' },
    frames: [
      { objs: [...heated(0), ggbLamp(0.15), legend], aria, enter: 0.6 },
      { objs: [...heated(5), ggbLamp(0.4), legend], dur: 0.4, aria, hold: 0 },
      { objs: [...heated(), ggbLamp(1), legend], dur: 0.4, aria },
      { objs: [...heated(), ggbLamp(1), legend, nameTag()], dur: 0.4, aria },
    ],
  };
};

// ---------- III-2 · Grading the labels ----------
const G2 = [2, -12, 2.4];
const PAPER_FEATURES = [
  { id: 'ggb', name: 'Golden Gate Bridge', c: 'bridge' },
  { id: 'brain', name: 'brain sciences', c: 'lamp' },
  { id: 'tourist', name: 'tourist attractions', c: 'lamp' },
  { id: 'transit', name: 'transit', c: 'lamp' },
];
const fourLamps = (on = 1) => PAPER_FEATURES.map((f, n) => ({
  id: `pf-${f.id}`, type: 'lamp', at: add3(G2, across(n * 2.2)), r: 0.34, c: f.c, on, label: f.name, layer: 2, k: ['four'],
}));
SCENES['grading'] = () => {
  const bins = drop => ({ id: 'bins', type: 'bins', at: add3(G2, [0, 0, -2.0]), pxo: [-20, 0], drop, caption: 'bright → mostly 3 · faint → spread out', layer: 3, k: ['bins'] });
  const aria = 'Four lamps for the paper’s four tour features: Golden Gate Bridge, brain sciences, tourist attractions and transit. Below, four bins labelled 0 to 3. Dots drop in: most land in bin 3, a few spread across the lower bins. Schematic: the paper reports the trend, not these counts.';
  return {
    words: { four: 'lamp', bins: 'ink' },
    frames: [
      { objs: fourLamps(), aria, enter: 0.6 },
      { objs: [...fourLamps(), bins(0)], dur: 0.4, aria },
      { objs: [...fourLamps(), bins(1)], dur: 1.0, aria },
    ],
  };
};

// ---------- III-3 · Any language, even pictures ----------
const LANG0 = [1, 8, 0];
const LANGS = [
  { word: 'Γκόλντεν Γκέιτ', tag: 'Greek' },
  { word: 'Золотые Ворота', tag: 'Russian' },
  { word: 'Cầu Cổng Vàng', tag: 'Vietnamese' },
  { word: '金门大桥', tag: 'Chinese' },
];
const LANG_STEP = 4.2;
const langTile = (l, i, o = 1) => ({ id: `lang-${i}`, type: 'tile', at: add3(LANG0, [i * LANG_STEP, 0, 0]), w: 3.9, word: l.word, tag: l.tag, tagO: 1, heat: o ? 0.85 : 0, o, layer: 1, k: ['languages'] });
SCENES['languages'] = () => {
  const lampAt = add3(LANG0, [8, -5, 2.8]);
  const lamp = on => ({ ...ggbLamp(on), at: lampAt, label: 'Golden Gate Bridge' });
  const photo = o => ({ id: 'photo', type: 'card', at: add3(LANG0, [LANGS.length * LANG_STEP + 1.6, -1.2, 0.9]), glyph: 'photo', label: 'a photo', flip: o, o, layer: 3, k: ['photos'] });
  const row = n => LANGS.map((l, i) => langTile(l, i, i < n ? 1 : 0));
  const aria = 'Tiles reading the Golden Gate Bridge’s name in Greek, Russian, Vietnamese and Chinese arrive one by one, each labelled with its language, then a small photo card. The bridge lamp lights for each. The scripts are illustrative; the paper doesn’t name its languages.';
  return {
    words: { languages: 'tile', photos: 'ink' },
    frames: [
      { objs: [...row(1), lamp(0.6), photo(0)], aria, enter: 0.6 },
      { objs: [...row(2), lamp(0.75), photo(0)], dur: 0.3, aria, hold: 0.1 },
      { objs: [...row(3), lamp(0.85), photo(0)], dur: 0.3, aria, hold: 0.1 },
      { objs: [...row(4), lamp(0.95), photo(0)], dur: 0.3, aria, hold: 0.1 },
      { objs: [...row(4), lamp(1), photo(1)], dur: 0.5, aria },
    ],
  };
};

// ---------- III-4 · Turn the dial ----------
// The toy does what the paper does [D1]: swap the SAE's rebuild for one with
// the bridge feature fixed, keep the error term, and carry on. In the toy's
// tower the floors above the middle add the same thing whatever comes in, so
// the change at the middle floor reaches the roof unchanged.
const CANDS = ['sunset', 'night', 'dawn', 'bridge'];
export function clampResult(mult) {
  const mid = toy.listAt('at', MID), roof = toy.listAt('at', toy.FLOORS);
  const f0 = run(mid).f[GGB];
  const delta = mult == null ? 0 : mult * ggbMax() - f0;
  const W = decoderCol(GGB);
  const edited = mid.map((v, k) => v + delta * W[k]);
  const roofEdited = roof.map((v, k) => v + delta * W[k]);
  const odds = toy.nextWordOdds(roofEdited, CANDS);
  return { edited, ps: CANDS.map(w => odds.find(o => o.word === w).p) };
}
const COL_SIDE = add3(climbAt(MID), SIDE);
const DIAL_AT = add3(COL_SIDE, across(3.8));
export function clampObjs(mult, { stage = 'done' } = {}) {
  const r = clampResult(mult);
  const fl = floors(MID);
  const back = stage === 'done' || stage === 'back';
  // Drawn at a smaller scale than elsewhere: at 10× the edited list is about ten times its usual size.
  const col = column('col-snap', r.edited, back ? climbAt(MID) : COL_SIDE, { k: ['back'], c: 'raw', unit: 0.32, layer: 3 });
  const odds = { id: 'odds', type: 'odds', at: [TOWER.x + 1.5, TOWER.y + 1.5, roofZ + 1.0], pxo: [-30, -96], rows: CANDS.map(w => ({ word: w, p: 0 })), ps: stage === 'done' ? r.ps : clampResult(null).ps, noWin: true, wpx: 100, layer: 3, k: ['guess'] };
  const lampAt = add3(DIAL_AT, [0, 0, 1.9]);
  const lamp = { ...ggbLamp(mult == null ? run(toy.listAt('at', MID)).f[GGB] / ggbMax() : Math.max(0, Math.min(1, mult / 2))), at: lampAt };
  const lampName = { id: 'ggb3-name', type: 'label', at: lampAt, pxo: [18, 0], text: 'Golden Gate Bridge', anchor: 'start', size: 12, weight: 600, layer: 3, k: ['clamping'] };
  const dial = { id: 'dial-ggb3', type: 'dial', at: DIAL_AT, r: 0.62, val: mult ?? 0, off: mult == null, layer: 3, k: ['clamping'] };
  return [...fl, col, odds, lamp, lampName, dial];
}
SCENES['dial'] = () => {
  const before = clampResult(null), after = clampResult(10);
  const pct = ps => CANDS.map((w, i) => `${w} ${Math.round(ps[i] * 100)}%`).join(', ');
  const aria = `The toy tower with its middle floor lit. Beside it, the bridge lamp’s dial turns from off to 10×. The edited list slides back into the middle floor, and above the roof the toy’s next-word odds after “at” change from ${pct(before.ps)} to ${pct(after.ps)}.`;
  return {
    words: { clamping: 'machine', back: 'raw', guess: 'raw' },
    interaction: 'clamp-dial',
    frames: [
      { objs: clampObjs(null, { stage: 'side' }), aria, enter: 0.7 },
      { objs: clampObjs(10, { stage: 'side' }), dur: 0.6, aria },
      { objs: clampObjs(10, { stage: 'back' }), dur: 0.7, aria },
      { objs: clampObjs(10), dur: 0.6, aria },
    ].map(f => ({ ...f, cam: { fit: ['odds', 'floor-0', 'floor-5', 'col-snap', 'dial-ggb3', 'ggb-lamp', 'ggb3-name'] } })),
  };
};

// ---------- III-5 · A feature for code mistakes ----------
const CODE0 = [0, -20, 0];
const CODE = [
  { word: 'left + rihgt', tag: 'Python', bug: true },
  { word: 'left + rihgt;', tag: 'C', bug: true },
  { word: '(+ left rihgt)', tag: 'Scheme', bug: true },
  { word: 'teh cat sat', tag: 'English typo', bug: false },
];
SCENES['code'] = () => {
  const codeTiles = glow => CODE.map((c, i) => ({ id: `code-${i}`, type: 'tile', at: add3(CODE0, [i * 3.1, 0, 0]), w: 2.9, word: c.word, tag: c.tag, tagO: 1, heatC: 'lamp', heat: c.bug ? glow : 0, layer: 1, k: [c.bug ? 'mistakes' : 'typos'] }));
  const lampAt = add3(CODE0, [2.5, -4.5, 3]);
  const lamp = on => ({ id: 'code-lamp', type: 'lamp', at: lampAt, r: 0.38, c: 'lamp', on, label: 'code error', layer: 2, k: ['mistakes'] });
  const dial = (val, off = false) => ({ id: 'dial-code', type: 'dial', at: add3(lampAt, [0, 0, -1.9]), r: 0.6, val, off, layer: 3, k: ['below'] });
  const term = which => ({ id: 'terminal', type: 'bubble', at: add3(CODE0, [3 * 3.1 + 1.0, -5.5, 2.4]), w: 200, lines: which === 'pos' ? ['Correct code, clamped +3×:', 'predicts an error.'] : ['Buggy code, clamped −5×:', 'predicts the bug-free “3”.'], badge: 'PARAPHRASED · FROM THE PAPER', layer: 3, k: ['below'] });
  const aria = 'Three tiles of code with a misspelled variable (in Python, C and Scheme) glow; a tile with an English typo stays dark. A dial on the code-error lamp turns to +3×, and a card paraphrasing the paper says the model predicts an error for correct code; then the dial goes below zero to −5×, and the card says the model predicts the bug-free output.';
  return {
    words: { mistakes: 'lamp', typos: 'ink', below: 'machine' },
    frames: [
      { objs: [...codeTiles(0), lamp(0.2), dial(0, true)], aria, enter: 0.6 },
      { objs: [...codeTiles(0.85), lamp(1), dial(0, true)], dur: 0.6, aria },
      { objs: [...codeTiles(0.85), lamp(1), dial(3), term('pos')], dur: 0.6, aria, hold: 0.6 },
      { objs: [...codeTiles(0.85), lamp(0.3), dial(-5), term('neg')], dur: 0.6, aria },
    ],
  };
};

// ---------- III-6 · Features beat neurons ----------
// Schematic dots: 82% of them left of the 0.3 line (the paper's numbers [F1]);
// their exact positions are drawn, not data.
const STRIP_PTS = Array.from({ length: 50 }, (_, k) => {
  const left = k < 41;                       // 41 of 50 = 82%
  const a = (k * 0.6180339887) % 1, b = (k * 0.7548776662) % 1;
  return [left ? 0.02 + a * 0.26 : 0.32 + a * 0.4, b];
});
SCENES['neurons'] = () => {
  const strip = (drop, shadeO) => ({ id: 'strip', type: 'strip', at: [0, -28, 2], pxo: [-130, -50], wpx: 260, pts: STRIP_PTS, label: '82%', drop, shadeO, layer: 3, k: ['shaded', 'line'] });
  const aria = 'A schematic strip chart. The horizontal axis is “best match with any neuron”, from 0 to 1, with a dashed line at 0.3. Each dot is a feature. 82% of the dots sit left of the line, in a shaded zone labelled 82%.';
  return {
    words: { shaded: 'bridge', line: 'ink' },
    frames: [
      { objs: [strip(0, 0)], aria, enter: 0.5 },
      { objs: [strip(1, 0)], dur: 1.0, aria },
      { objs: [strip(1, 1)], dur: 0.4, aria },
    ],
  };
};

// ---------- Recap III ----------
SCENES['recap-3'] = () => {
  // Paper clamp values (D5–D8, E3).
  const five = [
    { id: 'ggb', name: 'Golden Gate', c: 'bridge', val: 10 },
    { id: 'brain', name: 'brain sciences', c: 'lamp', val: 10 },
    { id: 'tourist', name: 'tourist', c: 'lamp', val: 8 },
    { id: 'transit', name: 'transit', c: 'lamp', val: 5 },
    { id: 'code', name: 'code error', c: 'lamp', val: 3 },
  ];
  const at = n => add3(G2, across(n * 2.3));
  const objs = five.flatMap((f, n) => [
    { id: `rc3-lamp-${f.id}`, type: 'lamp', at: add3(at(n), [0, 0, 1.3]), r: 0.32, c: f.c, on: 1, label: f.name, layer: 2, k: ['lamps3'] },
    { id: `rc3-dial-${f.id}`, type: 'dial', at: add3(at(n), [0, 0, -0.6]), r: 0.5, val: f.val, layer: 2, k: ['dials3'] },
  ]);
  const aria = 'Five lit lamps, each with its dial at the clamp the paper reports: Golden Gate Bridge 10×, brain sciences 10×, tourist attractions 8×, transit 5×, code error 3×.';
  return { words: { lamps3: 'lamp', dials3: 'machine' }, frames: [{ objs, aria, enter: 0.9 }] };
};

export const ACT3_SCENES = SCENES;
export const ACT3_TOY_VALUES = {};
