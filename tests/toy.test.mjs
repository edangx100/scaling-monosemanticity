// The toy must back every claim the step copy makes about it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as toy from '../src/toy/model.js';

test('toy has 3 numbers and 8 ideas, with unit directions', () => {
  assert.equal(toy.DIMS, 3);
  assert.equal(toy.CONCEPTS.length, 8);
  for (const c of toy.CONCEPTS) assert.ok(Math.abs(toy.vec.norm(toy.DIRS[c.id]) - 1) < 1e-9);
});

test('I-2: slot #2 jumps for bridge, code error and sadness, and those are its three biggest', () => {
  const s = toy.WATCHED_SLOT;
  const vals = toy.CONCEPTS.map(c => [c.id, toy.ideaList(c.id)[s]]).sort((a, b) => b[1] - a[1]);
  assert.deepEqual(vals.slice(0, 3).map(v => v[0]).sort(), [...toy.SLOT_SHARERS].sort());
  for (const [, v] of vals.slice(0, 3)) assert.ok(v > 0.5);
});

test('I-4: 8 directions in 3-D cannot all be at right angles', () => {
  const { angle } = toy.closestPair();
  assert.ok(angle < 90 && angle > 45, `closest pair at ${angle}°`);
});

test('P4: the toy guesses "sunset" after "at", ahead of night and dawn', () => {
  const odds = toy.nextWordOdds(toy.listAt('at', toy.FLOORS), ['sunset', 'night', 'dawn']);
  assert.deepEqual(odds.map(o => o.word), ['sunset', 'night', 'dawn']);
});

test('P1: every word of the running sentence is in the toy vocabulary', () => {
  for (const w of toy.SENTENCE) assert.equal(typeof toy.tokenId(w), 'number');
});

test('I-3: the Bridge token casts a longer shadow on the bridge idea than "the" does', () => {
  const m = toy.MIDDLE_FLOOR;
  assert.ok(toy.shadowOn(toy.listAt('Bridge', m), 'ggb') > toy.shadowOn(toy.listAt('the', m), 'ggb') + 0.5);
});

test('saved idea directions match a fresh computation (run node scripts/train-toy.mjs if this fails)', () => {
  assert.deepEqual(toy.DIRS, toy.buildDirections());
});
