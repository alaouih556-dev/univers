#!/usr/bin/env node
/*
 * Luxor Création — site + administration server (Node.js, no dependencies).
 *
 *   node server.js                 → serves the site on http://localhost:8080
 *   PORT=8090 node server.js       → other port
 *   node server.js --set-admin <email> <password>   → change the admin login
 *
 * The admin login is stored hashed (scrypt) in .admin.json — never in plain text,
 * and never sent to the browser. Admin changes are written to assets/catalogue.json
 * (a backup of the previous version is kept in .backups/).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = +process.env.PORT || 8080;
const CATALOGUE = path.join(ROOT, 'assets', 'catalogue.json');
const UPLOADS = path.join(ROOT, 'assets', 'uploads');
const BACKUPS = path.join(ROOT, '.backups');
const CRED_FILE = path.join(ROOT, '.admin.json');
const SESSION_TTL = 8 * 3600 * 1000;           // 8 h
const MAX_BODY = 12 * 1024 * 1024;             // 12 MB (photo upload)
const COOKIE = 'luxor_admin';

/* ---------- credentials ---------- */
function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
if (process.argv[2] === '--set-admin') {
  const [email, pw] = process.argv.slice(3);
  if (!email || !pw) { console.error('Usage: node server.js --set-admin <email> <password>'); process.exit(1); }
  fs.writeFileSync(CRED_FILE, JSON.stringify({ email: email.trim().toLowerCase(), ...hashPassword(pw) }, null, 2) + '\n');
  console.log('Identifiants administrateur mis à jour pour', email);
  process.exit(0);
}
let CRED;
try { CRED = JSON.parse(fs.readFileSync(CRED_FILE, 'utf8')); }
catch { console.error('Fichier .admin.json manquant. Lancez : node server.js --set-admin <email> <mot de passe>'); process.exit(1); }

function checkLogin(email, pw) {
  const okEmail = String(email || '').trim().toLowerCase() === CRED.email;
  const got = crypto.scryptSync(String(pw || ''), CRED.salt, 64);
  const okPw = crypto.timingSafeEqual(got, Buffer.from(CRED.hash, 'hex'));
  return okEmail && okPw;
}

/* ---------- sessions & rate limit ---------- */
const sessions = new Map();          // token -> expiry
const failures = new Map();          // ip -> {n, until}
function newSession() {
  const t = crypto.randomBytes(32).toString('hex');
  sessions.set(t, Date.now() + SESSION_TTL);
  return t;
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
}
function authed(req) {
  const t = cookies(req)[COOKIE];
  const exp = t && sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  sessions.set(t, Date.now() + SESSION_TTL);
  return true;
}
function limited(ip) {
  const f = failures.get(ip);
  return f && f.n >= 5 && f.until > Date.now();
}
function fail(ip) {
  const f = failures.get(ip);
  if (!f || f.until < Date.now()) failures.set(ip, { n: 1, until: Date.now() + 15 * 60 * 1000 });
  else f.n++;
}

