/* Luxor Création — admin data layer (mock data + store).
 *
 * Everything the dashboard shows is derived from four collections:
 *   clients, projects (with pieces, production steps and an event timeline), payments, messages.
 * The shapes mirror future database tables (clients, projects, project_pieces, project_events,
 * payments, messages). To connect a real database, replace the functions in `repo` with
 * Supabase calls; the pages only use `LuxorStore` and never touch the data directly.
 *
 * Mock dates are relative to today so "this month" figures always make sense.
 * Edits are kept in localStorage (demo) and can be reset from Settings.
 */
(() => {
'use strict';
const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
const iso = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const ago = n => iso(today().getTime() - n * DAY);   // n days ago (negative = in the future)
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const uid = p => p + '-' + Math.random().toString(36).slice(2, 9);

const STATUSES = ['started', 'in_progress', 'finished'];
const STATUS_LABEL = { started: 'Started', in_progress: 'In Progress', finished: 'Finished' };
const TYPE_LABEL = { catalog: 'Catalog order', custom: 'Custom-made', interior: 'Interior design' };
const STEPS = [['design', 'Design validated'], ['materials', 'Materials ordered'], ['fabrication', 'Fabrication'], ['finishing', 'Finishing'], ['delivery', 'Delivery & installation']];
const CLIENT_TYPES = { individual: 'Individual', company: 'Company', hotel: 'Hotel', office: 'Office', riad: 'Riad', clinic: 'Clinic', school: 'School', restaurant: 'Restaurant' };

/* ---------------- seed (mock) ---------------- */
function seed() {
  const clients = [
    { id: 'c1', name: 'Famille Benjelloun', type: 'individual', phone: '+212 661 24 58 10', email: 'n.benjelloun@example.ma', city: 'Casablanca', address: 'Anfa, Bd. de la Corniche' },
    { id: 'c2', name: 'Riad Dar Zitoun', type: 'riad', phone: '+212 524 38 11 72', email: 'contact@darzitoun.example', city: 'Marrakech', address: 'Médina, Derb Zitoun' },
    { id: 'c3', name: 'Hôtel Atlas Palm', type: 'hotel', phone: '+212 528 84 20 00', email: 'achats@atlaspalm.example', city: 'Agadir', address: 'Bd. du 20 Août' },
    { id: 'c4', name: 'Cabinet Alami & Associés', type: 'office', phone: '+212 537 70 44 19', email: 'office@alami-associes.example', city: 'Rabat', address: 'Hay Riad, Av. Annakhil' },
    { id: 'c5', name: 'Salma Idrissi', type: 'individual', phone: '+212 662 90 13 47', email: 's.idrissi@example.ma', city: 'Marrakech', address: 'Route de l’Ourika, km 7' },
    { id: 'c6', name: 'Karim Tazi', type: 'individual', phone: '+212 670 55 81 26', email: 'karim.tazi@example.ma', city: 'Tanger', address: 'Malabata, Résidence Al Bahr' },
    { id: 'c7', name: 'Café Nour', type: 'restaurant', phone: '+212 524 44 63 90', email: 'hello@cafenour.example', city: 'Marrakech', address: 'Guéliz, Rue de la Liberté' },
    { id: 'c8', name: 'Clinique Al Amal', type: 'clinic', phone: '+212 522 98 71 05', email: 'direction@alamal.example', city: 'Casablanca', address: 'Maârif, Rue Ibnou Mounir' },
    { id: 'c9', name: 'Youssef Berrada', type: 'individual', phone: '+212 664 12 09 88', email: 'y.berrada@example.ma', city: 'Rabat', address: 'Souissi, Rue des Glycines' },
    { id: 'c10', name: 'École Les Orangers', type: 'school', phone: '+212 535 62 30 41', email: 'administration@lesorangers.example', city: 'Fès', address: 'Route d’Imouzzer' }
  ];
  const all = (status) => STEPS.reduce((o, [k], i) => (o[k] = typeof status === 'number' ? i < status : status, o), {});
  // [id, title, client, type, status, start(days ago), delivery(days ago), completed(days ago|null), total, steps done, description, pieces]
  const P = [
    ['p1', 'Custom living room set', 'c1', 'custom', 'finished', 262, 200, 204, 68000, 5, 'Curved bouclé sofa, two lounge chairs and a travertine coffee table for a sea-view villa living room.',
      [['Curved sofa “Nuage” 4 seats', 1, 'Bouclé fabric, beech frame', 'Ivoire', '320 × 105 × 78 cm', 'canapes.webp'], ['Lounge chair “Oval”', 2, 'Bouclé fabric', 'Sable', '82 × 80 × 74 cm', 'hero-fauteuil.webp'], ['Coffee table', 1, 'Travertine, brushed brass', 'Natural', 'Ø 110 × 35 cm', 'hero-salon-beige.webp']]],
    ['p2', 'Riad dining room', 'c2', 'custom', 'finished', 231, 170, 172, 124000, 5, 'Solid walnut dining table for 12 guests with upholstered chairs and a carved sideboard for the riad’s main patio.',
      [['Dining table “Dune” 12 seats', 1, 'Solid walnut', 'Oiled walnut', '360 × 110 × 75 cm', 'hero-salle-manger.webp'], ['Upholstered dining chair', 12, 'Walnut, linen', 'Sable', '52 × 58 × 82 cm', 'tables.webp'], ['Carved sideboard', 1, 'Walnut, cedar inlay', 'Oiled walnut', '240 × 50 × 85 cm', 'view-1-1.webp']]],
    ['p3', 'Hotel lobby furniture', 'c3', 'interior', 'finished', 205, 115, 112, 385000, 5, 'Full lobby redesign: modular seating islands, reception desk in fluted oak and brass, lighting and decoration.',
      [['Modular seating island', 6, 'Velvet, oak base', 'Vert profond', '280 × 120 × 72 cm', 'hero-salon-vert.webp'], ['Reception desk', 1, 'Fluted oak, brass', 'Natural oak', '520 × 90 × 110 cm', 'view-0-1.webp'], ['Pendant lights “Halo”', 4, 'Brushed brass', 'Gold', 'Ø 120 cm', 'view-0-2.webp']]],
    ['p4', 'Office meeting room', 'c4', 'catalog', 'finished', 151, 122, 121, 46500, 5, 'Meeting table for 10 with ergonomic chairs and a storage wall, selected from the catalog.',
      [['Meeting table “Linea”', 1, 'Oak veneer, steel', 'Smoked oak', '400 × 120 × 75 cm', 'tables.webp'], ['Meeting chair', 10, 'Leather, aluminium', 'Cognac', '58 × 60 × 88 cm', 'hero-cognac.webp'], ['Storage wall', 1, 'Lacquered MDF', 'Sable', '480 × 45 × 220 cm', 'view-2-1.webp']]],
    ['p5', 'Master bedroom set', 'c5', 'custom', 'finished', 122, 62, 60, 52000, 5, 'Upholstered king-size bed with integrated headboard lighting, bedside tables and bench.',
      [['King-size bed “Sérénité”', 1, 'Bouclé, oak', 'Ivoire', '200 × 220 × 120 cm', 'hero-chambre.webp'], ['Bedside table', 2, 'Fluted oak, brass handles', 'Natural', '55 × 40 × 50 cm', 'chambres.webp'], ['Bed bench', 1, 'Bouclé', 'Ivoire', '160 × 45 × 45 cm', 'view-1-2.webp']]],
    ['p6', 'Fitted kitchen — oak & lacquer', 'c6', 'custom', 'finished', 101, 38, 36, 89000, 5, 'Made-to-measure kitchen with olive matt lacquer columns, oak island and integrated LED niches.',
      [['Tall columns with appliances', 1, 'Matt lacquer', 'Olive', '250 × 240 × 60 cm', 'cuisine-1.webp'], ['Island with breakfast bar', 1, 'Solid oak, quartz', 'Natural / white', '280 × 110 × 92 cm', 'cuisine-3.webp'], ['Wall units with LED', 1, 'Lacquer, glass', 'Olive', '320 × 70 × 35 cm', 'cuisine-6.webp']]],
    ['p7', 'Café terrace furniture', 'c7', 'catalog', 'finished', 47, 13, 12, 31800, 5, 'Outdoor tables, stackable chairs and parasols for the café’s new terrace.',
      [['Bistro table', 8, 'Teak, aluminium', 'Natural teak', 'Ø 70 × 75 cm', 'view-2-0.webp'], ['Stackable chair', 24, 'Rope, aluminium', 'Sable', '55 × 58 × 80 cm', 'view-2-2.webp']]],
    ['p8', 'Hotel suites — 12 rooms', 'c3', 'interior', 'in_progress', 82, -45, null, 512000, 3, 'Interior design and furniture for 12 sea-view suites: beds, dressing, desks, lounge corners and textiles.',
      [['Suite bed with headboard', 12, 'Velvet, oak', 'Vert pastel', '180 × 210 × 130 cm', 'hero-chambre.webp'], ['Built-in dressing', 12, 'Lacquer, fluted oak', 'Sable', '240 × 60 × 260 cm', 'view-1-0.webp'], ['Lounge armchair', 24, 'Bouclé', 'Ivoire', '80 × 82 × 76 cm', 'hero-fauteuil.webp']]],
    ['p9', 'Clinic waiting area', 'c8', 'custom', 'in_progress', 40, -20, null, 74000, 2, 'Durable, easy-to-clean seating benches, reception counter and planters for the clinic’s waiting area.',
      [['Waiting bench 4 seats', 6, 'Antibacterial faux leather, steel', 'Vert pastel', '240 × 60 × 80 cm', 'view-0-0.webp'], ['Reception counter', 1, 'Solid surface, oak', 'White / oak', '360 × 80 × 105 cm', 'view-0-1.webp']]],
    ['p10', 'Penthouse interior design', 'c1', 'interior', 'in_progress', 26, -60, null, 210000, 1, 'Complete interior design of a 240 m² penthouse: living, dining, two bedrooms and a home office.',
      [['Sectional sofa', 1, 'Linen, feather cushions', 'Sable', '380 × 220 × 80 cm', 'hero-salon-beige.webp'], ['Dining set 8 seats', 1, 'Oak, bouclé', 'Natural', '260 × 100 × 75 cm', 'hero-salle-manger.webp'], ['Home office desk', 1, 'Walnut, leather top', 'Cognac', '180 × 80 × 75 cm', 'view-1-1.webp']]],
    ['p11', 'Dining table Dune & chairs', 'c9', 'catalog', 'started', 6, -25, null, 28400, 0, 'Catalog order: table Dune 8 seats with six upholstered chairs.',
      [['Dining table “Dune”', 1, 'Oak', 'Natural oak', '240 × 100 × 75 cm', 'hero-salle-manger.webp'], ['Dining chair', 6, 'Oak, linen', 'Sable', '52 × 56 × 82 cm', 'tables.webp']]],
    ['p12', 'School library shelving', 'c10', 'custom', 'started', 3, -40, null, 57000, 0, 'Made-to-measure library: modular shelving, reading benches and a librarian desk.',
      [['Modular shelving unit', 14, 'Birch plywood', 'Natural / vert pastel', '120 × 35 × 200 cm', 'view-2-1.webp'], ['Reading bench', 4, 'Birch, wool felt', 'Vert pastel', '180 × 40 × 45 cm', 'view-2-0.webp']]]
  ];
  const projects = P.map(([id, title, clientId, type, status, s, dl, c, total, done, description, pieces], i) => {
    const events = [{ id: uid('e'), date: ago(s), type: 'status', status: 'started', text: 'Project created — quote signed.' }];
    if (status !== 'started') events.push({ id: uid('e'), date: ago(Math.round(s - (s - (c ?? 0)) * 0.25)), type: 'status', status: 'in_progress', text: 'Design validated, production launched.' });
    if (done >= 3 && status !== 'finished') events.push({ id: uid('e'), date: ago(Math.round(s * 0.35)), type: 'note', text: 'Fabrication in the workshop, first pieces assembled.' });
    if (status === 'finished') events.push({ id: uid('e'), date: ago(c), type: 'status', status: 'finished', text: 'Delivered and installed. Client satisfied.' });
    return {
      id, ref: 'LUX-P' + String(i + 1).padStart(3, '0'), title, clientId, type, status, description,
      startDate: ago(s), deliveryDate: ago(dl), completedDate: c == null ? null : ago(c), totalPrice: total,
      steps: status === 'finished' ? all(true) : all(done),
      pieces: pieces.map(([name, qty, material, finish, dimensions, image]) => ({ id: uid('pc'), name, qty, material, finish, dimensions, image })),
      events
    };
  });
  // payments: [project, days ago, amount, label, method]
  const PAY = [
    ['p1', 262, 27200, 'deposit', 'Bank transfer'], ['p1', 230, 20400, 'installment', 'Bank transfer'], ['p1', 204, 20400, 'balance', 'Cheque'],
    ['p2', 231, 49600, 'deposit', 'Bank transfer'], ['p2', 200, 37200, 'installment', 'Bank transfer'], ['p2', 172, 37200, 'balance', 'Bank transfer'],
    ['p3', 205, 154000, 'deposit', 'Bank transfer'], ['p3', 160, 96000, 'installment', 'Bank transfer'], ['p3', 112, 80000, 'installment', 'Bank transfer'],
    ['p4', 151, 18600, 'deposit', 'Card'], ['p4', 121, 27900, 'balance', 'Bank transfer'],
    ['p5', 122, 20800, 'deposit', 'Cash'], ['p5', 60, 21200, 'installment', 'Cheque'],
    ['p6', 101, 35600, 'deposit', 'Bank transfer'], ['p6', 70, 26700, 'installment', 'Bank transfer'], ['p6', 36, 26700, 'balance', 'Bank transfer'],
    ['p7', 47, 12700, 'deposit', 'Card'], ['p7', 12, 9100, 'installment', 'Card'],
    ['p8', 82, 204800, 'deposit', 'Bank transfer'], ['p8', 30, 102400, 'installment', 'Bank transfer'],
    ['p9', 40, 29600, 'deposit', 'Bank transfer'],
    ['p10', 26, 63000, 'deposit', 'Bank transfer'],
    ['p11', 6, 11400, 'deposit', 'Card']
  ];
  const payments = PAY.map(([projectId, d, amount, label, method]) => ({ id: uid('pay'), projectId, date: ago(d), amount, label, method }));
  for (const pay of payments) {
    const p = projects.find(x => x.id === pay.projectId);
    p.events.push({ id: uid('e'), date: pay.date, type: 'payment', text: `${pay.label === 'deposit' ? 'Deposit' : pay.label === 'balance' ? 'Balance' : 'Payment'} received — ${fmtMAD(pay.amount)} (${pay.method}).` });
  }
  const messages = [
    { id: 'm1', from: 'Youssef Berrada', email: 'y.berrada@example.ma', subject: 'Chair fabric samples', body: 'Bonjour, could you send me two more linen samples (sable and ivoire) before production starts? Merci.', date: ago(1), read: false },
    { id: 'm2', from: 'Clinique Al Amal', email: 'direction@alamal.example', subject: 'Delivery window', body: 'Hello, we would prefer a delivery on a Saturday morning to avoid disturbing patients. Is that possible?', date: ago(2), read: false },
    { id: 'm3', from: 'Hôtel Atlas Palm', email: 'achats@atlaspalm.example', subject: 'Suites — headboard colour', body: 'The board validated vert pastel for the headboards. Please confirm the new lead time for the 12 suites.', date: ago(4), read: false },
    { id: 'm4', from: 'Salma Idrissi', email: 's.idrissi@example.ma', subject: 'Thank you!', body: 'The bedroom is beautiful, thank you to the whole team. I will pay the remaining balance next week.', date: ago(9), read: true },
    { id: 'm5', from: 'École Les Orangers', email: 'administration@lesorangers.example', subject: 'Library plans', body: 'Please find attached the updated room plan with the window positions for the shelving.', date: ago(3), read: true }
  ];
  // monthly revenue booked before this dashboard existed (sales not linked to a project above), in MAD
  const archive = {
    prev: [118000, 96000, 132000, 141000, 155000, 128000, 147000, 112000, 166000, 158000, 171000, 189000],
    curr: [124000, 109000, 151000, 138000, 162000, 149000, 133000, 121000, 98000, 76000, 41000, 0]
  };
  return { version: 1, clients, projects, payments, messages, archive, seededAt: iso(today()) };
}

const fmtMAD = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + ' MAD';

/* ---------------- repository (swap these for database calls later) ---------------- */
const KEY = 'luxor_admin_demo_v1';
const repo = {
  load() {
    try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && d.version === 1 && d.seededAt === iso(today())) return d; } catch {}
    // reseed each day so relative dates stay coherent; keep demo edits made today
    const d = seed(); repo.save(d); return d;
  },
  save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} },
  reset() { localStorage.removeItem(KEY); return repo.load(); }
};

