// Lab 1 · Train a sparse autoencoder. The toy's 8 hidden ideas live in 3
// numbers; the reader trains a real SAE (exact gradients, Adam) and watches
// its arrows swing onto them. Training runs a few rounds per animation frame
// and pauses whenever the lab is off-screen.

import { Stage } from '../engine/stage.js';
import { makeTrainer, directions, recovered, measure } from '../toy/train.js';
import { loss, sampleBatch, rng, encode } from '../toy/sae.js';
import * as toy from '../toy/model.js';

const MAX_ROUNDS = 4000;
const PER_FRAME = 8;
const L = 2.0;

export function mountLab1(root) {
  const $ = s => root.querySelector(s);
  const stage = new Stage($('.lab-stage'), { title: 'Lab 1: the toy SAE training' });
  const el = {
    train: $('[data-lab1="train"]'), reset: $('[data-lab1="reset"]'),
    lambda: $('#lab1-lambda'), lambdaOut: $('#lab1-lambda-out'),
    width: $('#lab1-width'), widthOut: $('#lab1-width-out'),
    round: $('[data-out="round"]'), loss: $('[data-out="loss"]'), lit: $('[data-out="lit"]'), dead: $('[data-out="dead"]'), found: $('[data-out="found"]'),
    status: $('[data-out="status"]'),
  };
  const evalX = sampleBatch(rng(777), 400, { p: 0.1 });
  let t = null, running = false, visible = false, raf = 0, frame = 0, seed = 1;

  function deadFlags(p) {
    const seen = new Array(p.F).fill(false);
    for (const x of evalX) encode(p, x).f.forEach((v, i) => { if (v > 1e-6) seen[i] = true; });
    return seen.map(s => !s);
  }

  function objs() {
    const p = t.params, dirs = directions(p), dead = deadFlags(p);
    const list = [{ id: 'room', type: 'room', at: [0, 0, 0], size: 4.4, layer: 0 }];
    toy.CONCEPTS.forEach(c => list.push({ id: `hid-${c.id}`, type: 'arrow', at: [0, 0, 0], v: toy.DIRS[c.id], len: L * 1.12, c: 'ink-3', sw: 1.6, dash: true, layer: 1 }));
    dirs.forEach((d, i) => list.push({ id: `learn-${i}`, type: 'arrow', at: [0, 0, 0], v: d, len: L, c: dead[i] ? 'dead' : 'lamp', lamp: true, sw: 2.5, layer: 2 }));
    return { list, dead };
  }

  function readouts(dead) {
    const p = t.params;
    const m = measure(p, { n: 400, seed: 777 });
    el.round.textContent = t.round.toLocaleString('en');
    el.loss.textContent = loss(p, evalX.slice(0, 200), t.opts.lambda).total.toFixed(3);
    el.lit.textContent = m.lit.toFixed(2);
    el.dead.textContent = `${dead.filter(Boolean).length} of ${p.F}`;
    el.found.textContent = `${recovered(p)} of 8`;
  }

  function draw(full = true, fit = false) {
    const { list, dead } = objs();
    stage.patch(list, { fit });
    if (full) readouts(dead);
    const p = t.params;
    stage.setDesc(`A wireframe room with 8 dashed arrows for the toy’s hidden ideas and ${p.F} solid lamp-tipped arrows for the SAE’s learned features, after ${t.round} rounds of training. ${recovered(p)} of the 8 hidden ideas have a learned arrow on them.`);
  }

  function reset() {
    stop();
    seed += 1;
    t = makeTrainer({ seed, F: +el.width.value, lambda: +el.lambda.value, steps: MAX_ROUNDS });
    el.status.textContent = 'Ready. Press Train.';
    draw(true, true);
  }

  function tick() {
    if (!running || !visible) { raf = 0; return; }
    const done = t.step(PER_FRAME);
    frame++;
    draw(frame % 6 === 0 || done);
    if (done) { stop(); el.status.textContent = `Finished ${MAX_ROUNDS.toLocaleString('en')} rounds.`; return; }
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (t.round >= MAX_ROUNDS) reset();
    running = true;
    el.train.textContent = 'Pause'; el.train.setAttribute('aria-pressed', 'true');
    el.status.textContent = 'Training…';
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf); raf = 0;
    if (el.train) { el.train.textContent = 'Train'; el.train.setAttribute('aria-pressed', 'false'); }
    if (t) { el.status.textContent = `Paused at round ${t.round.toLocaleString('en')}.`; draw(); }
  }

  el.train.addEventListener('click', () => (running ? stop() : start()));
  el.reset.addEventListener('click', reset);
  el.lambda.addEventListener('input', () => {
    el.lambdaOut.textContent = (+el.lambda.value).toFixed(2);
    if (t) { t.opts.lambda = +el.lambda.value; if (!running) draw(); }
  });
  el.width.addEventListener('input', () => { el.widthOut.textContent = el.width.value; reset(); });

  new IntersectionObserver(es => {
    visible = es.some(e => e.isIntersecting);
    if (visible && running && !raf) raf = requestAnimationFrame(tick);
  }, { threshold: 0.05 }).observe(root);
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });

  reset();
  return { stage, get trainer() { return t; }, start, stop, reset };
}
