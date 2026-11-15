/* Admin authentication (Supabase Auth). The browser keeps the session it gets back
 * and sends `Authorization: Bearer <access_token>` on every /api/admin request. */
'use strict';
const { config, sb, rest, ApiError } = require('./supabase');

async function tokenRequest(grant, body) {
  const { url, key } = config();
  const r = await fetch(`${url}/auth/v1/token?grant_type=${grant}`, { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const m = d.error_description || d.msg || d.message || '';
    if (/invalid login credentials/i.test(m)) throw new ApiError(401, 'Incorrect email or password.');
    if (/email not confirmed/i.test(m)) throw new ApiError(401, 'This account is not confirmed yet.');
    if (r.status === 429) throw new ApiError(429, 'Too many attempts. Please try again in a few minutes.');
    if (grant === 'refresh_token') throw new ApiError(401, 'auth');
    throw new ApiError(400, m || `Sign-in failed (${r.status}).`);
  }
  return {
    access_token: d.access_token, refresh_token: d.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
    email: d.user?.email, user_id: d.user?.id
  };
}

async function isAdmin(token, userId) {
  const rows = await rest(`admins?select=email&user_id=eq.${encodeURIComponent(userId)}`, { token });
  return !!rows?.length;
}

async function logout(token) {
  if (!token) return;
  checked.delete(token);
  const { url, key } = config();
  await fetch(`${url}/auth/v1/logout`, { method: 'POST', headers: { apikey: key, Authorization: 'Bearer ' + token } }).catch(() => {});
}

async function login({ email, password } = {}) {
  email = String(email || '').trim();
  if (!email || !password) throw new ApiError(400, 'Please enter your email and password.');
  const s = await tokenRequest('password', { email, password: String(password) });
  if (!(await isAdmin(s.access_token, s.user_id))) { await logout(s.access_token); throw new ApiError(403, 'This account does not have admin access.'); }
  return s;
}

const refresh = ({ refresh_token } = {}) => {
  if (!refresh_token) throw new ApiError(401, 'auth');
  return tokenRequest('refresh_token', { refresh_token });
};

/* Returns the signed-in user, or throws 401 / 403. Used to guard every admin route. */
const checked = new Map();   // token → { user, until }: avoids two Supabase calls on every click
async function requireAdmin(token) {
  if (!token) throw new ApiError(401, 'auth');
  const hit = checked.get(token);
  if (hit && hit.until > Date.now()) return hit.user;
  const u = await sb('/auth/v1/user', { token }).catch(e => { throw e.status === 401 || e.status === 403 ? new ApiError(401, 'auth') : e; });   // bad or expired token
  if (!u?.id) throw new ApiError(401, 'auth');
  if (!(await isAdmin(token, u.id))) throw new ApiError(403, 'This account does not have admin access.');
  const user = { id: u.id, email: u.email };
  if (checked.size > 500) checked.clear();
  checked.set(token, { user, until: Date.now() + 60000 });
  return user;
}

async function changePassword(token, { password } = {}) {
  if (String(password || '').length < 10) throw new ApiError(400, 'Use at least 10 characters.');
  await sb('/auth/v1/user', { token, method: 'PUT', body: { password: String(password) } });
}

module.exports = { login, refresh, logout, requireAdmin, changePassword };
