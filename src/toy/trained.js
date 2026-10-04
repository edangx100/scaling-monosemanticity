// The trained toy SAE as the scenes use it (from src/toy/trained.data.js).
import data from './trained.data.js';
import { encode, decode } from './sae.js';
import { CONCEPTS } from './model.js';

export const TRAINED = data;
export const SAE = data.main.params;
const NAME = Object.fromEntries(CONCEPTS.map(c => [c.id, c.name]));

/** What feature i stands for (the hidden idea it landed on). */
export const featureIdea = i => data.main.ideas[i].id;
export const featureName = i => NAME[featureIdea(i)];

/** Encoder scores before ReLU (pre), after ReLU (f), and the rebuilt list. */
export function run(list) {
  const { pre, f } = encode(SAE, list);
  return { pre, f, rebuilt: decode(SAE, f) };
}

/** Decoder column i (an arrow, not normalised: its length matters for the rebuild). */
export const decoderCol = i => SAE.Wdec.map(row => row[i]);

// Each feature's strongest natural brightness over toy data: the unit for a
// clamp of "N×", as in the paper (multiples of the max over the SAE's data).
import { sampleBatch, rng } from './sae.js';
import { listAt, SENTENCE, MIDDLE_FLOOR } from './model.js';
let MAXES = null;
export function featureMax(i) {
  if (!MAXES) {
    MAXES = new Array(SAE.F).fill(0);
    const xs = [...sampleBatch(rng(4242), 4000, { p: 0.1 }), ...SENTENCE.map(w => listAt(w, MIDDLE_FLOOR))];
    for (const x of xs) run(x).f.forEach((v, k) => { if (v > MAXES[k]) MAXES[k] = v; });
  }
  return MAXES[i];
}

/** Clamp feature i to mult × its max at the middle floor (null = leave it),
 *  keeping the SAE's error term, and pass the change up to the roof. */
export function clampAtRoof(word, i, mult) {
  const mid = listAt(word, MIDDLE_FLOOR), roof = listAt(word, 6);
  if (mult == null) return roof;
  const delta = mult * featureMax(i) - run(mid).f[i];
  const W = decoderCol(i);
  return roof.map((v, k) => v + delta * W[k]);
}
