/* Luxor Création — admin data layer, backed by Supabase.
 *
 * Tables (backend/supabase/admin_schema.sql): clients, projects (+ project_pieces, project_events),
 * payments, messages, quotes (+ quote_items), revenue_history. All admin-only (row level security).
 * Business rules live in the database: quote numbers, "payment cannot exceed the balance",
 * status-change timeline entries, convert_quote().
 *
 * The pages read a local copy (fast, synchronous selectors) that is refreshed from the database
 * after every change; mutations are async and throw readable errors.
 */
(() => {
'use strict';
const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d, 12); };

const STATUSES = ['started', 'in_progress', 'finished'];
const STATUS_LABEL = { started: 'Started', in_progress: 'In Progress', finished: 'Finished' };
const TYPE_LABEL = { catalog: 'Catalog order', custom: 'Custom-made', interior: 'Interior design' };
const STEPS = [['design', 'Design validated'], ['materials', 'Materials ordered'], ['fabrication', 'Fabrication'], ['finishing', 'Finishing'], ['delivery', 'Delivery & installation']];
const CLIENT_TYPES = { individual: 'Individual', company: 'Company', hotel: 'Hotel', office: 'Office', riad: 'Riad', clinic: 'Clinic', school: 'School', restaurant: 'Restaurant' };
const QUOTE_STATUS = { draft: 'Draft', sent: 'Sent', accepted: 'Accepted', refused: 'Refused' };
const fmtMAD = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + ' MAD';

/* ---------------- database access ---------------- */
let request = null;                       // set by init(): (path, {method, body, headers}) => json
const rest = (path, opts) => request('/rest/v1/' + path, opts);
const ret = { Prefer: 'return=representation' };
const enc = encodeURIComponent;

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

let db = { clients: [], projects: [], payments: [], messages: [], quotes: [], revenue: {}, company: {} };
let loaded = false;
async function refresh() {
  const [clients, projects, payments, messages, quotes, revenue, company] = await Promise.all([
    rest('clients?select=*&order=name'),
    rest('projects?select=*,project_pieces(*),project_events(*)&order=start_date.desc'),
    rest('payments?select=*&order=date,created_at'),
    rest('messages?select=*&order=date.desc'),
    rest('quotes?select=*,quote_items(*)&order=date.desc,number.desc'),
    rest('revenue_history?select=*'),
    rest('company?select=*&id=eq.1')
  ]);
  db = {
    clients: clients.map(mapClient), projects: projects.map(mapProject), payments: payments.map(mapPayment),
    messages: messages.map(mapMessage), quotes: quotes.map(mapQuote),
    revenue: Object.fromEntries(revenue.map(r => [`${r.year}-${r.month}`, { amount: r.amount, sample: r.sample }])),
    company: company[0] || { name: 'Luxor Création' }
  };
  loaded = true;
}
const subs = new Set();
const notify = () => subs.forEach(fn => { try { fn(db); } catch (e) { console.error(e); } });
async function after(fn) { const out = await fn(); await refresh(); notify(); return out; }

const project = id => db.projects.find(p => p.id === id);
const client = id => db.clients.find(c => c.id === id);
const quote = id => db.quotes.find(q => q.id === id);

/* ---------------- selectors ---------------- */
const paidFor = (p, until) => db.payments.filter(x => x.projectId === p.id && (!until || parse(x.date) <= until)).reduce((s, x) => s + x.amount, 0);
const depositFor = p => db.payments.filter(x => x.projectId === p.id && x.label === 'deposit').reduce((s, x) => s + x.amount, 0);
const dueFor = (p, until) => Math.max(0, p.totalPrice - paidFor(p, until));
const payStatus = p => { const paid = paidFor(p); return paid >= p.totalPrice ? 'paid' : paid > 0 ? 'partial' : 'unpaid'; };
const progressOf = p => p.status === 'finished' ? 100 : Math.round(STEPS.filter(([k]) => p.steps[k]).length / STEPS.length * 100);
function statusAt(p, date) {
  if (parse(p.startDate) > date) return null;
  let st = 'started';
  for (const e of p.events) if (e.type === 'status' && e.status && parse(e.date) <= date) st = e.status;
  return st;
}
const monthEnd = (y, m) => new Date(y, m + 1, 0, 23, 59, 59);
const inMonth = (s, y, m) => { if (!s) return false; const d = parse(s); return d.getFullYear() === y && d.getMonth() === m; };
const shift = (y, m, k) => { const d = new Date(y, m + k, 1); return [d.getFullYear(), d.getMonth()]; };
const pct = (a, b) => b ? (a - b) / b * 100 : (a ? 100 : 0);
const hist = (y, m) => db.revenue[`${y}-${m + 1}`]?.amount || 0;

