// npm run e2e: interaction checks in Chromium and WebKit. Writes
// evidence/e2e/results.json and exits non-zero if any check fails.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, ENGINES, startServer, contextOptions, showStep } from './harness.mjs';

const server = await startServer();
const results = [];
const check = (browser, name, ok, detail = '') => { results.push({ browser, name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${browser.padEnd(8)} ${name}${detail ? ` (${detail})` : ''}`); };
const idx = (page, id) => page.evaluate(id => window.__story.steps.indexOf(id), id);

try {
  for (const name of Object.keys(ENGINES)) {
    const browser = await ENGINES[name].launch();

    // ---- phone: tap-linking and glossary notes ----
    {
      const ctx = await browser.newContext(contextOptions(name, { width: 390, height: 844 }));
      const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
      await page.goto(server.url, { waitUntil: 'networkidle' });

      await showStep(page, await idx(page, 'many-jobs'));
      const word = page.locator('#step-many-jobs .sw[data-k="card-code"]');
      await word.tap();
      await page.waitForTimeout(150);
      let hl = await page.evaluate(() => ({ focusing: document.querySelector('.stage-svg').classList.contains('focusing'), ids: [...document.querySelectorAll('.stage-svg .obj.hl')].map(g => g.dataset.id) }));
      check(name, 'tap a coloured word highlights its scene object', hl.focusing && hl.ids.includes('card-code'), hl.ids.join(','));
      check(name, 'tapped word reports aria-pressed', await word.getAttribute('aria-pressed') === 'true');
      await word.tap(); await page.waitForTimeout(100);
      hl = await page.evaluate(() => document.querySelectorAll('.stage-svg .obj.hl').length);
      check(name, 'tapping again clears the highlight', hl === 0);

      // A word in another step: tapping it activates that step first.
      await showStep(page, await idx(page, 'tiles'));
      await page.locator('#step-floors .sw[data-k="middle"]').scrollIntoViewIfNeeded();
      await page.locator('#step-floors .sw[data-k="middle"]').tap(); await page.waitForTimeout(150);
      const act = await page.evaluate(() => ({ active: window.__story.active, hl: [...document.querySelectorAll('.stage-svg .obj.hl')].map(g => g.dataset.id) }));
      check(name, 'tapping a word in another step switches to that step and highlights', act.active === 'floors' && act.hl.includes(`floor-3`), `${act.active}: ${act.hl.join(',')}`);

      const term = page.locator('#step-tiles .gl[data-term="token"]');
      await showStep(page, await idx(page, 'tiles'));
      await term.tap(); await page.waitForTimeout(100);
      const note = page.locator('#gl-tiles-token');
      check(name, 'tapping a glossary term opens its note', await note.isVisible() && (await term.getAttribute('aria-expanded')) === 'true', (await note.textContent()).slice(0, 60));
      await term.tap(); await page.waitForTimeout(100);
      check(name, 'tapping it again closes the note', !(await note.isVisible()));

      // Slider in I-3 updates the scene live.
      await showStep(page, await idx(page, 'directions'));
      const before = await page.evaluate(() => document.querySelector('[data-id="tok-label"] text').textContent);
      await page.locator('#ctl-directions').fill('0');
      await page.waitForTimeout(100);
      const after = await page.evaluate(() => document.querySelector('[data-id="tok-label"] text').textContent);
      check(name, 'I-3 slider changes the token arrow and shadow readout', before !== after, `${before} → ${after}`);

      // Bottom nav buttons are at least 44×44.
      const sizes = await page.evaluate(() => [...document.querySelectorAll('.stepper .btn, [data-replay], [data-begin]')].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
      check(name, 'nav, Begin and Replay buttons are ≥ 44×44', sizes.every(([w, h]) => w >= 44 && h >= 44), JSON.stringify(sizes.slice(0, 3)));
      check(name, 'no console errors (phone)', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }

    // ---- desktop: keyboard, focus rings, hover, replay ----
    {
      const ctx = await browser.newContext(contextOptions(name, { width: 1440, height: 900 }));
      const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => { window.__instant = true; });
      const seen = [];
      for (let k = 0; k < 3; k++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); seen.push(await page.evaluate(() => window.__story.active)); }
      check(name, '→ moves forward one step at a time', seen.join(',') === 'tiles,numbers,floors', seen.join(','));
      await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(250);
      check(name, '← moves back', await page.evaluate(() => window.__story.active) === 'numbers');
      check(name, 'URL hash follows the active step', await page.evaluate(() => location.hash) === '#numbers');

      // Tab reaches a coloured word, shows a visible focus ring, and highlights.
      await page.evaluate(() => document.querySelector('#step-numbers h2').setAttribute('tabindex', '-1'));
      await page.evaluate(() => document.querySelector('#step-numbers h2').focus());
      let focused = null;
      for (let k = 0; k < 6; k++) { await page.keyboard.press('Tab'); focused = await page.evaluate(() => ({ cls: document.activeElement.className, k: document.activeElement.dataset.k || document.activeElement.dataset.term, outline: getComputedStyle(document.activeElement).outlineStyle, width: getComputedStyle(document.activeElement).outlineWidth })); if (focused.cls.includes('sw')) break; }
      check(name, 'Tab reaches a coloured word with a visible focus ring', focused.cls.includes('sw') && focused.outline !== 'none' && parseFloat(focused.width) >= 2, JSON.stringify(focused));
      await page.waitForTimeout(150);
      const hlKb = await page.evaluate(() => document.querySelectorAll('.stage-svg .obj.hl').length);
      check(name, 'keyboard focus on a coloured word highlights the scene', hlKb > 0, `${hlKb} objects`);
      await page.keyboard.press('Enter'); await page.waitForTimeout(100);
      check(name, 'Enter on a coloured word toggles it (aria-pressed)', await page.evaluate(() => document.activeElement.getAttribute('aria-pressed')) === 'true');

      // Hover (desktop enhancement).
      await page.mouse.move(5, 5);
      await page.evaluate(() => document.activeElement.blur());
      await showStep(page, await idx(page, 'directions'));
      await page.locator('#step-directions .sw[data-k="shadow"]').hover(); await page.waitForTimeout(150);
      const hov = await page.evaluate(() => [...document.querySelectorAll('.stage-svg .obj.hl')].map(g => g.dataset.id));
      check(name, 'hovering a coloured word highlights (desktop)', hov.includes('shadow'), hov.join(','));
      await page.mouse.move(5, 5); await page.waitForTimeout(100);

      // Replay restarts the beats.
      await page.locator('#step-directions [data-replay]').click();
      await page.waitForTimeout(80);
      const playing = await page.evaluate(() => !!window.__story.stage.timeline);
      await page.waitForTimeout(4200);
      const done = await page.evaluate(() => !window.__story.stage.timeline);
      check(name, 'Replay plays the step again and finishes', playing && done);

      // Deep link.
      await page.evaluate(() => { location.hash = '#guess'; }); await page.waitForTimeout(400);
      check(name, 'editing the hash to #guess moves to that step', await page.evaluate(() => window.__story.active) === 'guess');
      await page.goto('about:blank');
      await page.goto(server.url + '#crowded', { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
      check(name, 'deep link #crowded opens that step on load', await page.evaluate(() => window.__story.active) === 'crowded');
      check(name, 'no console errors (desktop)', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }

    // ---- Act II: λ slider, maths toggle, live training replay ----
    {
      const ctx = await browser.newContext(contextOptions(name, { width: 390, height: 844 }));
      const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(server.url, { waitUntil: 'networkidle' });

      await showStep(page, await idx(page, 'tug'));
      const knot = () => page.evaluate(() => document.querySelector('[data-id="knot"] text').textContent);
      const before = await knot();
      await page.locator('#ctl-tug').fill('0'); await page.waitForTimeout(100);
      const after = await knot();
      const out = await page.locator('#out-tug').textContent();
      check(name, 'II-6 λ slider moves the knot and updates the readout', before !== after && after.includes('λ = 0') && out === '0', `${before} → ${after}`);

      await showStep(page, await idx(page, 'relu'));
      const sum = page.locator('#step-relu details.maths summary');
      await sum.tap(); await page.waitForTimeout(100);
      check(name, '“Show the maths” opens', await page.evaluate(() => document.querySelector('#step-relu details.maths').open));

      await showStep(page, await idx(page, 'training'));
      if (name === 'chromium') await page.evaluate(() => { window.__long = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__long.push(Math.round(e.duration)))).observe({ type: 'longtask' }); } catch {} });
      await page.locator('#step-training [data-replay]').tap();
      // Live training shows rounds that the saved keyframes (0, 40, 150, 400, 1500) never do.
      const rounds = [];
      for (let k = 0; k < 40; k++) { rounds.push(+(await page.evaluate(() => document.querySelector('[data-id="round"] text').textContent.replace('round ', '')))); if (rounds.at(-1) === 1500) break; await page.waitForTimeout(100); }
      const keyframes = new Set([0, 40, 150, 400, 1500]);
      const live = rounds.filter(r => !keyframes.has(r));
      check(name, 'II-5 Replay retrains the toy live, round by round, to round 1500', live.length >= 3 && rounds.at(-1) === 1500 && rounds.every((r, k) => k === 0 || r >= rounds[k - 1]), `${rounds.slice(0, 6).join(', ')} … ${rounds.at(-1)}`);
      if (name === 'chromium') {
        const long = await page.evaluate(() => window.__long || []);
        check(name, 'live training causes no long tasks (>50 ms) on the main thread', long.length === 0, long.length ? long.join(',') + ' ms' : 'none');
      }
      // Act III: the clamp dial drives the toy's next-word odds.
      await showStep(page, await idx(page, 'dial'));
      const odds = () => page.evaluate(() => [...document.querySelectorAll('[data-id="odds"] text.mono')].map(t => t.textContent).join(' '));
      const at10 = await odds();
      await page.locator('#ctl-dial').fill('-5'); await page.waitForTimeout(100);
      const atMinus5 = await odds();
      check(name, 'III-4 clamp dial changes the toy’s next-word odds', at10 !== atMinus5 && (await page.locator('#out-dial').textContent()) === '−5×', `${at10} → ${atMinus5}`);
      await showStep(page, await idx(page, 'lights'));
      const heat = await page.evaluate(() => [...document.querySelectorAll('[data-id^="tile-"]')].map(g => +(g.querySelector('.in > polygon:nth-of-type(4)')?.getAttribute('opacity') || 0)));
      check(name, 'III-1 tints the bridge words, not the others', heat[6] > 0.5 && heat[0] === 0 && heat[3] === 0, heat.map(v => v.toFixed(2)).join(' '));
      // Act IV: water-line slider and the brightness/attribution toggle.
      await showStep(page, await idx(page, 'missing'));
      const level = () => page.evaluate(() => [...document.querySelectorAll('[data-id="water"] text')].map(t => t.textContent).find(t => t.startsWith('Water level')));
      const at34 = await level();
      await page.locator('#ctl-missing').fill('0'); await page.waitForTimeout(100);
      const at1 = await level();
      check(name, 'IV-3 slider lowers coverage from 34M (12 of 20) to 1M', at34.includes('34M · 12 of 20') && at1.includes('1M') && !at1.includes('12 of 20'), `${at34} → ${at1}`);
      await showStep(page, await idx(page, 'shortcut'));
      const row = () => page.evaluate(() => document.querySelector('[data-id="kobe-ten"] text').textContent + ' · ' + document.querySelectorAll('[data-id="kobe-ten"] .slot-on').length);
      const byAttr = await row();
      await page.locator('#step-shortcut [data-rank="brightness"]').tap(); await page.waitForTimeout(100);
      const byBright = await row();
      const pressed = await page.locator('#step-shortcut [data-rank="brightness"]').getAttribute('aria-pressed');
      check(name, 'IV-6 toggle switches the top 10 between attribution (8) and brightness (3)', byAttr.endsWith('· 8') && byBright.endsWith('· 3') && pressed === 'true', `${byAttr} → ${byBright}`);
      // Act V: the collapsed list of further limitations.
      await showStep(page, await idx(page, 'limits'));
      const more = page.locator('#step-limits details.maths summary', { hasText: 'More limitations' });
      await more.tap(); await page.waitForTimeout(100);
      const items = await page.evaluate(() => { const d = [...document.querySelectorAll('#step-limits details.maths')].find(x => x.textContent.includes('More limitations')); return { open: d.open, n: d.querySelectorAll('li').length }; });
      check(name, 'V-4 “More limitations” opens with five more', items.open && items.n === 5, JSON.stringify(items));
      // Labs.
      await page.evaluate(() => document.querySelector('#lab-train').scrollIntoView());
      await page.waitForTimeout(200);
      if (name === 'chromium') await page.evaluate(() => { window.__long2 = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__long2.push(Math.round(e.duration)))).observe({ type: 'longtask' }); } catch {} });
      await page.locator('[data-lab1="train"]').tap();
      await page.waitForTimeout(3000);
      const r1 = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#lab-train [data-out]')].map(d => [d.dataset.out, d.textContent])));
      await page.locator('[data-lab1="train"]').tap();
      check(name, 'Lab 1 trains: rounds advance and the readouts update', +r1.round.replace(/,/g, '') > 100 && r1.loss !== '–' && /of 8/.test(r1.found), JSON.stringify(r1));
      if (name === 'chromium') { const long = await page.evaluate(() => window.__long2 || []); check(name, 'Lab 1 training causes no long tasks (>50 ms)', long.length === 0, long.join(',') || 'none'); }
      const stepperAway = await page.evaluate(() => document.querySelector('#stepper').classList.contains('away'));
      check(name, 'the step nav hides once the story is scrolled past', stepperAway);
      await page.evaluate(() => document.querySelector('#lab-steer').scrollIntoView());
      await page.locator('#lab-steer [data-prompt="lunch"]').tap();
      const lunchGgb = await page.locator('#lab-steer [data-out="completion"]').textContent();
      await page.locator('#lab-steer [data-feature]', { hasText: 'sadness' }).tap();
      const lunchSad = await page.locator('#lab-steer [data-out="completion"]').textContent();
      await page.locator('#lab-steer [data-lab2="release"]').tap();
      const lunchOff = await page.locator('#lab-steer [data-out="completion"]').textContent();
      check(name, 'Lab 2 steers the toy: bridge, then tears, then back to lunch when released', lunchGgb.includes('bridge.') && lunchSad.includes('tears.') && lunchOff.includes('lunch.'), `${lunchGgb} / ${lunchSad} / ${lunchOff}`);
      check(name, 'no console errors (Acts II–V and labs)', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }

    // ---- regression: no oversized-text flash, no step flip-flop mid-scroll ----
    // Real smooth scrolling (no __instant), dark mode, stepping through every step.
    {
      const ctx = await browser.newContext(contextOptions(name, { width: 1440, height: 900 }, { colorScheme: 'dark' }));
      const page = await ctx.newPage();
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        window.__big = []; window.__changes = [];
        document.addEventListener('stepchange', e => window.__changes.push(e.detail.id));
        const tick = () => {
          document.querySelectorAll('.stage-svg .world text').forEach(t => {
            const g = t.closest('.obj'); if (!g || getComputedStyle(g).display === 'none' || +(g.getAttribute('opacity') ?? 1) < 0.05) return;
            const lines = t.querySelectorAll('tspan').length || 1;
            // Per line. Scene text is at most 18px, ×1.5 on big stages (~35px tall);
            // the flash this guards against painted text 740–870px tall.
            const h = t.getBoundingClientRect().height / lines;
            if (h > 60) window.__big.push({ id: g.dataset.id, h: Math.round(h) });
          });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      const n = await page.evaluate(() => window.__story.steps.length);
      for (let i = 1; i < n; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(2600); }
      const { big, changes } = await page.evaluate(() => ({ big: window.__big, changes: window.__changes }));
      check(name, 'no scene text ever paints oversized while stepping (the “big white letters” flash)', big.length === 0, big.length ? JSON.stringify(big.slice(0, 3)) : `${n - 1} transitions watched every frame`);
      const expected = (await page.evaluate(() => window.__story.steps)).slice(1);
      check(name, 'each → press changes the step exactly once (no flip-flop during smooth scroll)', JSON.stringify(changes) === JSON.stringify(expected), changes.join(','));
      await ctx.close();
    }

    // ---- reduced motion: cross-fade straight to the end state ----
    {
      const ctx = await browser.newContext(contextOptions(name, { width: 390, height: 844 }, { reducedMotion: 'reduce' }));
      const page = await ctx.newPage();
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await page.evaluate(i => window.__story.go(i), await idx(page, 'tiles'));
      await page.waitForTimeout(80);
      const mid = await page.evaluate(() => !!document.querySelector('.stage-svg .snapshot'));
      await page.waitForTimeout(400);
      const end = await page.evaluate(() => ({ snap: !!document.querySelector('.stage-svg .snapshot'), tiles: document.querySelectorAll('.stage-svg .obj-tile').length, plank: !!document.querySelector('[data-id="plank"]') }));
      check(name, 'reduced motion: cross-fades (snapshot overlay) to the final frame', mid && !end.snap && end.tiles === 10 && !end.plank, JSON.stringify({ mid, ...end }));
      await ctx.close();
    }

    // ---- a step's own Replay button can be reached without the next step taking over ----
    {
      const ctx = await browser.newContext(contextOptions(name, { width: 320, height: 568 }));
      const page = await ctx.newPage();
      await page.goto(server.url, { waitUntil: 'networkidle' });
      const steps = await page.evaluate(() => window.__story.steps), bad = [];
      for (let i = 1; i < steps.length; i++) {
        const btn = page.locator(`#step-${steps[i]} [data-replay]`);
        if (!await btn.count()) continue;
        await page.evaluate(i => window.__story.go(i, { instant: true }), i);
        await page.waitForTimeout(120);
        await btn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const a = await page.evaluate(() => window.__story.active);
        if (a !== steps[i]) bad.push(`${steps[i]}→${a}`);
      }
      check(name, 'scrolling to a step’s Replay button keeps that step active (320×568)', bad.length === 0, bad.join(', ') || 'all steps');
      await ctx.close();
    }
    await browser.close();
  }
} finally { server.stop(); }

await mkdir(path.join(ROOT, 'evidence/e2e'), { recursive: true });
await writeFile(path.join(ROOT, 'evidence/e2e/results.json'), JSON.stringify({ generated: new Date().toISOString(), results }, null, 1));
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
