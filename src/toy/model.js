// The hand-built toy: a 3-number "residual stream" holding 8 named ideas in
// superposition. Every number tagged TOY on the page comes from this file.
// Nothing here is Claude; it's a tiny deterministic stand-in so the maths is
// visible.

export const DIMS = 3;

export const CONCEPTS = [
  { id: 'ggb', name: 'Golden Gate Bridge' },
  { id: 'sf', name: 'San Francisco' },
  { id: 'bridge', name: 'bridge (any)' },
  { id: 'landmark', name: 'tourist landmark' },
  { id: 'code', name: 'code error' },
  { id: 'sad', name: 'sadness' },
  { id: 'add', name: 'addition' },
  { id: 'transit', name: 'transit' },
];

// The slot that I-1/I-2 single out ("slot #2"), zero-based.
export const WATCHED_SLOT = 1;
// The three ideas slot #2 is built to share (I-2).
export const SLOT_SHARERS = ['bridge', 'code', 'sad'];

// ---------- small vector helpers ----------
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = a => Math.sqrt(dot(a, a));
const unit = a => { const n = norm(a) || 1; return a.map(v => v / n); };
const add = (a, b) => a.map((v, i) => v + b[i]);
const scale = (a, k) => a.map(v => v * k);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const vec = { dot, norm, unit, add, scale, cross };

// ---------- spread 8 directions evenly on a sphere ----------
// Deterministic: Fibonacci start, then a fixed number of repulsion steps.
function spread(n, iters = 3000) {
  let pts = Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), t = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(t) * r, y, Math.sin(t) * r];
  });
  for (let k = 0; k < iters; k++) {
    const step = 0.02 * (1 - k / iters) + 0.001;
    pts = pts.map((p, i) => {
      let f = [0, 0, 0];
      pts.forEach((q, j) => {
        if (i === j) return;
        const d = add(p, scale(q, -1)), l = norm(d) + 1e-9;
        f = add(f, scale(d, 1 / (l * l * l)));
      });
      return unit(add(p, scale(f, step)));
    });
  }
  return pts;
}

// Rotation (as a matrix) that sends unit vector a onto unit vector b.
function rotationTo(a, b) {
  const v = cross(a, b), c = dot(a, b);
  if (c > 0.999999) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const k = 1 / (1 + c), [x, y, z] = v;
  return [
    [x * x * k + c, x * y * k - z, x * z * k + y],
    [y * x * k + z, y * y * k + c, y * z * k - x],
    [z * x * k - y, z * y * k + x, z * z * k + c],
  ];
}
const apply = (m, p) => m.map(row => dot(row, p));

function buildDirections() {
  const pts = spread(CONCEPTS.length);
  // Pick the three points that share one direction best: they become the
  // ideas that all push slot #2 (I-2's "one slot, many jobs").
  let best = null;
  for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) for (let c = b + 1; c < pts.length; c++) {
    const m = unit(add(add(pts[a], pts[b]), pts[c]));
    const score = Math.min(dot(pts[a], m), dot(pts[b], m), dot(pts[c], m));
    if (!best || score > best.score) best = { score, idx: [a, b, c], m };
  }
  const axis = [0, 0, 0]; axis[WATCHED_SLOT] = 1;
  const R = rotationTo(best.m, axis);
  const rotated = pts.map(p => apply(R, p));
  const dirs = {};
  SLOT_SHARERS.forEach((id, i) => { dirs[id] = rotated[best.idx[i]]; });
  const rest = rotated.filter((_, i) => !best.idx.includes(i));
  CONCEPTS.filter(c => !SLOT_SHARERS.includes(c.id)).forEach((c, i) => { dirs[c.id] = rest[i]; });
  return dirs;
}

/** Unit direction (length-3 array) for each concept id. */
export const DIRS = buildDirections();

/** Angle in degrees between two concept directions. */
export const angleBetween = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(DIRS[a], DIRS[b])))) * 180 / Math.PI;

/** Smallest angle between any two of the 8 directions (I-4 readout). */
export function closestPair() {
  let best = null;
  for (let i = 0; i < CONCEPTS.length; i++) for (let j = i + 1; j < CONCEPTS.length; j++) {
    const a = CONCEPTS[i].id, b = CONCEPTS[j].id, ang = angleBetween(a, b);
    if (!best || ang < best.angle) best = { a, b, angle: ang };
  }
  return best;
}

