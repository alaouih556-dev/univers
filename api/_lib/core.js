'use strict';
/*
 * Shared admin API (used by the Vercel function api/admin.js and by the local server.js).
 * Storage is pluggable: GitHub (online, every change = a commit → Vercel redeploys) or the local filesystem.
 */
const crypto = require('crypto');

const COOKIE = 'luxor_admin';
const SESSION_TTL = 8 * 3600; // seconds
const MAX_BODY = 4 * 1024 * 1024; // Vercel limit is 4.5 MB
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const bad = msg => new HttpError(400, msg);

/* ---------- credentials ---------- */
function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
/** ADMIN_EMAIL + ADMIN_PASSWORD_HASH ("salt:hash") from env, else the local fallback object. */
function loadCredentials(env, fallback) {
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH) {
    const [salt, hash] = String(env.ADMIN_PASSWORD_HASH).trim().split(':');
    if (salt && /^[0-9a-f]{128}$/.test(hash || '')) return { email: env.ADMIN_EMAIL.trim().toLowerCase(), salt, hash };
  }
  return fallback || null;
}
function checkLogin(cred, email, pw) {
  const okEmail = String(email || '').trim().toLowerCase() === cred.email;
  const got = crypto.scryptSync(String(pw || ''), cred.salt, 64);
  return crypto.timingSafeEqual(got, Buffer.from(cred.hash, 'hex')) && okEmail;
}

/* ---------- stateless signed sessions (work across serverless instances) ---------- */
const b64u = b => Buffer.from(b).toString('base64url');
function sign(secret, data) { return crypto.createHmac('sha256', secret).update(data).digest('base64url'); }
function makeToken(secret, email) {
  const body = b64u(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + SESSION_TTL, n: crypto.randomBytes(8).toString('hex') }));
  return body + '.' + sign(secret, body);
}
function readToken(secret, token) {
  const [body, mac] = String(token || '').split('.');
  if (!body || !mac) return null;
  const want = sign(secret, body);
  if (want.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.x > Date.now() / 1000 ? p : null; } catch { return null; }
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
}

/* ---------- best-effort login throttle (per instance) ---------- */
const failures = new Map();
const limited = ip => { const f = failures.get(ip); return f && f.n >= 5 && f.until > Date.now(); };
function fail(ip) { const f = failures.get(ip); if (!f || f.until < Date.now()) failures.set(ip, { n: 1, until: Date.now() + 15 * 60 * 1000 }); else f.n++; }

/* ---------- helpers ---------- */
function send(res, code, obj, headers = {}) {
  res.statusCode = code;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers };
  for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
}
async function readBody(req) {
  if (req.body !== undefined && req.body !== null) { // already parsed by the platform
    if (typeof req.body === 'string') { try { return JSON.parse(req.body || '{}'); } catch { throw bad('JSON invalide'); } }
    if (Buffer.isBuffer(req.body)) { try { return JSON.parse(req.body.toString('utf8') || '{}'); } catch { throw bad('JSON invalide'); } }
    return req.body;
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new HttpError(413, 'Photo trop volumineuse (4 Mo max).')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(bad('JSON invalide')); } });
    req.on('error', reject);
  });
}
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const isUpload = n => typeof n === 'string' && /^uploads\/[a-z0-9-]+\.(png|jpg|webp)$/.test(n);

