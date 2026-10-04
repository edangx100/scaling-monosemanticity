// The labs' "What to try" cards make claims about the toy; check each one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeTrainer, recovered, measure } from '../src/toy/train.js';
import { encode, sampleBatch, rng } from '../src/toy/sae.js';
import { PROMPTS, promptOdds } from '../src/toy/model.js';
import { featureIdea, clampAtRoof } from '../src/toy/trained.js';

const trained = (opts, seeds = [2, 3, 4]) => seeds.map(seed => { const t = makeTrainer({ seed, steps: 4000, ...opts }); t.step(4000); return t.params; });
const deadCount = p => { const X = sampleBatch(rng(777), 400, { p: 0.1 }), seen = new Array(p.F).fill(false); for (const x of X) encode(p, x).f.forEach((v, i) => { if (v > 1e-6) seen[i] = true; }); return seen.filter(s => !s).length; };

test('Lab 1: λ = 0 lights about four lamps per input and almost no arrow lines up with an idea', () => {
  for (const p of trained({ lambda: 0 })) { assert.ok(measure(p).lit > 3, 'lamps lit'); assert.ok(recovered(p) <= 1); }
});
test('Lab 1: with 4 lamps most arrows settle between ideas and the rebuild gets worse', () => {
  const base = trained({ lambda: 0.3 })[0];
  for (const p of trained({ lambda: 0.3, F: 4 })) { assert.ok(recovered(p) <= 1); assert.ok(measure(p).gap > measure(base).gap * 1.5); }
});
test('Lab 1: with 16 lamps some may never switch on (dead)', () => {
  assert.ok(trained({ lambda: 0.3, F: 16 }).some(p => deadCount(p) > 0));
});
test('Lab 1: λ ≥ 1.2 lights hardly any lamps and most of each list goes unexplained', () => {
  for (const p of trained({ lambda: 1.2 })) { const m = measure(p); assert.ok(m.lit < 0.5 && m.gap > 0.5, JSON.stringify(m)); }
});

const top = (prompt, i, mult) => promptOdds(prompt, clampAtRoof(PROMPTS[prompt].last, i, mult))[0].word;
const F = id => [...Array(8).keys()].find(i => featureIdea(i) === id);
test('Lab 2: Golden Gate Bridge turned up on the lunch sentence makes "bridge" win', () => {
  assert.equal(top('lunch', F('ggb'), null), 'lunch');
  assert.equal(top('lunch', F('ggb'), 10), 'bridge');
});
test('Lab 2: code error and sadness each push their own word to the top', () => {
  for (const p of ['bridge', 'lunch']) { assert.equal(top(p, F('code'), 10), 'error'); assert.equal(top(p, F('sad'), 10), 'tears'); }
});
test('Lab 2: below zero, pushing one idea down pushes another word up', () => {
  const base = top('bridge', F('add'), null), neg = top('bridge', F('add'), -5);
  assert.notEqual(neg, base);
  assert.notEqual(neg, 'sum');
});
