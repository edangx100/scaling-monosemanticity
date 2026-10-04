// Story controller: scroll drives the active step (IntersectionObserver plus
// a geometry check), ← → and the bottom nav move between steps, coloured
// words highlight scene objects, glossary terms open notes.

import { Stage, reducedMotion } from './engine/stage.js';
import { SCENES, directionsObjs, tugObjs, trainingObjs } from './scenes/index.js';
import { TRAINED } from './toy/trained.js';
import { makeTrainer, directions } from './toy/train.js';
import { SENTENCE } from './toy/model.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const stage = new Stage($('#stage'), { title: 'Scene for the current step' });
const steps = $$('.step[data-step]');
const story = steps.filter(s => !s.classList.contains('hero'));
const stepper = $('#stepper'), where = $('#where'), live = $('#live'), hud = $('#hud');
const rail = $('.stepper .rail');
const sceneCache = new Map();
const sceneFor = id => { if (!sceneCache.has(id)) sceneCache.set(id, SCENES[id] ? SCENES[id]() : null); return sceneCache.get(id); };
// Must match the side-by-side breakpoint in styles.css.
const mobile = { get matches() { return !matchMedia('(min-width: 900px), (orientation: landscape) and (min-width: 640px) and (max-height: 600px)').matches; } };

story.forEach(() => rail.appendChild(document.createElement('span')));

let active = -1;

function activate(i, { force = false } = {}) {
  if (i < 0 || i >= steps.length || (i === active && !force)) return;
  active = i;
  const el = steps[i], id = el.dataset.step, sc = sceneFor(id);
  steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
  clearWords();
  const n = story.indexOf(el);
  stepper.hidden = n < 0;
  $('[data-prev]', stepper).disabled = i <= 0;
  $('[data-next]', stepper).disabled = i >= steps.length - 1;
  if (n >= 0) {
    where.textContent = `${String(n + 1).padStart(2, '0')} / ${story.length} · ${el.dataset.act || ''}`;
    [...rail.children].forEach((r, j) => { r.className = j < n ? 'done' : j === n ? 'now' : ''; });
  }
  hud.innerHTML = $$('.card-foot .badge', el).map(b => b.outerHTML).join('');
  if (sc) stage.play(sc.frames);
  try { history.replaceState(null, '', n < 0 ? location.pathname + location.search : `#${id}`); } catch { /* file:// */ }
  live.textContent = ($('h1, h2', el) || {}).textContent || '';
  document.dispatchEvent(new CustomEvent('stepchange', { detail: { id, index: i } }));
}

// ---------- scroll → active step ----------
// The reading area: below the sticky scene on phones, the whole height on
// wide screens, above the bottom nav either way.
function readingArea() {
  const navTop = stepper.hidden ? innerHeight : stepper.getBoundingClientRect().top;
  const top = mobile.matches ? $('.stage-wrap').getBoundingClientRect().bottom : 0;
  return [Math.max(0, top), Math.min(innerHeight, navTop)];
}
// While a button/key/link scrolls the page to a step, ignore the steps it
// passes on the way; otherwise the scene restarts several times mid-scroll.
let heading = null, headingTimer = 0;
const release = () => { heading = null; clearTimeout(headingTimer); };
['wheel', 'touchstart', 'pointerdown'].forEach(ev => addEventListener(ev, release, { passive: true }));
addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) release(); });

// The active step is the one whose card top has passed a line near the top of
// the reading area (30% down it on phones, the middle on wide screens). A card
// then stays active until the next card's opening lines arrive, so its own
// Replay button and controls are always reachable while it's active. (Phone
// cards can be taller than the reading area, so "most visible card" fails.)
function pick() {
  const [top, bottom] = readingArea();
  const line = mobile.matches ? top + 0.3 * (bottom - top) : innerHeight * 0.5;
  let best = 0;
  for (let i = 0; i < steps.length; i++) {
    const r = (mobile.matches ? $('.card', steps[i]) : steps[i]).getBoundingClientRect();
    if (r.top <= line) best = i; else break;
  }
  if (heading != null) { if (best === heading) release(); else return; }
  activate(best);
}
let queued = false;
const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; pick(); }); } };
const io = new IntersectionObserver(onScroll, { threshold: [0, 0.25, 0.5, 0.75, 1] });
steps.forEach(s => io.observe(s));
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll, { passive: true });

