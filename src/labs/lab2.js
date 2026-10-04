// Lab 2 · Steer a toy model. Pick one of the toy's 8 features, clamp it
// from −5× to +10× (the paper's way: the SAE's rebuild with that feature
// fixed, error term kept), and watch the toy's next-word odds shift.

import { Stage } from '../engine/stage.js';
import { PROMPTS, promptOdds } from '../toy/model.js';
import { SAE, featureName, featureIdea, clampAtRoof } from '../toy/trained.js';

const R3 = Math.sqrt(3);
const across = t => [t / R3, -t / R3, 0];
const SHORT = { 'Golden Gate Bridge': 'Golden Gate', 'San Francisco': 'SF', 'bridge (any)': 'bridge', 'tourist landmark': 'landmark', 'code error': 'code error', sadness: 'sadness', addition: 'addition', transit: 'transit' };

export function mountLab2(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const stage = new Stage($('.lab-stage'), { title: 'Lab 2: steering the toy' });
  const state = { prompt: 'bridge', feature: [...Array(SAE.F).keys()].find(i => featureIdea(i) === 'ggb'), mult: 10, clamped: true };
  const el = { mult: $('#lab2-mult'), multOut: $('#lab2-mult-out'), release: $('[data-lab2="release"]'), completion: $('[data-out="completion"]') };

  let fitted = false;
  function render() {
    const { prompt, feature, mult, clamped } = state;
    const roof = clampAtRoof(PROMPTS[prompt].last, feature, clamped ? mult : null);
    const odds = promptOdds(prompt, roof).slice(0, 5);
    const objs = [];
    for (let i = 0; i < SAE.F; i++) {
      const at = across((i - 3.5) * 1.5);
      const sel = i === feature;
      const on = sel ? (clamped ? Math.max(0, Math.min(1, mult / 3)) : 0.3) : 0.15;
      objs.push({ id: `l2-lamp-${i}`, type: 'lamp', at: [at[0], at[1], 0], r: sel ? 0.34 : 0.26, c: featureIdea(i) === 'ggb' ? 'bridge' : 'lamp', on, layer: 2 });
      objs.push({ id: `l2-name-${i}`, type: 'label', at: [at[0], at[1], 0], pxo: [0, 24 + (i % 2) * 14], text: SHORT[featureName(i)], size: 12, weight: sel ? 700 : 400, layer: 3 });
    }
    const dAt = across((feature - 3.5) * 1.5);
    objs.push({ id: 'l2-dial', type: 'dial', at: [dAt[0], dAt[1], 1.6], r: 0.5, val: clamped ? mult : 0, off: !clamped, layer: 3 });
    objs.push({ id: 'l2-odds', type: 'odds', at: [0, 0, -1.8], pxo: [-20, 40], rows: odds.map(o => ({ word: o.word, p: o.p })), noWin: true, wpx: 120, layer: 3 });
    stage.patch(objs, { fit: !fitted }); fitted = true;
    stage.setDesc(`Eight toy feature lamps; ${featureName(feature)} is selected and ${clamped ? `clamped to ${mult}×` : 'not clamped'}. The toy’s top next-word guesses: ${odds.map(o => `${o.word} ${Math.round(o.p * 100)}%`).join(', ')}.`);
    el.completion.innerHTML = `${PROMPTS[prompt].text} <b>${odds[0].word}</b>.`;
  }

  $$('[data-prompt]').forEach(b => b.addEventListener('click', () => {
    state.prompt = b.dataset.prompt;
    $$('[data-prompt]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
  $$('[data-feature]').forEach(b => b.addEventListener('click', () => {
    state.feature = +b.dataset.feature; state.clamped = true; state.mult = +el.mult.value;
    $$('[data-feature]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    render();
  }));
  el.mult.addEventListener('input', () => {
    state.mult = +el.mult.value; state.clamped = true;
    el.multOut.textContent = `${state.mult < 0 ? '−' + Math.abs(state.mult) : state.mult}×`;
    el.mult.setAttribute('aria-valuetext', `${state.mult} times`);
    render();
  });
  el.release.addEventListener('click', () => { state.clamped = false; el.multOut.textContent = 'off'; el.mult.setAttribute('aria-valuetext', 'not clamped'); render(); });

  render();
  return { stage, state, render };
}