function decodePhoto(dataUrl, slug) {
  const m = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw bad('Format de photo non accepté (JPG, PNG ou WebP).');
  const buf = Buffer.from(m[2], 'base64');
  const isPng = buf[0] === 0x89 && buf[1] === 0x50, isJpg = buf[0] === 0xff && buf[1] === 0xd8;
  const isWebp = buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
  const ext = isPng ? 'png' : isJpg ? 'jpg' : isWebp ? 'webp' : null;
  if (!ext) throw bad('Le fichier n’est pas une image valide.');
  return { name: `uploads/${slug}-${crypto.randomBytes(4).toString('hex')}.${ext}`, buf };
}
function productPage(slug, v) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#2F4F46"><title>Luxor Création — Mobilier & Design</title><meta name="description" content="Découvrez le catalogue de mobilier et la fabrication sur mesure Luxor Création."><link rel="stylesheet" href="../../assets/site.css?v=${v}"></head><body><div id="app"></div><script>window.UDC={base:"../../",kind:"product:${slug}"}</script><script src="../../assets/site.js?v=${v}" defer></script></body></html>`;
}
function applyFields(p, b, cats) {
  if ('name' in b) { const v = clean(b.name, 120); if (!v) throw bad('Le nom est obligatoire.'); p.name = v; }
  if ('price' in b) { const v = Number(b.price); if (b.price === '' || !Number.isFinite(v) || v < 0 || v > 1e9) throw bad('Prix invalide.'); p.price = Math.round(v); }
  if ('category' in b) { if (!cats.some(c => c.id === b.category)) throw bad('Catégorie inconnue.'); p.category = b.category; }
  if ('description' in b) p.description = clean(b.description, 4000);
  for (const k of ['material', 'dimensions', 'color']) if (k in b) p[k] = clean(b[k], 160);
  for (const k of ['featured', 'new']) if (k in b) p[k] = !!b[k];
}

/*
 * store interface:
 *   read() → { db, version }
 *   readText(path, version) → string|null
 *   exists(path, version) → bool
 *   commit({ version, db, files: {path: Buffer|string}, deletes: [path], message })  (throws {conflict:true} if version is stale)
 *   live: bool — true when changes go online after a redeploy
 */
async function mutate(store, fn) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { db, version } = await store.read();
    const out = await fn(db, version);
    try {
      await store.commit({ version, db, files: out.files || {}, deletes: out.deletes || [], message: out.message });
      return out.result;
    } catch (e) { if (!e.conflict) throw e; }
  }
  throw new HttpError(409, 'Le catalogue a été modifié en même temps. Réessayez.');
}

/**
 * createAdminApi({ store, cred, secret }) → async (req, res, route) where route is e.g. "login", "products", "products/<slug>"
 */
