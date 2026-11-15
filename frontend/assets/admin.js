/* Luxor Création — admin panel.
 * Protected by Supabase Auth (only accounts listed in the `admins` table).
 * Pages: Dashboard · Projects (+ details) · Clients · Catalog (live Supabase products) · Payments · Messages · Settings.
 * Project / client / payment figures come from LuxorStore (assets/admin-data.js, mock data for now). */
(() => {
'use strict';
const app = document.getElementById('admin');
const A = '../assets/';
const S = window.LuxorStore, CH = window.LuxorCharts;
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mad = S.fmtMAD;
const money = n => new Intl.NumberFormat('en-US').format(Math.round(n || 0)) + ' MAD';
const fdate = s => s ? S.parse(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const img = p => { const n = p._preview || p.image || (p.gallery && p.gallery[0]) || p.fallback || 'hero-ivoire.webp'; return /^(https?:|data:)/.test(n) ? n : A + n; };
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICON = {
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>', check: '<path d="m5 12 5 5 9-10"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20a2 2 0 0 0 4 0"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  back: '<path d="M15 6l-6 6 6 6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  site: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};
const ico = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

let state = { email: '', products: [], categories: [], colors: [], q: '', cat: '', catalogLoaded: false };
const ui = { filter: '', q: '', route: '' };

/* ---------------- Supabase (auth + database + photo storage) ----------------
 * The URL and the publishable key are public by design; what an account may do is enforced
 * by the database security rules (backend/supabase/schema.sql): only users listed in `admins` can write. */
const SB = { url: 'https://oknbuexbsukrzycwiies.supabase.co', key: 'sb_publishable_JA1AK7R3FiYQ9MLzWXf22g_yPY3PN7T', bucket: 'products' };
const SESSION_KEY = 'luxor_admin_session';
const photoBase = `${SB.url}/storage/v1/object/public/${SB.bucket}/`;
let session = null;
try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch {}
const saveSession = s => { session = s; if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); };

async function authRequest(grant, body) {
  const r = await fetch(`${SB.url}/auth/v1/token?grant_type=${grant}`, { method: 'POST', headers: { apikey: SB.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const m = d.error_description || d.msg || d.message || '';
    if (/invalid login credentials/i.test(m)) throw new Error('Incorrect email or password.');
    if (/email not confirmed/i.test(m)) throw new Error('This account is not confirmed yet.');
    if (r.status === 429) throw new Error('Too many attempts. Please try again in a few minutes.');
    throw new Error(m || 'Sign-in failed (' + r.status + ').');
  }
  return { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600), email: d.user?.email, user_id: d.user?.id };
}
async function token() {
  if (!session) throw authError();
  if (session.expires_at - 60 < Date.now() / 1000) {
    try { saveSession(await authRequest('refresh_token', { refresh_token: session.refresh_token })); }
    catch { saveSession(null); throw authError(); }
  }
  return session.access_token;
}
function authError() { showLogin(session ? 'Your session has expired. Please sign in again.' : ''); return new Error('auth'); }

async function sb(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const r = await fetch(SB.url + path, { method, headers: { apikey: SB.key, Authorization: 'Bearer ' + await token(), ...(body && !raw ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: raw ? body : body ? JSON.stringify(body) : undefined });
  if (r.status === 401) { saveSession(null); throw authError(); }
  const text = await r.text(); let d = null; try { d = text ? JSON.parse(text) : null; } catch {}
  if (!r.ok) {
    const m = d?.message || d?.msg || d?.error_description || d?.error || '';
    if (d?.code === '23505') { const e = new Error('duplicate'); e.duplicate = true; throw e; }
    if (d?.code === '42501' || r.status === 403 || /row-level security/i.test(m)) throw new Error('This account is not allowed to do that.');
    throw new Error(m || 'Error ' + r.status);
  }
  return d;
}
const fromRow = ({ is_new, ...p }) => ({ ...p, new: is_new });
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
function toRow(b) {
  const r = {};
  for (const k of ['name', 'category', 'description', 'material', 'dimensions', 'color']) if (k in b) r[k] = String(b[k] ?? '').trim();
  if ('price' in b) r.price = Math.round(Number(b.price));
  if ('new' in b) r.is_new = !!b.new;
  if ('featured' in b) r.featured = !!b.featured;
  return r;
}
async function uploadPhoto(dataUrl, slug) {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpg' : 'webp';
  const name = `${slug}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  await sb(`/storage/v1/object/${SB.bucket}/${name}`, { method: 'POST', body: blob, raw: true, headers: { 'Content-Type': blob.type, 'x-upsert': 'false' } });
  return photoBase + name;
}
async function deletePhotos(p) {
  const names = [...new Set([p.fallback, ...(p.gallery || [])])].filter(u => typeof u === 'string' && u.startsWith(photoBase)).map(u => u.slice(photoBase.length));
  if (names.length) await sb(`/storage/v1/object/${SB.bucket}`, { method: 'DELETE', body: { prefixes: names } }).catch(() => {});
}

const api = {
  async login(email, password) {
    const s = await authRequest('password', { email: String(email).trim(), password });
    saveSession(s);
    const rows = await sb(`/rest/v1/admins?select=email&user_id=eq.${s.user_id}`);
    if (!rows?.length) { await api.logout(); throw new Error('This account does not have admin access.'); }
    return { email: s.email };
  },
  async me() {
    if (!session) throw authError();
    await token();
    return { email: session.email };
  },
  async logout() {
    if (session) await fetch(`${SB.url}/auth/v1/logout`, { method: 'POST', headers: { apikey: SB.key, Authorization: 'Bearer ' + session.access_token } }).catch(() => {});
    saveSession(null);
  },
  async list() {
    const [products, categories, colors] = await Promise.all([
      sb('/rest/v1/products?select=*&order=sort,id'), sb('/rest/v1/categories?select=id,name,description&order=sort'), sb('/rest/v1/colors?select=name,hex&order=sort')]);
    return { products: products.map(fromRow), categories, colors };
  },
  async create(b) {
    const row = toRow(b);
    if (!row.name) throw new Error('The name is required.');
    row.sort = Math.max(0, ...state.products.map(p => p.sort || 0)) + 1;
    const base = `${row.category}-${slugify(row.name) || 'produit'}`;
    let slug = base, i = 2;
    while (state.products.some(p => p.slug === slug)) slug = `${base}-${i++}`;
    if (b.photo) { const url = await uploadPhoto(b.photo, slug); row.fallback = url; row.gallery = [url]; }
    else row.fallback = state.products.find(p => p.category === row.category)?.fallback || 'hero-ivoire.webp';
    for (let n = 0; n < 5; n++) {
      try {
        const [p] = await sb('/rest/v1/products', { method: 'POST', body: { ...row, slug }, headers: { Prefer: 'return=representation' } });
        const [withSku] = await sb(`/rest/v1/products?id=eq.${p.id}`, { method: 'PATCH', body: { sku: 'LUX-' + String(p.id).padStart(4, '0') }, headers: { Prefer: 'return=representation' } });
        return { product: fromRow(withSku || p) };
      } catch (e) { if (!e.duplicate) throw e; slug = `${base}-${i++}`; }
    }
    throw new Error('Could not create the product, please try again.');
  },
  async update(p, b) {
    const row = toRow(b);
    let old = null;
    if (b.photo) { const url = await uploadPhoto(b.photo, p.slug); row.image = ''; row.fallback = url; row.gallery = [url]; old = { ...p }; }
    const rows = await sb(`/rest/v1/products?slug=eq.${encodeURIComponent(p.slug)}`, { method: 'PATCH', body: row, headers: { Prefer: 'return=representation' } });
    if (!rows?.length) throw new Error('Product not found or action not allowed.');
    if (old) await deletePhotos(old);
    return { product: fromRow(rows[0]) };
  },
  async remove(p) {
    const rows = await sb(`/rest/v1/products?slug=eq.${encodeURIComponent(p.slug)}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
    if (!rows?.length) throw new Error('Product not found or action not allowed.');
    await deletePhotos(p);
  }
};


function toast(msg, kind = 'ok') {
  let box = $('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = (kind === 'ok' ? ico('check') : ico('info')) + `<span>${esc(msg)}</span>`;
  box.appendChild(t); setTimeout(() => t.classList.add('out'), 3400); setTimeout(() => t.remove(), 3900);
}

/* ---------------- theme & profile ---------------- */
const THEME_KEY = 'luxor_admin_theme', NAME_KEY = 'luxor_admin_name';
const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
function setTheme(t) { document.documentElement.dataset.theme = t; localStorage.setItem(THEME_KEY, t); const b = $('#themebtn'); if (b) { b.innerHTML = ico(t === 'dark' ? 'sun' : 'moon'); b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); } if (ui.route === 'dashboard') renderRoute(); }
const displayName = () => localStorage.getItem(NAME_KEY) || 'Luxor Création';
const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'LC';

const logoMark = `<img class="brand-mark" src="${A}luxor-mark-gold.webp" alt="" width="36" height="36">`;

/* ---------------- login (protected route) ---------------- */
function showLogin(msg = '') {
  document.body.className = 'is-login';
  app.innerHTML = `<main class="login">
    <form class="login-card" id="loginform" novalidate>
      <img class="login-logo" src="${A}luxor-logo-gold.webp" alt="Luxor Création">
      <h1>Admin panel</h1>
      <p class="login-sub">Sign in to manage projects, clients and the catalog.</p>
      <label>Email<input type="email" name="email" autocomplete="username" required autofocus></label>
      <label>Password<span class="pw"><input type="password" name="password" autocomplete="current-password" required><button type="button" class="pw-toggle" aria-label="Show password">${ico('eye')}</button></span></label>
      <p class="form-err" id="loginerr" role="alert">${esc(msg)}</p>
      <button class="btn primary lg" type="submit">Sign in</button>
      <a class="back-link" href="../">${ico('back')} Back to the website</a>
    </form>
  </main>`;
  const f = $('#loginform');
  f.querySelector('.pw-toggle').onclick = () => { const i = f.password; i.type = i.type === 'password' ? 'text' : 'password'; };
  f.onsubmit = async e => {
    e.preventDefault();
    const err = $('#loginerr'), btn = f.querySelector('[type=submit]');
    if (!f.email.value || !f.password.value) { err.textContent = 'Please enter your email and password.'; return; }
    btn.disabled = true; btn.textContent = 'Signing in…'; err.textContent = '';
    try { const d = await api.login(f.email.value, f.password.value); state.email = d.email; startApp(); }
    catch (x) { err.textContent = x.message; btn.disabled = false; btn.textContent = 'Sign in'; f.password.select(); }
  };
}

/* ---------------- shell ---------------- */
const NAV = [['dashboard', 'Dashboard'], ['projects', 'Projects'], ['clients', 'Clients'], ['catalog', 'Catalog'], ['payments', 'Payments'], ['messages', 'Messages'], ['settings', 'Settings']];
let unsub = null;
function startApp() {
  document.body.className = 'is-app';
  app.innerHTML = `<header class="topbar">
      <a class="brand" href="#/dashboard" aria-label="Univers — dashboard">${logoMark}<span>Univers</span></a>
      <div class="top-r">
        <a class="icon-btn ghost" href="../" target="_blank" rel="noopener" title="Open the website" aria-label="Open the website">${ico('site')}</a>
        <div class="pop-wrap"><button class="icon-btn ghost bell" id="bell" aria-haspopup="true" aria-expanded="false" aria-label="Notifications">${ico('bell')}<i class="dot" id="belldot"></i></button><div class="popover" id="notifs" hidden></div></div>
        <div class="pop-wrap"><button class="avatar" id="avatar" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">${esc(initials(displayName()))}</button>
          <div class="popover menu" id="acct" hidden><p class="pm-name">${esc(displayName())}</p><p class="pm-mail">${esc(state.email)}</p><a href="#/settings">${ico('gear')} Settings</a><button id="logout">${ico('out')} Sign out</button></div></div>
      </div>
    </header>
    <nav class="navbar" aria-label="Admin sections"><div class="nav-pill">${NAV.map(([k, l]) => `<a href="#/${k}" data-nav="${k}">${l}<span class="count" data-count="${k}"></span></a>`).join('')}</div></nav>
    <main class="view" id="view" tabindex="-1"></main>
    <div class="dock" role="toolbar" aria-label="Quick actions">
      <button class="dock-btn" id="docksearch" aria-label="Search projects">${ico('search')}</button>
      <a class="dock-btn" href="#/settings" aria-label="Settings">${ico('gear')}</a>
      <button class="dock-btn" id="dockhelp" aria-label="Help">${ico('help')}</button>
      <span class="dock-sep"></span>
      <button class="dock-btn" id="themebtn" aria-label="Switch to dark mode">${ico(theme() === 'dark' ? 'sun' : 'moon')}</button>
    </div>
    <div class="tip" id="tip" hidden></div>
    <div class="modal" id="modal" hidden></div>`;
  $('#logout').onclick = async () => { try { await api.logout(); } catch {} state.email = ''; if (unsub) unsub(); location.hash = ''; showLogin(); };
  $('#themebtn').onclick = () => setTheme(theme() === 'dark' ? 'light' : 'dark');
  $('#dockhelp').onclick = showHelp;
  $('#docksearch').onclick = () => { if (ui.route !== 'projects' && ui.route !== 'dashboard') location.hash = '#/projects'; setTimeout(() => { const i = $('#tsearch'); if (i) { i.focus(); i.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }, 60); };
  popover('#bell', '#notifs', renderNotifs);
  popover('#avatar', '#acct');
  if (unsub) unsub();
  unsub = S.subscribe(() => { updateBadges(); if (!/catalog|settings/.test(ui.route)) renderRoute(true); });
  window.onhashchange = () => renderRoute();
  window.onresize = debounce(() => { if (ui.route === 'dashboard') drawRevenue(); }, 150);
  updateBadges();
  if (!location.hash || location.hash === '#') location.hash = '#/dashboard'; else renderRoute();
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function popover(btnSel, popSel, onOpen) {
  const b = $(btnSel), p = $(popSel);
  b.onclick = e => { e.stopPropagation(); const open = p.hidden; $$('.popover').forEach(x => x.hidden = true); $$('[aria-expanded]').forEach(x => x.setAttribute('aria-expanded', 'false')); if (open) { onOpen?.(); p.hidden = false; b.setAttribute('aria-expanded', 'true'); } };
  document.addEventListener('click', e => { if (!p.hidden && !p.contains(e.target)) { p.hidden = true; b.setAttribute('aria-expanded', 'false'); } });
}
function updateBadges() {
  const m = S.metrics();
  const set = (k, v) => { const el = $(`[data-count="${k}"]`); if (el) { el.textContent = v || ''; el.hidden = !v; } };
  set('projects', m.total); set('messages', m.unread);
  const dot = $('#belldot'); if (dot) dot.hidden = !S.notifications().length;
}
function renderNotifs() {
  const list = S.notifications();
  $('#notifs').innerHTML = `<p class="pop-title">Notifications</p>${list.length ? list.slice(0, 8).map(n => `<a class="notif ${n.kind}" href="${n.route || '#/projects/' + n.projectId}"><i></i><span>${esc(n.text)}</span></a>`).join('') : '<p class="pop-empty">All caught up.</p>'}`;
}

/* ---------------- router ---------------- */
function renderRoute(fromStore = false) {
  const h = location.hash.replace(/^#\/?/, '');
  const [page, id] = h.split('/');
  const route = NAV.some(([k]) => k === page) ? page : 'dashboard';
  const changed = route + (id || '') !== ui.route + (ui.id || '');
  ui.route = route; ui.id = id;
  $$('[data-nav]').forEach(a => { const on = a.dataset.nav === route; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const v = $('#view'), y = scrollY;
  const views = { dashboard: viewDashboard, projects: id ? () => viewProject(id) : viewProjects, clients: viewClients, catalog: viewCatalog, payments: viewPayments, messages: viewMessages, settings: viewSettings };
  views[route](v);
  document.title = `${NAV.find(([k]) => k === route)[1]} — Univers admin`;
  if (changed && !fromStore) { scrollTo(0, 0); v.focus({ preventScroll: true }); $('.nav-pill .active')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }
  else scrollTo(0, y);
}

/* ---------------- shared bits ---------------- */
const pill = st => `<span class="status s-${st}">${S.STATUS_LABEL[st]}</span>`;
const badge = (v, { unit = '', pct = false, invert = false } = {}) => {
  const up = v > 0, flat = Math.abs(v) < 0.05, good = invert ? !up : up;
  const txt = flat ? '0' : (pct ? Math.abs(v).toFixed(1) + '%' : Math.abs(Math.round(v)) + unit);
  return `<span class="chg ${flat ? 'flat' : good ? 'pos' : 'neg'}">${flat ? '→' : up ? '↑' : '↓'} ${txt}</span>`;
};
const monthLabel = m => `${m.today.toLocaleString('en-US', { month: 'long' })} ${m.Y}, month to date`;
function titleRow(title, chip = '') { return `<div class="title-row"><h1>${title}</h1>${chip}</div>`; }
function toolbar({ report = true } = {}) {
  const m = S.metrics();
  const seg = [['', 'All'], ['started', 'Started'], ['in_progress', 'In Progress'], ['finished', 'Finished']];
  return `<div class="toolbar">
    <div class="seg" role="tablist" aria-label="Filter projects by status">${seg.map(([k, l]) => `<button role="tab" aria-selected="${ui.filter === k}" class="${ui.filter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('')}</div>
    <span class="date-lbl">${ico('clock')}${monthLabel(m)}</span>
    <div class="tb-actions">${report ? `<button class="btn outline" id="report">${ico('file')}Full report</button>` : ''}<button class="btn primary" id="export">${ico('download')}Export</button></div>
  </div>`;
}
function wireToolbar(root, onFilter) {
  $$('[data-filter]', root).forEach(b => b.onclick = () => { ui.filter = b.dataset.filter; $$('[data-filter]', root).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); }); onFilter(); });
  const r = $('#report', root); if (r) r.onclick = () => { if (ui.route !== 'dashboard') location.hash = '#/dashboard'; setTimeout(() => window.print(), 150); };
  $('#export', root).onclick = exportCSV;
}
function filteredProjects() {
  const db = S.get(), q = ui.q.trim().toLowerCase();
  return db.projects.filter(p => (!ui.filter || p.status === ui.filter) && (!q || [p.title, p.ref, S.client(p.clientId)?.name, S.TYPE_LABEL[p.type]].join(' ').toLowerCase().includes(q)))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}
function exportCSV() {
  const rows = [['Reference', 'Project', 'Client', 'Type', 'Status', 'Total (MAD)', 'Paid (MAD)', 'Due (MAD)', 'Start date', 'Delivery date', 'Completed']];
  for (const p of filteredProjects()) rows.push([p.ref, p.title, S.client(p.clientId)?.name, S.TYPE_LABEL[p.type], S.STATUS_LABEL[p.status], p.totalPrice, S.paidFor(p), S.dueFor(p), p.startDate, p.deliveryDate, p.completedDate || '']);
  const csv = '﻿' + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `univers-projects-${S.iso(S.today())}${ui.filter ? '-' + ui.filter : ''}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(`Exported ${rows.length - 1} project${rows.length === 2 ? '' : 's'} to CSV.`);
}

/* ---------------- projects table (dashboard + projects page) ---------------- */
function projectsCard(title = 'Projects') {
  return `<section class="card white tbl-card">
    <div class="card-head"><h2>${title}</h2><label class="search-pill">${ico('search')}<input type="search" id="tsearch" placeholder="Search a project or client…" value="${esc(ui.q)}" aria-label="Search a project or client"></label></div>
    <div class="tbl-wrap"><table class="ptbl"><thead><tr><th>Project</th><th>Client</th><th>Type</th><th>Status</th><th class="num">Amount due</th><th>Start / delivery</th><th></th></tr></thead><tbody id="prows"></tbody></table>
    <p class="empty" id="pempty" hidden>No project matches your search.</p></div></section>`;
}
function fillProjects(root) {
  const list = filteredProjects();
  $('#prows', root).innerHTML = list.map(p => {
    const c = S.client(p.clientId), due = S.dueFor(p), late = p.status !== 'finished' && S.parse(p.deliveryDate) < S.today();
    return `<tr>
      <td data-l="Project"><b class="p-title">${esc(p.title)}</b><small class="muted">${esc(p.ref)}</small></td>
      <td data-l="Client">${esc(c?.name)}</td>
      <td data-l="Type"><span class="type t-${p.type}">${S.TYPE_LABEL[p.type]}</span></td>
      <td data-l="Status">${pill(p.status)}</td>
      <td data-l="Amount due" class="num ${due ? 'due' : 'muted'}">${due ? money(due) : 'Paid'}</td>
      <td data-l="Start / delivery"><span class="dates">${fdate(p.startDate)}<span class="muted"> → </span><span class="${late ? 'late' : ''}">${fdate(p.status === 'finished' ? p.completedDate : p.deliveryDate)}</span></span></td>
      <td class="act"><a class="btn pill-sm" href="#/projects/${p.id}">View details</a></td></tr>`;
  }).join('');
  $('#pempty', root).hidden = list.length > 0;
}
function wireProjects(root) {
  const inp = $('#tsearch', root);
  inp.oninput = () => { ui.q = inp.value; fillProjects(root); };
  fillProjects(root);
}

/* ---------------- dashboard ---------------- */
function viewDashboard(v) {
  const m = S.metrics();
  const statusColors = { started: 'var(--or)', in_progress: 'var(--pastel)', finished: 'var(--donut-fin)' };
  v.innerHTML = `${titleRow('Dashboard', `<span class="chip"><i class="live"></i>${m.inProgress} project${m.inProgress === 1 ? '' : 's'} in progress</span>`)}
    ${toolbar()}
    <section class="kpis">
      ${kpi('dark', 'Completed clients', 'Clients with at least one finished project or order.', m.completedClients, badge(m.completedClientsDiff), CH.miniBars(m.completedSeries, { labels: m.monthLabels, color: 'var(--bar-on-dark)' }), 'See clients', '#/clients')}
      ${kpi('white', 'Total amount due', 'Money clients still owe on started and delivered projects.', `<span class="gold-amount">${money(m.amountDue)}</span>`, badge(m.amountDueChange, { pct: true, invert: true }), CH.sparkline(m.dueSeries), 'See payments', '#/payments')}
      ${kpi('sable', 'Projects in progress', 'Projects currently in production. The ring shows their average completion.', m.inProgress, badge(m.inProgressDiff), CH.ring(m.avgProgress), 'See projects', '#/projects', 'in_progress')}
      ${kpi('pastel', 'Projects started', 'New projects started this month.', m.startedThisMonth, badge(m.startedChange), CH.miniBars(m.startedSeries, { labels: m.monthLabels, color: 'var(--bar-on-pastel)' }), 'See projects', '#/projects', 'started')}
    </section>
    <section class="card dark gauge-card">
      <div class="gauge-wrap">${CH.gauge(m.finished, m.total)}<div class="gauge-num"><b>${m.finished}</b><span>of ${m.total}</span></div></div>
      <div class="gauge-txt">
        <p class="lbl">Projects finished ${infoTip('Finished projects out of all projects.')}</p>
        <h2>${m.finished} of ${m.total} projects finished</h2>
        <p class="sub">${gaugeSentence(m)}</p>
        <div class="gauge-legend"><span><i class="lg gold"></i>Finished ${Math.round(m.finished / (m.total || 1) * 100)}%</span><span><i class="lg track"></i>Remaining ${m.total - m.finished}</span></div>
      </div>
    </section>
    <section class="card white rev-card">
      <div class="card-head"><div><p class="lbl">Monthly revenue ${infoTip('Payments received each month, in MAD.')}</p><h2>${money(m.revenue[m.M].value)} <small class="muted">this month</small></h2></div>
        <div class="legend"><span><i class="lg hatch"></i>Past months</span><span><i class="lg gold"></i>Current month</span><span><i class="lg dash"></i>Upcoming (last year)</span><span><i class="lg avg"></i>Average</span></div></div>
      <div class="rev-chart" id="revchart"></div>
    </section>
    <section class="split2">
      <div class="card white donut-card">
        <div class="donut-info"><p class="lbl">Projects by status ${infoTip('All projects, by current status.')}</p><p class="big">${m.total}</p><p class="muted small">total projects</p>
          <ul class="legend-list">${S.STATUSES.map(s => `<li><i class="sq" style="background:${statusColors[s]}"></i>${S.STATUS_LABEL[s]}<b>${m.byStatus[s]}</b></li>`).join('')}</ul></div>
        ${CH.donut(S.STATUSES.map(s => ({ label: S.STATUS_LABEL[s], value: m.byStatus[s], color: statusColors[s] })), { value: Math.round(m.finished / (m.total || 1) * 100) + '%', label: 'finished' })}
      </div>
      <div class="card white upcoming">${upcomingDeliveries()}</div>
    </section>
    ${projectsCard('Projects')}`;
  wireToolbar(v, () => fillProjects(v));
  wireProjects(v);
  drawRevenue();
}
function kpi(tone, label, info, value, chg, chart, link, href, filter = '') {
  return `<article class="card kpi ${tone}">
    <div class="kpi-top"><div><p class="lbl">${label} ${infoTip(info)}</p><p class="kpi-v">${value}</p><p class="kpi-c">${chg}<span>vs last month</span></p></div><div class="kpi-chart">${chart}</div></div>
    <hr class="dash"><a class="kpi-link" href="${href}"${filter ? ` data-setfilter="${filter}"` : ''}>${link}</a></article>`;
}
const infoTip = t => `<span class="info" tabindex="0" role="img" aria-label="${esc(t)}" data-tip="${esc(t)}">${ico('info')}</span>`;
function gaugeSentence(m) {
  const parts = [];
  if (m.overdue) parts.push(`${m.overdue} deliver${m.overdue > 1 ? 'ies are' : 'y is'} overdue.`);
  else parts.push(m.finished / (m.total || 1) >= 0.5 ? 'Ahead of plan' : 'On track');
  if (m.deliveredThisMonth) parts.push(`${m.deliveredThisMonth} project${m.deliveredThisMonth > 1 ? 's' : ''} delivered this month.`);
  else if (!m.overdue) parts.push('no delivery yet this month.');
  return parts.join(m.overdue ? ' ' : ', ');
}
function upcomingDeliveries() {
  const t = S.today();
  const list = S.get().projects.filter(p => p.status !== 'finished').sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate)).slice(0, 5);
  return `<p class="lbl">Upcoming deliveries ${infoTip('Next delivery dates of projects not finished yet.')}</p>
    <ul class="up-list">${list.map(p => { const d = Math.round((S.parse(p.deliveryDate) - t) / 864e5); return `<li><a href="#/projects/${p.id}"><span class="up-day ${d < 0 ? 'late' : d <= 21 ? 'soon' : ''}"><b>${S.parse(p.deliveryDate).getDate()}</b>${S.parse(p.deliveryDate).toLocaleString('en-US', { month: 'short' })}</span><span class="up-t"><b>${esc(p.title)}</b><small class="muted">${esc(S.client(p.clientId)?.name)} · ${d < 0 ? `${-d} days late` : d === 0 ? 'today' : `in ${d} days`}</small></span>${pill(p.status)}</a></li>`; }).join('') || '<li class="muted">Nothing scheduled.</li>'}</ul>`;
}
function drawRevenue() {
  const el = $('#revchart'); if (!el) return;
  const m = S.metrics(), w = Math.max(320, el.clientWidth), h = w < 560 ? 220 : 280;
  el.innerHTML = CH.revenueBars(m.revenue, m.revenueAvg, { w, h });
  const tip = $('#tip');
  $$('.bar', el).forEach(g => {
    const d = m.revenue[+g.dataset.i];
    const show = () => {
      const vs = d.prev ? (d.value - d.prev) / d.prev * 100 : 0;
      tip.innerHTML = `<b>${d.label} ${m.Y}</b>${d.kind === 'future' ? `<span>Last year<em>${money(d.prev)}</em></span><span class="muted-on-dark">Upcoming month</span>` : `<span>Revenue<em>${money(d.value)}</em></span><span>Projects<em>${d.projects}</em></span><span>vs last year<em class="${vs >= 0 ? 'up' : 'down'}">${vs >= 0 ? '↑' : '↓'} ${Math.abs(vs).toFixed(1)}%</em></span>`}`;
      tip.hidden = false;
      const r = g.querySelector('rect:not(.hit)').getBoundingClientRect(), tw = tip.offsetWidth;
      tip.style.left = Math.min(innerWidth - tw - 8, Math.max(8, r.left + r.width / 2 - tw / 2)) + 'px';
      tip.style.top = (r.top + scrollY - tip.offsetHeight - 10) + 'px';
      g.classList.add('hover');
    };
    const hide = () => { tip.hidden = true; g.classList.remove('hover'); };
    g.addEventListener('mouseenter', show); g.addEventListener('mouseleave', hide);
    g.addEventListener('click', show);
  });
}

/* ---------------- projects page ---------------- */
function viewProjects(v) {
  const m = S.metrics();
  v.innerHTML = `${titleRow('Projects', `<span class="chip"><i class="live"></i>${m.total} projects · ${money(m.amountDue)} due</span>`)}
    ${toolbar({ report: false })}${projectsCard('All projects')}`;
  wireToolbar(v, () => fillProjects(v));
  wireProjects(v);
}

/* ---------------- project details ---------------- */
function viewProject(id) {
  const v = $('#view'), p = S.project(id);
  if (!p) { v.innerHTML = `${titleRow('Project not found')}<p><a class="btn outline" href="#/projects">${ico('back')}Back to projects</a></p>`; return; }
  const c = S.client(p.clientId), paid = S.paidFor(p), due = S.dueFor(p), dep = S.depositFor(p), ps = S.payStatus(p), prog = S.progressOf(p);
  const payPct = Math.round(paid / (p.totalPrice || 1) * 100);
  const events = [...p.events].sort((a, b) => b.date.localeCompare(a.date) || 0);
  v.innerHTML = `<a class="back-link" href="#/projects">${ico('back')} All projects</a>
    <div class="title-row detail-title"><div><p class="lbl">${esc(p.ref)} · ${S.TYPE_LABEL[p.type]}</p><h1>${esc(p.title)}</h1></div>${pill(p.status)}</div>
    <div class="detail-grid">
      <div class="col">
        <section class="card white"><div class="card-head"><h2>Project</h2><span class="type t-${p.type}">${S.TYPE_LABEL[p.type]}</span></div>
          <p class="desc">${esc(p.description)}</p>
          <h3 class="sub-h">Furniture pieces <span class="muted">(${p.pieces.reduce((s, x) => s + x.qty, 0)} items)</span></h3>
          <div class="pieces">${p.pieces.map(x => `<article class="piece"><img src="${A}${esc(x.image)}" alt="${esc(x.name)}" loading="lazy"><div><b>${esc(x.name)}</b><span class="qty">× ${x.qty}</span>
            <dl><dt>Material</dt><dd>${esc(x.material)}</dd><dt>Finish / colour</dt><dd>${esc(x.finish)}</dd><dt>Dimensions</dt><dd>${esc(x.dimensions)}</dd></dl></div></article>`).join('')}</div>
        </section>
        <section class="card white"><div class="card-head"><h2>Production steps</h2><span class="muted small">${prog}% complete</span></div>
          <div class="pbar"><i style="width:${prog}%"></i></div>
          <ul class="steps">${S.STEPS.map(([k, l], i) => `<li><label class="${p.steps[k] ? 'done' : ''}"><input type="checkbox" data-step="${k}" ${p.steps[k] ? 'checked' : ''} ${p.status === 'finished' ? 'disabled' : ''}><span class="box">${ico('check')}</span><span class="n">${i + 1}</span>${l}</label></li>`).join('')}</ul>
        </section>
        <section class="card white"><div class="card-head"><h2>Notes & progress</h2></div>
          <form class="note-form" id="noteform"><input name="note" maxlength="600" placeholder="Add a progress update…" aria-label="Progress update"><button class="btn primary" type="submit">${ico('plus')}Add</button></form>
          <ol class="timeline">${events.map(e => `<li class="ev ${e.type}"><span class="ev-dot"></span><div><time>${fdate(e.date)}</time><p>${esc(e.text)}</p></div></li>`).join('')}</ol>
        </section>
      </div>
      <div class="col side">
        <section class="card dark"><p class="lbl">Status</p>
          <div class="seg seg-status" role="radiogroup" aria-label="Project status">${S.STATUSES.map(s => `<button role="radio" aria-checked="${p.status === s}" class="${p.status === s ? 'on' : ''}" data-status="${s}">${S.STATUS_LABEL[s]}</button>`).join('')}</div>
          <p class="sub small">Changing the status updates the dashboard instantly.</p></section>
        <section class="card white"><div class="card-head"><h2>Client</h2><span class="type">${S.CLIENT_TYPES[c.type] || c.type}</span></div>
          <p class="client-name">${esc(c.name)}</p>
          <ul class="contact"><li>${ico('phone')}<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></li><li>${ico('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li><li>${ico('pin')}<span>${esc(c.address)}, ${esc(c.city)}</span></li></ul></section>
        <section class="card sable"><h2>Dates</h2>
          <dl class="dates-dl"><dt>Start</dt><dd>${fdate(p.startDate)}</dd><dt>Expected delivery</dt><dd class="${p.status !== 'finished' && S.parse(p.deliveryDate) < S.today() ? 'late' : ''}">${fdate(p.deliveryDate)}</dd><dt>Completed</dt><dd>${fdate(p.completedDate)}</dd></dl></section>
        <section class="card white"><div class="card-head"><h2>Payment</h2><span class="pay pay-${ps}">${{ paid: 'Paid', partial: 'Partially paid', unpaid: 'Unpaid' }[ps]}</span></div>
          <dl class="pay-dl"><dt>Total price</dt><dd>${money(p.totalPrice)}</dd><dt>Deposit (avance)</dt><dd>${money(dep)}</dd><dt>Amount paid</dt><dd>${money(paid)}</dd><dt>Remaining</dt><dd class="gold-amount">${money(due)}</dd></dl>
          <div class="pbar gold" role="progressbar" aria-valuenow="${payPct}" aria-valuemin="0" aria-valuemax="100" aria-label="Paid ${payPct}%"><i style="width:${payPct}%"></i></div><p class="muted small">${payPct}% paid</p>
          ${due > 0 ? `<form class="pay-form" id="payform"><p class="lbl">Record a payment</p>
            <div class="pf-row"><input name="amount" type="number" min="1" max="${due}" step="1" placeholder="Amount (MAD)" required aria-label="Amount in MAD"><input name="date" type="date" value="${S.iso(S.today())}" max="${S.iso(S.today())}" aria-label="Payment date"></div>
            <div class="pf-row"><select name="method" aria-label="Payment method"><option>Bank transfer</option><option>Cheque</option><option>Card</option><option>Cash</option></select><button class="btn primary" type="submit">Add payment</button></div>
            <button type="button" class="link-btn" id="payfull">Fill remaining (${money(due)})</button><p class="form-err" id="payerr" role="alert"></p></form>` : '<p class="paid-ok">' + ico('check') + ' Fully paid</p>'}
        </section>
      </div>
    </div>`;
  $$('[data-status]', v).forEach(b => b.onclick = () => { if (b.dataset.status === p.status) return; S.updateStatus(p.id, b.dataset.status); toast(`“${p.title}” is now ${S.STATUS_LABEL[b.dataset.status]}.`); });
  $$('[data-step]', v).forEach(c => c.onchange = () => S.toggleStep(p.id, c.dataset.step));
  $('#noteform', v).onsubmit = e => { e.preventDefault(); const t = e.target.note.value.trim(); if (!t) return; S.addNote(p.id, t); toast('Update added to the timeline.'); };
  const pf = $('#payform', v);
  if (pf) {
    $('#payfull', v).onclick = () => { pf.amount.value = due; pf.amount.focus(); };
    pf.onsubmit = e => { e.preventDefault(); try { S.addPayment(p.id, { amount: pf.amount.value, date: pf.date.value, method: pf.method.value }); toast(`Payment of ${money(pf.amount.value)} recorded.`); } catch (x) { $('#payerr', v).textContent = x.message; } };
  }
}

/* ---------------- clients ---------------- */
function viewClients(v) {
  const db = S.get();
  const rows = db.clients.map(c => { const ps = db.projects.filter(p => p.clientId === c.id); return { c, ps, billed: ps.reduce((s, p) => s + p.totalPrice, 0), due: ps.reduce((s, p) => s + S.dueFor(p), 0), done: ps.some(p => p.status === 'finished') }; })
    .sort((a, b) => b.billed - a.billed);
  v.innerHTML = `${titleRow('Clients', `<span class="chip"><i class="live"></i>${rows.filter(r => r.done).length} completed clients</span>`)}
    <section class="client-grid">${rows.map(({ c, ps, billed, due, done }, i) => `<article class="card ${['white', 'sable', 'white', 'pastel'][i % 4]} client-card">
      <div class="cc-top"><span class="cc-av">${esc(initials(c.name))}</span><div><b>${esc(c.name)}</b><small class="muted">${S.CLIENT_TYPES[c.type]} · ${esc(c.city)}</small></div>${done ? '<span class="chg pos">Completed</span>' : ''}</div>
      <ul class="contact compact"><li>${ico('phone')}<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></li><li>${ico('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li></ul>
      <hr class="dash"><div class="cc-stats"><span><small>Projects</small><b>${ps.length}</b></span><span><small>Billed</small><b>${money(billed)}</b></span><span><small>Due</small><b class="${due ? 'gold-amount' : ''}">${money(due)}</b></span></div>
      <div class="cc-projects">${ps.map(p => `<a href="#/projects/${p.id}">${esc(p.title)} ${pill(p.status)}</a>`).join('')}</div></article>`).join('')}</section>`;
}

/* ---------------- payments ---------------- */
function viewPayments(v) {
  const db = S.get(), m = S.metrics();
  const pays = [...db.payments].sort((a, b) => b.date.localeCompare(a.date));
  const open = db.projects.filter(p => S.dueFor(p) > 0).sort((a, b) => S.dueFor(b) - S.dueFor(a));
  const depositsYear = db.payments.filter(x => x.label === 'deposit' && S.parse(x.date).getFullYear() === m.Y).reduce((s, x) => s + x.amount, 0);
  v.innerHTML = `${titleRow('Payments', `<span class="chip"><i class="live"></i>${open.length} open balance${open.length === 1 ? '' : 's'}</span>`)}
    <section class="mini-stats">
      <div class="card dark"><p class="lbl">Received this month</p><p class="kpi-v">${money(m.receivedThisMonth)}</p></div>
      <div class="card white"><p class="lbl">Total amount due</p><p class="kpi-v gold-amount">${money(m.amountDue)}</p></div>
      <div class="card sable"><p class="lbl">Deposits this year</p><p class="kpi-v">${money(depositsYear)}</p></div>
    </section>
    <section class="card white"><div class="card-head"><h2>Open balances</h2></div>
      <div class="balances">${open.map(p => { const pc = Math.round(S.paidFor(p) / p.totalPrice * 100); return `<a class="bal" href="#/projects/${p.id}"><div><b>${esc(p.title)}</b><small class="muted">${esc(S.client(p.clientId)?.name)}</small></div><div class="pbar gold"><i style="width:${pc}%"></i></div><span class="gold-amount">${money(S.dueFor(p))}</span></a>`; }).join('') || '<p class="muted">No open balance. 🎉</p>'}</div></section>
    <section class="card white tbl-card"><div class="card-head"><h2>Payment history</h2><span class="muted small">${pays.length} payments</span></div>
      <div class="tbl-wrap"><table class="ptbl"><thead><tr><th>Date</th><th>Project</th><th>Client</th><th>Type</th><th>Method</th><th class="num">Amount</th></tr></thead><tbody>
      ${pays.map(x => { const p = S.project(x.projectId); return `<tr><td data-l="Date">${fdate(x.date)}</td><td data-l="Project"><a href="#/projects/${p.id}"><b class="p-title">${esc(p.title)}</b></a></td><td data-l="Client">${esc(S.client(p.clientId)?.name)}</td><td data-l="Type"><span class="type">${x.label === 'deposit' ? 'Deposit' : x.label === 'balance' ? 'Balance' : 'Installment'}</span></td><td data-l="Method">${esc(x.method)}</td><td data-l="Amount" class="num"><b>${money(x.amount)}</b></td></tr>`; }).join('')}
      </tbody></table></div></section>`;
}

/* ---------------- messages ---------------- */
function viewMessages(v) {
  const db = S.get(), list = [...db.messages].sort((a, b) => b.date.localeCompare(a.date));
  const sel = list.find(x => x.id === ui.msg) || list[0];
  if (sel && !sel.read) { setTimeout(() => S.markRead(sel.id), 400); }
  v.innerHTML = `${titleRow('Messages', `<span class="chip"><i class="live"></i>${list.filter(x => !x.read).length} unread</span>`)}
    <section class="inbox">
      <div class="card white inbox-list">${list.map(x => `<button class="msg ${x.read ? '' : 'unread'} ${sel && x.id === sel.id ? 'on' : ''}" data-msg="${x.id}"><span class="cc-av sm">${esc(initials(x.from))}</span><span class="msg-t"><b>${esc(x.from)}</b><span>${esc(x.subject)}</span></span><time>${fdate(x.date)}</time></button>`).join('')}</div>
      ${sel ? `<article class="card white inbox-read"><p class="lbl">${fdate(sel.date)}</p><h2>${esc(sel.subject)}</h2><p class="muted">${esc(sel.from)} · <a href="mailto:${esc(sel.email)}">${esc(sel.email)}</a></p><hr class="dash"><p class="msg-body">${esc(sel.body)}</p>
        <div class="row-gap"><a class="btn primary" href="mailto:${esc(sel.email)}?subject=${encodeURIComponent('Re: ' + sel.subject)}">${ico('mail')}Reply by email</a><button class="btn outline" id="unread">Mark as unread</button></div></article>` : ''}
    </section>`;
  $$('[data-msg]', v).forEach(b => b.onclick = () => { ui.msg = b.dataset.msg; viewMessages(v); });
  const u = $('#unread', v); if (u) u.onclick = () => { ui.msg = sel.id; S.markRead(sel.id, false); };
}

/* ---------------- settings ---------------- */
function viewSettings(v) {
  v.innerHTML = `${titleRow('Settings')}
    <section class="settings">
      <form class="card white" id="profileform"><h2>Profile</h2><p class="muted small">Shown in the header avatar.</p>
        <label class="fld">Display name<input name="name" maxlength="60" value="${esc(displayName())}"></label>
        <p class="muted small">Signed in as <b>${esc(state.email)}</b></p><button class="btn primary" type="submit">Save</button></form>
      <div class="card white"><h2>Appearance</h2><p class="muted small">Also available from the floating toolbar.</p>
        <div class="seg" role="radiogroup" aria-label="Theme"><button role="radio" data-theme-set="light" aria-checked="${theme() === 'light'}" class="${theme() === 'light' ? 'on' : ''}">${ico('sun')}Light</button><button role="radio" data-theme-set="dark" aria-checked="${theme() === 'dark'}" class="${theme() === 'dark' ? 'on' : ''}">${ico('moon')}Dark</button></div></div>
      <form class="card white" id="pwform"><h2>Change password</h2><p class="muted small">At least 10 characters.</p>
        <label class="fld">New password<input name="pw" type="password" minlength="10" autocomplete="new-password" required></label>
        <label class="fld">Confirm<input name="pw2" type="password" minlength="10" autocomplete="new-password" required></label>
        <p class="form-err" id="pwerr" role="alert"></p><button class="btn primary" type="submit">Update password</button></form>
      <div class="card sable"><h2>Demo data</h2><p class="small">Projects, clients, payments and messages are sample data for now (saved in this browser). The catalog is live from Supabase.</p>
        <button class="btn outline" id="resetdemo">Reset sample data</button></div>
    </section>`;
  $('#profileform', v).onsubmit = e => { e.preventDefault(); const n = e.target.name.value.trim() || 'Luxor Création'; localStorage.setItem(NAME_KEY, n); $('#avatar').textContent = initials(n); $('.pm-name').textContent = n; toast('Profile saved.'); };
  $$('[data-theme-set]', v).forEach(b => b.onclick = () => { setTheme(b.dataset.themeSet); viewSettings(v); });
  $('#pwform', v).onsubmit = async e => {
    e.preventDefault(); const f = e.target, err = $('#pwerr', v);
    if (f.pw.value.length < 10) return err.textContent = 'Use at least 10 characters.';
    if (f.pw.value !== f.pw2.value) return err.textContent = 'The two passwords do not match.';
    err.textContent = '';
    try { await sb('/auth/v1/user', { method: 'PUT', body: { password: f.pw.value } }); f.reset(); toast('Password updated.'); }
    catch (x) { if (x.message !== 'auth') err.textContent = x.message; }
  };
  $('#resetdemo', v).onclick = () => { if (confirm('Reset all sample projects, payments and messages?')) { S.reset(); toast('Sample data reset.'); } };
}

function showHelp() {
  const m = openModal(`<div class="m-head"><h2>Help</h2><button type="button" class="icon-btn" data-close aria-label="Close">${ico('x')}</button></div>
    <div class="m-body help">
      <p><b>Dashboard</b> — key figures, charts and all projects. Use the status toggle to filter the table, <b>Export</b> for a CSV and <b>Full report</b> to print or save as PDF.</p>
      <p><b>Projects</b> — open <b>View details</b> to change the status, tick production steps, record payments and add progress notes. Every change updates the dashboard instantly.</p>
      <p><b>Catalog</b> — the products shown on the public website (live).</p>
      <p><b>Dark mode</b> — moon icon in the floating toolbar.</p>
      <p class="muted small">Projects, clients, payments and messages use sample data until they are connected to the database.</p>
    </div>`);
  return m;
}

/* ---------------- catalog (live Supabase products) ---------------- */
const catName = id => state.categories.find(c => c.id === id)?.name || id;
async function viewCatalog(v) {
  if (!state.catalogLoaded) {
    v.innerHTML = `${titleRow('Catalog')}<div class="card white loading">Loading products…</div>`;
    try { const d = await api.list(); Object.assign(state, { products: d.products, categories: d.categories, colors: d.colors || [], catalogLoaded: true }); }
    catch (x) { if (x.message !== 'auth') v.innerHTML = `${titleRow('Catalog')}<div class="card white"><p class="form-err">${esc(x.message)}</p></div>`; return; }
    if (ui.route !== 'catalog') return;
  }
  v.innerHTML = `${titleRow('Catalog', `<button class="btn primary" id="addbtn">${ico('plus')}New product</button>`)}
    <section class="mini-stats four" id="stats"></section>
    <section class="card white tbl-card">
      <div class="card-head"><h2>Products on the website</h2><div class="row-gap"><label class="search-pill">${ico('search')}<input type="search" id="q" placeholder="Search a product or reference…" value="${esc(state.q)}" aria-label="Search products"></label>
        <select class="select-pill" id="catf" aria-label="Filter by category"><option value="">All categories</option>${state.categories.map(c => `<option value="${c.id}" ${state.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div></div>
      <div class="tbl-wrap"><table class="ptbl cat-tbl"><thead><tr><th>Product</th><th>Category</th><th class="num">Price (MAD)</th><th>Tags</th><th class="act">Actions</th></tr></thead><tbody id="rows"></tbody></table>
      <p class="empty" id="empty" hidden>No product matches your search.</p></div></section>`;
  $('#addbtn', v).onclick = () => openEditor(null);
  $('#q', v).oninput = e => { state.q = e.target.value; renderRows(); };
  $('#catf', v).onchange = e => { state.cat = e.target.value; renderRows(); };
  renderRows();
}
function renderStats() {
  const ps = state.products, total = ps.length;
  const avg = total ? Math.round(ps.reduce((s, p) => s + (+p.price || 0), 0) / total) : 0;
  const el = $('#stats'); if (!el) return;
  el.innerHTML = [['Products', total, 'dark'], ['Categories', state.categories.length, 'white'], ['New arrivals', ps.filter(p => p.new).length, 'sable'], ['Average price', money(avg), 'pastel']]
    .map(([k, val, tone]) => `<div class="card ${tone}"><p class="lbl">${k}</p><p class="kpi-v">${val}</p></div>`).join('');
}
function renderRows() {
  renderStats();
  const q = state.q.trim().toLowerCase();
  const list = state.products.filter(p => (!state.cat || p.category === state.cat) && (!q || [p.name, p.sku, p.slug, catName(p.category), p.material].join(' ').toLowerCase().includes(q)));
  $('#empty').hidden = list.length > 0;
  $('#rows').innerHTML = list.map(p => `<tr data-slug="${esc(p.slug)}">
      <td data-l="Product"><div class="pcell"><img src="${esc(img(p))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${A}hero-ivoire.webp'"><div><b class="p-title">${esc(p.name)}</b><small class="muted">${esc(p.sku || '')}</small></div></div></td>
      <td data-l="Category">${esc(catName(p.category))}</td>
      <td data-l="Price (MAD)" class="num"><form class="price-form"><input type="number" min="0" step="1" value="${+p.price || 0}" aria-label="Price of ${esc(p.name)}"><button class="icon-btn save" title="Save price" aria-label="Save price">${ico('check')}</button></form></td>
      <td data-l="Tags">${p.new ? '<span class="type">New</span> ' : ''}${p.featured ? '<span class="type gold">Featured</span>' : ''}</td>
      <td class="act"><a class="icon-btn" href="../produit/${esc(p.slug)}/" target="_blank" rel="noopener" title="View on the website" aria-label="View on the website">${ico('eye')}</a><button class="icon-btn" data-edit title="Edit" aria-label="Edit">${ico('edit')}</button><button class="icon-btn danger" data-del title="Delete" aria-label="Delete">${ico('trash')}</button></td>
    </tr>`).join('');
  $$('#rows tr').forEach(tr => {
    const p = state.products.find(x => x.slug === tr.dataset.slug);
    const f = tr.querySelector('.price-form'), inp = f.querySelector('input');
    inp.oninput = () => f.classList.toggle('dirty', +inp.value !== +p.price);
    f.onsubmit = async e => {
      e.preventDefault(); if (+inp.value === +p.price) return;
      try { const d = await api.update(p, { price: inp.value }); Object.assign(p, d.product); f.classList.remove('dirty'); renderStats(); toast(`Price of “${p.name}”: ${money(p.price)}.`); }
      catch (x) { if (x.message !== 'auth') toast(x.message, 'err'); }
    };
    tr.querySelector('[data-edit]').onclick = () => openEditor(p);
    tr.querySelector('[data-del]').onclick = () => confirmDelete(p);
  });
}

/* ---------------- modal ---------------- */
function openModal(html) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false; document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => m.classList.add('open'));
  $$('[data-close]', m).forEach(b => b.onclick = closeModal);
  document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
  return m;
}
function closeModal() {
  const m = $('#modal'); if (!m) return;
  m.classList.remove('open'); document.body.style.overflow = ''; document.onkeydown = null;
  setTimeout(() => { m.hidden = true; m.innerHTML = ''; }, 250);
}

/* resize the chosen photo in the browser (max 1600 px, WebP) to keep uploads light */
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Choose a JPG, PNG or WebP image.'));
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      let out = c.toDataURL('image/webp', 0.86); if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', 0.88);
      resolve(out);
    };
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unreadable image.')); };
    im.src = url;
  });
}

function openEditor(p) {
  const isNew = !p; p = p || { name: '', category: state.cat || state.categories[0]?.id, price: '', description: '', material: '', dimensions: '', color: '', new: true, featured: false };
  const m = openModal(`<form id="pform" class="pform" novalidate>
      <div class="m-head"><h2>${isNew ? 'New product' : 'Edit “' + esc(p.name) + '”'}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${ico('x')}</button></div>
      <div class="m-body">
        <div class="photo-col">
          <label class="photo-drop"><img id="prev" src="${isNew ? '' : esc(img(p))}" alt="" ${isNew ? 'hidden' : ''}><span class="ph" ${isNew ? '' : 'hidden'}>${ico('img')}<b>Add a photo</b><small>JPG, PNG or WebP</small></span><input type="file" id="photo" accept="image/jpeg,image/png,image/webp"></label>
          <p class="hint">${isNew ? 'Without a photo, the category image is used.' : 'Click the photo to replace it.'}</p>
        </div>
        <div class="fields">
          <label class="full">Product name *<input name="name" required maxlength="120" value="${esc(p.name)}"></label>
          <label>Category<select name="category">${state.categories.map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <label>Price (MAD) *<input name="price" type="number" min="0" step="1" required value="${esc(p.price)}"></label>
          <label class="full">Description<textarea name="description" rows="5" maxlength="4000">${esc(p.description)}</textarea></label>
          <label>Material<input name="material" maxlength="160" value="${esc(p.material)}"></label>
          <label>Dimensions<input name="dimensions" maxlength="160" placeholder="e.g. 220 × 90 × 75 cm" value="${esc(p.dimensions)}"></label>
          <label>Colour<input name="color" list="colorlist" maxlength="160" value="${esc(p.color)}"><datalist id="colorlist">${state.colors.map(c => `<option value="${esc(c.name)}">`).join('')}</datalist></label>
          <div class="checks"><label class="chk"><input type="checkbox" name="new" ${p.new ? 'checked' : ''}><span>New arrival</span></label><label class="chk"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}><span>Featured</span></label></div>
        </div>
      </div>
      <p class="form-err" id="perr" role="alert"></p>
      <div class="m-foot"><button type="button" class="btn outline" data-close>Cancel</button><button type="submit" class="btn primary">${isNew ? 'Add product' : 'Save'}</button></div>
    </form>`);
  $$('[data-close]', m).forEach(b => b.onclick = closeModal);
  const f = $('#pform', m); let photo = null;
  f.name.focus();
  $('#photo', m).onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { photo = await readPhoto(file); const pr = $('#prev', m); pr.src = photo; pr.hidden = false; $('.ph', m).hidden = true; }
    catch (x) { $('#perr', m).textContent = x.message; }
  };
  f.onsubmit = async e => {
    e.preventDefault();
    const err = $('#perr', m), btn = f.querySelector('[type=submit]');
    if (!f.name.value.trim()) { err.textContent = 'The product name is required.'; f.name.focus(); return; }
    if (f.price.value === '' || +f.price.value < 0) { err.textContent = 'Enter a valid price.'; f.price.focus(); return; }
    const body = { name: f.name.value, category: f.category.value, price: f.price.value, description: f.description.value, material: f.material.value, dimensions: f.dimensions.value, color: f.color.value, new: f.new.checked, featured: f.featured.checked };
    if (photo) body.photo = photo;
    btn.disabled = true; btn.textContent = 'Saving…'; err.textContent = '';
    try {
      const d = isNew ? await api.create(body) : await api.update(p, body);
      if (photo) d.product._preview = photo;
      if (isNew) state.products.push(d.product); else Object.assign(p, d.product);
      closeModal(); renderRows(); toast(isNew ? `“${d.product.name}” was added to the catalog.` : `“${d.product.name}” was updated.`);
    } catch (x) { if (x.message !== 'auth') { err.textContent = x.message; btn.disabled = false; btn.textContent = isNew ? 'Add product' : 'Save'; } }
  };
}

function confirmDelete(p) {
  const m = openModal(`<div class="confirm">
      <img src="${esc(img(p))}" alt="">
      <h2>Delete “${esc(p.name)}”?</h2>
      <p class="muted">The product and its page will be removed from the website. This cannot be undone.</p>
      <div class="m-foot"><button type="button" class="btn outline" data-close>Cancel</button><button type="button" class="btn danger" id="dodel">${ico('trash')}Delete</button></div>
    </div>`);
  $$('[data-close]', m).forEach(b => b.onclick = closeModal);
  const b = $('#dodel', m); b.focus();
  b.onclick = async () => {
    b.disabled = true;
    try { await api.remove(p); state.products = state.products.filter(x => x !== p); closeModal(); renderRows(); toast(`“${p.name}” was deleted.`); }
    catch (x) { b.disabled = false; if (x.message !== 'auth') toast(x.message, 'err'); }
  };
}

/* KPI links that also set the status filter; info tooltips */
document.addEventListener('click', e => { const a = e.target.closest('[data-setfilter]'); if (a) ui.filter = a.dataset.setfilter; });
document.addEventListener('mouseover', e => { const t = e.target.closest('[data-tip]'); if (t) showInfo(t); });
document.addEventListener('focusin', e => { const t = e.target.closest('[data-tip]'); if (t) showInfo(t); });
document.addEventListener('mouseout', e => { if (e.target.closest('[data-tip]')) hideInfo(); });
document.addEventListener('focusout', e => { if (e.target.closest('[data-tip]')) hideInfo(); });
function showInfo(t) { const tip = $('#tip'); if (!tip) return; tip.innerHTML = `<span class="tip-txt">${esc(t.dataset.tip)}</span>`; tip.hidden = false; const r = t.getBoundingClientRect(); tip.style.left = Math.min(innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px'; tip.style.top = (r.top + scrollY - tip.offsetHeight - 8) + 'px'; }
function hideInfo() { const tip = $('#tip'); if (tip) tip.hidden = true; }

/* ---------------- start ---------------- */
(async () => {
  try { const d = await api.me(); state.email = d.email; startApp(); }
  catch (x) {
    if (x.message === 'auth') return;
    app.innerHTML = `<main class="login"><div class="login-card"><img class="login-logo" src="${A}luxor-logo-gold.webp" alt="Luxor Création"><h1>Admin unavailable</h1><p class="login-sub">${esc(x.message)}</p><a class="back-link" href="../">${ico('back')} Back to the website</a></div></main>`;
  }
})();
})();
