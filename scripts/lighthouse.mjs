// npm run lh: Lighthouse mobile (performance + accessibility) on the
// production build, using Playwright's Chromium. evidence/lighthouse/
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { chromium } from 'playwright';
import { ROOT, startServer } from './harness.mjs';

execFileSync(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' });
const server = await startServer({ dist: true });
const url = server.url + 'scaling-monosemanticity/';
// Launch Playwright's Chromium ourselves: under WSL, chrome-launcher rewrites
// paths to Windows form and Chromium then creates them inside the project.
const profile = await mkdtemp(path.join(os.tmpdir(), 'lh-profile-'));
const port = await new Promise(res => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
const chrome = spawn(chromium.executablePath(), ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
for (let k = 0; k < 50; k++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) break; } catch { /* not up yet */ } await new Promise(r => setTimeout(r, 100)); }
try {
  const result = await lighthouse(url, { port, output: ['html', 'json'], onlyCategories: ['performance', 'accessibility'], logLevel: 'error' });
  const out = path.join(ROOT, 'evidence/lighthouse');
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, 'report.html'), result.report[0]);
  await writeFile(path.join(out, 'report.json'), result.report[1]);
  const c = result.lhr.categories, a = result.lhr.audits;
  const summary = {
    url, fetched: result.lhr.fetchTime, formFactor: result.lhr.configSettings.formFactor,
    performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
    LCP: a['largest-contentful-paint'].displayValue, TBT: a['total-blocking-time'].displayValue, CLS: a['cumulative-layout-shift'].displayValue, FCP: a['first-contentful-paint'].displayValue,
    failedA11y: Object.values(c.accessibility.auditRefs).map(r => a[r.id]).filter(x => x.score === 0).map(x => x.id),
  };
  await writeFile(path.join(out, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(summary);
} finally { chrome.kill(); server.stop(); await new Promise(r => setTimeout(r, 300)); await rm(profile, { recursive: true, force: true }); }
