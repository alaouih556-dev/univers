/* Luxor Création — admin charts (hand-made SVG, no library).
 * Colours come from CSS variables, so every chart follows light / dark mode. */
(() => {
'use strict';
const V = n => `var(--${n})`;
const r2 = n => Math.round(n * 100) / 100;
let gid = 0;

/* small vertical bars; the last bar is highlighted */
function miniBars(values, { color = V('c-bar'), last = V('or'), w = 96, h = 52, labels = [] } = {}) {
  const max = Math.max(1, ...values), n = values.length, gap = 5, bw = (w - gap * (n - 1)) / n;
  return `<svg class="mini" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${values.map((v, i) => {
    const bh = Math.max(4, v / max * (h - 4)), x = i * (bw + gap);
    return `<rect x="${r2(x)}" y="${r2(h - bh)}" width="${r2(bw)}" height="${r2(bh)}" rx="${r2(Math.min(5, bw / 2))}" style="fill:${i === n - 1 ? last : color}"><title>${labels[i] || ''} ${v}</title></rect>`;
  }).join('')}</svg>`;
}

/* sparkline with soft gold area */
function sparkline(values, { w = 120, h = 52 } = {}) {
  const id = 'sp' + (++gid), max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const pts = values.map((v, i) => [i / (values.length - 1) * (w - 6) + 3, h - 6 - (v - min) / span * (h - 14)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + r2(p[0]) + ' ' + r2(p[1])).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="mini" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${V('or')};stop-opacity:.28"/><stop offset="1" style="stop-color:${V('or')};stop-opacity:0"/></linearGradient></defs>
    <path d="${d} L ${r2(lx)} ${h} L 3 ${h} Z" style="fill:url(#${id})"/>
    <path d="${d}" style="fill:none;stroke:${V('or')};stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"/>
    <circle cx="${r2(lx)}" cy="${r2(ly)}" r="4" style="fill:${V('or')};stroke:${V('card')};stroke-width:2"/></svg>`;
}

/* circular progress ring */
function ring(percent, { size = 64, stroke = 7 } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, percent));
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${p}% average completion">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r2(r)}" style="fill:none;stroke:${V('ring-track')};stroke-width:${stroke}"/>
    <circle class="ring-val" cx="${size / 2}" cy="${size / 2}" r="${r2(r)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="fill:none;stroke:${V('vert')};stroke-width:${stroke};stroke-linecap:round;stroke-dasharray:${r2(c)};stroke-dashoffset:${r2(c * (1 - p / 100))}"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" class="ring-txt">${p}%</text></svg>`;
}

/* semicircle gauge: value of total, gold arc + needle */
function gauge(value, total, { w = 260 } = {}) {
  const h = w / 2 + 18, cx = w / 2, cy = w / 2 + 4, r = w / 2 - 18, sw = 18;
  const f = total ? value / total : 0, len = Math.PI * r;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const ang = Math.PI * (1 - f), nx = cx + Math.cos(ang) * (r - 26), ny = cy - Math.sin(ang) * (r - 26);
  const ticks = Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (1 - i / 10), r1 = r + sw / 2 + 4, r3 = r1 + (i % 5 ? 4 : 8); return `<line x1="${r2(cx + Math.cos(a) * r1)}" y1="${r2(cy - Math.sin(a) * r1)}" x2="${r2(cx + Math.cos(a) * r3)}" y2="${r2(cy - Math.sin(a) * r3)}" style="stroke:${V('on-dark-soft')};stroke-width:1.5"/>`; }).join('');
  const id = 'g' + (++gid);
  return `<svg class="gauge" viewBox="0 0 ${w} ${h}" role="img" aria-label="${value} of ${total} projects finished">
    <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" style="stop-color:#B8912A"/><stop offset=".55" style="stop-color:#F0D77A"/><stop offset="1" style="stop-color:#D4AF37"/></linearGradient></defs>
    ${ticks}
    <path d="${arc}" style="fill:none;stroke:${V('gauge-track')};stroke-width:${sw};stroke-linecap:round"/>
    <path class="gauge-val" d="${arc}" style="fill:none;stroke:url(#${id});stroke-width:${sw};stroke-linecap:round;stroke-dasharray:${r2(len)};stroke-dashoffset:${r2(len * (1 - f))}"/>
    <line x1="${cx}" y1="${cy}" x2="${r2(nx)}" y2="${r2(ny)}" style="stroke:${V('or')};stroke-width:4;stroke-linecap:round"/>
    <circle cx="${cx}" cy="${cy}" r="9" style="fill:${V('or')}"/><circle cx="${cx}" cy="${cy}" r="3.5" style="fill:${V('vert')}"/>
  </svg>`;
}

/* monthly revenue bars: hatched past, gold current, dashed future, dashed average line */
function revenueBars(data, avg, { w = 960, h = 280 } = {}) {
  const padL = 54, padB = 30, padT = 14, cw = w - padL - 8, ch = h - padB - padT;
  const max = Math.max(avg, ...data.map(d => Math.max(d.value, d.prev))) * 1.12 || 1;
  const n = data.length, slot = cw / n, bw = Math.min(46, slot * 0.58);
  const y = v => padT + ch - v / max * ch;
  const id = 'h' + (++gid);
  const step = niceStep(max / 4);
  const grid = []; for (let v = 0; v <= max; v += step) grid.push(v);
  const k = v => v >= 1e6 ? r2(v / 1e6) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : v;
  return `<svg class="rev" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Monthly revenue">
    <defs><pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" style="fill:${V('sable-soft')}"/><line x1="0" y1="0" x2="0" y2="8" style="stroke:${V('sable-line')};stroke-width:3.2"/></pattern></defs>
    ${grid.map(v => `<line x1="${padL}" x2="${w - 8}" y1="${r2(y(v))}" y2="${r2(y(v))}" style="stroke:${V('grid')};stroke-width:1"/><text x="${padL - 10}" y="${r2(y(v))}" class="ax" text-anchor="end" dominant-baseline="central">${k(v)}</text>`).join('')}
    ${data.map((d, i) => {
      const x = padL + i * slot + (slot - bw) / 2, val = d.kind === 'future' ? d.prev : d.value, top = y(val), bh = Math.max(3, padT + ch - top);
      const style = d.kind === 'past' ? `fill:url(#${id})` : d.kind === 'current' ? `fill:${V('or')}` : `fill:none;stroke:${V('pastel')};stroke-width:1.6;stroke-dasharray:5 4`;
      return `<g class="bar ${d.kind}" data-i="${i}"><rect class="hit" x="${r2(padL + i * slot)}" y="${padT}" width="${r2(slot)}" height="${ch}" style="fill:transparent"/>
        <rect x="${r2(x)}" y="${r2(top)}" width="${r2(bw)}" height="${r2(bh)}" rx="${r2(Math.min(10, bw / 2))}" style="${style}"/>
        <text x="${r2(x + bw / 2)}" y="${h - 9}" class="ax${d.kind === 'current' ? ' cur' : ''}" text-anchor="middle">${slot < 36 ? d.label[0] : d.label}</text></g>`;
    }).join('')}
    <line x1="${padL}" x2="${w - 8}" y1="${r2(y(avg))}" y2="${r2(y(avg))}" style="stroke:${V('vert')};stroke-width:1.4;stroke-dasharray:6 5;opacity:.7"/>
    <text x="${w - 10}" y="${r2(y(avg) - 7)}" class="ax avg" text-anchor="end">avg ${k(avg)}</text>
  </svg>`;
}
function niceStep(raw) { const p = 10 ** Math.floor(Math.log10(raw || 1)), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }

/* donut; segments: [{value, color}] */
function donut(segments, center, { size = 170, stroke = 26 } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let off = 0;
  const arcs = segments.map(s => { const len = s.value / total * c, gap = segments.filter(x => x.value).length > 1 && s.value ? 3 : 0; const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r2(r)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="fill:none;stroke:${s.color};stroke-width:${stroke};stroke-dasharray:${r2(Math.max(0, len - gap))} ${r2(c)};stroke-dashoffset:${r2(-off)}"><title>${s.label}: ${s.value}</title></circle>`; off += len; return el; }).join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${center.label}: ${center.value}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r2(r)}" style="fill:none;stroke:${V('ring-track')};stroke-width:${stroke}"/>${arcs}
    <text x="50%" y="46%" text-anchor="middle" dominant-baseline="central" class="donut-v">${center.value}</text>
    <text x="50%" y="62%" text-anchor="middle" dominant-baseline="central" class="donut-l">${center.label}</text></svg>`;
}

window.LuxorCharts = { miniBars, sparkline, ring, gauge, revenueBars, donut };
})();
