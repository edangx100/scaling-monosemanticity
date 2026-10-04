// Content integrity: every coloured word points at scene objects that exist,
// every glossary term exists, toy placeholders resolve, and the page renders.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STEPS } from '../content/steps.js';
import { GLOSSARY } from '../content/glossary.js';
import { SCENES } from '../src/scenes/index.js';
import { renderPage } from '../scripts/render.mjs';

for (const step of STEPS) {
  test(`${step.id}: scene words and glossary terms resolve`, () => {
    const scene = SCENES[step.id] && SCENES[step.id]();
    assert.ok(scene, `no scene for ${step.id}`);
    const final = scene.frames[scene.frames.length - 1].objs;
    const text = step.body.map(p => (typeof p === 'object' ? [p.lead, ...p.list].join(' ') : p)).join(' ');
    for (const [, key] of text.matchAll(/\[\[([\w-]+)\|/g)) {
      assert.ok(scene.words[key], `no colour for scene word "${key}"`);
      const hits = final.filter(o => [].concat(o.k || []).includes(key) && (o.o ?? 1) > 0);
      assert.ok(hits.length, `scene word "${key}" highlights nothing in the final frame`);
    }
    for (const [, term] of text.matchAll(/\{\{([\w-]+)\|/g)) assert.ok(GLOSSARY[term], `unknown glossary term "${term}"`);
    for (const f of scene.frames) assert.ok(f.aria && f.aria.length > 40, 'every keyframe needs an aria description');
    const ids = final.map(o => o.id);
    assert.equal(new Set(ids).size, ids.length, 'object ids must be unique');
  });
}

test('every technical term is introduced with a glossary note on first use', () => {
  const seen = new Set();
  for (const step of STEPS) for (const [, term] of step.body.map(p => (typeof p === 'object' ? [p.lead, ...p.list].join(' ') : p)).join(' ').matchAll(/\{\{([\w-]+)\|/g)) seen.add(term);
  for (const term of ['token', 'vector', 'layer', 'next', 'neuron', 'polysemantic', 'direction', 'superposition', 'feature', 'sae', 'encoder', 'relu', 'decoder', 'training', 'loss', 'dead', 'brightness', 'clamping', 'correlation', 'similar', 'splitting', 'ablation', 'attribution', 'sycophancy', 'persona']) assert.ok(seen.has(term), term);
});

test('the page renders with no unresolved marks', async () => {
  const html = await renderPage();
  assert.ok(!/\[\[|\]\]|\{\{|\}\}|\{toy:/.test(html), 'unresolved inline mark in output');
  assert.ok(!/(href|src)="\//.test(html), 'absolute path found; all paths must be relative for GitHub Pages');
  assert.match(html, /og:image" content="https:\/\/edangx100\.github\.io\/scaling-monosemanticity\//);
});

test('every step changes the scene (its final picture differs from the step before)', () => {
  const sig = id => JSON.stringify(SCENES[id]().frames.at(-1).objs.map(o => [o.id, o.type, o.at, o.vals, o.on, o.val, o.v, o.text, o.heat, o.level, o.lift, o.o ?? 1]).sort());
  const ids = STEPS.map(s => s.id);
  const same = [];
  for (let i = 1; i < ids.length; i++) if (sig(ids[i]) === sig(ids[i - 1])) same.push(`${ids[i - 1]} → ${ids[i]}`);
  assert.deepEqual(same, []);
});
