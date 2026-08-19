import { MONO, defs, panel, clipPanel, chrome, svg, esc } from '../theme.mjs';

const W = 900, H = 236;

// Day-level contribution heatmap. Cells are static (the first frame must be complete —
// see the <img> note in stats.mjs); a diagonal shimmer sweeps across for motion.
export function pulse(t, d) {
  const cell = 12, gap = 3.4, step = cell + gap;
  const gridX = 26, gridY = 60;
  const weeks = d.weeks;

  // Five-level ramp from the panel's own accents, so it matches the rest of the card set.
  const ramp = t.id === 'dark'
    ? ['#1E293B', '#3B2E7A', '#5B37B8', '#2C8FB8', '#22D3EE']
    : ['#E2E8F0', '#C7BAF0', '#A78BE8', '#5FB6D4', '#0891B2'];
  const peakDay = Math.max(1, d.peakDay);
  const level = (n) => (n === 0 ? 0 : Math.min(4, 1 + Math.floor((n / peakDay) * 3.999)));

  const cells = weeks.map((w, wi) => w.days.map((n, di) => {
    const x = gridX + wi * step, y = gridY + di * step;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="3"
      fill="${ramp[level(n)]}"${n === 0 ? ` opacity="${t.id === 'dark' ? 0.55 : 0.8}"` : ''}/>`;
  }).join('')).join('');

  const gridW = weeks.length * step, gridH = 7 * step;
  const legendX = W - 26 - 128, legendY = gridY + gridH + 22;

  const facts = [
    ['total', d.calTotal],
    ['best day', d.peakDay],
    ['longest streak', `${d.longestStreak}d`],
    ['current streak', `${d.currentStreak}d`],
  ];

  const extra = `
    <clipPath id="clipGrid"><rect x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}"/></clipPath>
    <linearGradient id="scan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${t.accent}" stop-opacity="${t.id === 'dark' ? 0.30 : 0.22}"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0"/>
    </linearGradient>
    ${clipPanel(W, H)}`;

  const body = `
  ${defs(t, extra)}
  ${panel(t, W, H)}
  ${chrome(t, `contributions --daily --last-${weeks.length}w`, W)}
  <g clip-path="url(#clipGrid)">
    ${cells}
    <g transform="skewX(-18)">
      <rect x="-120" y="${gridY}" width="90" height="${gridH}" fill="url(#scan)">
        <animate attributeName="x" values="-120;${gridX + gridW + 120};-120" dur="6.5s" repeatCount="indefinite"/>
      </rect>
    </g>
  </g>

  <g font-family="${MONO}" font-size="10.5">
    ${facts.map(([k, v], i) => `
    <text x="${26 + i * 152}" y="${legendY}" fill="${t.faint}">
      ${esc(k)} <tspan fill="${t.text}" font-size="12" font-weight="700">${esc(String(v))}</tspan>
    </text>`).join('')}
    <text x="${legendX - 8}" y="${legendY}" text-anchor="end" fill="${t.faint}">less</text>
    ${ramp.map((c, i) => `<rect x="${legendX + i * 16}" y="${legendY - 9}" width="12" height="12" rx="3" fill="${c}"/>`).join('')}
    <text x="${legendX + ramp.length * 16 + 4}" y="${legendY}" fill="${t.faint}">more</text>
  </g>

  <text x="26" y="${H - 14}" font-family="${MONO}" font-size="10" fill="${t.faint}">
    ${esc(d.calStart)} &#8594; ${esc(d.calEnd)} &#183; includes private contributions
  </text>`;
  return svg(W, H, body);
}