// ---------- vocabulary and the running sentence ----------
// A tiny fixed vocabulary; a token's tag (P1) is its position in this list.
export const VOCAB = [
  '<start>', '.', ',', 'the', 'a', 'at', 'We', 'drove', 'across', 'over', 'to', 'of', 'in', 'is',
  'Golden', 'Gate', 'Bridge', 'bridge', 'San', 'Francisco', 'city', 'tower', 'river', 'train', 'bus',
  'road', 'car', 'sunset', 'night', 'dawn', 'noon', 'lunch', 'sad', 'alone', 'cried', 'error', 'bug',
  'return', 'def', 'add', 'plus', 'sum', 'famous', 'view', 'trip',
];
export const tokenId = w => { const i = VOCAB.indexOf(w); if (i < 0) throw new Error(`not in toy vocab: ${w}`); return i; };

export const SENTENCE = ['We', 'drove', 'across', 'the', 'Golden', 'Gate', 'Bridge', 'at', 'sunset', '.'];

// What each word means on its own, as amounts of each idea (hand-set toy semantics).
const LEXICON = {
  drove: { transit: 0.6 },
  across: { bridge: 0.3, transit: 0.2 },
  Golden: { ggb: 0.6, sf: 0.3 },
  Gate: { ggb: 0.7, sf: 0.3 },
  Bridge: { ggb: 1.0, bridge: 0.5, landmark: 0.3 },
  sunset: { landmark: 0.2 },
};
// What the context adds by the time a token reaches the top floor.
const CONTEXT = {
  Golden: { landmark: 0.2 },
  Gate: { ggb: 0.3, landmark: 0.2 },
  Bridge: { sf: 0.4, landmark: 0.3 },
  at: { ggb: 0.4, landmark: 0.3, sf: 0.2 },
  sunset: { ggb: 0.3, landmark: 0.3 },
};

// Small deterministic per-token offset so no column is ever empty.
function jitter(word) {
  let h = 2166136261;
  for (const ch of word) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return [0, 1, 2].map(k => (((h >>> (k * 8)) & 255) / 255 - 0.5) * 0.24);
}

export const FLOORS = 6;          // toy tower height (drawn; the real count isn't reported)
export const MIDDLE_FLOOR = 3;    // where the snapshot is taken

/** Idea amounts for a word at a given floor (0 = bottom, FLOORS = roof). */
export function ideasAt(word, floor) {
  const t = floor / FLOORS, out = {};
  for (const c of CONCEPTS) out[c.id] = 0;
  for (const [k, v] of Object.entries(LEXICON[word] || {})) out[k] += v * (0.6 + 0.4 * t);
  for (const [k, v] of Object.entries(CONTEXT[word] || {})) out[k] += v * t;
  return out;
}

/** The 3-number list for a word at a floor: the sum of its ideas' directions plus a small offset. */
export function listAt(word, floor) {
  let v = jitter(word);
  for (const [k, a] of Object.entries(ideasAt(word, floor))) v = add(v, scale(DIRS[k], a));
  return v;
}

/** The list for a single, pure idea (I-2's cards). */
export const ideaList = (id, amount = 1) => scale(DIRS[id], amount);

// ---------- the roof: next-word odds ----------
// Toy unembedding: each candidate word has a base score and leans toward some ideas.
const CANDIDATES = {
  sunset: { base: 1.3, lean: { landmark: 1.2, ggb: 0.4 } },
  night: { base: 1.2, lean: { transit: 0.4 } },
  dawn: { base: 0.9, lean: { landmark: 0.3 } },
  noon: { base: 0.6, lean: {} },
  bridge: { base: -0.6, lean: { ggb: 1.5, bridge: 1.8 } },
  lunch: { base: 0.1, lean: {} },
};

/** Softmax odds for the word after `word`, given its list at the roof. Returns [{word, p}] sorted. */
export function nextWordOdds(list, candidates = Object.keys(CANDIDATES)) {
  const scores = candidates.map(w => {
    const c = CANDIDATES[w];
    let lean = [0, 0, 0];
    for (const [k, a] of Object.entries(c.lean)) lean = add(lean, scale(DIRS[k], a));
    return c.base + dot(lean, list);
  });
  const mx = Math.max(...scores), ex = scores.map(s => Math.exp(s - mx)), z = ex.reduce((a, b) => a + b, 0);
  return candidates.map((w, i) => ({ word: w, p: ex[i] / z })).sort((a, b) => b.p - a.p);
}

/** Length of the shadow a list casts on an idea's direction (I-3). */
export const shadowOn = (list, id) => dot(list, DIRS[id]);