function metrics() {
  const t = today(), Y = t.getFullYear(), M = t.getMonth();
  const [pY, pM] = shift(Y, M, -1);
  const lastEnd = monthEnd(pY, pM);
  const P = db.projects;
  const finishedClientsAt = date => new Set(P.filter(p => statusAt(p, date) === 'finished').map(p => p.clientId)).size;
  const months6 = Array.from({ length: 6 }, (_, i) => shift(Y, M, i - 5));
  const completedClients = new Set(P.filter(p => p.status === 'finished').map(p => p.clientId)).size, completedClientsPrev = finishedClientsAt(lastEnd);
  const dueAt = date => P.filter(p => parse(p.startDate) <= date).reduce((s, p) => s + dueFor(p, date), 0);
  const amountDue = dueAt(t), amountDuePrev = dueAt(lastEnd);
  const inProgress = P.filter(p => p.status === 'in_progress');
  const inProgressPrev = P.filter(p => statusAt(p, lastEnd) === 'in_progress').length;
  const startedThisMonth = P.filter(p => inMonth(p.startDate, Y, M)).length;
  const startedLastMonth = P.filter(p => inMonth(p.startDate, pY, pM)).length;
  const finished = P.filter(p => p.status === 'finished');
  const deliveredThisMonth = finished.filter(p => inMonth(p.completedDate, Y, M)).length;
  const overdue = P.filter(p => p.status !== 'finished' && parse(p.deliveryDate) < t);
  const byStatus = Object.fromEntries(STATUSES.map(s => [s, P.filter(p => p.status === s).length]));
  // revenue per month (current year) = revenue history + payments received
  const revenue = Array.from({ length: 12 }, (_, m) => {
    const pays = db.payments.filter(x => inMonth(x.date, Y, m));
    const value = (m <= M ? hist(Y, m) : 0) + pays.reduce((s, x) => s + x.amount, 0);
    const prev = hist(Y - 1, m) + db.payments.filter(x => inMonth(x.date, Y - 1, m)).reduce((s, x) => s + x.amount, 0);
    return { month: m, label: new Date(Y, m, 1).toLocaleString('en-US', { month: 'short' }), value, prev, projects: new Set(pays.map(x => x.projectId)).size, kind: m < M ? 'past' : m === M ? 'current' : 'future' };
  });
  const pastVals = revenue.filter(r => r.kind !== 'future').map(r => r.value);
  return {
    today: t, Y, M,
    completedClients, completedClientsDiff: completedClients - completedClientsPrev,
    completedSeries: months6.map(([y, m]) => P.filter(p => inMonth(p.completedDate, y, m)).length),
    amountDue, amountDueChange: pct(amountDue, amountDuePrev),
    dueSeries: Array.from({ length: 8 }, (_, i) => { const [y, m] = shift(Y, M, i - 7); return dueAt(i === 7 ? t : monthEnd(y, m)); }),
    inProgress: inProgress.length, inProgressDiff: inProgress.length - inProgressPrev,
    avgProgress: inProgress.length ? Math.round(inProgress.reduce((s, p) => s + progressOf(p), 0) / inProgress.length) : 0,
    startedThisMonth, startedChange: startedThisMonth - startedLastMonth,
    startedSeries: months6.map(([y, m]) => P.filter(p => inMonth(p.startDate, y, m)).length),
    monthLabels: months6.map(([y, m]) => new Date(y, m, 1).toLocaleString('en-US', { month: 'short' })),
    total: P.length, finished: finished.length, deliveredThisMonth, overdue: overdue.length, byStatus,
    revenue, revenueAvg: pastVals.reduce((s, v) => s + v, 0) / (pastVals.length || 1),
    receivedThisMonth: db.payments.filter(x => inMonth(x.date, Y, M)).reduce((s, x) => s + x.amount, 0),
    unread: db.messages.filter(m => !m.read).length,
    openQuotes: db.quotes.filter(q => q.status === 'draft' || q.status === 'sent').length
  };
}

