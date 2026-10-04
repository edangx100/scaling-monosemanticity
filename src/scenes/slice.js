// Scenes for the hook, primer and Act I. Pure data: each step returns
// keyframes of objects with stable ids (no DOM here), so the renderer and
// tests can import it too. Every toy value is computed from src/toy/model.js.

import * as toy from '../toy/model.js';

// ---------- world layout ----------
const STREET = { x0: -6, y: 3, step: 1.75, w: 1.6 };
const TOWER = { x: 10, y: -3, size: 3, gap: 1.1 };
const ROOM = { c: [17.5, -4, 3.4], size: 4.4, L: 2.0 };
const tileAt = i => [STREET.x0 + i * STREET.step, STREET.y, 0];
const tileTop = i => { const [x, y] = tileAt(i); return [x + STREET.w / 2, y + 0.45, 1.9]; };
const floorZ = i => i * TOWER.gap;
const climbAt = floor => [TOWER.x + 1.5, TOWER.y + 3.3, floorZ(floor) + 0.45];
const roofZ = floorZ(toy.FLOORS) + 0.3;
const SIDE = [3.4, -2.0, 0.3];   // where the middle-floor snapshot sits, beside the tower
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

const MID = toy.MIDDLE_FLOOR;
const WORDS = toy.SENTENCE;
const BRIDGE_I = WORDS.indexOf('Bridge');
const AT_I = WORDS.indexOf('at');

// ---------- object helpers ----------
const tiles = ({ spread = 1, tags = 1, hide = [] } = {}) => WORDS.map((w, i) => {
  const [x, y, z] = tileAt(i);
  const pinch = (1 - spread) * (STREET.step - STREET.w) * (i - 4.5);
  return { id: `tile-${i}`, type: 'tile', at: [x - pinch, y, z], w: STREET.w, word: w, tag: String(toy.tokenId(w)), tagO: tags, o: hide.includes(i) ? 0 : 1, k: ['tiles'], layer: 1 };
});
const column = (id, vals, at, extra = {}) => ({ id, type: 'bars', at, vals, unit: 1.3, bw: 0.36, gap: 0.1, layer: 2, ...extra });
const floors = (hi = -1) => Array.from({ length: toy.FLOORS }, (_, i) => ({
  id: `floor-${i}`, type: 'box', at: [TOWER.x, TOWER.y, floorZ(i)], w: TOWER.size, d: TOWER.size, h: 0.32,
  c: i === hi ? 'machine' : 'frame', k: i === hi ? ['middle', 'tower'] : ['tower'], layer: 1, zi: i,
}));
const middleLabel = () => ({ id: 'mid-label', type: 'label', at: [TOWER.x + 3.4, TOWER.y + 1.5, floorZ(MID) + 0.2], text: 'middle layer', anchor: 'start', size: 12, cls: 'dim', layer: 3, k: ['middle'] });
const listVals = (word, floor) => toy.listAt(word, floor);
const roomObj = () => ({ id: 'room', type: 'room', at: ROOM.c, size: ROOM.size, layer: 0 });

// The 8 idea arrows in the room, with lamps at their tips.
const ideaArrows = (on = 1, extra = {}) => toy.CONCEPTS.map(c => ({
  id: `idea-${c.id}`, type: 'arrow', at: ROOM.c, v: toy.DIRS[c.id], len: ROOM.L * on, c: c.id === 'ggb' ? 'bridge' : 'lamp', lamp: true, sw: 2.5, k: ['ideas'], layer: 2, o: on ? 1 : 0, ...extra,
}));

// ---------- steps ----------
export const SCENES = {};