/* ---------- helpers ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.gif': 'image/gif', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const SEC_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' };

function send(res, code, body, headers = {}) {
  res.writeHead(code, { ...SEC_HEADERS, ...headers });
  res.end(body);
}
function json(res, code, obj, headers = {}) {
  send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('Fichier trop volumineux (12 Mo max).'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('JSON invalide'), { code: 400 })); } });
    req.on('error', reject);
  });
}
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const clean = (v, max = 2000) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);

/* ---------- catalogue storage (serialised writes) ---------- */
let queue = Promise.resolve();
function withCatalogue(fn) {
  const run = queue.then(async () => {
    const db = JSON.parse(await fsp.readFile(CATALOGUE, 'utf8'));
    const result = await fn(db);
    await fsp.mkdir(BACKUPS, { recursive: true });
    await fsp.copyFile(CATALOGUE, path.join(BACKUPS, `catalogue-${new Date().toISOString().replace(/[:.]/g, '-')}.json`));
    const tmp = CATALOGUE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(db));
    await fsp.rename(tmp, CATALOGUE);
    const old = (await fsp.readdir(BACKUPS)).filter(f => f.startsWith('catalogue-')).sort();
    for (const f of old.slice(0, Math.max(0, old.length - 30))) await fsp.unlink(path.join(BACKUPS, f)).catch(() => {});
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

async function assetVersion() {
  const html = await fsp.readFile(path.join(ROOT, 'index.html'), 'utf8').catch(() => '');
  return (html.match(/site\.js\?v=([\w-]+)/) || [])[1] || '1';
}
async function writeProductPage(slug) {
  const v = await assetVersion();
  const dir = path.join(ROOT, 'produit', slug);
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, 'index.html'),
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#2F4F46"><title>Luxor Création — Mobilier & Design</title><meta name="description" content="Découvrez le catalogue de mobilier et la fabrication sur mesure Luxor Création."><link rel="stylesheet" href="../../assets/site.css?v=${v}"></head><body><div id="app"></div><script>window.UDC={base:"../../",kind:"product:${slug}"}</script><script src="../../assets/site.js?v=${v}" defer></script></body></html>`);
}
async function removeProductPage(slug) {
  if (!SLUG_RE.test(slug)) return;
  const dir = path.join(ROOT, 'produit', slug);
  if (path.dirname(dir) !== path.join(ROOT, 'produit')) return;
  await fsp.rm(dir, { recursive: true, force: true });
}

/* photo: data URL → assets/uploads/<slug>-<rand>.<ext>; returns name relative to assets/ */
async function savePhoto(dataUrl, slug) {
  const m = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw Object.assign(new Error('Format de photo non accepté (JPG, PNG ou WebP).'), { code: 400 });
  const buf = Buffer.from(m[2], 'base64');
  const sig = buf.subarray(0, 12);
  const isPng = sig[0] === 0x89 && sig[1] === 0x50, isJpg = sig[0] === 0xff && sig[1] === 0xd8, isWebp = sig.toString('ascii', 0, 4) === 'RIFF' && sig.toString('ascii', 8, 12) === 'WEBP';
  const ext = isPng ? 'png' : isJpg ? 'jpg' : isWebp ? 'webp' : null;
  if (!ext) throw Object.assign(new Error('Le fichier n’est pas une image valide.'), { code: 400 });
  await fsp.mkdir(UPLOADS, { recursive: true });
  const name = `${slug}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  await fsp.writeFile(path.join(UPLOADS, name), buf);
  return 'uploads/' + name;
}
async function deleteUploads(p) {
  for (const n of new Set([p.fallback, ...(p.gallery || [])])) {
    if (typeof n === 'string' && /^uploads\/[a-z0-9-]+\.(png|jpg|webp)$/.test(n)) await fsp.unlink(path.join(ROOT, 'assets', n)).catch(() => {});
  }
}

function applyFields(p, b, cats) {
  if ('name' in b) { const v = clean(b.name, 120); if (!v) throw Object.assign(new Error('Le nom est obligatoire.'), { code: 400 }); p.name = v; }
  if ('price' in b) { const v = Number(b.price); if (!Number.isFinite(v) || v < 0 || v > 1e9) throw Object.assign(new Error('Prix invalide.'), { code: 400 }); p.price = Math.round(v); }
  if ('category' in b) { if (!cats.some(c => c.id === b.category)) throw Object.assign(new Error('Catégorie inconnue.'), { code: 400 }); p.category = b.category; }
  for (const k of ['description']) if (k in b) p[k] = clean(b[k], 4000);
  for (const k of ['material', 'dimensions', 'color']) if (k in b) p[k] = clean(b[k], 160);
  for (const k of ['featured', 'new']) if (k in b) p[k] = !!b[k];
}
const publicProduct = p => p;

/* ---------- API ---------- */
async function api(req, res, url) {
  const ip = req.socket.remoteAddress || '';
  const method = req.method;
  // CSRF guard: state-changing requests must be same-origin JSON
  if (method !== 'GET') {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return json(res, 403, { error: 'Origine refusée.' });
    if (!/^application\/json/.test(req.headers['content-type'] || '')) return json(res, 415, { error: 'JSON attendu.' });
  }
  const route = url.pathname.replace(/\/+$/, '');

  if (route === '/api/admin/login' && method === 'POST') {
    if (limited(ip)) return json(res, 429, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
    const b = await readBody(req);
    if (!checkLogin(b.email, b.password)) { fail(ip); return json(res, 401, { error: 'Email ou mot de passe incorrect.' }); }
    failures.delete(ip);
    const t = newSession();
    const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    return json(res, 200, { ok: true, email: CRED.email }, { 'Set-Cookie': `${COOKIE}=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL / 1000}${secure}` });
  }
  if (route === '/api/admin/logout' && method === 'POST') {
    const t = cookies(req)[COOKIE]; if (t) sessions.delete(t);
    return json(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` });
  }
  if (!authed(req)) return json(res, 401, { error: 'Session expirée. Veuillez vous reconnecter.' });

  if (route === '/api/admin/me' && method === 'GET') return json(res, 200, { ok: true, email: CRED.email });

  if (route === '/api/admin/products' && method === 'GET') {
    const db = JSON.parse(await fsp.readFile(CATALOGUE, 'utf8'));
    return json(res, 200, { products: db.products.map(publicProduct), categories: db.categories, colors: db.colors });
  }
  if (route === '/api/admin/products' && method === 'POST') {
    const b = await readBody(req);
    const p = await withCatalogue(async db => {
      const id = Math.max(0, ...db.products.map(x => +x.id || 0)) + 1;
      const p = { id, name: '', slug: '', category: db.categories[0].id, description: '', price: 0, sku: 'LUX-' + String(id).padStart(4, '0'), material: '', dimensions: '', image: '', fallback: '', color: '', featured: false, new: true };
      applyFields(p, b, db.categories);
      if (!p.name) throw Object.assign(new Error('Le nom est obligatoire.'), { code: 400 });
      let base = `${p.category}-${slugify(p.name) || 'produit'}`, slug = base, i = 2;
      while (db.products.some(x => x.slug === slug) || fs.existsSync(path.join(ROOT, 'produit', slug))) slug = `${base}-${i++}`;
      p.slug = slug;
      if (b.photo) { const img = await savePhoto(b.photo, slug); p.fallback = img; p.gallery = [img]; }
      else p.fallback = db.products.find(x => x.category === p.category)?.fallback || 'hero-ivoire.webp';
      db.products.push(p);
      await writeProductPage(slug);
      return p;
    });
    return json(res, 201, { ok: true, product: p });
  }
  const m = /^\/api\/admin\/products\/([a-z0-9-]+)$/.exec(route);
  if (m && method === 'PUT') {
    const b = await readBody(req);
    const p = await withCatalogue(async db => {
      const p = db.products.find(x => x.slug === m[1]);
      if (!p) throw Object.assign(new Error('Produit introuvable.'), { code: 404 });
      applyFields(p, b, db.categories);
      if (b.photo) {
        const img = await savePhoto(b.photo, p.slug);
        await deleteUploads(p);
        p.image = ''; p.fallback = img; p.gallery = [img];
      }
      return p;
    });
    return json(res, 200, { ok: true, product: p });
  }
  if (m && method === 'DELETE') {
    await withCatalogue(async db => {
      const i = db.products.findIndex(x => x.slug === m[1]);
      if (i < 0) throw Object.assign(new Error('Produit introuvable.'), { code: 404 });
      const [p] = db.products.splice(i, 1);
      await deleteUploads(p);
      await removeProductPage(p.slug);
    });
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: 'Route inconnue.' });
}

