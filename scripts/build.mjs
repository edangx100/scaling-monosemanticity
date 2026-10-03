// npm run build: static site in dist/, same layout as the source so every
// relative path still works from a subfolder (GitHub Pages).
//   dist/index.html        rendered from index.html + content/
//   dist/src/main.js       bundled + minified (esbuild)
//   dist/src/styles.css    minified
//   dist/assets/…          copied

import { build } from 'esbuild';
import { mkdir, rm, writeFile, cp, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderPage } from './render.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');

await rm(DIST, { recursive: true, force: true });
await mkdir(path.join(DIST, 'src'), { recursive: true });

await build({
  entryPoints: [path.join(ROOT, 'src/main.js')],
  outfile: path.join(DIST, 'src/main.js'),
  bundle: true, minify: true, format: 'esm', target: ['es2020', 'safari15'], sourcemap: false, logLevel: 'warning',
});
await build({
  entryPoints: [path.join(ROOT, 'src/styles.css')],
  outfile: path.join(DIST, 'src/styles.css'),
  bundle: true, minify: true, external: ['../assets/*'], logLevel: 'warning',
});
await cp(path.join(ROOT, 'assets'), path.join(DIST, 'assets'), { recursive: true });
await writeFile(path.join(DIST, 'index.html'), await renderPage());
await writeFile(path.join(DIST, '.nojekyll'), '');

const js = readFileSync(path.join(DIST, 'src/main.js'));
const css = readFileSync(path.join(DIST, 'src/styles.css'));
const kb = n => (n / 1024).toFixed(1) + ' KB';
console.log(`dist/src/main.js   ${kb(js.length)} (${kb(gzipSync(js).length)} gzipped)`);
console.log(`dist/src/styles.css ${kb(css.length)} (${kb(gzipSync(css).length)} gzipped)`);
console.log(`dist/index.html    ${kb((await stat(path.join(DIST, 'index.html'))).size)}`);
