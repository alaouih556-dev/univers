#!/usr/bin/env node
/*
 * Luxor Création — local server: the site + the /admin API (Node.js 18+, no dependencies).
 * Online (Vercel) the same API runs as the serverless function api/admin.js.
 *
 *   node server.js                                   → http://localhost:8080  (admin: /admin/)
 *   PORT=8090 node server.js                         → other port
 *   node server.js --set-admin <email> <password>    → local login, saved hashed in .admin.json (not committed)
 *   node server.js --hash <password>                 → prints the ADMIN_PASSWORD_HASH value for Vercel
 *
 * Locally, changes are written to the files on disk (assets/catalogue.json …).
 * If GITHUB_TOKEN and GITHUB_REPO are set, changes are committed to GitHub instead (like online).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { createAdminApi, loadCredentials, hashPassword } = require('./api/_lib/core');
const { fsStore } = require('./api/_lib/fs-store');
const { githubStore } = require('./api/_lib/github-store');

const ROOT = __dirname;
const PORT = +process.env.PORT || 8080;
const CRED_FILE = path.join(ROOT, '.admin.json');

/* ---------- CLI ---------- */
if (process.argv[2] === '--set-admin') {
  const [email, pw] = process.argv.slice(3);
  if (!email || !pw) { console.error('Usage : node server.js --set-admin <email> <mot de passe>'); process.exit(1); }
  fs.writeFileSync(CRED_FILE, JSON.stringify({ email: email.trim().toLowerCase(), ...hashPassword(pw) }, null, 2) + '\n');
  console.log('Identifiants administrateur locaux mis à jour pour', email);
  process.exit(0);
}
if (process.argv[2] === '--hash') {
  const pw = process.argv[3];
  if (!pw) { console.error('Usage : node server.js --hash <mot de passe>'); process.exit(1); }
  const { salt, hash } = hashPassword(pw);
  console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
  console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}`);
  process.exit(0);
}

/* ---------- admin API ---------- */
let fileCred = null;
try { fileCred = JSON.parse(fs.readFileSync(CRED_FILE, 'utf8')); } catch {}
const cred = loadCredentials(process.env, fileCred);
if (!cred) { console.error('Aucun identifiant admin. Lancez : node server.js --set-admin <email> <mot de passe>'); process.exit(1); }
const useGithub = process.env.GITHUB_TOKEN && process.env.GITHUB_REPO;
const store = useGithub ? githubStore({ token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO, branch: process.env.GITHUB_BRANCH || 'main' }) : fsStore(ROOT);
const secret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const adminApi = createAdminApi({ store, cred, secret });

/* ---------- static files ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.gif': 'image/gif', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' };
function send(res, code, body, headers = {}) { res.writeHead(code, { ...SEC, ...headers }); res.end(body); }

async function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad request'); }
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return send(res, 403, 'Forbidden');
  const parts = path.relative(ROOT, file).split(path.sep);
  // never expose dotfiles (.admin.json, .git, .backups), server code or the README
  if (parts.some(s => s.startsWith('.')) || ['server.js', 'api', 'node_modules', 'package.json', 'README.md', 'vercel.json'].includes(parts[0])) return send(res, 404, 'Not found');
  let target = file;
  try {
    let st = await fsp.stat(target);
    if (st.isDirectory()) {
      if (!url.pathname.endsWith('/')) return send(res, 301, '', { Location: url.pathname + '/' + url.search });
      target = path.join(target, 'index.html'); st = await fsp.stat(target);
    }
    const ext = path.extname(target).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, 'Last-Modified': st.mtime.toUTCString() };
    headers['Cache-Control'] = (ext === '.html' || ext === '.json') ? 'no-cache' : 'public, max-age=3600';
    if (parts[0] === 'admin') Object.assign(headers, { 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY', 'X-Robots-Tag': 'noindex, nofollow' });
    if (req.headers['if-modified-since'] && new Date(req.headers['if-modified-since']) >= new Date(st.mtime.toUTCString())) return send(res, 304, '', { 'Cache-Control': headers['Cache-Control'] });
    res.writeHead(200, { ...SEC, ...headers });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  } catch {
    send(res, 404, 'Page introuvable', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/admin' || url.pathname.startsWith('/api/admin/')) return await adminApi(req, res, url.pathname.replace(/^\/api\/admin\/?/, '').replace(/\/+$/, ''));
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    if (url.pathname === '/admin') return send(res, 301, '', { Location: '/admin/' });
    return await serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, 'Erreur serveur');
  }
}).listen(PORT, () => {
  console.log(`Luxor Création → http://localhost:${PORT}/`);
  console.log(`Administration → http://localhost:${PORT}/admin/  (${useGithub ? 'enregistrement sur GitHub ' + process.env.GITHUB_REPO : 'enregistrement local'})`);
});
