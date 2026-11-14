'use strict';
/* Catalogue storage on the local disk (used by `node server.js`). Keeps the last 30 backups in .backups/. */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

function fsStore(root) {
  const CATALOGUE = path.join(root, 'assets', 'catalogue.json');
  const BACKUPS = path.join(root, '.backups');
  const inside = p => { const f = path.normalize(path.join(root, p)); if (!f.startsWith(root + path.sep)) throw new Error('bad path'); return f; };
  let queue = Promise.resolve();

  async function read() {
    return { db: JSON.parse(await fsp.readFile(CATALOGUE, 'utf8')), version: 'local' };
  }
  async function readText(p) { return fsp.readFile(inside(p), 'utf8').catch(() => null); }
  async function exists(p) { return fs.existsSync(inside(p)); }
  function commit({ db, files, deletes }) {
    const run = queue.then(async () => {
      await fsp.mkdir(BACKUPS, { recursive: true });
      await fsp.copyFile(CATALOGUE, path.join(BACKUPS, `catalogue-${new Date().toISOString().replace(/[:.]/g, '-')}.json`));
      for (const [p, content] of Object.entries(files)) { const f = inside(p); await fsp.mkdir(path.dirname(f), { recursive: true }); await fsp.writeFile(f, content); }
      for (const p of deletes) {
        const f = inside(p); await fsp.unlink(f).catch(() => {});
        const dir = path.dirname(f); if (path.dirname(dir) === path.join(root, 'produit')) await fsp.rmdir(dir).catch(() => {});
      }
      const tmp = CATALOGUE + '.tmp';
      await fsp.writeFile(tmp, JSON.stringify(db));
      await fsp.rename(tmp, CATALOGUE);
      const old = (await fsp.readdir(BACKUPS)).filter(f => f.startsWith('catalogue-')).sort();
      for (const f of old.slice(0, Math.max(0, old.length - 30))) await fsp.unlink(path.join(BACKUPS, f)).catch(() => {});
    });
    queue = run.catch(() => {});
    return run;
  }
  return { read, readText, exists, commit, live: false };
}

module.exports = { fsStore };