// Hook: a small city by a bay, a bridge, and a lamp with a dial.
SCENES.hook = () => {
  const city = [[-7, -9, 2.6], [-5.6, -9.4, 1.7], [-7.2, -7.4, 1.2], [-5.4, -7.6, 3.2], [-3.8, -9.2, 2.1]].map(([x, y, h], i) => ({ id: `bld-${i}`, type: 'box', at: [x, y, 0], w: 1.2, d: 1.2, h, c: 'frame', layer: 1 }));
  const water = { id: 'water', type: 'plane', at: [-3, -6.6, -0.02], w: 7, d: 6.5, c: 'water', layer: 0 };
  const bridge = (glow = 0) => ({ id: 'bridge', type: 'bridge', at: [-2.8, -3.9, 0.1], span: 6.4, glow, k: ['bridge'], layer: 1 });
  const lamp = on => ({ id: 'lamp-ggb', type: 'lamp', at: [5.4, -2.2, 2.3], r: 0.42, c: 'bridge', on, k: ['bridge'], layer: 2 });
  const dial = val => ({ id: 'dial-ggb', type: 'dial', at: [5.4, -2.2, 0.9], r: 0.62, val, k: ['dial'], layer: 2 });
  const bubble = { id: 'bubble-hook', type: 'bubble', at: [-1.2, -6.5, 3.6], w: 230, lines: ['Asked about its body, the model', 'said it was the Golden Gate Bridge.'], badge: 'PARAPHRASE · FROM THE PAPER', layer: 3 };
  const base = [water, ...city];
  const aria = 'A small isometric city by a bay with a suspension bridge. Beside it, a lamp with a dial. The dial is turned up to 10 times, the lamp glows orange and the bridge glows. A speech bubble, labelled paraphrase from the paper, says: asked about its body, the model said it was the Golden Gate Bridge.';
  return {
    words: { bridge: 'bridge', dial: 'machine' },
    frames: [
      { objs: [...base, bridge(0), lamp(0), dial(0)], aria, enter: 0.8 },
      { objs: [...base, bridge(0), lamp(0.2), dial(10)], dur: 0.6, aria },
      { objs: [...base, bridge(1), lamp(1), dial(10)], dur: 0.4, aria },
      { objs: [...base, bridge(1), lamp(1), dial(10), bubble], dur: 0.4, aria },
    ],
  };
};

// P1 · Words become tiles
SCENES.tiles = () => {
  const plank = { id: 'plank', type: 'box', at: [STREET.x0, STREET.y, 0], w: WORDS.length * STREET.step - 0.15, d: 0.9, h: 0.22, c: 'paper', text: 'We drove across the Golden Gate Bridge at sunset.', size: 13, k: ['tiles'], layer: 1 };
  const aria = 'The sentence “We drove across the Golden Gate Bridge at sunset.” splits into ten tiles along a street, each with a small number tag: its ID in the toy vocabulary.';
  return {
    words: { tiles: 'tile', tags: 'tile' },
    frames: [
      { objs: [plank], aria, enter: 0.7 },
      { objs: tiles({ spread: 0, tags: 0 }), dur: 0.5, aria, hold: 0.1 },
      { objs: tiles({ spread: 1, tags: 0 }), dur: 0.5, aria },
      { objs: tiles({ spread: 1, tags: 1 }).map(t => ({ ...t, k: ['tiles', 'tags'] })), dur: 0.5, aria },
    ],
  };
};

// P2 · Tiles become lists of numbers
SCENES.numbers = () => {
  const cols = (grow = WORDS.map(() => 1)) => WORDS.map((w, i) => column(`col-${i}`, listVals(w, 0).map(v => v * grow[i]), tileTop(i), { k: ['column'], c: i === BRIDGE_I ? 'raw' : 'raw-dim' }));
  const zero = WORDS.map(() => 0), onlyBridge = WORDS.map((_, i) => (i === BRIDGE_I ? 1 : 0));
  const realAt = [4.2, -2.6, 2.6];
  const real = { id: 'real-col', type: 'bars', at: realAt, vals: Array.from({ length: 24 }, (_, j) => Math.sin(j * 1.37) * 0.9), unit: 1.4, bw: 0.07, gap: 0.04, c: 'raw-dim', k: ['real'], layer: 2 };
  const realLabel = { id: 'real-label', type: 'label', at: add3(realAt, [0, 0, -1.9]), text: 'a real model:\nfar more numbers\n(count not reported)', size: 11, cls: 'dim', k: ['real'], layer: 3 };
  const aria = 'Each tile now has a column of three bars above it, up for positive and down for negative. The Bridge column is the darkest. Beside the street, a faint, much taller column stands for a real model, whose count isn’t reported.';
  const t = tiles();
  return {
    words: { column: 'raw', real: 'raw' },
    frames: [
      { objs: [...t, ...cols(zero)], aria, enter: 0.6 },
      { objs: [...t, ...cols(onlyBridge)], dur: 0.6, aria },
      { objs: [...t, ...cols()], dur: 0.6, aria },
      { objs: [...t, ...cols(), real, realLabel], dur: 0.4, aria },
    ],
  };
};

