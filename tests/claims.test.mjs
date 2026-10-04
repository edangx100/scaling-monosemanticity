// Accuracy: every real number on the page must trace to research/facts.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STEPS } from '../content/steps.js';

const facts = readFileSync(new URL('../research/facts.md', import.meta.url), 'utf8').replace(/,/g, '');
const flat = s => [
  ...s.body.map(p => (typeof p === 'object' ? [p.lead, ...p.list].join(' ') : p)),
  s.caption || '', s.maths || '', ...(s.more ? s.more.list : []),
].join(' ')
  .replace(/<[^>]+>/g, ' ').replace(/\{toy:\w+\}/g, '').replace(/§[\w-]+/g, '')
  .replace(/\[\[[\w-]+\|/g, '').replace(/\{\{[\w-]+\|/g, '');

test('every number with a unit (%, ×, million, rank) in the copy appears in facts.md', () => {
  const missing = [];
  for (const s of STEPS) {
    for (const m of flat(s).matchAll(/[−-]?\d[\d,]*(?:\.\d+)?\s?(?:%|×|th\b|nd\b|rd\b|million|billion)/g)) {
      const n = m[0].replace(/,/g, '').replace(/^-/, '');   // "more-than-50%" → "50%"
      const variants = [n, n.replace('−', '-'), n.replace(' million', 'M'), n.replace(' billion', ' billion')];
      if (!variants.some(v => facts.includes(v))) missing.push(`${s.id}: ${m[0]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('every fact ID cited in storyboard.md exists in facts.md', () => {
  const sb = readFileSync(new URL('../storyboard.md', import.meta.url), 'utf8');
  const ids = new Set([...readFileSync(new URL('../research/facts.md', import.meta.url), 'utf8').matchAll(/^\| ([A-M]\d+) \|/gm)].map(m => m[1]));
  const cited = new Set();
  for (const [, grp] of sb.matchAll(/\[([A-M]\d+(?:[–,\- ]+[A-M]?\d+)*)\]/g)) {
    for (const part of grp.split(/,\s*/)) {
      const r = part.match(/([A-M])(\d+)[–-]([A-M])?(\d+)/);
      if (r) for (let i = +r[2]; i <= +r[4]; i++) cited.add(r[1] + i); else cited.add(part.trim());
    }
  }
  assert.deepEqual([...cited].filter(id => !ids.has(id)), []);
});

test('every step has a caption naming its source (recaps excepted)', () => {
  for (const s of STEPS) if (!s.recap) assert.ok(s.caption && s.caption.length > 10, s.id);
});
