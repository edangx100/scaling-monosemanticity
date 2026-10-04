// Review helper: screenshot chosen steps after their animation ends, plus a
// grid image of the top (scene) halves.
//   node scripts/peek.mjs <outDir> <width> <height> step… [--dark] [--webkit] [--full]
import { mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ENGINES, startServer, contextOptions } from './harness.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const [out, w, h, ...ids] = args.filter(a => !a.startsWith('--'));
const engine = flags.has('--webkit') ? 'webkit' : 'chromium';
await mkdir(out, { recursive: true });
const server = await startServer();
const browser = await ENGINES[engine].launch();
const page = await (await browser.newContext(contextOptions(engine, { width: +w, height: +h }, { deviceScaleFactor: 2, colorScheme: flags.has('--dark') ? 'dark' : 'light' }))).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
await page.goto(server.url, { waitUntil: 'networkidle' });
const files = [];
for (const [k, id] of ids.entries()) {
  await page.evaluate(id => { window.__instant = true; window.__story.go(window.__story.steps.indexOf(id)); }, id);
  await page.waitForFunction(() => !window.__story.stage.timeline, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(250);
  const f = path.join(out, `peek-${k + 1}.png`);
  await page.screenshot({ path: f }); files.push(f);
}
await browser.close(); server.stop();
console.log('errors:', errors.length ? errors : 'none');
// Grid of the scenes (top half on phones, whole page on wide screens).
const crop = !flags.has('--full') && +w < 900;
execFileSync('python3', ['-c', `
import sys
from PIL import Image
fs=sys.argv[2:]; crop=sys.argv[1]=='1'
ims=[Image.open(f) for f in fs]
ims=[(i.crop((0,0,i.width,int(i.height*0.48))) if crop else i) for i in ims]
w=ims[0].width//2; h=ims[0].height//2; ims=[i.resize((w,h)) for i in ims]
cols=min(4,len(ims)); rows=(len(ims)+cols-1)//cols
g=Image.new('RGB',(w*cols,h*rows),'white')
for k,i in enumerate(ims): g.paste(i,((k%cols)*w,(k//cols)*h))
g.save('${path.join(out, 'grid.png')}')`, crop ? '1' : '0', ...files]);
