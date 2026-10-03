// npm run shots: screenshots of every built step in Chromium and WebKit at
// six sizes, plus dark-mode and reduced-motion variants, into evidence/shots/.
// Also checks each shot for horizontal overflow and clipped scene labels,
// writing evidence/shots/report.json.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, ENGINES, startServer, contextOptions, showStep } from './harness.mjs';

const SIZES = [[320, 568], [360, 800], [390, 844], [430, 932], [844, 390], [1440, 900]].map(([width, height]) => ({ width, height }));
const VARIANTS = [
  { name: '', sizes: SIZES },
  { name: 'dark', sizes: [SIZES[2], SIZES[5]], opts: { colorScheme: 'dark' } },
  { name: 'reduced', sizes: [SIZES[2], SIZES[5]], opts: { reducedMotion: 'reduce' } },
];
const OUT = path.join(ROOT, 'evidence/shots');
const only = process.argv.includes('--browser') ? [process.argv[process.argv.indexOf('--browser') + 1]] : Object.keys(ENGINES);

const server = await startServer();
const report = { generated: new Date().toISOString(), runs: [] };
let problems = 0;
try {
  for (const engineName of only) {
    const browser = await ENGINES[engineName].launch();
    for (const v of VARIANTS) for (const size of v.sizes) {
      const label = `${size.width}x${size.height}${v.name ? '-' + v.name : ''}`;
      const dir = path.join(OUT, engineName, label);
      await mkdir(dir, { recursive: true });
      const ctx = await browser.newContext(contextOptions(engineName, size, v.opts));
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto(server.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const ids = await page.evaluate(() => window.__story.steps);
      const run = { browser: engineName, size: label, steps: [] };
      for (let i = 0; i < ids.length; i++) {
        await showStep(page, i);
        const file = path.join(dir, `${String(i).padStart(2, '0')}-${ids[i]}.png`);
        await page.screenshot({ path: file });
        const check = await page.evaluate(() => {
          const doc = document.documentElement;
          const overflowX = doc.scrollWidth > doc.clientWidth + 1;
          const st = document.querySelector('.stage').getBoundingClientRect();
          const clipped = [];
          document.querySelectorAll('.stage-svg .world text').forEach(t => {
            let el = t, hidden = false;
            while (el && el.tagName !== 'svg') { const cs = getComputedStyle(el); if (cs.display === 'none' || +cs.opacity === 0 || +(el.getAttribute('opacity') ?? 1) <= 0.02) { hidden = true; break; } el = el.parentNode; }
            if (hidden || !t.textContent.trim()) return;
            const r = t.getBoundingClientRect();
            if (r.left < st.left - 1 || r.right > st.right + 1 || r.top < st.top - 1 || r.bottom > st.bottom + 1) clipped.push(t.textContent.trim().slice(0, 30));
          });
          const sizes = [...document.querySelectorAll('.stage-svg .world text')].map(t => t.getBoundingClientRect().height).filter(h => h > 0);
          return { overflowX, clipped, active: window.__story.active };
        });
        if (check.overflowX || check.clipped.length) problems++;
        run.steps.push({ step: ids[i], file: path.relative(ROOT, file), ...check });
      }
      run.errors = errors;
      if (errors.length) problems++;
      report.runs.push(run);
      console.log(`${engineName} ${label}: ${run.steps.length} shots, ${run.steps.filter(s => s.overflowX).length} overflow, ${run.steps.filter(s => s.clipped.length).length} with clipped labels, ${errors.length} errors`);
      await ctx.close();
    }
    await browser.close();
  }
} finally { server.stop(); }
report.problems = problems;
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log(problems ? `\n${problems} problem(s); see evidence/shots/report.json` : '\nNo overflow, clipped labels or page errors.');
