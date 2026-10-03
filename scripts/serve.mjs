// npm run dev: a tiny static server. "/" is rendered from index.html +
// content/ on every request, so copy edits show up on reload.
//   PORT=5173 node scripts/serve.mjs [--dist]

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { renderPage } from './render.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = process.argv.includes('--dist');
const BASE = DIST ? path.join(ROOT, 'dist') : ROOT;
const PORT = +(process.env.PORT || 5173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    // Also serve under /scaling-monosemanticity/ to mimic GitHub Pages.
    p = p.replace(/^\/scaling-monosemanticity(?=\/|$)/, '') || '/';
    if (p.endsWith('/')) p += 'index.html';
    if (!DIST && p === '/index.html') {
      const html = await renderPage({ bust: true });
      res.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' });
      return res.end(html);
    }
    const file = path.join(BASE, path.normalize(p));
    if (!file.startsWith(BASE)) { res.writeHead(403); return res.end(); }
    await stat(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(await readFile(file));
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500, { 'content-type': 'text/plain' });
    res.end(e.code === 'ENOENT' ? 'Not found' : String(e.stack || e));
  }
}).listen(PORT, () => console.log(`Serving ${DIST ? 'dist/' : 'source'} at http://localhost:${PORT}/`));
