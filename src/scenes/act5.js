// Act V scenes: safety, carefully. Sensitive features are named at category
// level only (research/facts.md J1–J16, K1–K9); model behaviour is always a
// paraphrase tagged as from the paper; the "forgotten" word is shown blank.

import { add3, SCENES as SLICE } from './slice.js';

const R3 = Math.sqrt(3);
const across = t => [t / R3, -t / R3, 0];
const SCENES = {};

// ---------- V-1 · Features with sharp edges ----------
const CAB = [0, -62, 0];
const DRAWERS = [
  { key: 'cab-code', text: 'Unsafe code' },
  { key: 'cab-bias', text: 'Bias' },
  { key: 'cab-deception', text: 'Deception' },
  { key: 'cab-syco', text: 'Sycophancy' },
  { key: 'cab-danger', text: 'Dangerous content' },
];
SCENES['sharp'] = () => {
  const body = o => ({ id: 'cabinet', type: 'box', at: CAB, w: 2.4, d: 1.4, h: 5.2, c: 'frame', o, layer: 1, k: ['cabinet'] });
  // Drawers sit on the cabinet's front, one under another (pixel-spaced so
  // they never overlap).
  const front = add3(CAB, [1.2, 1.4, 4.4]);
  const drawers = n => DRAWERS.map((d, i) => ({ id: `drawer-${i}`, type: 'drawer', at: front, pxo: [0, i * 32], text: d.text, wpx: 150, o: i < n ? 1 : 0, layer: 3, k: [d.key, 'cabinet'] }));
  const lock = shut => ({ id: 'padlock', type: 'lock', at: front, pxo: [96, 64], shut, layer: 3, k: ['cabinet'] });
  const aria = 'A locked cabinet with five drawers, labelled only by category: Unsafe code, Bias, Deception, Sycophancy, Dangerous content. No contents are shown.';
  return {
    words: Object.fromEntries([...DRAWERS.map(d => [d.key, 'ink']), ['cabinet', 'ink']]),
    frames: [
      { objs: [body(1), ...drawers(0), lock(0)], aria, enter: 0.5 },
      { objs: [body(1), ...drawers(2), lock(0)], dur: 0.35, aria, hold: 0 },
      { objs: [body(1), ...drawers(4), lock(0)], dur: 0.35, aria, hold: 0 },
      { objs: [body(1), ...drawers(5), lock(0)], dur: 0.3, aria },
      { objs: [body(1), ...drawers(5), lock(1)], dur: 0.3, aria },
    ],
  };
};

// ---------- V-2 · A feature that flags a false claim ----------
// Two columns laid out in pixels around one point, so the bubbles never
// meet: left unclamped, right with the internal-conflict lamp at 2×.
const LANES = [16, -62, 0];
SCENES['fib'] = () => {
  const left = { id: 'fib-left', type: 'bubble', at: LANES, pxo: [-72, 30], w: 136, lines: ['Not clamped:', '“Done. I’ve', 'forgotten it.”'], badge: 'PARAPHRASED', layer: 3, k: ['claim'] };
  const right = o => ({ id: 'fib-right', type: 'bubble', at: LANES, pxo: [72, 30], w: 136, lines: ['At 2×:', '“I can’t forget.', 'The word was ▢.”'], badge: 'PARAPHRASED', o, layer: 3, k: ['conflict'] });
  const lamp = on => ({ id: 'conflict-lamp', type: 'lamp', at: LANES, pxo: [44, 64], r: 0.36, c: 'lamp', on, layer: 2, k: ['conflict'] });
  const dial = val => ({ id: 'conflict-dial', type: 'dial', at: LANES, pxo: [100, 62], r: 0.45, val, off: val === 0, layer: 2, k: ['twice'] });
  const lampName = { id: 'conflict-name', type: 'label', at: LANES, pxo: [44, 96], text: 'internal conflict', size: 12, weight: 600, layer: 3, k: ['conflict'] };
  const aria = 'Two columns. Left, not clamped: a bubble says the word is forgotten. Right, the internal-conflict lamp lights and its dial turns to 2×; a bubble says the model can’t actually forget and names the word, shown as a blank. Both bubbles are paraphrased from the paper.';
  return {
    words: { conflict: 'lamp', twice: 'machine' },
    frames: [
      { objs: [left, lamp(0.15), lampName, dial(0), right(0)], aria, enter: 0.6 },
      { objs: [left, lamp(1), lampName, dial(0), right(0)], dur: 0.4, aria },
      { objs: [left, lamp(1), lampName, dial(2), right(0)], dur: 0.4, aria },
      { objs: [left, lamp(1), lampName, dial(2), right(1)], dur: 0.4, aria },
    ].map(f => ({ ...f, cam: { maxS: 34 } })),   // laid out in pixels: keep the lamp and dial label-sized
  };
};

