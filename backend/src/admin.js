/* Admin business data: clients, projects, payments, messages, quotes, company details.
 * All validation and write rules live here (and in the database, see supabase/admin_schema.sql).
 * Every function receives the admin's token so row-level security applies. */
'use strict';
const { rest, ret, ApiError } = require('./supabase');

const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d, 12); };
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !isNaN(parse(s));
const fmtMAD = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + ' MAD';
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const id = v => { const s = String(v || ''); if (!/^[A-Za-z0-9-]{1,64}$/.test(s)) throw new ApiError(400, 'Invalid id.'); return s; };

const STATUSES = ['started', 'in_progress', 'finished'];
const TYPES = ['catalog', 'custom', 'interior'];
const STEPS = [['design', 'Design validated'], ['materials', 'Materials ordered'], ['fabrication', 'Fabrication'], ['finishing', 'Finishing'], ['delivery', 'Delivery & installation']];
const CLIENT_TYPES = ['individual', 'company', 'hotel', 'office', 'riad', 'clinic', 'school', 'restaurant'];
const QUOTE_STATUS = ['draft', 'sent', 'accepted', 'refused'];
const METHODS = ['Bank transfer', 'Cheque', 'Card', 'Cash'];
const COMPANY_FIELDS = ['name', 'tagline', 'address', 'city', 'phone', 'email', 'website', 'ice', 'rc', 'if_number', 'patente', 'bank'];

/* ---------------- read everything (mapped for the admin UI) ---------------- */
const mapClient = c => ({ id: c.id, name: c.name, type: c.type, phone: c.phone, email: c.email, city: c.city, address: c.address, sample: c.sample });
const mapProject = p => ({
  id: p.id, ref: p.ref, title: p.title, clientId: p.client_id, type: p.type, status: p.status, description: p.description,
  startDate: p.start_date, deliveryDate: p.delivery_date || p.start_date, completedDate: p.completed_date, totalPrice: p.total_price,
  steps: { design: false, materials: false, fabrication: false, finishing: false, delivery: false, ...(p.steps || {}) },
  pieces: (p.project_pieces || []).sort((a, b) => a.sort - b.sort).map(x => ({ id: x.id, name: x.name, qty: +x.qty, material: x.material, finish: x.finish, dimensions: x.dimensions, image: x.image })),
  events: (p.project_events || []).sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at)).map(e => ({ id: e.id, date: e.date, type: e.type, status: e.status, text: e.text, at: e.created_at }))
});
const mapPayment = x => ({ id: x.id, projectId: x.project_id, date: x.date, amount: x.amount, label: x.label, method: x.method });
const mapMessage = m => ({ id: m.id, from: m.from_name, email: m.email, subject: m.subject, body: m.body, date: m.date, read: m.read, sample: m.sample });
const mapQuote = q => ({
  id: q.id, number: q.number, clientId: q.client_id, date: q.date, validDays: q.valid_days, title: q.title, type: q.type, status: q.status,
  discount: +q.discount, vat: q.vat, depositPct: q.deposit_pct, notes: q.notes, projectId: q.project_id,
  items: (q.quote_items || []).sort((a, b) => a.sort - b.sort).map(i => ({ id: i.id, label: i.label, qty: +i.qty, unit: i.unit }))
});

async function getAll(token) {
  const o = { token };
  const [clients, projects, payments, messages, quotes, revenue, company] = await Promise.all([
    rest('clients?select=*&order=name', o),
    rest('projects?select=*,project_pieces(*),project_events(*)&order=start_date.desc', o),
    rest('payments?select=*&order=date,created_at', o),
    rest('messages?select=*&order=date.desc', o),
    rest('quotes?select=*,quote_items(*)&order=date.desc,number.desc', o),
    rest('revenue_history?select=*', o),
    rest('company?select=*&id=eq.1', o)
  ]);
  return {
    clients: clients.map(mapClient), projects: projects.map(mapProject), payments: payments.map(mapPayment),
    messages: messages.map(mapMessage), quotes: quotes.map(mapQuote),
    revenue: Object.fromEntries(revenue.map(r => [`${r.year}-${r.month}`, { amount: r.amount, sample: r.sample }])),
    company: company[0] || { name: 'Luxor Création' }
  };
}

