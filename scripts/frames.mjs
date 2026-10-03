// npm run frames: a frame sequence (every 100 ms) of the scene while a step
// animates, for review. evidence/frames/<step>/NN.png
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, ENGINES, startServer, contextOptions, showStep } from './harness.mjs';

const STEPS = process.argv.slice(2).length ? process.argv.slice(2) : ['tiles', 'floors'];
const server = await startServer();
try {
  const browser = await ENGINES.chromium.launch();
  const ctx = await browser.newContext(contextOptions('chromium', { width: 390, height: 844 }, { deviceScaleFactor: 2 }));
  const page = await ctx.newPage();
  await page.goto(server.url, { waitUntil: 'networkidle' });
  for (const id of STEPS) {
    const i = await page.evaluate(id => window.__story.steps.indexOf(id), id);
    await showStep(page, i - 1);                 // start from the previous step's end state
    const dir = path.join(ROOT, 'evidence/frames', id);
    await mkdir(dir, { recursive: true });
    await page.evaluate(i => { window.__instant = true; window.__story.go(i); }, i);
    const t0 = Date.now();
    for (let k = 0; k < 36; k++) {
      await page.waitForTimeout(Math.max(0, k * 100 - (Date.now() - t0)));
      await page.locator('.stage-wrap').screenshot({ path: path.join(dir, `${String(k).padStart(2, '0')}.png`) });
    }
    console.log(`${id}: 36 frames over ~3.6 s → ${path.relative(ROOT, dir)}/`);
  }
  await browser.close();
} finally { server.stop(); }
