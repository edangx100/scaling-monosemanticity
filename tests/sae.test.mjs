// SAE: finite-difference gradient check for every parameter group, plus a
// short training run that must recover the toy's hidden ideas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initSAE, loss, grads, rng, sampleBatch, adam, decoderDir } from '../src/toy/sae.js';
import { DIRS, CONCEPTS } from '../src/toy/model.js';

const clone = p => JSON.parse(JSON.stringify(p));

for (const lambda of [0, 0.3]) {
  test(`gradients match finite differences for every parameter group (λ=${lambda})`, () => {
    const p = initSAE({ seed: 3 });
    // Nudge the biases so some ReLUs are on and some off.
    p.benc = p.benc.map((_, i) => (i % 2 ? 0.15 : -0.05));
    p.bdec = [0.05, -0.02, 0.03];
    const X = sampleBatch(rng(11), 24, { p: 0.4 });
    const g = grads(p, X, lambda);
    const h = 1e-6;
    let checked = 0;
    for (const key of ['Wenc', 'benc', 'Wdec', 'bdec']) {
      const isMat = Array.isArray(p[key][0]);
      const idxs = isMat ? p[key].flatMap((row, r) => row.map((_, c) => [r, c])) : p[key].map((_, i) => [i]);
      for (const ix of idxs) {
        const plus = clone(p), minus = clone(p);
        if (isMat) { plus[key][ix[0]][ix[1]] += h; minus[key][ix[0]][ix[1]] -= h; }
        else { plus[key][ix[0]] += h; minus[key][ix[0]] -= h; }
        const num = (loss(plus, X, lambda).total - loss(minus, X, lambda).total) / (2 * h);
        const ana = isMat ? g[key][ix[0]][ix[1]] : g[key][ix[0]];
        const tol = 1e-5 + 1e-4 * Math.abs(num);
        assert.ok(Math.abs(num - ana) <= tol, `${key}[${ix}] analytic ${ana} vs numeric ${num}`);
        checked++;
      }
    }
    assert.equal(checked, 8 * 3 + 8 + 3 * 8 + 3);
  });
}

test('training recovers the 8 hidden ideas', () => {
  const p = initSAE({ seed: 5 });
  const step = adam(p, { lr: 0.02 });
  const r = rng(21);
  const before = loss(p, sampleBatch(rng(99), 256), 0.05).total;
  for (let it = 0; it < 1500; it++) step(grads(p, sampleBatch(r, 64), 0.05));
  const after = loss(p, sampleBatch(rng(99), 256), 0.05).total;
  assert.ok(after < before * 0.5, `loss ${before} → ${after}`);
  // Each hidden idea should have a learned decoder direction within ~25°.
  const dirs = Array.from({ length: p.F }, (_, i) => decoderDir(p, i));
  let matched = 0;
  for (const c of CONCEPTS) {
    const best = Math.max(...dirs.map(d => d.reduce((s, v, k) => s + v * DIRS[c.id][k], 0)));
    if (best > Math.cos(25 * Math.PI / 180)) matched++;
  }
  assert.ok(matched >= 6, `only ${matched}/8 ideas recovered`);
});