// P3 · The list rises through the floors
SCENES.floors = () => {
  const t = tiles({ hide: [0, 1, 2, 3, 4, 5] }); // the camera frames the tower; early tiles would be cut off
  const climb = f => column('col-climb', listVals('Bridge', f), climbAt(f), { k: ['column'] });
  const flash = o => ({ id: 'flash', type: 'flash', at: add3(climbAt(MID), [0, 0, 0.6]), o, k: ['snapshot'], layer: 3 });
  const snap = out => column('col-snap', listVals('Bridge', MID), add3(climbAt(MID), out ? SIDE : [0, 0, 0]), { k: ['snapshot'], c: 'raw', o: out ? 1 : 0, layer: 3 });
  const snapLabel = { id: 'snap-label', type: 'label', at: add3(add3(climbAt(MID), SIDE), [0, 0, 2.3]), text: 'snapshot', size: 12, cls: 'dim', k: ['snapshot'], layer: 3 };
  const aria = 'The camera pans to a tower of six floors. The Bridge column climbs floor by floor, its three bars shifting a little at each one. At the middle floor, a camera flash, and a copy of the column slides out to the side, labelled snapshot.';
  const fl = floors(MID);
  return {
    words: { middle: 'machine', snapshot: 'raw' },
    frames: [
      { objs: [...t, ...fl, climb(0)], aria, enter: 0.8 },
      { objs: [...t, ...fl, climb(1)], dur: 0.45, aria, hold: 0 },
      { objs: [...t, ...fl, climb(2)], dur: 0.45, aria, hold: 0 },
      { objs: [...t, ...fl, middleLabel(), climb(MID), flash(0)], dur: 0.45, aria, hold: 0 },
      { objs: [...t, ...fl, middleLabel(), climb(MID), flash(1), snap(false)], dur: 0.2, aria, hold: 0 },
      { objs: [...t, ...fl, middleLabel(), climb(MID), flash(0), snap(true), snapLabel], dur: 0.6, aria },
    ].map((f, i) => ({ ...f, cam: { fit: [...fl.map(o => o.id), 'tile-6', 'tile-9', 'col-snap', 'snap-label', 'mid-label', 'col-climb'] } })),
  };
};

// P4 · The top floor makes a guess
SCENES.guess = () => {
  const roofList = listVals('at', toy.FLOORS);
  const odds = toy.nextWordOdds(roofList, ['sunset', 'night', 'dawn']);
  const fl = floors(MID);
  const climb = f => column('col-climb', listVals('at', f), climbAt(f), { k: ['column'] });
  const oddsObj = grow => ({ id: 'odds', type: 'odds', at: [TOWER.x + 1.5, TOWER.y + 1.5, roofZ + 2.6], rows: odds, ps: odds.map(o => o.p * grow), wpx: 110, k: ['odds'], layer: 3 });
  const roofLabel = { id: 'roof-label', type: 'label', at: [TOWER.x + 1.5, TOWER.y + 1.5, roofZ + 3.4], text: 'next-word odds', size: 12, cls: 'dim', layer: 3, k: ['odds'] };
  const t = (dropped) => tiles({ hide: dropped ? [0, 1, 2, 3, 4, 9] : [0, 1, 2, 3, 4, 8, 9] }).map((o, i) => (i === 8 && dropped ? { ...o, k: ['tiles', 'winner'] } : o));
  const falling = { ...tiles()[8], at: [TOWER.x + 1.5, TOWER.y + 1.5, roofZ + 0.8], o: 1, k: ['winner'] };
  const aria = `On the tower’s roof, three bars give the toy’s next-word odds after “at”: ${odds.map(o => `${o.word} ${Math.round(o.p * 100)}%`).join(', ')}. The winning word, sunset, drops onto the end of the sentence.`;
  return {
    words: { odds: 'raw', winner: 'tile' },
    frames: [
      { objs: [...t(false), ...fl, middleLabel(), climb(MID)], aria, enter: 0.7 },
      { objs: [...t(false), ...fl, middleLabel(), climb(toy.FLOORS)], dur: 0.6, aria },
      { objs: [...t(false), ...fl, middleLabel(), climb(toy.FLOORS), oddsObj(1), roofLabel, { ...falling, o: 0 }], dur: 0.6, aria },
      { objs: [...t(false), ...fl, middleLabel(), climb(toy.FLOORS), oddsObj(1), roofLabel, falling], dur: 0.3, aria },
      { objs: [...t(true), ...fl, middleLabel(), climb(toy.FLOORS), oddsObj(1), roofLabel], dur: 0.8, aria },
    ].map(f => ({ ...f, cam: { fit: [...fl.map(o => o.id), 'odds', 'roof-label', 'tile-5', 'tile-8', 'col-climb'] } })),
  };
};