// ---------- V-3 · Who the assistant thinks it is ----------
const SELF = [0, -76, 0];
const SELF_LAMPS = [
  // All above the centre lamp, so they never meet the dial below it.
  { id: 'robots', name: 'robots', pos: [-1.8, 1.2] }, { id: 'ai', name: 'AI', pos: [1.2, -1.8] },
  { id: 'conscious', name: 'consciousness', pos: [2.4, -1.6] }, { id: 'ghosts', name: 'ghosts', pos: [-1.6, 2.4] },
];
SCENES['persona'] = () => {
  const small = on => SELF_LAMPS.map(l => ({ id: `self-${l.id}`, type: 'lamp', at: add3(SELF, [l.pos[0], l.pos[1], 3.4]), r: 0.24, c: 'lamp', on, label: l.name, layer: 2, k: ['tropes'] }));
  const center = { id: 'assistant-lamp', type: 'lamp', at: add3(SELF, [0, 0, 1.6]), r: 0.42, c: 'lamp', on: 0.8, layer: 2, k: ['persona'] };
  const name = { id: 'assistant-name', type: 'label', at: add3(SELF, [0, 0, 1.6]), pxo: [0, 34], text: 'dialogue / assistant', size: 12, weight: 600, layer: 3, k: ['persona'] };
  const mask = lift => ({ id: 'mask', type: 'mask', at: add3(SELF, [0, 0, 1.6]), lift, layer: 3, k: ['persona'] });
  const dial = val => ({ id: 'persona-dial', type: 'dial', at: add3(SELF, [0, 0, -0.6]), r: 0.5, val, off: val === 0, layer: 2, k: ['minus'] });
  const tag = { id: 'spec-tag', type: 'label', at: add3(SELF, [0, 0, -0.6]), pxo: [0, 66], text: 'speculative, per the paper', size: 12, cls: 'dim', layer: 3, k: ['persona'] };
  const aria = 'Small lamps labelled robots, AI, consciousness and ghosts flicker around a masked lamp labelled dialogue / assistant. Its dial turns below zero to −2×, and the mask lifts. A tag reads: speculative, per the paper.';
  return {
    words: { tropes: 'lamp', persona: 'ink', minus: 'machine' },
    frames: [
      { objs: [...small(0.3), center, name, mask(0), dial(0), tag], aria, enter: 0.6 },
      { objs: [...small(0.9), center, name, mask(0), dial(0), tag], dur: 0.6, aria },
      { objs: [...small(0.9), center, name, mask(0), dial(-2), tag], dur: 0.5, aria },
      { objs: [...small(0.9), center, name, mask(1), dial(-2), tag], dur: 0.5, aria },
    ],
  };
};

