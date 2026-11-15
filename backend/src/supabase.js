/* Supabase access for the API.
 * Uses the public (anon / publishable) key + the signed-in admin's own token, so the database
 * row-level-security rules stay in charge: only users listed in `admins` can write.
 * The service-role key is deliberately NOT used here. */
'use strict';

// Public values (safe to publish) used when the environment variables are not set.
const DEFAULT_URL = 'https://oknbuexbsukrzycwiies.supabase.co';
const DEFAULT_KEY = 'sb_publishable_JA1AK7R3FiYQ9MLzWXf22g_yPY3PN7T';

const config = () => ({
  url: (process.env.SUPABASE_URL || DEFAULT_URL).replace(/\/+$/, ''),
  key: process.env.SUPABASE_ANON_KEY || DEFAULT_KEY,
  bucket: process.env.SUPABASE_BUCKET || 'products'
});

class ApiError extends Error {
  constructor(status, message, extra = {}) { super(message); this.status = status; Object.assign(this, extra); }
}

async function sb(path, { token, method = 'GET', body, headers = {}, raw = false } = {}) {
  const { url, key } = config();
  const r = await fetch(url + path, {
    method,
    headers: { apikey: key, ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body !== undefined && !raw ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: raw ? body : body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await r.text(); let d = null; try { d = text ? JSON.parse(text) : null; } catch {}
  if (r.status === 401) throw new ApiError(401, 'auth');
  if (!r.ok) {
    const m = d?.message || d?.msg || d?.error_description || d?.error || '';
    if (d?.code === '23505') throw new ApiError(409, 'duplicate', { duplicate: true });
    if (d?.code === '42501' || r.status === 403 || /row-level security/i.test(m)) throw new ApiError(403, 'This account is not allowed to do that.');
    if (/payment cannot exceed the balance/i.test(m)) throw new ApiError(400, 'The payment cannot exceed the balance.');
    throw new ApiError(r.status >= 500 ? 502 : 400, m || 'Error ' + r.status);
  }
  return d;
}
const rest = (path, opts) => sb('/rest/v1/' + path, opts);
const ret = { Prefer: 'return=representation' };

module.exports = { config, sb, rest, ret, ApiError };