/* ---------- static files ---------- */
async function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad request'); }
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return send(res, 403, 'Forbidden');
  const parts = path.relative(ROOT, file).split(path.sep);
  // never expose dotfiles (.admin.json, .git, .backups), the server itself or node_modules
  if (parts.some(s => s.startsWith('.')) || parts[0] === 'server.js' || parts[0] === 'node_modules' || parts[0] === 'package.json') return send(res, 404, 'Not found');
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
    if (parts[0] === 'admin') { headers['Cache-Control'] = 'no-store'; headers['X-Frame-Options'] = 'DENY'; headers['X-Robots-Tag'] = 'noindex, nofollow'; }
    if (req.headers['if-modified-since'] && new Date(req.headers['if-modified-since']) >= new Date(st.mtime.toUTCString())) return send(res, 304, '', { 'Cache-Control': headers['Cache-Control'] });
    res.writeHead(200, { ...SEC_HEADERS, ...headers });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  } catch {
    send(res, 404, 'Page introuvable', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    if (url.pathname === '/admin') return send(res, 301, '', { Location: '/admin/' });
    return await serveStatic(req, res, url);
  } catch (e) {
    const known = typeof e.code === 'number' && e.code >= 400 && e.code < 600;
    if (!res.headersSent) json(res, known ? e.code : 500, { error: known ? e.message : 'Erreur serveur.' });
    if (!known) console.error(e);
  }
}).listen(PORT, () => {
  console.log(`Luxor Création → http://localhost:${PORT}/`);
  console.log(`Administration → http://localhost:${PORT}/admin/`);
});
