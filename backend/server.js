#!/usr/bin/env node
/*
 * Luxor Création — local server (Node.js 18+, no dependencies).
 *   node backend/server.js            → http://localhost:8080   (admin: /admin/)
 *   PORT=8090 node backend/server.js  → other port
 *
 *   /api/*   → the backend API (backend/src/app.js), which talks to Supabase
 *   anything else → static files from frontend/
 * Online, Vercel does the same: frontend/ as static files + api/index.js as a serverless function.
 * Unknown /produit/<slug>/ pages fall back to frontend/produit/index.html (same rewrite as vercel.json).
 * Settings are read from the .env file at the project root (SUPABASE_URL, SUPABASE_ANON_KEY).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

/* minimal .env loader (no dependency): KEY=value lines, existing env vars win */
try {
  for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {}
const { handler: api } = require('./src/app');

const ROOT = path.join(__dirname, '..', 'frontend');
const PORT = +process.env.PORT || 8080;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.gif': 'image/gif', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' };
const send = (res, code, body, headers = {}) => { res.writeHead(code, { ...SEC, ...headers }); res.end(body); };

async function resolve(rel) {
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return null;
  if (path.relative(ROOT, file).split(path.sep).some(s => s.startsWith('.'))) return null;
  try {
    let st = await fsp.stat(file);
    if (st.isDirectory()) { const f = path.join(file, 'index.html'); st = await fsp.stat(f); return { file: f, st, dir: true }; }
    return { file, st };
  } catch { return null; }
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return api(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    let rel; try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad request'); }
    let hit = await resolve(rel);
    if (hit?.dir && !url.pathname.endsWith('/')) return send(res, 301, '', { Location: url.pathname + '/' + url.search });
    if (!hit && /^\/produit\/[a-z0-9-]+\/?$/.test(url.pathname)) hit = await resolve('/produit/index.html');
    if (!hit) return send(res, 404, 'Page introuvable', { 'Content-Type': 'text/plain; charset=utf-8' });
    const ext = path.extname(hit.file).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': hit.st.size, 'Cache-Control': ext === '.html' || ext === '.json' ? 'no-cache' : 'public, max-age=3600' };
    if (rel.startsWith('/admin')) Object.assign(headers, { 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY', 'X-Robots-Tag': 'noindex, nofollow' });
    res.writeHead(200, { ...SEC, ...headers });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(hit.file).pipe(res);
  } catch (e) { console.error(e); if (!res.headersSent) send(res, 500, 'Erreur serveur'); }
}).listen(PORT, () => console.log(`Luxor Création → http://localhost:${PORT}/  (admin : /admin/, API : /api/)`));