/* ---------------- projects ---------------- */
async function getProject(token, pid) {
  const [p] = await rest(`projects?select=id,status,steps,total_price&id=eq.${pid}`, { token });
  if (!p) throw new ApiError(404, 'Project not found');
  return p;
}

async function updateStatus(token, pid, { status } = {}) {
  pid = id(pid);
  if (!STATUSES.includes(status)) throw new ApiError(400, 'Unknown status.');
  const rows = await rest(`projects?id=eq.${pid}`, { token, method: 'PATCH', body: { status }, headers: ret });   // the database adds the timeline entry
  if (!rows?.length) throw new ApiError(404, 'Project not found');
}

async function toggleStep(token, pid, key) {
  pid = id(pid);
  const step = STEPS.find(([k]) => k === key); if (!step) throw new ApiError(400, 'Unknown step.');
  const p = await getProject(token, pid);
  if (p.status === 'finished') throw new ApiError(400, 'This project is finished.');
  const steps = { design: false, materials: false, fabrication: false, finishing: false, delivery: false, ...(p.steps || {}) };
  steps[key] = !steps[key];
  const body = { steps };
  if (p.status === 'started' && steps[key]) body.status = 'in_progress';
  await rest(`projects?id=eq.${pid}`, { token, method: 'PATCH', body, headers: ret });
  await rest('project_events', { token, method: 'POST', body: { project_id: pid, type: 'step', text: `${step[1]} ${steps[key] ? 'completed' : 'reopened'}.` } });
}

async function addPayment(token, pid, { amount, date, method } = {}) {
  pid = id(pid);
  const p = await getProject(token, pid);
  amount = Math.round(+amount);
  if (!(amount > 0)) throw new ApiError(400, 'Enter a valid amount.');
  const d = date || iso(today());
  if (!isDate(d)) throw new ApiError(400, 'Enter a valid date.');
  if (parse(d) > today()) throw new ApiError(400, 'The payment date cannot be in the future.');
  const pays = await rest(`payments?select=amount&project_id=eq.${pid}`, { token });
  const paid = pays.reduce((s, x) => s + x.amount, 0), due = Math.max(0, p.total_price - paid);
  if (amount > due) throw new ApiError(400, 'The payment cannot exceed the balance.');
  const label = paid === 0 ? 'deposit' : amount === due ? 'balance' : 'installment';
  if (!METHODS.includes(method)) method = 'Bank transfer';
  await rest('payments', { token, method: 'POST', body: { project_id: pid, amount, date: d, method, label } });   // the database also refuses more than the balance
  await rest('project_events', { token, method: 'POST', body: { project_id: pid, date: d, type: 'payment', text: `${label === 'deposit' ? 'Deposit' : label === 'balance' ? 'Balance' : 'Payment'} received — ${fmtMAD(amount)} (${method}).` } });
}

async function addNote(token, pid, { text } = {}) {
  pid = id(pid);
  text = clean(text, 600); if (!text) throw new ApiError(400, 'Write a note first.');
  await rest('project_events', { token, method: 'POST', body: { project_id: pid, type: 'note', text } });
}

const markRead = (token, mid, { read = true } = {}) => rest(`messages?id=eq.${id(mid)}`, { token, method: 'PATCH', body: { read: !!read } });

/* ---------------- clients ---------------- */
function clientFields(data = {}) {
  const c = { name: clean(data.name, 120), type: CLIENT_TYPES.includes(data.type) ? data.type : 'individual', phone: clean(data.phone, 40), email: clean(data.email, 120), city: clean(data.city, 80), address: clean(data.address, 200) };
  if (!c.name) throw new ApiError(400, 'The client name is required.');
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) throw new ApiError(400, 'Enter a valid email address.');
  return c;
}
const dupe = e => { if (e.duplicate) throw new ApiError(409, 'A client with this name already exists.'); throw e; };
async function addClient(token, data) {
  const [c] = await rest('clients', { token, method: 'POST', body: clientFields(data), headers: ret }).catch(dupe);
  return mapClient(c);
}
async function updateClient(token, cid, data) {
  const rows = await rest(`clients?id=eq.${id(cid)}`, { token, method: 'PATCH', body: clientFields(data), headers: ret }).catch(dupe);
  if (!rows?.length) throw new ApiError(404, 'Client not found.');
}
async function removeClient(token, cid) {   // projects, payments and quotes are deleted with it (cascade)
  const rows = await rest(`clients?id=eq.${id(cid)}`, { token, method: 'DELETE', headers: ret });
  if (!rows?.length) throw new ApiError(404, 'Client not found.');
}

