/* Luxor Création — admin data layer (browser side).
 *
 * All reads and writes go through the backend API (/api/admin/…, see backend/src/admin.js), which
 * validates every change and applies the business rules together with the database.
 * The pages read a local copy (fast, synchronous selectors) that is refreshed from the API
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
const ORDER_STATUS = { draft: 'Draft', confirmed: 'Confirmed', delivered: 'Delivered', cancelled: 'Cancelled' };
const PAY_METHODS = ['Bank transfer', 'Cheque', 'Card', 'Cash'];
const DELIVERY_STATUS = { draft: 'Draft', delivered: 'Delivered & signed' };
const RECEIPT_STATUS = { draft: 'Draft', validated: 'Compliant', dispute: 'Dispute' };
const CONDITIONS = { ok: 'Compliant', damaged: 'Damaged', missing: 'Missing' };
const fmtMAD = n => new Intl.NumberFormat(window.LuxorI18n?.numLocale || 'en-US', { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + ' MAD';

/* ---------------- API access ---------------- */
let request = null;                       // set by init(): (path, {method, body}) => json, authenticated
const enc = encodeURIComponent;
const send = (method, path, body) => request('/admin' + path, { method, body });

let db = { clients: [], projects: [], payments: [], messages: [], quotes: [], orders: [], deliveries: [], receipts: [], revenue: {}, company: {} };
let loaded = false;
async function refresh() { db = await request('/admin/data'); db.orders ||= []; db.deliveries ||= []; db.receipts ||= []; loaded = true; }
const subs = new Set();
const notify = () => subs.forEach(fn => { try { fn(db); } catch (e) { console.error(e); } });
async function after(fn) { const out = await fn(); await refresh(); notify(); return out; }

const project = id => db.projects.find(p => p.id === id);
const client = id => db.clients.find(c => c.id === id);
const quote = id => db.quotes.find(q => q.id === id);
const order = id => db.orders.find(o => o.id === id);
const delivery = id => db.deliveries.find(d => d.id === id);
const receipt = id => db.receipts.find(r => r.id === id);
/* supplier reception: amount = quantity received × unit price, WITHOUT VAT */
function receiptTotals(r) {
  const lines = r.items.map(i => Math.round((+i.qty || 0) * (+i.unit || 0)));
  return { lines, total: lines.reduce((s, v) => s + v, 0) };
}
/* compliant = every line in good condition and fully received */
const receiptCompliant = r => r.items.every(i => i.condition === 'ok' && (i.qtyOrdered == null || i.qty >= i.qtyOrdered));
const suppliers = () => { const m = new Map(); for (const r of db.receipts) if (!m.has(r.supplier.name.toLowerCase())) m.set(r.supplier.name.toLowerCase(), r.supplier); return [...m.values()]; };
/* what is left to deliver on each line of a purchase order (other delivery notes than exceptId) */
const lineKey = i => [i.label, i.color, i.dimensions].map(x => String(x || '').trim().toLowerCase()).join('|');
function remainingFor(o, exceptId) {
  const done = new Map();
  for (const d of db.deliveries) if (d.orderId === o.id && d.id !== exceptId) for (const i of d.items) done.set(lineKey(i), (done.get(lineKey(i)) || 0) + i.qty);
  return o.items.map(i => { const k = lineKey(i), used = Math.min(i.qty, done.get(k) || 0); done.set(k, (done.get(k) || 0) - used); return { ...i, delivered: used, left: Math.max(0, Math.round((i.qty - used) * 100) / 100) }; });
}

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
    return { month: m, label: new Date(Y, m, 1).toLocaleString(window.LuxorI18n?.locale || 'en-US', { month: 'short' }), value, prev, projects: new Set(pays.map(x => x.projectId)).size, kind: m < M ? 'past' : m === M ? 'current' : 'future' };
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
    monthLabels: months6.map(([y, m]) => new Date(y, m, 1).toLocaleString(window.LuxorI18n?.locale || 'en-US', { month: 'short' })),
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
const updateStatus = (id, status) => after(() => send('PATCH', `/projects/${enc(id)}/status`, { status }));
const toggleStep = (id, key) => after(() => send('POST', `/projects/${enc(id)}/steps/${enc(key)}`));
const addPayment = (id, { amount, date, method }) => after(() => send('POST', `/projects/${enc(id)}/payments`, { amount, date, method }));
const addNote = (id, text) => { if (!String(text ?? '').trim()) return Promise.resolve(); return after(() => send('POST', `/projects/${enc(id)}/notes`, { text })); };
const markRead = (id, read = true) => after(() => send('PATCH', `/messages/${enc(id)}`, { read }));

