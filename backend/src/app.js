/* Luxor Création API — one request handler shared by the local server (backend/server.js)
 * and the Vercel serverless function (api/index.js).
 *
 *   GET    /api/health
 *   GET    /api/catalog                         public website catalogue
 *   POST   /api/auth/login | /refresh | /logout
 *   GET    /api/auth/me                          (admin)
 *   PUT    /api/auth/password                    (admin)
 *   GET    /api/admin/data                       all admin data
 *   PATCH  /api/admin/projects/:id/status
 *   POST   /api/admin/projects/:id/steps/:key    toggle a production step
 *   POST   /api/admin/projects/:id/payments
 *   POST   /api/admin/projects/:id/notes
 *   PATCH  /api/admin/messages/:id
 *   POST   /api/admin/clients        PATCH|DELETE /api/admin/clients/:id
 *   POST   /api/admin/quotes         PUT|DELETE   /api/admin/quotes/:id
 *   PATCH  /api/admin/quotes/:id/status          POST /api/admin/quotes/:id/convert
 *   POST   /api/admin/orders         PUT|DELETE   /api/admin/orders/:id      PATCH /api/admin/orders/:id/status
 *   POST   /api/admin/deliveries     PUT|DELETE   /api/admin/deliveries/:id  PATCH /api/admin/deliveries/:id/status
 *   PUT    /api/admin/company        DELETE /api/admin/sample-data
 *   GET    /api/admin/catalog        POST /api/admin/products   PATCH|DELETE /api/admin/products/:slug
 */
'use strict';
const { ApiError } = require('./supabase');
const auth = require('./auth');
const catalog = require('./catalog');
const admin = require('./admin');

const MAX_BODY = 8 * 1024 * 1024;   // product photos are sent as base64 (max 5 MB)