// I-1 · Look at one number
const BIG = { at: add3(climbAt(MID), SIDE), unit: 1.25, bw: 0.55, gap: 0.22 };
const bigCol = (vals, extra = {}) => ({ id: 'col-big', type: 'bars', at: BIG.at, vals, unit: BIG.unit, bw: BIG.bw, gap: BIG.gap, hi: toy.WATCHED_SLOT, hiLabel: 'slot #2', k: ['slot', 'slot2'], layer: 2, ...extra });
const tokenLabel = word => ({ id: 'token-label', type: 'label', at: add3(BIG.at, [0, 0, 2.3]), text: `token: “${word}”`, size: 13, weight: 600, k: ['passing'], layer: 3 });
SCENES['one-number'] = () => {
  const fl = floors(MID);
  const seq = ['We', 'Gate', 'drove'];
  const aria = `Zoomed in on the middle floor: one column of three bars, with bar 2 bracketed as slot #2. Tokens pass through one at a time (${seq.join(', ')}) and slot #2 changes height for each.`;
  return {
    words: { slot: 'raw', passing: 'ink' },
    frames: [
      { objs: [...fl, bigCol(listVals(seq[0], MID)), tokenLabel(seq[0])], aria, enter: 0.8 },
      { objs: [...fl, bigCol(listVals(seq[1], MID)), tokenLabel(seq[1])], dur: 0.5, aria, hold: 0.35 },
      { objs: [...fl, bigCol(listVals(seq[2], MID)), tokenLabel(seq[2])], dur: 0.5, aria, hold: 0.35 },
    ].map(f => ({ ...f, cam: { fit: ['col-big', 'token-label'], maxS: 70, margin: { t: 50, b: 30, l: 40, r: 40 } } })),
  };
};

// I-2 · One slot, many jobs
SCENES['many-jobs'] = () => {
  const fl = floors(MID);
  const cards = ['bridge', 'code', 'sad'];
  const names = { bridge: 'a bridge', code: 'a code bug', sad: 'a sad sentence' };
  const card = (c, i, flip) => ({ id: `card-${c}`, type: 'card', at: add3(BIG.at, [0.9, -0.9, 0.9]), pxo: [[70, -48], [162, -48], [116, 48]][i]   /* two over one, so it fits at 320px */, glyph: c, label: names[c], flip, k: [`card-${c}`], layer: 3 });
  const aria = 'Slot #2 rises high three times, beside three cards that flip over in turn: a bridge, a line of code with a bug, and a teardrop for a sad sentence.';
  const frame = (n, dur) => ({
    objs: [...fl, bigCol(n ? toy.ideaList(cards[n - 1]) : listVals('sunset', MID)), ...cards.map((c, i) => card(c, i, i < n ? 1 : 0.02))].map(o => (o.id === 'col-big' && n ? { ...o, k: ['slot', 'slot2', `card-${cards[n - 1]}`] } : o)),
    dur, aria, hold: 0.3,
  });
  return {
    words: { 'card-bridge': 'bridge', 'card-code': 'ink', 'card-sad': 'raw' },
    frames: [{ ...frame(0), enter: 0.7 }, frame(1, 0.6), frame(2, 0.6), frame(3, 0.6)].map(f => ({ ...f, cam: { fit: ['col-big', 'card-bridge', 'card-code', 'card-sad'], maxS: 70 } })),
  };
};