/* ---------------- quotes (devis) ---------------- */
async function saveQuote(token, qid, data = {}) {
  const cid = id(data.clientId || 'x');
  const [c] = await rest(`clients?select=id&id=eq.${cid}`, { token });
  if (!c) throw new ApiError(400, 'Choose a client.');
  const items = (Array.isArray(data.items) ? data.items : []).slice(0, 100)
    .map(i => ({ label: clean(i.label, 200), qty: Math.round((+i.qty || 0) * 100) / 100, unit: Math.max(0, Math.round(+i.unit || 0)) })).filter(i => i.label || i.unit);
  if (!items.length) throw new ApiError(400, 'Add at least one line to the quote.');
  if (items.some(i => !i.label)) throw new ApiError(400, 'Every line needs a description.');
  if (items.some(i => !(i.qty > 0))) throw new ApiError(400, 'Every line needs a quantity above 0.');
  const fields = {
    client_id: cid, title: clean(data.title, 140) || 'Quote', type: TYPES.includes(data.type) ? data.type : 'custom', date: isDate(data.date) ? data.date : iso(today()),
    valid_days: Math.min(365, Math.max(1, Math.round(+data.validDays || 30))), discount: Math.min(100, Math.max(0, +data.discount || 0)), vat: !!data.vat,
    deposit_pct: Math.min(100, Math.max(0, Math.round(+data.depositPct || 0))), notes: clean(data.notes, 1200)
  };
  if (qid) {
    qid = id(qid);
    const [q] = await rest(`quotes?select=status,project_id&id=eq.${qid}`, { token });
    if (!q) throw new ApiError(404, 'Quote not found.');
    if (q.status === 'accepted' && q.project_id) throw new ApiError(400, 'This quote is already a project and can no longer be edited.');
    await rest(`quotes?id=eq.${qid}`, { token, method: 'PATCH', body: fields });
    await rest(`quote_items?quote_id=eq.${qid}`, { token, method: 'DELETE' });
  } else {
    const [q] = await rest('quotes', { token, method: 'POST', body: fields, headers: ret });   // number DEV-YYYY-NNN set by the database
    qid = q.id;
  }
  await rest('quote_items', { token, method: 'POST', body: items.map((i, n) => ({ ...i, quote_id: qid, sort: n })) });
  return qid;
}
async function setQuoteStatus(token, qid, { status } = {}) {
  if (!QUOTE_STATUS.includes(status)) throw new ApiError(400, 'Unknown status.');
  await rest(`quotes?id=eq.${id(qid)}`, { token, method: 'PATCH', body: { status } });
}
const removeQuote = (token, qid) => rest(`quotes?id=eq.${id(qid)}`, { token, method: 'DELETE' });
const convertQuote = (token, qid) => rest('rpc/convert_quote', { token, method: 'POST', body: { quote_id: id(qid) } });   // returns the new project id

/* ---------------- company details & sample data ---------------- */
async function saveCompany(token, data = {}) {
  const body = Object.fromEntries(COMPANY_FIELDS.map(k => [k, clean(data[k], k === 'bank' ? 80 : 120)]));
  if (!body.name) throw new ApiError(400, 'The company name is required.');
  body.updated_at = new Date().toISOString();
  await rest('company?id=eq.1', { token, method: 'PATCH', body });
}
async function removeSampleData(token) {
  await rest('clients?sample=is.true', { token, method: 'DELETE' });   // cascades to their projects, payments and quotes
  await rest('messages?sample=is.true', { token, method: 'DELETE' });
  await rest('revenue_history?sample=is.true', { token, method: 'DELETE' });
}

module.exports = {
  getAll, updateStatus, toggleStep, addPayment, addNote, markRead,
  addClient, updateClient, removeClient, saveQuote, setQuoteStatus, removeQuote, convertQuote,
  saveCompany, removeSampleData
};
