import { MONO, defs, panel, clipPanel, chrome, svg, esc } from '../theme.mjs';

const W = 460, H = 240;

// NOTE: GitHub embeds these with <img>, where one-shot fill="freeze" SMIL never paints
// its final frame. Every static attribute therefore holds the final state, and motion is
// only ever added as a looping (repeatCount="indefinite") embellishment on top.
export function stats(t, d) {
  const tiles = [
    { k: 'commits / 12mo', v: d.commitsYear, c: t.accent },
    { k: 'repositories',   v: d.repoCount,   c: t.accent2 },
    { k: 'languages',      v: d.langCount,   c: t.accent3 },
    { k: 'active repos',   v: d.activeRepos, c: t.accent },
  ];
  const body = `
  ${defs(t, clipPanel(W, H))}
  ${panel(t, W, H)}
  ${chrome(t, 'telemetry --live', W)}
  ${tiles.map((tile, i) => {
    const col = i % 2, row = (i / 2) | 0;
    const x = 24 + col * 214, y = 62 + row * 76;
    const begin = (i * 0.35).toFixed(2);
    return `
    <g>
      <rect x="${x}" y="${y}" width="198" height="64" rx="12"
        fill="${t.chip}" fill-opacity="${t.id === 'dark' ? 0.55 : 0.85}" stroke="${t.stroke}"/>
      <rect x="${x}" y="${y}" width="3" height="64" rx="1.5" fill="${tile.c}">
        <animate attributeName="opacity" values="1;0.35;1" dur="3.2s" begin="${begin}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + 18}" y="${y + 33}" font-family="${MONO}" font-size="27" font-weight="700"
        fill="${t.text}">${tile.v.toLocaleString('en-US')}</text>
      <text x="${x + 18}" y="${y + 51}" font-family="${MONO}" font-size="10.5"
        fill="${t.faint}" letter-spacing="1.2">${esc(tile.k.toUpperCase())}</text>
      <rect x="${x + 148}" y="${y + 20}" width="34" height="4" rx="2" fill="${tile.c}" opacity="0.22"/>
      <rect x="${x + 148}" y="${y + 20}" width="34" height="4" rx="2" fill="${tile.c}">
        <animate attributeName="width" values="0;34;34;0" keyTimes="0;0.35;0.8;1"
          dur="4.5s" begin="${begin}s" repeatCount="indefinite"/>
      </rect>
    </g>`;
  }).join('')}
  <text x="24" y="${H - 20}" font-family="${MONO}" font-size="10.5" fill="${t.faint}">
    <tspan fill="${t.accent}">&#9679;</tspan> synced ${esc(d.stamp)} &#183; rendered from the GitHub API
  </text>`;
  return svg(W, H, body);
}