/* [method, path pattern, handler(ctx), { admin: true } ] */
const routes = [
  ['GET', '/health', () => ({ ok: true })],
  ['GET', '/catalog', async ({ res }) => { const { data, source } = await catalog.publicCatalog(); res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300'); res.setHeader('X-Catalog-Source', source); return data; }],

  ['POST', '/auth/login', ({ body }) => auth.login(body)],
  ['POST', '/auth/refresh', ({ body }) => auth.refresh(body)],
  ['POST', '/auth/logout', ({ token }) => auth.logout(token).then(() => ({ ok: true }))],
  ['GET', '/auth/me', ({ user }) => ({ email: user.email }), { admin: true }],
  ['PUT', '/auth/password', ({ token, body }) => auth.changePassword(token, body), { admin: true }],

  ['GET', '/admin/data', ({ token }) => admin.getAll(token), { admin: true }],
  ['PATCH', '/admin/projects/:id/status', ({ token, p, body }) => admin.updateStatus(token, p.id, body), { admin: true }],
  ['POST', '/admin/projects/:id/steps/:key', ({ token, p }) => admin.toggleStep(token, p.id, p.key), { admin: true }],
  ['POST', '/admin/projects/:id/payments', ({ token, p, body }) => admin.addPayment(token, p.id, body), { admin: true }],
  ['POST', '/admin/projects/:id/notes', ({ token, p, body }) => admin.addNote(token, p.id, body), { admin: true }],
  ['PATCH', '/admin/messages/:id', ({ token, p, body }) => admin.markRead(token, p.id, body), { admin: true }],
  ['POST', '/admin/clients', ({ token, body }) => admin.addClient(token, body), { admin: true }],
  ['PATCH', '/admin/clients/:id', ({ token, p, body }) => admin.updateClient(token, p.id, body), { admin: true }],
  ['DELETE', '/admin/clients/:id', ({ token, p }) => admin.removeClient(token, p.id), { admin: true }],
  ['POST', '/admin/quotes', ({ token, body }) => admin.saveQuote(token, null, body).then(id => ({ id })), { admin: true }],
  ['PUT', '/admin/quotes/:id', ({ token, p, body }) => admin.saveQuote(token, p.id, body).then(id => ({ id })), { admin: true }],
  ['PATCH', '/admin/quotes/:id/status', ({ token, p, body }) => admin.setQuoteStatus(token, p.id, body), { admin: true }],
  ['DELETE', '/admin/quotes/:id', ({ token, p }) => admin.removeQuote(token, p.id), { admin: true }],
  ['POST', '/admin/quotes/:id/convert', ({ token, p }) => admin.convertQuote(token, p.id).then(id => ({ projectId: id })), { admin: true }],
  ['POST', '/admin/orders', ({ token, body }) => admin.saveOrder(token, null, body).then(id => ({ id })), { admin: true }],
  ['PUT', '/admin/orders/:id', ({ token, p, body }) => admin.saveOrder(token, p.id, body).then(id => ({ id })), { admin: true }],
  ['PATCH', '/admin/orders/:id/status', ({ token, p, body }) => admin.setOrderStatus(token, p.id, body), { admin: true }],
  ['DELETE', '/admin/orders/:id', ({ token, p }) => admin.removeOrder(token, p.id), { admin: true }],
  ['POST', '/admin/deliveries', ({ token, body }) => admin.saveDelivery(token, null, body).then(id => ({ id })), { admin: true }],
  ['PUT', '/admin/deliveries/:id', ({ token, p, body }) => admin.saveDelivery(token, p.id, body).then(id => ({ id })), { admin: true }],
  ['PATCH', '/admin/deliveries/:id/status', ({ token, p, body }) => admin.setDeliveryStatus(token, p.id, body), { admin: true }],
  ['DELETE', '/admin/deliveries/:id', ({ token, p }) => admin.removeDelivery(token, p.id), { admin: true }],
  ['PUT', '/admin/company', ({ token, body }) => admin.saveCompany(token, body), { admin: true }],
  ['DELETE', '/admin/sample-data', ({ token }) => admin.removeSampleData(token), { admin: true }],

  ['GET', '/admin/catalog', ({ token }) => catalog.load(token), { admin: true }],
  ['POST', '/admin/products', ({ token, body }) => catalog.createProduct(token, body).then(product => ({ product })), { admin: true }],
  ['PATCH', '/admin/products/:slug', ({ token, p, body }) => catalog.updateProduct(token, p.slug, body).then(product => ({ product })), { admin: true }],
  ['DELETE', '/admin/products/:slug', ({ token, p }) => catalog.removeProduct(token, p.slug), { admin: true }]
].map(([method, pattern, fn, opts = {}]) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
  return { method, re, keys, fn, ...opts };
});

function readBody(req) {
  if (req.body !== undefined) return Promise.resolve(typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : req.body || {});   // Vercel parses JSON already
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new ApiError(413, 'The request is too large.')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { const s = Buffer.concat(chunks).toString('utf8'); resolve(s ? JSON.parse(s) : {}); } catch { reject(new ApiError(400, 'Invalid JSON.')); } });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  const body = JSON.stringify(data ?? { ok: true });
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

/* Path inside the API, e.g. "/catalog". Vercel's rewrite passes it as ?__path=… */
function apiPath(req) {
  const url = new URL(req.url, 'http://x');
  const forwarded = url.searchParams.get('__path');
  if (forwarded !== null) return '/' + forwarded.replace(/^\/+/, '');
  return url.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
}

async function handler(req, res) {
  try {
    const path = apiPath(req);
    const matches = routes.filter(r => r.re.test(path));
    if (!matches.length) throw new ApiError(404, 'Not found.');
    const route = matches.find(r => r.method === req.method || (req.method === 'HEAD' && r.method === 'GET'));
    if (!route) { res.setHeader('Allow', matches.map(r => r.method).join(', ')); throw new ApiError(405, 'Method not allowed.'); }
    const m = route.re.exec(path);
    const p = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const token = (/^Bearer\s+(.+)$/i.exec(req.headers.authorization || '') || [])[1] || '';
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : {};
    const user = route.admin ? await auth.requireAdmin(token) : null;
    const out = await route.fn({ req, res, p, token, body, user });
    sendJSON(res, 200, out === undefined || out === null ? { ok: true } : out);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    if (status >= 500) console.error(e);
    sendJSON(res, status, { error: status === 500 ? 'Server error, please try again.' : e.message });
  }
}

module.exports = { handler };