/* ---------------- store ---------------- */
let db = repo.load();
const subs = new Set();
const commit = () => { repo.save(db); subs.forEach(fn => { try { fn(db); } catch (e) { console.error(e); } }); };
const project = id => db.projects.find(p => p.id === id);
const client = id => db.clients.find(c => c.id === id);

/* ---------------- selectors ---------------- */
const paidFor = (p, until) => db.payments.filter(x => x.projectId === p.id && (!until || parse(x.date) <= until)).reduce((s, x) => s + x.amount, 0);
const depositFor = p => db.payments.filter(x => x.projectId === p.id && x.label === 'deposit').reduce((s, x) => s + x.amount, 0);
const dueFor = (p, until) => Math.max(0, p.totalPrice - paidFor(p, until));
const payStatus = p => { const paid = paidFor(p); return paid >= p.totalPrice ? 'paid' : paid > 0 ? 'partial' : 'unpaid'; };
const progressOf = p => p.status === 'finished' ? 100 : Math.round(STEPS.filter(([k]) => p.steps[k]).length / STEPS.length * 100);
function statusAt(p, date) {
  if (parse(p.startDate) > date) return null;
  let st = 'started';
  for (const e of [...p.events].sort((a, b) => a.date.localeCompare(b.date))) if (e.type === 'status' && parse(e.date) <= date) st = e.status;
  return st;
}
const monthStart = (y, m) => new Date(y, m, 1, 0, 0, 0);
const monthEnd = (y, m) => new Date(y, m + 1, 0, 23, 59, 59);
const inMonth = (s, y, m) => { if (!s) return false; const d = parse(s); return d.getFullYear() === y && d.getMonth() === m; };
const shift = (y, m, k) => { const d = new Date(y, m + k, 1); return [d.getFullYear(), d.getMonth()]; };
const pct = (a, b) => b ? (a - b) / b * 100 : (a ? 100 : 0);

