// Research tool, not site code: screenshots of the reference explorable for
// research/style-notes.md. Output goes to research/reference-shots/ (gitignored).
//
//   node scripts/ref-shots.mjs [--browser chromium|webkit]

import { chromium, webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const URL = 'https://mdjawad.com/explorables/clm/';
const OUT = path.resolve('research/reference-shots');
const SIZES = [
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '360x800', width: 360, height: 800, mobile: true },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
];
// A spread of steps: the opener, a coloured-word step, a mid-story machine,
// a "receipts" step with numbers and a caption, and the closing map.
const STEPS = ['hook', 'three-ways', 'anatomy', 'receipts', 'spectrum'];

const which = process.argv.includes('--browser') ? process.argv[process.argv.indexOf('--browser') + 1] : 'chromium';
const engine = { chromium, webkit }[which];
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await engine.launch();
const log = [];

for (const size of SIZES) {
  const dir = path.join(OUT, which, size.name);
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 2,
    isMobile: size.mobile && which === 'chromium',
    hasTouch: size.mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // Changing only the hash doesn't reload the page, so drive the reference's
  // own step controller (window.STORY.go) instead of relying on deep links.
  const goStep = async id => {
    await page.evaluate(id => {
      const i = [...document.querySelectorAll('.step[data-step]')].findIndex(s => s.dataset.step === id);
      window.STORY.go(i, true);
    }, id);
  };

  const shot = async name => {
    await page.screenshot({ path: path.join(dir, `${name}.png`) });
    log.push(`${which}/${size.name}/${name}.png`);
  };

  // 1. Hook / hero, at the very top.
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await wait(1500);
  await shot('00-hero');

  // 2. Story steps (the page scrolls to the step and activates it).
  for (const [i, id] of STEPS.entries()) {
    await goStep(id);
    await wait(2000); // the scene tween is ~0.9-1.0 s
    await shot(`${String(i + 1).padStart(2, '0')}-step-${id}`);
  }

  // 3. A transition, frame by frame: from "three-ways" press → to the next step.
  await goStep('three-ways');
  await wait(2000);
  await page.click('.stepper [data-next]');
  const t0 = Date.now();
  for (const t of [0, 150, 300, 500, 800, 1200]) {
    await wait(Math.max(0, t - (Date.now() - t0)));
    await shot(`10-transition-${String(t).padStart(4, '0')}ms`);
  }

  // 4. A coloured word highlighting its scene objects (tap on mobile, hover on desktop).
  await goStep('three-ways');
  await wait(2000);
  const word = page.locator('.step.is-active .t[data-k="lookup"]').first();
  if (size.mobile) await word.tap(); else await word.hover();
  await wait(500);
  await shot('20-coloured-word');

  // 5. A lab and the closing sources.
  for (const [name, sel] of [['30-lab-1', '#lab-train'], ['31-lab-2', '#lab-build'], ['40-sources', 'footer.colophon']]) {
    await page.locator(sel).scrollIntoViewIfNeeded();
    await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'start' }), sel);
    await wait(1500);
    await shot(name);
  }

  if (errors.length) log.push(`  page errors at ${size.name}: ${errors.join(' | ')}`);
  await ctx.close();
}

await browser.close();
await writeFile(path.join(OUT, `${which}-index.txt`), log.join('\n') + '\n');
console.log(log.join('\n'));