// ---------- moving between steps ----------
function go(i, { instant = false } = {}) {
  i = Math.max(0, Math.min(steps.length - 1, i));
  const card = $('.card', steps[i]);
  const r = card.getBoundingClientRect();
  const stageBottom = mobile.matches ? $('.stage-wrap').getBoundingClientRect().height : 0;
  const target = mobile.matches ? scrollY + r.top - stageBottom - 12 : scrollY + r.top - (innerHeight - Math.min(r.height, innerHeight * 0.8)) / 2;
  const smooth = !(instant || reducedMotion() || window.__instant);
  if (smooth) { heading = i; clearTimeout(headingTimer); headingTimer = setTimeout(release, 1500); }
  activate(i);
  scrollTo({ top: Math.max(0, i === 0 ? 0 : target), behavior: smooth ? 'smooth' : 'auto' });
}
$('[data-prev]', stepper).addEventListener('click', () => go(active - 1));
$('[data-next]', stepper).addEventListener('click', () => go(active + 1));
$$('[data-begin]').forEach(b => b.addEventListener('click', () => go(1)));
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
  if (e.target.closest && e.target.closest('input, select, textarea, [contenteditable]')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
});
$$('[data-replay]').forEach(b => b.addEventListener('click', () => {
  // Replay always replays its own step, even if scrolling down to reach the
  // button has already made the next step active.
  const i = steps.indexOf(b.closest('.step'));
  if (i !== active) activate(i);
  clearWords();
  const sc = sceneFor(steps[i].dataset.step);
  if (sc && sc.liveReplay) trainLive(i); else stage.replay();
}));

// II-5's Replay retrains the toy SAE from a new random start, a few rounds
// per animation frame so scrolling never stutters.
let liveTimer = 0;
function trainLive(i) {
  cancelAnimationFrame(liveTimer);
  stage.finish();
  const t = makeTrainer({ seed: 1 + Math.floor(Math.random() * 1e6) });
  const show = () => stage.patch(trainingObjs(directions(t.params), t.round));
  if (reducedMotion()) { t.step(t.opts.steps); show(); return; }
  const tick = () => {
    if (active !== i) return;               // left the step: stop quietly
    const done = t.step(t.round < 200 ? 4 : 24);
    show();
    if (!done) liveTimer = requestAnimationFrame(tick);
  };
  show();
  liveTimer = requestAnimationFrame(tick);
}

// ---------- scene words ----------
let pressed = null;
function clearWords() { stage.clearHighlight(); $$('.sw[aria-pressed="true"]').forEach(w => w.setAttribute('aria-pressed', 'false')); pressed = null; }
function showWord(w) {
  const i = steps.indexOf(w.closest('.step'));
  if (i !== active) activate(i);
  stage.finish();          // jump to the end state so every object is there
  stage.highlight(w.dataset.k);
  const wrap = $('.stage-wrap').getBoundingClientRect();
  if (wrap.bottom < 40 || wrap.top > innerHeight - 40) $('.stage-wrap').scrollIntoView({ block: 'nearest' });
}
$$('.sw').forEach(w => {
  w.addEventListener('click', () => {
    if (pressed === w) { clearWords(); return; }
    clearWords(); showWord(w); w.setAttribute('aria-pressed', 'true'); pressed = w;
  });
  w.addEventListener('focus', () => { if (pressed !== w && w.matches(':focus-visible')) { clearWords(); showWord(w); } });
  w.addEventListener('blur', () => { if (pressed !== w) stage.clearHighlight(); });
});
if (matchMedia('(hover: hover)').matches) {
  $$('.sw').forEach(w => {
    w.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !pressed) showWord(w); });
    w.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !pressed) stage.clearHighlight(); });
  });
}

// Scene words and glossary terms are inline spans with role="button" (so long
// phrases wrap like text); give them the keyboard behaviour of a button.
$$('.sw, .gl').forEach(el => el.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
}));

// ---------- glossary notes ----------
$$('.gl').forEach(g => g.addEventListener('click', () => {
  const note = document.getElementById(g.getAttribute('aria-controls'));
  const open = g.getAttribute('aria-expanded') !== 'true';
  g.setAttribute('aria-expanded', String(open));
  note.hidden = !open;
}));

// ---------- step controls ----------
$$('[data-control="shadow-slider"]').forEach(input => {
  const out = document.getElementById(`out-${input.closest('.step').dataset.step}`);
  input.addEventListener('input', () => {
    const word = SENTENCE[+input.value];
    out.textContent = word;
    const i = steps.indexOf(input.closest('.step'));
    if (i !== active) activate(i);
    stage.finish();
    stage.patch(directionsObjs(word));
  });
});

// Hash edited by hand (or a #step link clicked) → go there.
addEventListener('hashchange', () => {
  const i = steps.findIndex(s => s.dataset.step === location.hash.slice(1));
  if (i >= 0 && i !== active) go(i);
});

$$('[data-control="lambda-slider"]').forEach(input => {
  const out = document.getElementById(`out-${input.closest('.step').dataset.step}`);
  input.addEventListener('input', () => {
    const idx = +input.value, lam = TRAINED.sweep[idx].lambda;
    out.textContent = String(lam);
    input.setAttribute('aria-valuetext', `λ ${lam}`);
    const i = steps.indexOf(input.closest('.step'));
    if (i !== active) activate(i);
    stage.finish();
    stage.patch(tugObjs(idx));
  });
});

// ---------- start ----------
const hashIdx = steps.findIndex(s => s.dataset.step === location.hash.slice(1));
if (hashIdx > 0) { activate(hashIdx); requestAnimationFrame(() => go(hashIdx, { instant: true })); } else pick();
document.documentElement.classList.add('js');

// Test hook (Playwright): read state without poking internals.
window.__story = { stage, get active() { return steps[active]?.dataset.step; }, go: i => go(i), steps: steps.map(s => s.dataset.step) };
