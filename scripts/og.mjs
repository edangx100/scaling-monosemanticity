// node scripts/og.mjs → og.png (1200×630): the hook as it looks when its
// animation has finished. Committed; the build copies it to dist/.
import path from 'node:path';
import { ROOT, ENGINES, startServer } from './harness.mjs';

const server = await startServer();
const browser = await ENGINES.chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
await page.goto(server.url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => !window.__story.stage.timeline, null, { timeout: 15000 });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(ROOT, 'og.png') });
await browser.close(); server.stop();
console.log('saved og.png (1200×630)');