function metrics() {
  const t = today(), Y = t.getFullYear(), M = t.getMonth();
  const [pY, pM] = shift(Y, M, -1);
  const lastEnd = monthEnd(pY, pM);
  const P = db.projects;
  const finishedClientsAt = date => new Set(P.filter(p => statusAt(p, date) === 'finished').map(p => p.clientId)).size;
  const months6 = Array.from({ length: 6 }, (_, i) => shift(Y, M, i - 5));
  const completedClients = finishedClientsAt(t), completedClientsPrev = finishedClientsAt(lastEnd);
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
  // revenue per month (current year) = archived sales + payments received
  const revenue = Array.from({ length: 12 }, (_, m) => {
    const pays = db.payments.filter(x => inMonth(x.date, Y, m));
    const value = (m <= M ? db.archive.curr[m] : 0) + pays.reduce((s, x) => s + x.amount, 0);
    return { month: m, label: new Date(Y, m, 1).toLocaleString('en-US', { month: 'short' }), value, prev: db.archive.prev[m], projects: new Set(pays.map(x => x.projectId)).size, kind: m < M ? 'past' : m === M ? 'current' : 'future' };
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
    unread: db.messages.filter(m => !m.read).length
  };
}

function notifications() {
  const t = today(), out = [];
  for (const p of db.projects) {
    const c = client(p.clientId), dl = parse(p.deliveryDate), days = Math.round((dl - t) / DAY);
    if (p.status !== 'finished' && days < 0) out.push({ kind: 'warn', projectId: p.id, text: `${p.title} — delivery overdue by ${-days} day${days === -1 ? '' : 's'}` });
    else if (p.status !== 'finished' && days <= 21) out.push({ kind: 'info', projectId: p.id, text: `${p.title} — delivery in ${days} day${days === 1 ? '' : 's'}` });
    if (p.status === 'finished' && dueFor(p) > 0) out.push({ kind: 'gold', projectId: p.id, text: `${c?.name}: ${fmtMAD(dueFor(p))} still due on “${p.title}”` });
  }
  const unread = db.messages.filter(m => !m.read).length;
  if (unread) out.unshift({ kind: 'info', route: '#/messages', text: `${unread} unread message${unread > 1 ? 's' : ''}` });
  return out;
}

/* ---------------- mutations ---------------- */
function updateStatus(id, status) {
  const p = project(id); if (!p || p.status === status || !STATUSES.includes(status)) return;
  p.status = status;
  if (status === 'finished') { p.completedDate = iso(today()); STEPS.forEach(([k]) => p.steps[k] = true); }
  else p.completedDate = null;
  p.events.push({ id: uid('e'), date: iso(today()), type: 'status', status, text: `Status changed to ${STATUS_LABEL[status]}.` });
  commit();
}
function toggleStep(id, key) {
  const p = project(id); if (!p || !(key in p.steps)) return;
  p.steps[key] = !p.steps[key];
  const label = STEPS.find(([k]) => k === key)[1];
  p.events.push({ id: uid('e'), date: iso(today()), type: 'step', text: `${label} ${p.steps[key] ? 'completed' : 'reopened'}.` });
  if (p.status === 'started' && p.steps[key]) { p.status = 'in_progress'; p.events.push({ id: uid('e'), date: iso(today()), type: 'status', status: 'in_progress', text: 'Status changed to In Progress.' }); }
  commit();
}
function addPayment(id, { amount, date, method, label }) {
  const p = project(id); amount = Math.round(+amount);
  if (!p || !(amount > 0)) throw new Error('Enter a valid amount.');
  if (amount > dueFor(p)) throw new Error(`The amount is higher than the remaining ${fmtMAD(dueFor(p))}.`);
  const d = date || iso(today());
  if (parse(d) > today()) throw new Error('The payment date cannot be in the future.');
  label = label || (paidFor(p) === 0 ? 'deposit' : amount === dueFor(p) ? 'balance' : 'installment');
  db.payments.push({ id: uid('pay'), projectId: id, date: d, amount, method: method || 'Bank transfer', label });
  p.events.push({ id: uid('e'), date: d, type: 'payment', text: `${label === 'deposit' ? 'Deposit' : label === 'balance' ? 'Balance' : 'Payment'} received — ${fmtMAD(amount)} (${method || 'Bank transfer'}).` });
  commit();
}
function addNote(id, text) {
  const p = project(id); text = String(text || '').trim().slice(0, 600);
  if (!p || !text) return;
  p.events.push({ id: uid('e'), date: iso(today()), type: 'note', text });
  commit();
}
function markRead(id, read = true) { const m = db.messages.find(x => x.id === id); if (m && m.read !== read) { m.read = read; commit(); } }

window.LuxorStore = {
  STATUSES, STATUS_LABEL, TYPE_LABEL, STEPS, CLIENT_TYPES,
  get: () => db, subscribe: fn => (subs.add(fn), () => subs.delete(fn)),
  project, client, metrics, notifications,
  paidFor, depositFor, dueFor, payStatus, progressOf,
  updateStatus, toggleStep, addPayment, addNote, markRead,
  reset() { db = repo.reset(); commit(); },
  fmtMAD, parse, iso, today
};
})();