// I-3 · Ideas as directions (slider picks which token's arrow to show)
export function directionsObjs(word, { showBridge = true, showSF = true, grow = 1 } = {}) {
  const list = listVals(word, MID), b = toy.DIRS.bridge, sh = toy.shadowOn(list, 'bridge');
  const proj = b.map(v => v * sh);
  const maxSh = Math.max(...WORDS.map(w => toy.shadowOn(listVals(w, MID), 'bridge')));
  const objs = [
    roomObj(),
    { id: 'tok-arrow', type: 'arrow', at: ROOM.c, v: list, len: ROOM.L * grow, c: 'raw', sw: 3, label: 'token', k: ['token-arrow'], layer: 2 },
    { id: 'tok-label', type: 'label', at: add3(ROOM.c, [-ROOM.size / 2, -ROOM.size / 2, ROOM.size * 0.62]), text: `token: “${word}” · shadow ${sh.toFixed(2)}`, size: 12, cls: 'dim mono', layer: 3, k: ['shadow'] },
  ];
  if (showBridge) objs.push(
    { id: 'bridge-arrow', type: 'arrow', at: ROOM.c, v: b, len: ROOM.L * 1.15, c: 'bridge', lamp: true, sw: 2.5, label: 'bridge idea', k: ['bridge-arrow'], layer: 2 },
    { id: 'shadow', type: 'arrow', at: ROOM.c, v: proj, len: ROOM.L, c: 'bridge', sw: 7, k: ['shadow'], layer: 1, o: 0.45, nohead: true },
    { id: 'drop', type: 'arrow', at: add3(ROOM.c, proj, ROOM.L), v: list.map((v, i) => v - proj[i]), len: ROOM.L, c: 'ink-3', sw: 1.5, k: ['shadow'], layer: 2 },
    { id: 'meter', type: 'meter', at: add3(ROOM.c, [2.6, -2.6, 1.4]), val: Math.max(0, sh) / maxSh, label: 'bridge-ness', c: 'bridge', k: ['shadow'], layer: 3 },
  );
  if (showSF) objs.push({ id: 'sf-arrow', type: 'arrow', at: add3(ROOM.c, b, ROOM.L * 1.15), v: toy.DIRS.sf, len: ROOM.L * 0.8, c: 'lamp', lamp: true, sw: 2.5, label: 'San Francisco', k: ['sf-arrow'], layer: 2 });
  return objs;
}
SCENES.directions = () => {
  const aria = 'Inside a wireframe room, the Bridge token’s three numbers become one arrow. An orange arrow marks the “bridge” idea; the token arrow casts a shadow along it, and a bridge-ness meter matches the shadow’s length. Then a San Francisco arrow is placed on the end of the bridge arrow.';
  const col = column('col-room', listVals('Bridge', MID), ROOM.c, { k: ['token-arrow'] });
  return {
    words: { 'token-arrow': 'raw', shadow: 'bridge', 'bridge-arrow': 'bridge', 'sf-arrow': 'lamp' },
    interaction: 'shadow-slider',
    frames: [
      { objs: [roomObj(), col], aria, enter: 0.8 },
      { objs: [...directionsObjs('Bridge', { showBridge: false, showSF: false }), { ...col, o: 0 }], dur: 0.8, aria },
      { objs: directionsObjs('Bridge', { showSF: false }), dur: 0.8, aria },
      { objs: directionsObjs('Bridge'), dur: 0.6, aria },
    ],
  };
};

