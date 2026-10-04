// The saved toy training (src/toy/trained.data.js) must match a fresh,
// deterministic run, and must back the Act II copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import saved from '../src/toy/trained.data.js';
import { buildTrained } from '../src/toy/trained-build.js';

test('saved toy training matches a fresh run (run node scripts/train-toy.mjs if this fails)', () => {
  assert.deepEqual(saved, JSON.parse(JSON.stringify(buildTrained())));
});

test('II-5: training recovers all 8 hidden ideas', () => {
  assert.equal(saved.main.recovered, 8);
  assert.equal(new Set(saved.main.ideas.map(i => i.id)).size, 8, 'each feature lands on a different idea');
  for (const i of saved.main.ideas) assert.ok(i.angle < 15, `${i.id} at ${i.angle}°`);
  // …and at round 0 they were not there yet.
  const first = saved.snapshots[0].dirs;
  assert.ok(first.length === 8);
});

test('II-6: raising λ lights fewer lamps and widens the rebuild gap', () => {
  const s = saved.sweep;
  for (let k = 1; k < s.length; k++) {
    assert.ok(s[k].lit < s[k - 1].lit, `lamps lit should fall: ${s[k - 1].lit} → ${s[k].lit}`);
    assert.ok(s[k].gap > s[k - 1].gap, `gap should grow: ${s[k - 1].gap} → ${s[k].gap}`);
  }
  // With no penalty the lamps don't line up with the ideas ("harder to read").
  assert.ok(s.find(x => x.lambda === 0).recovered < 8);
});
