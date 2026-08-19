import { MONO, defs, panel, clipPanel, chrome, svg, esc } from '../theme.mjs';

const W = 460, H = 240;

// Stacked bar sized by real bytes-per-language, then a two-column legend.
// Widths are static (see the <img> SMIL note in stats.mjs); a looping shine crosses the bar.
export function langs(t, d) {
  const top = d.languages.slice(0, 8);
  const total = top.reduce((s, l) => s + l.size, 0) || 1;
  const barX = 24, barY = 58, barW = W - 48, barH = 16;
  let cursor = barX;

  const segments = top.map((l) => {
    const w = Math.max(3, (l.size / total) * barW);
    const x = cursor; cursor += w;
    return `<rect x="${x.toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barH}"
      fill="${l.color || t.accent}" opacity="0.95"/>`;
  }).join('');

  const legend = top.map((l, i) => {
    const col = i % 2, row = (i / 2) | 0;
    const x = 24 + col * 214, y = 104 + row * 27;
    const pct = ((l.size / total) * 100).toFixed(1);
    return `<g>
      <circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${l.color || t.accent}">
        <animate attributeName="opacity" values="1;0.4;1" dur="3.6s"
          begin="${(i * 0.25).toFixed(2)}s" repeatCount="indefinite"/>
      </circle>
      <text x="${x + 18}" y="${y}" font-family="${MONO}" font-size="11.5" fill="${t.text}">${esc(l.name)}</text>
      <text x="${x + 190}" y="${y}" text-anchor="end" font-family="${MONO}" font-size="11.5"
        fill="${t.faint}">${pct}%</text>
    </g>`;
  }).join('');

  const extra = `
    <clipPath id="clipBar"><rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="8"/></clipPath>
    <linearGradient id="shineBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="${t.id === 'dark' ? 0.5 : 0.75}"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    ${clipPanel(W, H)}`;

  const body = `
  ${defs(t, extra)}
  ${panel(t, W, H)}
  ${chrome(t, 'lang --by-bytes', W)}
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="8" fill="${t.stroke}" fill-opacity="0.5"/>
  <g clip-path="url(#clipBar)">
    ${segments}
    <rect y="${barY}" width="90" height="${barH}" fill="url(#shineBar)">
      <animate attributeName="x" values="${barX - 100};${barX + barW};${barX - 100}"
        dur="5.5s" repeatCount="indefinite"/>
    </rect>
  </g>
  ${legend}
  <text x="24" y="${H - 20}" font-family="${MONO}" font-size="10.5" fill="${t.faint}">
    <tspan fill="${t.accent2}">&#9679;</tspan> ${d.langCount} languages across ${d.repoCount} repositories
  </text>`;
  return svg(W, H, body);
}