function createAdminApi({ store, cred, secret, configError }) {
  return async function handle(req, res, route) {
    try {
      const method = req.method;
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      if (method !== 'GET') {
        const origin = req.headers.origin;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        if (origin) { let oh = ''; try { oh = new URL(origin).host; } catch {} if (oh !== host) return send(res, 403, { error: 'Origine refusée.' }); }
        if (!/^application\/json/.test(req.headers['content-type'] || '')) return send(res, 415, { error: 'JSON attendu.' });
      }
      if (configError) return send(res, 503, { error: configError });
      const secure = (req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '';

      if (route === 'login' && method === 'POST') {
        if (limited(ip)) return send(res, 429, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
        const b = await readBody(req);
        if (!checkLogin(cred, b.email, b.password)) { fail(ip); return send(res, 401, { error: 'Email ou mot de passe incorrect.' }); }
        failures.delete(ip);
        return send(res, 200, { ok: true, email: cred.email, live: !!store.live }, { 'Set-Cookie': `${COOKIE}=${makeToken(secret, cred.email)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL}${secure}` });
      }
      if (route === 'logout' && method === 'POST') {
        return send(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}` });
      }
      const session = readToken(secret, cookies(req)[COOKIE]);
      if (!session || session.e !== cred.email) return send(res, 401, { error: 'Session expirée. Veuillez vous reconnecter.' });

      if (route === 'me' && method === 'GET') return send(res, 200, { ok: true, email: cred.email, live: !!store.live });

      if (route === 'products' && method === 'GET') {
        const { db } = await store.read();
        return send(res, 200, { products: db.products, categories: db.categories, colors: db.colors || [], live: !!store.live });
      }

      if (route === 'products' && method === 'POST') {
        const b = await readBody(req);
        const product = await mutate(store, async (db, version) => {
          const id = Math.max(0, ...db.products.map(x => +x.id || 0)) + 1;
          const p = { id, name: '', slug: '', category: db.categories[0].id, description: '', price: 0, sku: 'LUX-' + String(id).padStart(4, '0'), material: '', dimensions: '', image: '', fallback: '', color: '', featured: false, new: true };
          applyFields(p, b, db.categories);
          if (!p.name) throw bad('Le nom est obligatoire.');
          if (!('price' in b)) throw bad('Prix invalide.');
          const base = `${p.category}-${slugify(p.name) || 'produit'}`;
          let slug = base, i = 2;
          while (db.products.some(x => x.slug === slug) || await store.exists(`produit/${slug}/index.html`, version)) slug = `${base}-${i++}`;
          p.slug = slug;
          const files = {};
          if (b.photo) { const ph = decodePhoto(b.photo, slug); files['assets/' + ph.name] = ph.buf; p.fallback = ph.name; p.gallery = [ph.name]; }
          else p.fallback = db.products.find(x => x.category === p.category)?.fallback || 'hero-ivoire.webp';
          const html = (await store.readText('index.html', version)) || '';
          const v = (html.match(/site\.js\?v=([\w-]+)/) || [])[1] || '1';
          files[`produit/${slug}/index.html`] = productPage(slug, v);
          db.products.push(p);
          return { result: p, files, message: `Admin : ajout du produit « ${p.name} »` };
        });
        return send(res, 201, { ok: true, product, live: !!store.live });
      }

      const m = /^products\/([a-z0-9-]+)$/.exec(route);
      if (m && method === 'PUT') {
        if (!SLUG_RE.test(m[1])) throw bad('Produit invalide.');
        const b = await readBody(req);
        const product = await mutate(store, async (db, version) => {
          const p = db.products.find(x => x.slug === m[1]);
          if (!p) throw new HttpError(404, 'Produit introuvable.');
          applyFields(p, b, db.categories);
          const files = {}, deletes = [];
          if (b.photo) {
            const ph = decodePhoto(b.photo, p.slug);
            for (const n of new Set([p.fallback, ...(p.gallery || [])])) if (isUpload(n) && await store.exists('assets/' + n, version)) deletes.push('assets/' + n);
            files['assets/' + ph.name] = ph.buf; p.image = ''; p.fallback = ph.name; p.gallery = [ph.name];
          }
          return { result: p, files, deletes, message: `Admin : modification du produit « ${p.name} »` };
        });
        return send(res, 200, { ok: true, product, live: !!store.live });
      }

      if (m && method === 'DELETE') {
        await mutate(store, async (db, version) => {
          const i = db.products.findIndex(x => x.slug === m[1]);
          if (i < 0) throw new HttpError(404, 'Produit introuvable.');
          const [p] = db.products.splice(i, 1);
          const deletes = [];
          for (const n of new Set([p.fallback, ...(p.gallery || [])])) if (isUpload(n) && await store.exists('assets/' + n, version)) deletes.push('assets/' + n);
          if (SLUG_RE.test(p.slug) && await store.exists(`produit/${p.slug}/index.html`, version)) deletes.push(`produit/${p.slug}/index.html`);
          return { result: true, deletes, message: `Admin : suppression du produit « ${p.name} »` };
        });
        return send(res, 200, { ok: true, live: !!store.live });
      }
      return send(res, 404, { error: 'Route inconnue.' });
    } catch (e) {
      const known = e instanceof HttpError;
      if (!known) console.error(e);
      if (!res.headersSent) send(res, known ? e.code : 500, { error: known ? e.message : (e.publicMessage || 'Erreur serveur.') });
    }
  };
}

module.exports = { createAdminApi, loadCredentials, hashPassword, HttpError };