function notifications() {
  const t = today(), out = [];
  for (const p of db.projects) {
    const c = client(p.clientId), days = Math.round((parse(p.deliveryDate) - t) / DAY);
    if (p.status !== 'finished' && days < 0) out.push({ kind: 'warn', projectId: p.id, text: `${p.title} — delivery overdue by ${-days} day${days === -1 ? '' : 's'}` });
    else if (p.status !== 'finished' && days <= 21) out.push({ kind: 'info', projectId: p.id, text: `${p.title} — delivery in ${days} day${days === 1 ? '' : 's'}` });
    if (p.status === 'finished' && dueFor(p) > 0) out.push({ kind: 'gold', projectId: p.id, text: `${c?.name}: ${fmtMAD(dueFor(p))} still due on “${p.title}”` });
  }
  for (const q of db.quotes) if (q.status === 'sent') { const left = q.validDays - Math.round((t - parse(q.date)) / DAY); if (left <= 7) out.push({ kind: left < 0 ? 'warn' : 'gold', route: '#/clients/quote/' + q.id, text: `Quote ${q.number} ${left < 0 ? 'has expired' : `expires in ${left} day${left === 1 ? '' : 's'}`}` }); }
  const unread = db.messages.filter(m => !m.read).length;
  if (unread) out.unshift({ kind: 'info', route: '#/messages', text: `${unread} unread message${unread > 1 ? 's' : ''}` });
  return out;
}

/* ---------------- projects ---------------- */
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const updateStatus = (id, status) => after(async () => {
  if (!STATUSES.includes(status)) throw new Error('Unknown status.');
  await rest(`projects?id=eq.${id}`, { method: 'PATCH', body: { status }, headers: ret });     // the database adds the timeline entry
});
const toggleStep = (id, key) => after(async () => {
  const p = project(id); if (!p || !(key in p.steps)) return;
  const steps = { ...p.steps, [key]: !p.steps[key] };
  const body = { steps };
  if (p.status === 'started' && steps[key]) body.status = 'in_progress';
  await rest(`projects?id=eq.${id}`, { method: 'PATCH', body, headers: ret });
  const label = STEPS.find(([k]) => k === key)[1];
  await rest('project_events', { method: 'POST', body: { project_id: id, type: 'step', text: `${label} ${steps[key] ? 'completed' : 'reopened'}.` } });
});
const addPayment = (id, { amount, date, method }) => after(async () => {
  const p = project(id); amount = Math.round(+amount);
  if (!p || !(amount > 0)) throw new Error('Enter a valid amount.');
  const d = date || iso(today());
  if (parse(d) > today()) throw new Error('The payment date cannot be in the future.');
  const label = paidFor(p) === 0 ? 'deposit' : amount === dueFor(p) ? 'balance' : 'installment';
  await rest('payments', { method: 'POST', body: { project_id: id, amount, date: d, method: method || 'Bank transfer', label } });   // the database refuses more than the balance
  await rest('project_events', { method: 'POST', body: { project_id: id, date: d, type: 'payment', text: `${label === 'deposit' ? 'Deposit' : label === 'balance' ? 'Balance' : 'Payment'} received — ${fmtMAD(amount)} (${method || 'Bank transfer'}).` } });
});
const addNote = (id, text) => after(async () => {
  text = clean(text, 600); if (!text) return;
  await rest('project_events', { method: 'POST', body: { project_id: id, type: 'note', text } });
});
const markRead = (id, read = true) => after(() => rest(`messages?id=eq.${id}`, { method: 'PATCH', body: { read } }));

/* ---------------- clients ---------------- */
function clientFields(data) {
  const c = { name: clean(data.name, 120), type: CLIENT_TYPES[data.type] ? data.type : 'individual', phone: clean(data.phone, 40), email: clean(data.email, 120), city: clean(data.city, 80), address: clean(data.address, 200) };
  if (!c.name) throw new Error('The client name is required.');
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) throw new Error('Enter a valid email address.');
  return c;
}
const dupe = e => { if (e.duplicate) throw new Error('A client with this name already exists.'); throw e; };
const addClient = data => after(async () => { const [c] = await rest('clients', { method: 'POST', body: clientFields(data), headers: ret }).catch(dupe); return mapClient(c); });
const updateClient = (id, data) => after(async () => { const rows = await rest(`clients?id=eq.${id}`, { method: 'PATCH', body: clientFields(data), headers: ret }).catch(dupe); if (!rows?.length) throw new Error('Client not found.'); });
function clientUsage(id) {
  const projects = db.projects.filter(p => p.clientId === id);
  return { projects, quotes: db.quotes.filter(q => q.clientId === id), payments: db.payments.filter(x => projects.some(p => p.id === x.projectId)) };
}
const removeClient = id => after(async () => { const rows = await rest(`clients?id=eq.${id}`, { method: 'DELETE', headers: ret }); if (!rows?.length) throw new Error('Client not found.'); });   // projects, payments and quotes are deleted with it (cascade)

