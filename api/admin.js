'use strict';
/*
 * Vercel serverless function: /api/admin/* (rewritten to /api/admin?path=… by vercel.json).
 *
 * Required environment variables (Vercel → Project → Settings → Environment Variables):
 *   ADMIN_EMAIL          admin login email
 *   ADMIN_PASSWORD_HASH  "salt:hash" generated with: node server.js --hash "<password>"
 *   SESSION_SECRET       long random string
 *   GITHUB_TOKEN         fine-grained token with "Contents: Read and write" on the repo
 *   GITHUB_REPO          owner/repo, e.g. alaouih556-dev/Luxor
 *   GITHUB_BRANCH        optional, default "main"
 */
const { createAdminApi, loadCredentials } = require('./_lib/core');
const { githubStore } = require('./_lib/github-store');

let api;
function getApi() {
  if (api) return api;
  const env = process.env;
  const missing = ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_REPO'].filter(k => !env[k]);
  const cred = loadCredentials(env, null);
  let configError = null;
  if (missing.length) configError = `Administration non configurée : variable(s) Vercel manquante(s) : ${missing.join(', ')}.`;
  else if (!cred) configError = 'ADMIN_PASSWORD_HASH invalide (format attendu « sel:hash »).';
  else if (env.SESSION_SECRET.length < 32) configError = 'SESSION_SECRET trop court (32 caractères minimum).';
  api = createAdminApi({
    store: configError ? null : githubStore({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO, branch: env.GITHUB_BRANCH || 'main', apiBase: env.GITHUB_API_URL || undefined }),
    cred, secret: env.SESSION_SECRET, configError
  });
  return api;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let route = url.searchParams.get('path');
  if (route == null) route = url.pathname.replace(/^\/api\/admin\/?/, '');
  route = String(route).replace(/^\/+|\/+$/g, '');
  return getApi()(req, res, route);
};
