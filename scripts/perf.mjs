// npm run perf: frame timing at 4× CPU slowdown (Chromium, via the DevTools
// protocol), on a phone-sized page, while
//   1. stepping through every step with real smooth scrolling and animation,
//   2. Lab 1 training for 6 seconds.
// Every animation frame is timed in the page; a DevTools performance trace of
// the first steps is saved too. Writes evidence/perf/.
import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { ROOT, ENGINES, startServer, contextOptions } from './harness.mjs';

const OUT = path.join(ROOT, 'evidence/perf');
await mkdir(OUT, { recursive: true });
const server = await startServer({ dist: true });
const browser = await ENGINES.chromium.launch();
const ctx = await browser.newContext(contextOptions('chromium', { width: 390, height: 844 }));
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await page.goto(server.url + 'scaling-monosemanticity/', { waitUntil: 'networkidle' });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

// Frame timer in the page.
await page.evaluate(() => {
  window.__frames = []; let last = performance.now();
  const tick = now => { window.__frames.push(now - last); last = now; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const take = () => page.evaluate(() => { const f = window.__frames; window.__frames = []; return f; });
const stats = f => {
  const s = [...f].sort((a, b) => a - b), n = s.length || 1, sum = f.reduce((a, b) => a + b, 0);
  const q = p => s[Math.min(n - 1, Math.floor(p * n))] || 0;
  return { frames: f.length, fps: +(1000 / (sum / n)).toFixed(1), median: +q(0.5).toFixed(1), p95: +q(0.95).toFixed(1), max: +(s[n - 1] || 0).toFixed(1), slow: f.filter(x => x > 20).length, slowShare: +(100 * f.filter(x => x > 20).length / n).toFixed(1) };
};

// 1. Stepping through the story (trace the first few steps).
const steps = await page.evaluate(() => window.__story.steps);
await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.frame,blink.user_timing', transferMode: 'ReturnAsStream' });
const perStep = [];
await take();
for (let i = 1; i < steps.length; i++) {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(2400);
  perStep.push({ step: steps[i], ...stats(await take()) });
  if (i === 4) {
    const done = new Promise(res => cdp.once('Tracing.tracingComplete', res));
    await cdp.send('Tracing.end');
    const { stream } = await done;
    let data = '', chunk;
    do { chunk = await cdp.send('IO.read', { handle: stream }); data += chunk.data; } while (!chunk.eof);
    await cdp.send('IO.close', { handle: stream });
    await writeFile(path.join(OUT, 'trace-steps-1-4.json.gz'), gzipSync(data));
  }
}
// 2. Lab 1 training.
await page.evaluate(() => document.getElementById('lab-train').scrollIntoView());
await page.waitForTimeout(1500);
await take();
await page.locator('[data-lab1="train"]').click();
await page.waitForTimeout(6000);
const lab = stats(await take());
await page.locator('[data-lab1="train"]').click();
const rounds = await page.evaluate(() => document.querySelector('#lab-train [data-out="round"]').textContent);

const stepFrames = perStep.reduce((a, s) => a + s.frames, 0);
const summary = {
  generated: new Date().toISOString(), cpuThrottle: '4×', viewport: '390×844 (phone emulation)', build: 'production (dist/)',
  steps: { count: perStep.length, frames: stepFrames, meanFps: +(perStep.reduce((a, s) => a + s.fps * s.frames, 0) / stepFrames).toFixed(1), slowFrames: perStep.reduce((a, s) => a + s.slow, 0), worst: [...perStep].sort((a, b) => a.fps - b.fps).slice(0, 5) },
  lab1Training: { ...lab, rounds },
  perStep,
};
await writeFile(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 1));
console.log(`Steps (${summary.steps.count} transitions, ${stepFrames} frames): mean ${summary.steps.meanFps} fps, ${summary.steps.slowFrames} frames over 20 ms`);
console.log('Slowest steps:', summary.steps.worst.map(s => `${s.step} ${s.fps} fps (p95 ${s.p95} ms, max ${s.max} ms)`).join('; '));
console.log(`Lab 1 training (6 s): ${lab.fps} fps, p95 ${lab.p95} ms, ${lab.slowShare}% frames over 20 ms, reached round ${rounds}`);
await browser.close(); server.stop();
