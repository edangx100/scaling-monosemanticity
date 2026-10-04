// npm run words: every coloured word on the page, tapped on a phone and
// hovered on a desktop, in Chromium and WebKit. Each must highlight at least
// one scene object. Writes evidence/e2e/words.json.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, ENGINES, startServer, contextOptions, showStep } from './harness.mjs';

const server = await startServer();
const out = { generated: new Date().toISOString(), runs: [] };
let failures = 0;
try {
  for (const name of Object.keys(ENGINES)) {
    const browser = await ENGINES[name].launch();
    for (const mode of ['tap', 'hover']) {
      const size = mode === 'tap' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
      const page = await (await browser.newContext(contextOptions(name, size))).newPage();
      await page.goto(server.url, { waitUntil: 'networkidle' });
      const words = await page.evaluate(() => [...document.querySelectorAll('.step .sw')].map((w, i) => ({ i, step: w.closest('.step').dataset.step, key: w.dataset.k, text: w.textContent.trim() })));
      const run = { browser: name, mode, total: words.length, failed: [] };
      for (const w of words) {
        const idx = await page.evaluate(id => window.__story.steps.indexOf(id), w.step);
        await showStep(page, idx);
        const loc = page.locator('.step .sw').nth(w.i);
        await loc.scrollIntoViewIfNeeded();
        if (mode === 'tap') await loc.tap(); else { await page.mouse.move(2, 2); await loc.hover(); }
        await page.waitForTimeout(60);
        const n = await page.evaluate(() => document.querySelectorAll('#stage .obj.hl').length);
        if (!n) run.failed.push(`${w.step}: “${w.text}” (${w.key})`);
        if (mode === 'tap') await loc.tap();   // toggle off
      }
      failures += run.failed.length;
      out.runs.push(run);
      console.log(`${name} ${mode}: ${run.total - run.failed.length}/${run.total} coloured words highlight their scene object${run.failed.length ? '\n  ' + run.failed.join('\n  ') : ''}`);
      await page.context().close();
    }
    await browser.close();
  }
} finally { server.stop(); }
await mkdir(path.join(ROOT, 'evidence/e2e'), { recursive: true });
await writeFile(path.join(ROOT, 'evidence/e2e/words.json'), JSON.stringify(out, null, 1));
process.exit(failures ? 1 : 0);