/* ---------------- clients ---------------- */
const addClient = data => after(() => send('POST', '/clients', data));
const updateClient = (id, data) => after(() => send('PATCH', `/clients/${enc(id)}`, data));
function clientUsage(id) {
  const projects = db.projects.filter(p => p.clientId === id);
  return { projects, quotes: db.quotes.filter(q => q.clientId === id), orders: db.orders.filter(o => o.clientId === id), deliveries: db.deliveries.filter(d => d.clientId === id), receipts: db.receipts.filter(r => r.clientId === id), payments: db.payments.filter(x => projects.some(p => p.id === x.projectId)) };
}
const removeClient = id => after(() => send('DELETE', `/clients/${enc(id)}`));   // projects, payments and quotes are deleted with it

/* ---------------- quotes (devis) ---------------- */
function quoteTotals(q) {
  const lines = (q.items || []).map(i => Math.round(Math.max(0, +i.qty || 0) * Math.max(0, Math.round(+i.unit || 0))));
  const subtotal = lines.reduce((s, v) => s + v, 0);
  const discount = Math.round(subtotal * Math.min(100, Math.max(0, +q.discount || 0)) / 100);
  const net = subtotal - discount, vat = q.vat ? Math.round(net * 0.2) : 0, total = net + vat;
  return { lines, subtotal, discount, net, vat, total, deposit: Math.round(total * Math.min(100, Math.max(0, +q.depositPct || 0)) / 100) };
}
const quoteExpiry = q => iso(parse(q.date).getTime() + q.validDays * DAY);
const saveQuote = data => after(async () => (await send(data.id ? 'PUT' : 'POST', data.id ? `/quotes/${enc(data.id)}` : '/quotes', data)).id);
const setQuoteStatus = (id, status) => after(() => send('PATCH', `/quotes/${enc(id)}/status`, { status }));
const removeQuote = id => after(() => send('DELETE', `/quotes/${enc(id)}`));
const convertQuote = id => after(async () => (await send('POST', `/quotes/${enc(id)}/convert`)).projectId);   // returns the new project id

/* ---------------- purchase orders (bons de commande) ---------------- */
const saveOrder = data => after(async () => (await send(data.id ? 'PUT' : 'POST', data.id ? `/orders/${enc(data.id)}` : '/orders', data)).id);
const setOrderStatus = (id, status) => after(() => send('PATCH', `/orders/${enc(id)}/status`, { status }));
const removeOrder = id => after(() => send('DELETE', `/orders/${enc(id)}`));

/* ---------------- delivery notes (bons de livraison) ---------------- */
const saveDelivery = data => after(async () => (await send(data.id ? 'PUT' : 'POST', data.id ? `/deliveries/${enc(data.id)}` : '/deliveries', data)).id);
const setDeliveryStatus = (id, status) => after(() => send('PATCH', `/deliveries/${enc(id)}/status`, { status }));
const removeDelivery = id => after(() => send('DELETE', `/deliveries/${enc(id)}`));

/* ---------------- reception notes (bons de réception) ---------------- */
const saveReceipt = data => after(async () => (await send(data.id ? 'PUT' : 'POST', data.id ? `/receipts/${enc(data.id)}` : '/receipts', data)).id);
const setReceiptStatus = (id, status) => after(() => send('PATCH', `/receipts/${enc(id)}/status`, { status }));
const removeReceipt = id => after(() => send('DELETE', `/receipts/${enc(id)}`));

/* ---------------- company details (printed on quotes) ---------------- */
const COMPANY_FIELDS = ['name', 'tagline', 'address', 'city', 'phone', 'email', 'website', 'ice', 'rc', 'if_number', 'patente', 'bank'];
const saveCompany = data => after(() => send('PUT', '/company', data));

/* ---------------- sample data ---------------- */
const sampleCounts = () => ({ clients: db.clients.filter(c => c.sample).length, messages: db.messages.filter(m => m.sample).length });
const removeSampleData = () => after(() => send('DELETE', '/sample-data'));

window.LuxorStore = {
  STATUSES, STATUS_LABEL, TYPE_LABEL, STEPS, CLIENT_TYPES, QUOTE_STATUS, ORDER_STATUS, PAY_METHODS, DELIVERY_STATUS, RECEIPT_STATUS, CONDITIONS,
  async init(req) { request = req; await refresh(); },
  reload: () => after(() => null),
  loaded: () => loaded,
  get: () => db, subscribe: fn => (subs.add(fn), () => subs.delete(fn)),
  project, client, quote, order, delivery, receipt, receiptTotals, receiptCompliant, suppliers, remainingFor, metrics, notifications,
  paidFor, depositFor, dueFor, payStatus, progressOf,
  updateStatus, toggleStep, addPayment, addNote, markRead,
  addClient, updateClient, removeClient, clientUsage,
  quoteTotals, quoteExpiry, saveQuote, setQuoteStatus, removeQuote, convertQuote,
  saveOrder, setOrderStatus, removeOrder, saveDelivery, setDeliveryStatus, removeDelivery, saveReceipt, setReceiptStatus, removeReceipt,
  sampleCounts, removeSampleData, saveCompany, COMPANY_FIELDS,
  fmtMAD, parse, iso, today
};
})();
