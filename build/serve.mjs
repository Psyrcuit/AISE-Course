// Tiny static server for development + Playwright tests.
// Serves the project root; ESM modules need http (browsers block file://).
// Run: `node build/serve.mjs [port]`
// Default port 4173.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = parseInt(process.argv[2] || '4173', 10);
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.map': 'application/json'
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === '') pathname = '/course.html';
    const filePath = normalize(join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); res.end('forbidden'); return;
    }
    const st = await stat(filePath).catch(() => null);
    if (!st || !st.isFile()) {
      res.writeHead(404); res.end('not found: ' + pathname); return;
    }
    const buf = await readFile(filePath);
    const ct = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': ct,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(buf);
  } catch (err) {
    res.writeHead(500); res.end('server error: ' + err.message);
  }
});
server.listen(PORT, () => {
  console.log('Serving ' + ROOT + ' on http://localhost:' + PORT);
});
