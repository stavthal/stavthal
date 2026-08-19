import { MONO, defs, panel, clipPanel, chrome, svg, esc } from '../theme.mjs';

const W = 900, H = 236;

// Weekly commit volume across every repo the token can read, private ones included.
// Bars are static so the data is honest in the un-animated first frame (see stats.mjs);
// a scan line and a pulsing peak supply the motion.
export function pulse(t, d) {
  const weeks = d.weeks;
  const padX = 26, top = 62, base = H - 58;
  const slot = (W - padX * 2) / weeks.length;
  const bw = Math.max(4, slot * 0.66);
  const peak = Math.max(1, d.peakWeek);
  const maxH = base - top;

  const bars = weeks.map((w, i) => {
    const h = Math.max(2, (w.total / peak) * maxH);
    const x = padX + i * slot + (slot - bw) / 2;
    const isPeak = w.total === peak;
    return `<rect x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}"
      height="${h.toFixed(1)}" rx="${Math.min(3, bw / 2).toFixed(1)}" fill="url(#barGrad)"
      opacity="${(0.5 + (w.total / peak) * 0.5).toFixed(2)}">${isPeak
        ? `<animate attributeName="opacity" values="1;0.5;1" dur="2.4s" repeatCount="indefinite"/>` : ''}</rect>`;
  }).join('');

  // Mean line, so the shape of the year reads at a glance rather than needing the numbers.
  const avgY = base - (d.avgWeek / peak) * maxH;

  const facts = [
    ['commits', d.commitsYear.toLocaleString('en-US')],
    ['peak week', d.peakWeek.toLocaleString('en-US')],
    ['weekly avg', d.avgWeek.toLocaleString('en-US')],
    ['active weeks', `${d.activeWeeks}/${weeks.length}`],
  ];

  const extra = `
    <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${t.accent2}"/>
      <stop offset="100%" stop-color="${t.accent}"/>
    </linearGradient>
    <linearGradient id="scan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${t.accent}" stop-opacity="${t.id === 'dark' ? 0.32 : 0.22}"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0"/>
    </linearGradient>
    ${clipPanel(W, H)}`;

  const body = `
  ${defs(t, extra)}
  ${panel(t, W, H)}
  ${chrome(t, `commits --weekly --all-repos --last-${weeks.length}w`, W)}

  <line x1="${padX}" y1="${avgY.toFixed(1)}" x2="${W - padX}" y2="${avgY.toFixed(1)}"
    stroke="${t.accent3}" stroke-opacity="0.55" stroke-dasharray="3 4"/>
  <text x="${padX + 3}" y="${(avgY - 6).toFixed(1)}" font-family="${MONO}"
    font-size="9.5" fill="${t.accent3}" opacity="0.85">avg ${d.avgWeek}</text>

  ${bars}
  <line x1="${padX}" y1="${base + 0.5}" x2="${W - padX}" y2="${base + 0.5}" stroke="${t.stroke}"/>
  <g clip-path="url(#clipPanel)">
    <rect y="${top - 6}" width="80" height="${base - top + 12}" fill="url(#scan)">
      <animate attributeName="x" values="-90;${W};-90" dur="7s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g font-family="${MONO}" font-size="10.5">
    ${facts.map(([k, v], i) => `
    <text x="${padX + i * 168}" y="${H - 30}" fill="${t.faint}">
      ${esc(k)} <tspan fill="${t.text}" font-size="13" font-weight="700">${esc(v)}</tspan>
    </text>`).join('')}
  </g>
  <text x="${padX}" y="${H - 12}" font-family="${MONO}" font-size="10" fill="${t.faint}">
    ${esc(d.calStart)} &#8594; ${esc(d.calEnd)} &#183; every repo this token can read, private included
  </text>`;
  return svg(W, H, body);
}