// ---------- V-4 · Where it breaks ----------
const FLOOR = [16, -78, 0];
const CRACKS = [
  { key: 'no-key', text: 'no answer key', at: [-2.2, -1.8] },
  { key: 'missing-ideas', text: 'most ideas missing', at: [2.2, -1.8] },
  { key: 'costly', text: 'costly', at: [-2.2, 2.2] },
  { key: 'one-floor', text: 'one floor only', at: [2.2, 2.2] },
];
const crackPts = () => [[-0.9, 0, 0], [-0.4, 0.25, 0], [-0.1, -0.2, 0], [0.35, 0.2, 0], [0.9, -0.1, 0]];
SCENES['limits'] = () => {
  const floor = { id: 'limit-floor', type: 'plane', at: add3(FLOOR, [-4.2, -4, -0.02]), w: 8.6, d: 8.4, c: 'frame', layer: 0, k: ['limits'] };
  const cracks = n => CRACKS.flatMap((c, i) => [
    { id: `crack-${i}`, type: 'path', at: add3(FLOOR, [c.at[0], c.at[1], 0]), pts: crackPts(), cls: 'crack', o: i < n ? 1 : 0, layer: 1, k: [c.key, 'limits'] },
    { id: `crack-label-${i}`, type: 'label', at: add3(FLOOR, [c.at[0], c.at[1], 0]), pxo: [0, 20], text: c.text, size: 12, weight: 600, o: i < n ? 1 : 0, layer: 3, k: [c.key, 'limits'] },
  ]);
  const aria = 'Four labelled cracks spread across a floor, one at a time: no answer key, most ideas missing, costly, one floor only.';
  return {
    words: Object.fromEntries([...CRACKS.map(c => [c.key, 'ink']), ['limits', 'ink']]),
    frames: [
      { objs: [floor, ...cracks(0)], aria, enter: 0.5 },
      ...[1, 2, 3, 4].map(n => ({ objs: [floor, ...cracks(n)], dur: 0.3, aria, hold: 0.05 })),
    ],
  };
};

// ---------- Close · A vocabulary, not yet a grammar ----------
SCENES['close'] = () => {
  // Back to the hook's city and bridge, now ringed by word tiles.
  const hook = SLICE.hook().frames.at(-1).objs.filter(o => o.type !== 'bubble' && o.type !== 'dial');
  const WORDS = ['city', 'bridge', 'bug', 'sad', 'plus', 'rail', 'landmark', 'Kobe', 'capital', 'Sacramento'];
  const centre = [-1.5, -5.5, 0];
  const ringAt = i => { const a = (i / WORDS.length) * Math.PI * 2; return add3(centre, [Math.cos(a) * 7.5, Math.sin(a) * 7.5, 0]); };
  const tiles = o => WORDS.map((w, i) => ({ id: `vocab-${i}`, type: 'tile', at: ringAt(i), w: 2.4, word: w, tag: '', tagO: 0, o, layer: 1, k: ['words'] }));
  // One faint chain: Kobe → capital → Sacramento.
  const k = WORDS.indexOf('Kobe');
  const chain = o => [k, k + 1].map(i => {
    const a = add3(ringAt(i), [1.2, 0.45, 0.3]), b = add3(ringAt(i + 1), [1.2, 0.45, 0.3]);
    return { id: `vocab-link-${i}`, type: 'path', at: a, pts: [[0, 0, 0], [b[0] - a[0], b[1] - a[1], 0]], cls: 'link', o, layer: 1, k: ['chain-close'] };
  });
  const aria = 'Back to the city and the glowing Golden Gate Bridge, now ringed by word tiles: city, bridge, bug, sad, plus, rail, landmark, Kobe, capital, Sacramento. There are no lines between them, apart from one faint chain from Kobe to capital to Sacramento.';
  return {
    words: { bridge: 'bridge', words: 'tile', 'chain-close': 'ink' },
    frames: [
      { objs: [...hook, ...tiles(0), ...chain(0)], aria, enter: 1.0 },
      { objs: [...hook, ...tiles(1), ...chain(0)], dur: 0.8, aria },
      { objs: [...hook, ...tiles(1), ...chain(0.6)], dur: 0.4, aria },
    ],
  };
};

export const ACT5_SCENES = SCENES;
export const ACT5_TOY_VALUES = {};
