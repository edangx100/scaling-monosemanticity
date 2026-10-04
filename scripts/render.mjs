// Renders index.html from the template plus content/. Used by the dev server
// (on every request) and by the production build, so the page is plain,
// readable HTML before any JavaScript runs.

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

async function load(rel, bust) {
  const url = pathToFileURL(path.join(ROOT, rel)).href + (bust ? `?t=${Date.now()}` : '');
  return import(url);
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function renderPage({ bust = false } = {}) {
  const [{ STEPS, ACTS, ACT_COUNT }, { GLOSSARY }, { SCENES, TOY_VALUES, TUG_DEFAULT }, { SOURCES, ABOUT }, { TRAINED }] = await Promise.all([
    load('content/steps.js', bust), load('content/glossary.js', bust), load('src/scenes/index.js', bust), load('content/sources.js', bust), load('src/toy/trained.js', bust),
  ]);
  const template = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const story = STEPS.filter(s => !s.hero);
  const total = story.length;

  const BADGE = { paper: ['paper', 'From the paper'], toy: ['toy', 'Toy'], schematic: ['schematic', 'Schematic'] };

  const html = STEPS.map(step => {
    const scene = SCENES[step.id] ? SCENES[step.id]() : { words: {} };
    const words = scene.words || {};
    const notes = [];
    const mark = text => text
      .replace(/\{toy:(\w+)\}/g, (_, k) => { if (!TOY_VALUES[k]) throw new Error(`unknown toy value ${k}`); return TOY_VALUES[k](); })
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[\[([\w-]+)\|(.+?)\]\]([.,;:!?’”)]*)/g, (_, k, t, punct) => {
        if (!words[k]) throw new Error(`step ${step.id}: scene word "${k}" has no scene objects/colour`);
        // An inline span (not <button>) so long phrases wrap like text.
        return `<span class="sw" role="button" tabindex="0" data-k="${k}" data-c="${words[k]}" aria-pressed="false">${t}</span>${punct}`;
      })
      .replace(/\{\{([\w-]+)\|(.+?)\}\}([.,;:!?’”)]*)/g, (_, term, t, punct) => {
        const g = GLOSSARY[term]; if (!g) throw new Error(`step ${step.id}: unknown glossary term "${term}"`);
        const id = `gl-${step.id}-${term}`;
        notes.push(`<div class="gl-note" id="${id}" role="note" hidden><b>${esc(g.term)}.</b> ${esc(g.def)}${g.more ? `<p>${esc(g.more)}</p>` : ''}</div>`);
        return `<span class="gl" role="button" tabindex="0" data-term="${term}" aria-expanded="false" aria-controls="${id}">${t}</span>${punct}`;
      });
    const paras = step.body.map(p => {
      const before = notes.length;
      const out = `<p>${mark(p)}</p>`;
      return out + notes.slice(before).join('');
    }).join('\n');
    const badges = (step.badges || []).map(b => `<span class="badge ${BADGE[b][0]}">${BADGE[b][1]}</span>`).join('');
    const i = story.indexOf(step);
    const act = ACTS.find(a => a.id === step.act);
    const sweep = TRAINED.sweep;
    const control = step.interaction === 'shadow-slider'
      ? `<div class="control"><label for="ctl-${step.id}">Which token?</label><input type="range" id="ctl-${step.id}" min="0" max="9" step="1" value="6" data-control="shadow-slider"><output for="ctl-${step.id}" id="out-${step.id}">Bridge</output></div>`
      : step.interaction === 'lambda-slider'
        ? `<div class="control"><label for="ctl-${step.id}">λ (toy)</label><input type="range" id="ctl-${step.id}" min="0" max="${sweep.length - 1}" step="1" value="${TUG_DEFAULT}" data-control="lambda-slider" aria-valuetext="λ ${sweep[TUG_DEFAULT].lambda}"><output for="ctl-${step.id}" id="out-${step.id}">${sweep[TUG_DEFAULT].lambda}</output></div>`
        : '';
    const maths = step.maths ? `<details class="maths"><summary>Show the maths</summary><p>${step.maths}</p></details>` : '';
    if (step.hero) {
      return `<section class="step hero" id="step-${step.id}" data-step="${step.id}" aria-labelledby="h-${step.id}">
  <div class="card">
    <p class="byline"><b>edang100x</b> · October 2026</p>
    <h1 id="h-${step.id}">${esc(step.title)}</h1>
    ${paras}
    <p class="hint">${esc(step.hint)}</p>
    <div class="begin-row"><button class="btn primary" type="button" data-begin>Begin</button><small>${total} steps · scroll, or use <kbd>←</kbd> <kbd>→</kbd></small></div>
    <p class="caption">${step.caption}</p>
    <div class="card-foot"><div class="badges">${badges}</div><button class="btn small" type="button" data-replay aria-label="Replay this step’s animation">↻ Replay</button></div>
  </div>
</section>`;
    }
    return `<section class="step${step.recap ? ' recap' : ''}" id="step-${step.id}" data-step="${step.id}" data-act="${esc(act.short)}" aria-labelledby="h-${step.id}">
  <div class="card">
    <div class="meta"><span class="act">${esc(act.short)}${act.numbered ? ` of ${ACT_COUNT}` : ''} · ${esc(act.name)}</span><span>Step ${i + 1} of ${total}</span></div>
    <h2 id="h-${step.id}">${esc(step.title)}</h2>
    ${paras}
    ${maths}
    ${control}
    ${step.caption ? `<p class="caption">${step.caption}</p>` : ''}
    <div class="card-foot"><div class="badges">${badges}</div><button class="btn small" type="button" data-replay aria-label="Replay this step’s animation">↻ Replay</button></div>
  </div>
</section>`;
  }).join('\n');

  const sources = `<h2>Sources</h2>\n${SOURCES.map(s => `<p>${s}</p>`).join('\n')}\n<h2>About the figures</h2>\n<p>${ABOUT}</p>`;
  return template.replace('<!--STEPS-->', html).replace('<!--SOURCES-->', sources);
}

// CLI: print the rendered page.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(await renderPage());
}
