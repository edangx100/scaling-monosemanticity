// A tiny sparse autoencoder, written out by hand so its gradients can be
// checked against finite differences (tests/sae.test.mjs).
//
//   f   = ReLU(W_enc x + b_enc)                       encoder   (F × D)
//   x̂   = b_dec + W_dec f                             decoder   (D × F)
//   L   = mean_x [ ‖x − x̂‖² + λ Σ_i f_i ‖W_dec[:, i]‖ ] same form as the paper's loss
//
// Parameters are plain arrays of arrays so the toy stays readable.

import { DIRS, CONCEPTS, DIMS } from './model.js';

/** Small deterministic PRNG (mulberry32). */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function initSAE({ D = DIMS, F = CONCEPTS.length, seed = 7 } = {}) {
  const r = rng(seed), g = () => (r() * 2 - 1);
  const Wdec = Array.from({ length: D }, () => Array.from({ length: F }, g));
  // Normalise decoder columns, then tie the encoder to them as a start.
  for (let i = 0; i < F; i++) {
    const n = Math.sqrt(Wdec.reduce((s, row) => s + row[i] * row[i], 0)) || 1;
    for (let d = 0; d < D; d++) Wdec[d][i] /= n;
  }
  const Wenc = Array.from({ length: F }, (_, i) => Array.from({ length: D }, (_, d) => Wdec[d][i]));
  return { D, F, Wenc, benc: new Array(F).fill(0), Wdec, bdec: new Array(D).fill(0) };
}

export function encode(p, x) {
  const pre = p.Wenc.map((row, i) => row.reduce((s, w, d) => s + w * x[d], p.benc[i]));
  return { pre, f: pre.map(v => (v > 0 ? v : 0)) };
}

export function decode(p, f) {
  return p.bdec.map((b, d) => p.Wdec[d].reduce((s, w, i) => s + w * f[i], b));
}

const colNorms = p => Array.from({ length: p.F }, (_, i) => Math.sqrt(p.Wdec.reduce((s, row) => s + row[i] * row[i], 0)));

/** Loss and its parts over a batch of inputs. */
export function loss(p, X, lambda) {
  const norms = colNorms(p);
  let rec = 0, sp = 0;
  for (const x of X) {
    const { f } = encode(p, x), xh = decode(p, f);
    rec += xh.reduce((s, v, d) => s + (x[d] - v) ** 2, 0);
    sp += f.reduce((s, v, i) => s + v * norms[i], 0);
  }
  return { total: (rec + lambda * sp) / X.length, rec: rec / X.length, sparsity: sp / X.length };
}

/** Exact gradients of loss().total with respect to every parameter. */
export function grads(p, X, lambda) {
  const { D, F } = p, n = X.length, norms = colNorms(p);
  const gWenc = Array.from({ length: F }, () => new Array(D).fill(0));
  const gbenc = new Array(F).fill(0);
  const gWdec = Array.from({ length: D }, () => new Array(F).fill(0));
  const gbdec = new Array(D).fill(0);
  const sumF = new Array(F).fill(0);
  for (const x of X) {
    const { pre, f } = encode(p, x), xh = decode(p, f);
    const e = xh.map((v, d) => 2 * (v - x[d]) / n);              // dL/dx̂
    for (let d = 0; d < D; d++) {
      gbdec[d] += e[d];
      for (let i = 0; i < F; i++) gWdec[d][i] += e[d] * f[i];
    }
    for (let i = 0; i < F; i++) {
      sumF[i] += f[i];
      if (pre[i] <= 0) continue;                                 // ReLU gate
      let df = lambda * norms[i] / n;
      for (let d = 0; d < D; d++) df += e[d] * p.Wdec[d][i];
      gbenc[i] += df;
      for (let d = 0; d < D; d++) gWenc[i][d] += df * x[d];
    }
  }
  // Sparsity term's dependence on the decoder norms.
  for (let i = 0; i < F; i++) {
    if (norms[i] === 0) continue;
    for (let d = 0; d < D; d++) gWdec[d][i] += lambda * (sumF[i] / n) * p.Wdec[d][i] / norms[i];
  }
  return { Wenc: gWenc, benc: gbenc, Wdec: gWdec, bdec: gbdec };
}

/** Sparse toy data: each idea is "on" with probability `p`, at a random strength. */
export function sampleBatch(r, size, { p = 0.12 } = {}) {
  const X = [];
  for (let k = 0; k < size; k++) {
    let x = [0, 0, 0];
    for (const c of CONCEPTS) if (r() < p) { const a = r(); x = x.map((v, d) => v + a * DIRS[c.id][d]); }
    X.push(x);
  }
  return X;
}

/** Adam optimiser state for an SAE. */
export function adam(p, { lr = 0.01, b1 = 0.9, b2 = 0.999, eps = 1e-8 } = {}) {
  const zero = v => (Array.isArray(v[0]) ? v.map(r => r.map(() => 0)) : v.map(() => 0));
  const m = {}, s = {};
  for (const k of ['Wenc', 'benc', 'Wdec', 'bdec']) { m[k] = zero(p[k]); s[k] = zero(p[k]); }
  let t = 0;
  return function step(g) {
    t++;
    const c1 = 1 - b1 ** t, c2 = 1 - b2 ** t;
    for (const k of ['Wenc', 'benc', 'Wdec', 'bdec']) {
      const upd = (P, G, M, S, i) => {
        M[i] = b1 * M[i] + (1 - b1) * G[i];
        S[i] = b2 * S[i] + (1 - b2) * G[i] * G[i];
        P[i] -= lr * (M[i] / c1) / (Math.sqrt(S[i] / c2) + eps);
      };
      if (Array.isArray(p[k][0])) p[k].forEach((row, r) => row.forEach((_, c) => upd(row, g[k][r], m[k][r], s[k][r], c)));
      else p[k].forEach((_, i) => upd(p[k], g[k], m[k], s[k], i));
    }
  };
}

/** Unit decoder direction of feature i (what the scene draws as its arrow). */
export function decoderDir(p, i) {
  const v = p.Wdec.map(row => row[i]), n = Math.sqrt(v.reduce((s, a) => s + a * a, 0)) || 1;
  return v.map(a => a / n);
}
