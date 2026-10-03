// Shared helpers for the Playwright scripts: start the dev server on a free
// port, launch a browser, and drive the story through its test hook.
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { chromium, webkit } from 'playwright';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const ENGINES = { chromium, webkit };

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => res(port)); }); });

export async function startServer({ dist = false } = {}) {
  const port = await freePort();
  const proc = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs'), ...(dist ? ['--dist'] : [])], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((res, rej) => { proc.stdout.once('data', res); proc.once('exit', c => rej(new Error(`server exited ${c}`))); });
  return { url: `http://localhost:${port}/`, stop: () => proc.kill() };
}

/** Viewport + touch settings per browser (WebKit has no isMobile). */
export function contextOptions(engine, { width, height }, extra = {}) {
  const phone = width < 900;
  return { viewport: { width, height }, deviceScaleFactor: 1, hasTouch: phone, ...(engine === 'chromium' && phone ? { isMobile: true } : {}), ...extra };
}

/** Jump to step i with no scroll animation and no scene animation. */
export async function showStep(page, i) {
  await page.evaluate(i => { window.__instant = true; window.__story.go(i); }, i);
  await page.waitForTimeout(120);
  await page.evaluate(() => window.__story.stage.finish());
  await page.waitForTimeout(260);
}