/* ---------------- quotes (devis) ---------------- */
function quoteTotals(q) {
  const lines = (q.items || []).map(i => Math.round(Math.max(0, +i.qty || 0) * Math.max(0, Math.round(+i.unit || 0))));
  const subtotal = lines.reduce((s, v) => s + v, 0);
  const discount = Math.round(subtotal * Math.min(100, Math.max(0, +q.discount || 0)) / 100);
  const net = subtotal - discount, vat = q.vat ? Math.round(net * 0.2) : 0, total = net + vat;
  return { lines, subtotal, discount, net, vat, total, deposit: Math.round(total * Math.min(100, Math.max(0, +q.depositPct || 0)) / 100) };
}
const quoteExpiry = q => iso(parse(q.date).getTime() + q.validDays * DAY);
const saveQuote = data => after(async () => {
  if (!client(data.clientId)) throw new Error('Choose a client.');
  const items = (data.items || []).map(i => ({ label: clean(i.label, 200), qty: Math.round((+i.qty || 0) * 100) / 100, unit: Math.max(0, Math.round(+i.unit || 0)) })).filter(i => i.label || i.unit);
  if (!items.length) throw new Error('Add at least one line to the quote.');
  if (items.some(i => !i.label)) throw new Error('Every line needs a description.');
  if (items.some(i => !(i.qty > 0))) throw new Error('Every line needs a quantity above 0.');
  const fields = { client_id: data.clientId, title: clean(data.title, 140) || 'Quote', type: TYPE_LABEL[data.type] ? data.type : 'custom', date: data.date || iso(today()),
    valid_days: Math.min(365, Math.max(1, Math.round(+data.validDays || 30))), discount: Math.min(100, Math.max(0, +data.discount || 0)), vat: !!data.vat,
    deposit_pct: Math.min(100, Math.max(0, Math.round(+data.depositPct || 0))), notes: clean(data.notes, 1200) };
  let id = data.id;
  if (id) {
    const q = quote(id); if (!q) throw new Error('Quote not found.');
    if (q.status === 'accepted' && q.projectId) throw new Error('This quote is already a project and can no longer be edited.');
    await rest(`quotes?id=eq.${id}`, { method: 'PATCH', body: fields });
    await rest(`quote_items?quote_id=eq.${id}`, { method: 'DELETE' });
  } else {
    const [q] = await rest('quotes', { method: 'POST', body: fields, headers: ret });          // number DEV-YYYY-NNN set by the database
    id = q.id;
  }
  await rest('quote_items', { method: 'POST', body: items.map((i, n) => ({ ...i, quote_id: id, sort: n })) });
  return id;
});
const setQuoteStatus = (id, status) => after(async () => { if (!QUOTE_STATUS[status]) throw new Error('Unknown status.'); await rest(`quotes?id=eq.${id}`, { method: 'PATCH', body: { status } }); });
const removeQuote = id => after(() => rest(`quotes?id=eq.${id}`, { method: 'DELETE' }));
const convertQuote = id => after(() => rest('rpc/convert_quote', { method: 'POST', body: { quote_id: id } }));   // returns the new project id

/* ---------------- company details (printed on quotes) ---------------- */
const COMPANY_FIELDS = ['name', 'tagline', 'address', 'city', 'phone', 'email', 'website', 'ice', 'rc', 'if_number', 'patente', 'bank'];
const saveCompany = data => after(async () => {
  const body = Object.fromEntries(COMPANY_FIELDS.map(k => [k, clean(data[k], k === 'bank' ? 80 : 120)]));
  if (!body.name) throw new Error('The company name is required.');
  body.updated_at = new Date().toISOString();
  await rest('company?id=eq.1', { method: 'PATCH', body });
});

/* ---------------- sample data ---------------- */
const sampleCounts = () => ({ clients: db.clients.filter(c => c.sample).length, messages: db.messages.filter(m => m.sample).length });
const removeSampleData = () => after(async () => {
  await rest('clients?sample=is.true', { method: 'DELETE' });       // cascades to their projects, payments and quotes
  await rest('messages?sample=is.true', { method: 'DELETE' });
  await rest('revenue_history?sample=is.true', { method: 'DELETE' });
});

window.LuxorStore = {
  STATUSES, STATUS_LABEL, TYPE_LABEL, STEPS, CLIENT_TYPES, QUOTE_STATUS,
  async init(req) { request = req; await refresh(); },
  reload: () => after(() => null),
  loaded: () => loaded,
  get: () => db, subscribe: fn => (subs.add(fn), () => subs.delete(fn)),
  project, client, quote, metrics, notifications,
  paidFor, depositFor, dueFor, payStatus, progressOf,
  updateStatus, toggleStep, addPayment, addNote, markRead,
  addClient, updateClient, removeClient, clientUsage,
  quoteTotals, quoteExpiry, saveQuote, setQuoteStatus, removeQuote, convertQuote,
  sampleCounts, removeSampleData, saveCompany, COMPANY_FIELDS,
  fmtMAD, parse, iso, today
};
})();
