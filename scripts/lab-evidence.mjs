// Lab 1 before/after: random arrows at reset, then on the hidden ideas after
// training. evidence/labs/lab1-before.png, lab1-after.png, lab1.json
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, ENGINES, startServer, contextOptions } from './harness.mjs';

const server = await startServer();
const browser = await ENGINES.chromium.launch();
const page = await (await browser.newContext(contextOptions('chromium', { width: 1440, height: 900 }))).newPage();
await page.goto(server.url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.getElementById('lab-train').scrollIntoView());
await page.waitForTimeout(800);
const read = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#lab-train [data-out]')].map(d => [d.dataset.out, d.textContent])));
const shot = name => page.locator('#lab-train .lab-body').screenshot({ path: path.join(ROOT, 'evidence/labs', name) });
const before = await read(); await shot('lab1-before.png');
await page.locator('[data-lab1="train"]').click();
await page.waitForFunction(() => /Finished/.test(document.querySelector('#lab-train [data-out="status"]').textContent), null, { timeout: 120000 });
const after = await read(); await shot('lab1-after.png');
await writeFile(path.join(ROOT, 'evidence/labs/lab1.json'), JSON.stringify({ before, after }, null, 1));
console.log('before', before); console.log('after', after);
await browser.close(); server.stop();
