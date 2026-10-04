// Training the toy SAE, in small steps so the browser can spread it over
// animation frames (II-5's live replay, Lab 1) and node can run it in one go
// (scripts/train-toy.mjs → src/toy/trained.data.js).

import { initSAE, grads, adam, sampleBatch, rng, encode, decode, decoderDir } from './sae.js';
import { CONCEPTS, DIRS } from './model.js';

export const TOY_TRAINING = { lambda: 0.3, steps: 1500, batch: 64, p: 0.1, lr: 0.01, seed: 3 };

/** A resumable trainer. step(n) runs n more rounds; returns true when done. */
export function makeTrainer(opts = {}) {
  const o = { ...TOY_TRAINING, ...opts };
  const params = initSAE({ seed: o.seed, F: o.F });
  const opt = adam(params, { lr: o.lr });
  const r = rng(o.seed * 7 + 1);
  let round = 0;
  return {
    params, opts: o,
    get round() { return round; },
    step(n = 1) {
      for (let k = 0; k < n && round < o.steps; k++, round++) opt(grads(params, sampleBatch(r, o.batch, { p: o.p }), o.lambda));
      return round >= o.steps;
    },
  };
}

/** Unit decoder directions of every feature. */
export const directions = p => Array.from({ length: p.F }, (_, i) => decoderDir(p, i));

/** For each learned feature, the hidden idea it points at most closely. */
export function matchIdeas(p) {
  return directions(p).map(d => {
    let best = null;
    for (const c of CONCEPTS) {
      const cos = d.reduce((s, v, k) => s + v * DIRS[c.id][k], 0);
      if (!best || cos > best.cos) best = { id: c.id, cos };
    }
    return { ...best, angle: Math.acos(Math.min(1, best.cos)) * 180 / Math.PI };
  });
}

/** How many of the 8 hidden ideas some feature lands within `deg` of. */
export function recovered(p, deg = 15) {
  const dirs = directions(p);
  return CONCEPTS.filter(c => Math.max(...dirs.map(d => d.reduce((s, v, k) => s + v * DIRS[c.id][k], 0))) > Math.cos(deg * Math.PI / 180)).length;
}

/** Lamps lit per input and the rebuild gap (share of the data's spread missed). */
export function measure(p, { n = 2000, seed = 999, p: prob = TOY_TRAINING.p } = {}) {
  const X = sampleBatch(rng(seed), n, { p: prob });
  let lit = 0, err = 0, spread = 0;
  for (const x of X) {
    const { f } = encode(p, x), xh = decode(p, f);
    lit += f.filter(v => v > 1e-3).length;
    err += xh.reduce((s, v, d) => s + (x[d] - v) ** 2, 0);
    spread += x.reduce((s, v) => s + v * v, 0);
  }
  return { lit: lit / n, gap: err / spread };
}
