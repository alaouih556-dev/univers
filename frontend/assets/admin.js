/* Luxor Création — administration (catalogue: add, edit price/description, delete). */
(() => {
'use strict';
const app = document.getElementById('admin');
const A = '../assets/';
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => new Intl.NumberFormat('fr-MA').format(n) + ' DH';
const img = p => p._preview || p.image || A + ((p.gallery && p.gallery[0]) || p.fallback || 'hero-ivoire.webp');
const ICON = {
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>', check: '<path d="m5 12 5 5 9-10"/>'
};
const ico = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

let state = { email: '', products: [], categories: [], colors: [], q: '', cat: '', live: false };
const liveNote = () => state.live ? ' En ligne sur le site dans environ 1 minute.' : '';

async function call(method, url, body) {
  const r = await fetch(url, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  let data = {}; try { data = await r.json(); } catch {}
  if (r.status === 401 && !url.endsWith('/login')) { showLogin(url.endsWith('/me') ? '' : 'Votre session a expiré. Veuillez vous reconnecter.'); throw new Error('auth'); }
  if (!r.ok) throw new Error(data.error || 'Erreur ' + r.status);
  return data;
}

function toast(msg, kind = 'ok') {
  let box = document.querySelector('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = (kind === 'ok' ? ico('check') : '') + `<span>${esc(msg)}</span>`;
  box.appendChild(t); setTimeout(() => t.classList.add('out'), 3200); setTimeout(() => t.remove(), 3700);
}

const logo = `<img class="ad-logo" src="${A}luxor-logo-gold.webp" alt="Luxor Création">`;

/* ---------------- login ---------------- */
function showLogin(msg = '') {
  document.body.className = 'is-login';
  app.innerHTML = `<main class="login">
    <form class="login-card" id="loginform" novalidate>
      ${logo}
      <h1>Espace administration</h1>
      <p class="login-sub">Connectez-vous pour gérer le catalogue.</p>
      <label>Email<input type="email" name="email" autocomplete="username" required autofocus></label>
      <label>Mot de passe<span class="pw"><input type="password" name="password" autocomplete="current-password" required><button type="button" class="pw-toggle" aria-label="Afficher le mot de passe">${ico('eye')}</button></span></label>
      <p class="form-err" id="loginerr" role="alert">${esc(msg)}</p>
      <button class="btn gold" type="submit">Se connecter</button>
      <a class="back" href="../">← Retour au site</a>
    </form>
  </main>`;
  const f = document.getElementById('loginform');
  f.querySelector('.pw-toggle').onclick = () => { const i = f.password; i.type = i.type === 'password' ? 'text' : 'password'; };
  f.onsubmit = async e => {
    e.preventDefault();
    const err = document.getElementById('loginerr'), btn = f.querySelector('[type=submit]');
    if (!f.email.value || !f.password.value) { err.textContent = 'Veuillez saisir votre email et votre mot de passe.'; return; }
    btn.disabled = true; btn.textContent = 'Connexion…'; err.textContent = '';
    try { const d = await call('POST', '/api/admin/login', { email: f.email.value, password: f.password.value }); state.email = d.email; await loadDashboard(); }
    catch (x) { err.textContent = x.message; btn.disabled = false; btn.textContent = 'Se connecter'; f.password.select(); }
  };
}

/* ---------------- dashboard ---------------- */
async function loadDashboard() {
  const d = await call('GET', '/api/admin/products');
  Object.assign(state, { products: d.products, categories: d.categories, colors: d.colors || [], live: !!d.live });
  renderDashboard();
}
const catName = id => state.categories.find(c => c.id === id)?.name || id;

function renderDashboard() {
  document.body.className = 'is-dash';
  const cats = state.categories;
  app.innerHTML = `<header class="ad-hdr">
      <a href="../" title="Voir le site">${logo}</a>
      <div class="ad-hdr-r"><span class="ad-user">${esc(state.email)}</span><button class="btn ghost sm" id="logout">${ico('out')}<span>Déconnexion</span></button></div>
    </header>
    <main class="ad-main">
      <div class="ad-head">
        <div><p class="eyebrow">Catalogue</p><h1>Gestion des produits</h1></div>
        <button class="btn gold" id="addbtn">${ico('plus')}<span>Nouveau produit</span></button>
      </div>
      <section class="stats" id="stats"></section>
      <div class="toolbar">
        <label class="search">${ico('search')}<input type="search" id="q" placeholder="Rechercher un produit, une référence…" value="${esc(state.q)}"></label>
        <select id="catf" aria-label="Filtrer par catégorie"><option value="">Toutes les catégories</option>${cats.map(c => `<option value="${c.id}" ${state.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
      </div>
      <div class="table-wrap"><table class="ptable">
        <thead><tr><th>Produit</th><th>Catégorie</th><th class="num">Prix (DH)</th><th>Statut</th><th class="act">Actions</th></tr></thead>
        <tbody id="rows"></tbody>
      </table><p class="empty hidden" id="empty">Aucun produit ne correspond à votre recherche.</p></div>
    </main>
    <div class="modal" id="modal" hidden></div>`;
  document.getElementById('logout').onclick = async () => { try { await call('POST', '/api/admin/logout', {}); } catch {} state.email = ''; showLogin(); };
  document.getElementById('addbtn').onclick = () => openEditor(null);
  document.getElementById('q').oninput = e => { state.q = e.target.value; renderRows(); };
  document.getElementById('catf').onchange = e => { state.cat = e.target.value; renderRows(); };
  renderRows();
}

function renderStats() {
  const ps = state.products, total = ps.length;
  const avg = total ? Math.round(ps.reduce((s, p) => s + (+p.price || 0), 0) / total) : 0;
  document.getElementById('stats').innerHTML = [
    ['Produits', total], ['Catégories', state.categories.length], ['Nouveautés', ps.filter(p => p.new).length], ['Prix moyen', money(avg)]
  ].map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
}

function renderRows() {
  renderStats();
  const q = state.q.trim().toLowerCase();
  const list = state.products.filter(p => (!state.cat || p.category === state.cat) && (!q || [p.name, p.sku, p.slug, catName(p.category), p.material].join(' ').toLowerCase().includes(q)));
  document.getElementById('empty').classList.toggle('hidden', list.length > 0);
  document.getElementById('rows').innerHTML = list.map(p => `<tr data-slug="${esc(p.slug)}">
      <td><div class="pcell"><img src="${esc(img(p))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${A}hero-ivoire.webp'"><div><b>${esc(p.name)}</b><small>${esc(p.sku || '')}</small></div></div></td>
      <td>${esc(catName(p.category))}</td>
      <td class="num"><form class="price-form"><input type="number" min="0" step="1" value="${+p.price || 0}" aria-label="Prix de ${esc(p.name)}"><button class="icon-btn save" title="Enregistrer le prix" aria-label="Enregistrer le prix">${ico('check')}</button></form></td>
      <td>${p.new ? '<span class="tag">Nouveau</span>' : ''}${p.featured ? '<span class="tag">À la une</span>' : ''}</td>
      <td class="act"><a class="icon-btn" href="../produit/${esc(p.slug)}/" target="_blank" rel="noopener" title="Voir sur le site" aria-label="Voir sur le site">${ico('eye')}</a><button class="icon-btn" data-edit title="Modifier" aria-label="Modifier">${ico('edit')}</button><button class="icon-btn danger" data-del title="Supprimer" aria-label="Supprimer">${ico('trash')}</button></td>
    </tr>`).join('');
  document.querySelectorAll('#rows tr').forEach(tr => {
    const p = state.products.find(x => x.slug === tr.dataset.slug);
    const f = tr.querySelector('.price-form'), inp = f.querySelector('input');
    inp.oninput = () => f.classList.toggle('dirty', +inp.value !== +p.price);
    f.onsubmit = async e => {
      e.preventDefault(); if (+inp.value === +p.price) return;
      try { const d = await call('PUT', '/api/admin/products/' + p.slug, { price: inp.value }); Object.assign(p, d.product); f.classList.remove('dirty'); renderStats(); toast(`Prix de « ${p.name} » : ${money(p.price)}.` + liveNote()); }
      catch (x) { if (x.message !== 'auth') toast(x.message, 'err'); }
    };
    tr.querySelector('[data-edit]').onclick = () => openEditor(p);
    tr.querySelector('[data-del]').onclick = () => confirmDelete(p);
  });
}

/* ---------------- editor modal ---------------- */
function openModal(html) {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false; document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => m.classList.add('open'));
  m.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal);
  document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
  return m;
}
function closeModal() {
  const m = document.getElementById('modal'); if (!m) return;
  m.classList.remove('open'); document.body.style.overflow = ''; document.onkeydown = null;
  setTimeout(() => { m.hidden = true; m.innerHTML = ''; }, 250);
}

/* resize the chosen photo in the browser (max 1600 px, WebP) to keep uploads light */
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Choisissez une image JPG, PNG ou WebP.'));
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      let out = c.toDataURL('image/webp', 0.86); if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', 0.88);
      resolve(out);
    };
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible.')); };
    im.src = url;
  });
}

function openEditor(p) {
  const isNew = !p; p = p || { name: '', category: state.cat || state.categories[0]?.id, price: '', description: '', material: '', dimensions: '', color: '', new: true, featured: false };
  const m = openModal(`<form id="pform" class="pform" novalidate>
      <div class="m-head"><h2>${isNew ? 'Nouveau produit' : 'Modifier « ' + esc(p.name) + ' »'}</h2><button type="button" class="icon-btn" data-close aria-label="Fermer">${ico('x')}</button></div>
      <div class="m-body">
        <div class="photo-col">
          <label class="photo-drop" id="drop"><img id="prev" src="${isNew ? '' : esc(img(p))}" alt="" ${isNew ? 'hidden' : ''}><span class="ph" ${isNew ? '' : 'hidden'}>${ico('img')}<b>Ajouter une photo</b><small>JPG, PNG ou WebP</small></span><input type="file" id="photo" accept="image/jpeg,image/png,image/webp"></label>
          <p class="hint">${isNew ? 'Sans photo, l’image de la catégorie sera utilisée.' : 'Cliquez sur la photo pour la remplacer.'}</p>
        </div>
        <div class="fields">
          <label class="full">Nom du produit *<input name="name" required maxlength="120" value="${esc(p.name)}"></label>
          <label>Catégorie<select name="category">${state.categories.map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <label>Prix (DH) *<input name="price" type="number" min="0" step="1" required value="${esc(p.price)}"></label>
          <label class="full">Description<textarea name="description" rows="5" maxlength="4000">${esc(p.description)}</textarea></label>
          <label>Matière<input name="material" maxlength="160" value="${esc(p.material)}"></label>
          <label>Dimensions<input name="dimensions" maxlength="160" placeholder="ex. 220 × 90 × 75 cm" value="${esc(p.dimensions)}"></label>
          <label>Couleur<input name="color" list="colorlist" maxlength="160" value="${esc(p.color)}"><datalist id="colorlist">${state.colors.map(c => `<option value="${esc(c.name)}">`).join('')}</datalist></label>
          <div class="checks"><label class="chk"><input type="checkbox" name="new" ${p.new ? 'checked' : ''}><span>Nouveauté</span></label><label class="chk"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}><span>À la une</span></label></div>
        </div>
      </div>
      <p class="form-err" id="perr" role="alert"></p>
      <div class="m-foot"><button type="button" class="btn ghost" data-close>Annuler</button><button type="submit" class="btn gold">${isNew ? 'Ajouter le produit' : 'Enregistrer'}</button></div>
    </form>`);
  m.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal);
  const f = m.querySelector('#pform'); let photo = null;
  f.name.focus();
  m.querySelector('#photo').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { photo = await readPhoto(file); const pr = m.querySelector('#prev'); pr.src = photo; pr.hidden = false; m.querySelector('.ph').hidden = true; }
    catch (x) { m.querySelector('#perr').textContent = x.message; }
  };
  f.onsubmit = async e => {
    e.preventDefault();
    const err = m.querySelector('#perr'), btn = f.querySelector('[type=submit]');
    if (!f.name.value.trim()) { err.textContent = 'Le nom du produit est obligatoire.'; f.name.focus(); return; }
    if (f.price.value === '' || +f.price.value < 0) { err.textContent = 'Indiquez un prix valide.'; f.price.focus(); return; }
    const body = { name: f.name.value, category: f.category.value, price: f.price.value, description: f.description.value, material: f.material.value, dimensions: f.dimensions.value, color: f.color.value, new: f.new.checked, featured: f.featured.checked };
    if (photo) body.photo = photo;
    btn.disabled = true; btn.textContent = 'Enregistrement…'; err.textContent = '';
    try {
      const d = isNew ? await call('POST', '/api/admin/products', body) : await call('PUT', '/api/admin/products/' + p.slug, body);
      if (photo) d.product._preview = photo;
      if (isNew) state.products.push(d.product); else Object.assign(p, d.product);
      closeModal(); renderRows(); toast((isNew ? `« ${d.product.name} » a été ajouté au catalogue.` : `« ${d.product.name} » a été mis à jour.`) + liveNote());
    } catch (x) { if (x.message !== 'auth') { err.textContent = x.message; btn.disabled = false; btn.textContent = isNew ? 'Ajouter le produit' : 'Enregistrer'; } }
  };
}

function confirmDelete(p) {
  const m = openModal(`<div class="confirm">
      <img src="${esc(img(p))}" alt="">
      <h2>Supprimer « ${esc(p.name)} » ?</h2>
      <p>Le produit et sa page seront retirés du site. Cette action est définitive.</p>
      <div class="m-foot"><button type="button" class="btn ghost" data-close>Annuler</button><button type="button" class="btn danger" id="dodel">${ico('trash')}<span>Supprimer</span></button></div>
    </div>`);
  m.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal);
  const b = m.querySelector('#dodel'); b.focus();
  b.onclick = async () => {
    b.disabled = true;
    try { await call('DELETE', '/api/admin/products/' + p.slug, {}); state.products = state.products.filter(x => x !== p); closeModal(); renderRows(); toast(`« ${p.name} » a été supprimé.` + liveNote()); }
    catch (x) { b.disabled = false; if (x.message !== 'auth') toast(x.message, 'err'); }
  };
}

/* ---------------- start ---------------- */
(async () => {
  try { const d = await call('GET', '/api/admin/me'); state.email = d.email; await loadDashboard(); }
  catch (x) {
    if (x.message === 'auth') return;
    const noApi = /^Erreur (404|405)$/.test(x.message) || x instanceof TypeError;
    app.innerHTML = `<main class="login"><div class="login-card">${logo}<h1>${noApi ? 'Serveur requis' : 'Administration indisponible'}</h1><p class="login-sub">${noApi ? 'L’API d’administration est introuvable. En local, lancez <code>node server.js</code> puis ouvrez <code>http://localhost:8080/admin/</code>. En ligne, vérifiez que le dossier <code>api/</code> et <code>vercel.json</code> ont bien été déployés.' : esc(x.message)}</p><a class="back" href="../">← Retour au site</a></div></main>`;
  }
})();
})();