// I-4 · More ideas than room
SCENES.crowded = () => {
  const axes = (o = 1) => [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((v, i) => ({ id: `axis-${i}`, type: 'arrow', at: ROOM.c, v, len: ROOM.L, c: 'ink-3', sw: 2, k: ['axes'], layer: 2, o }));
  const pair = toy.closestPair();
  const tip = id => add3(ROOM.c, toy.DIRS[id], ROOM.L);
  const mid = tip(pair.a).map((v, i) => (v + tip(pair.b)[i]) / 2);
  const angleLabel = { id: 'angle', type: 'label', at: add3(mid, [0, 0, 0.5]), text: `${Math.round(pair.angle)}°`, size: 13, weight: 700, cls: 'mono', layer: 3, k: ['ideas'] };
  const slotAt = add3(ROOM.c, [3.6, -3.6, -0.6]);
  const sharers = toy.SLOT_SHARERS;
  const seg = (o) => ({ id: 'col-big', type: 'bars', at: slotAt, vals: toy.listAt('Bridge', MID).map((v, i) => (i === toy.WATCHED_SLOT ? 1.2 : v)), unit: 1.1, bw: 0.5, gap: 0.2, hi: toy.WATCHED_SLOT, hiLabel: 'slot #2', segs: [null, ['seg-a', 'seg-b', 'seg-c'], null], segO: o, k: ['slot2'], layer: 3 });
  const segLabels = ['bridge', 'code error', 'sadness'].map((t, i) => ({ id: `seg-label-${i}`, type: 'label', at: add3(slotAt, [0.6, -0.6, 1.0]), pxo: [6, i * 15 - 15], text: t, size: 11, anchor: 'start', cls: `seg-${'abc'[i]}-text`, k: ['slot2'], layer: 3 }));
  const aria = `Three grey arrows at right angles fill the room. Then eight lamp-tipped arrows, one per toy idea, spread out as evenly as they can in 3-D; the closest two are ${Math.round(pair.angle)}° apart, not 90°. Beside the room, slot #2 splits into three coloured pieces: ${sharers.join(', ')}.`;
  return {
    words: { axes: 'ink', ideas: 'lamp', slot2: 'raw' },
    frames: [
      { objs: [roomObj(), ...axes()], aria, enter: 0.7 },
      { objs: [roomObj(), ...axes(0.35), ...ideaArrows(1)], dur: 1.0, aria },
      { objs: [roomObj(), ...axes(0.2), ...ideaArrows(1), angleLabel], dur: 0.4, aria },
      { objs: [roomObj(), ...axes(0.2), ...ideaArrows(1), angleLabel, seg(1), ...segLabels], dur: 0.6, aria },
    ],
  };
};

// Recap I: everything so far, zoomed out.
SCENES['recap-1'] = () => {
  const roofList = listVals('at', toy.FLOORS);
  const odds = toy.nextWordOdds(roofList, ['sunset', 'night', 'dawn']);
  const objs = [
    ...tiles(), ...floors(MID).map(f => ({ ...f, k: [...f.k, 'tower'] })),
    column('col-climb', listVals('Bridge', MID), climbAt(MID), { k: ['column'] }),
    { id: 'odds', type: 'odds', at: [TOWER.x + 1.5, TOWER.y + 1.5, roofZ + 2.6], rows: odds, wpx: 90, k: ['odds'], layer: 3 },
    roomObj(), ...ideaArrows(1),
  ];
  const aria = 'Zoomed out: the street of word tiles, the tower with its middle floor lit and next-word odds on its roof, a column of numbers at the middle floor, and the room crowded with eight idea arrows.';
  return {
    words: { tiles: 'tile', column: 'raw', tower: 'machine', odds: 'raw', ideas: 'lamp' },
    frames: [{ objs, aria, enter: 1.0 }],
  };
};

// Shared with later acts so the same street, tower and snapshot carry over.
export { tiles, floors, climbAt, tileTop, column, middleLabel, SIDE, TOWER, STREET, roofZ, add3 };

/** Toy values the copy refers to ({toy:name}). */
export const TOY_VALUES = {
  closestAngle: () => String(Math.round(toy.closestPair().angle)),
};
