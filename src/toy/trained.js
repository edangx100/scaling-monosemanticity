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
