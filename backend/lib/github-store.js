'use strict';
/* Catalogue storage in the GitHub repo: every admin change is one commit; Vercel redeploys the site automatically. */

/* prefix: folder of the website inside the repo ("frontend/") — paths given to this store are relative to it. */
function githubStore({ token, repo, branch = 'main', apiBase = 'https://api.github.com', prefix = '' }) {
  const API = `${apiBase}/repos/${repo}`;
  async function gh(path, opts = {}) {
    const r = await fetch(API + path, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'luxor-admin', Accept: 'application/vnd.github+json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) }
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      const err = new Error(`GitHub ${r.status} ${path}: ${text.slice(0, 300)}`);
      err.status = r.status;
      if (r.status === 401) err.publicMessage = 'Jeton GitHub invalide ou expiré (GITHUB_TOKEN).';
      else if (r.status === 403 || r.status === 404) err.publicMessage = 'Accès au dépôt GitHub refusé : vérifiez GITHUB_TOKEN et GITHUB_REPO.';
      throw err;
    }
    return r;
  }
  const full = p => prefix + p;
  const enc = p => full(p).split('/').map(encodeURIComponent).join('/');

  async function head() {
    return (await (await gh(`/git/ref/heads/${encodeURIComponent(branch)}`)).json()).object.sha;
  }
  async function readText(path, version) {
    try {
      const r = await gh(`/contents/${enc(path)}?ref=${version}`, { headers: { Accept: 'application/vnd.github.raw' } });
      return await r.text();
    } catch (e) { if (e.status === 404) return null; throw e; }
  }
  async function exists(path, version) {
    try { await gh(`/contents/${enc(path)}?ref=${version}`); return true; }
    catch (e) { if (e.status === 404) return false; throw e; }
  }
  async function read() {
    const version = await head();
    const text = await readText('assets/catalogue.json', version);
    if (text == null) throw new Error(full('assets/catalogue.json') + ' introuvable dans le dépôt');
    return { db: JSON.parse(text), version };
  }
  async function blob(content) {
    const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8');
    const r = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: buf.toString('base64'), encoding: 'base64' }) });
    return (await r.json()).sha;
  }
  async function commit({ version, db, files, deletes, message }) {
    const baseTree = (await (await gh(`/git/commits/${version}`)).json()).tree.sha;
    const entries = [];
    const all = { ...files, 'assets/catalogue.json': JSON.stringify(db) };
    for (const [path, content] of Object.entries(all)) entries.push({ path: full(path), mode: '100644', type: 'blob', sha: await blob(content) });
    for (const path of deletes) entries.push({ path: full(path), mode: '100644', type: 'blob', sha: null });
    const tree = (await (await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: baseTree, tree: entries }) })).json()).sha;
    const c = (await (await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree, parents: [version] }) })).json()).sha;
    try {
      await gh(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: c, force: false }) });
    } catch (e) {
      if (e.status === 422 || e.status === 409) { const x = new Error('conflict'); x.conflict = true; throw x; }
      throw e;
    }
  }
  return { read, readText, exists, commit, live: true };
}

module.exports = { githubStore };
