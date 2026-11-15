/* Catalogue: public read for the website + product management for the admin. */
'use strict';
const fs = require('fs');
const path = require('path');
const { config, sb, rest, ret, ApiError } = require('./supabase');

const FALLBACK_FILE = path.join(__dirname, '..', '..', 'frontend', 'assets', 'catalogue.json');
const fromRow = ({ is_new, ...p }) => ({ ...p, new: is_new });

async function load(token) {
  const [categories, colors, products] = await Promise.all([
    rest('categories?select=id,name,description&order=sort', { token }),
    rest('colors?select=name,hex&order=sort', { token }),
    rest('products?select=*&order=sort,id', { token })
  ]);
  return { categories, colors, products: products.map(fromRow) };
}

/* Website catalogue. If Supabase is unreachable, serve the local catalogue.json copy. */
async function publicCatalog() {
  try { return { data: await load(), source: 'live' }; }
  catch (e) {
    console.warn('Supabase unavailable, serving the local catalogue:', e.message);
    try { return { data: JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8')), source: 'fallback' }; }
    catch { throw new ApiError(503, 'The catalogue is temporarily unavailable.'); }
  }
}

/* ---------------- admin: products ---------------- */
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
function toRow(b) {
  const r = {};
  for (const k of ['name', 'category', 'description', 'material', 'dimensions', 'color']) if (k in b) r[k] = String(b[k] ?? '').trim().slice(0, k === 'description' ? 2000 : 200);
  if ('price' in b) {
    const n = Number(b.price);
    if (!Number.isFinite(n) || n < 0) throw new ApiError(400, 'Enter a valid price.');
    r.price = Math.round(n);
  }
  if ('new' in b) r.is_new = !!b.new;
  if ('featured' in b) r.featured = !!b.featured;
  return r;
}

const MAX_PHOTO = 5 * 1024 * 1024;
const photoBase = () => `${config().url}/storage/v1/object/public/${config().bucket}/`;
async function uploadPhoto(token, dataUrl, slug) {
  const m = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new ApiError(400, 'Choose a JPG, PNG or WebP image.');
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > MAX_PHOTO) throw new ApiError(400, 'The photo must be 5 MB or less.');
  const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/jpeg' ? 'jpg' : 'webp';
  const name = `${slug}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  await sb(`/storage/v1/object/${config().bucket}/${name}`, { token, method: 'POST', body: buf, raw: true, headers: { 'Content-Type': m[1], 'x-upsert': 'false' } });
  return photoBase() + name;
}
async function deletePhotos(token, p) {
  const base = photoBase();
  const names = [...new Set([p.fallback, ...(p.gallery || [])])].filter(u => typeof u === 'string' && u.startsWith(base)).map(u => u.slice(base.length));
  if (names.length) await sb(`/storage/v1/object/${config().bucket}`, { token, method: 'DELETE', body: { prefixes: names } }).catch(() => {});
}

async function createProduct(token, b = {}) {
  const row = toRow(b);
  if (!row.name) throw new ApiError(400, 'The product name is required.');
  if (!('price' in row)) throw new ApiError(400, 'Enter a valid price.');
  const existing = await rest('products?select=slug,sort,category,fallback', { token });
  row.sort = Math.max(0, ...existing.map(p => p.sort || 0)) + 1;
  const base = `${row.category}-${slugify(row.name) || 'produit'}`;
  let slug = base, i = 2;
  while (existing.some(p => p.slug === slug)) slug = `${base}-${i++}`;
  if (b.photo) { const url = await uploadPhoto(token, b.photo, slug); row.fallback = url; row.gallery = [url]; }
  else row.fallback = existing.find(p => p.category === row.category)?.fallback || 'hero-ivoire.webp';
  for (let n = 0; n < 5; n++) {
    try {
      const [p] = await rest('products', { token, method: 'POST', body: { ...row, slug }, headers: ret });
      const [withSku] = await rest(`products?id=eq.${p.id}`, { token, method: 'PATCH', body: { sku: 'LUX-' + String(p.id).padStart(4, '0') }, headers: ret });
      return fromRow(withSku || p);
    } catch (e) { if (!e.duplicate) throw e; slug = `${base}-${i++}`; }
  }
  throw new ApiError(500, 'Could not create the product, please try again.');
}

async function getProduct(token, slug) {
  const [p] = await rest(`products?select=*&slug=eq.${encodeURIComponent(slug)}`, { token });
  if (!p) throw new ApiError(404, 'Product not found or action not allowed.');
  return p;
}

async function updateProduct(token, slug, b = {}) {
  const row = toRow(b);
  if ('name' in row && !row.name) throw new ApiError(400, 'The product name is required.');
  let old = null;
  if (b.photo) { old = await getProduct(token, slug); const url = await uploadPhoto(token, b.photo, slug); row.image = ''; row.fallback = url; row.gallery = [url]; }
  const rows = await rest(`products?slug=eq.${encodeURIComponent(slug)}`, { token, method: 'PATCH', body: row, headers: ret });
  if (!rows?.length) throw new ApiError(404, 'Product not found or action not allowed.');
  if (old) await deletePhotos(token, old);
  return fromRow(rows[0]);
}

async function removeProduct(token, slug) {
  const rows = await rest(`products?slug=eq.${encodeURIComponent(slug)}`, { token, method: 'DELETE', headers: ret });
  if (!rows?.length) throw new ApiError(404, 'Product not found or action not allowed.');
  await deletePhotos(token, rows[0]);
}

module.exports = { publicCatalog, load, createProduct, updateProduct, removeProduct };
