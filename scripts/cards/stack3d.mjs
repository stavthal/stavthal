import { MONO, defs, panel, clipPanel, chrome, svg, esc } from '../theme.mjs';
import { ICONS } from '../icons.mjs';

const W = 900, H = 336;
const HW = 30, HH = 15, DEPTH = 20;   // isometric half-width, half-height, extrusion

// Brand colours, keyed to scripts/icons.mjs. Next.js has no colour of its own, so it
// borrows the theme's text colour the way its own mark does.
const BRAND = {
  java: '#F89820', spring: '#6DB33F', laravel: '#FF2D20', typescript: '#3178C6',
  react: '#61DAFB', next: null, vue: '#4FC08D', node: '#5FA04E',
  go: '#00ADD8', swift: '#F05138', python: '#3776AB', astro: '#FF5D01',
  postgres: '#4169E1', mysql: '#4479A1', docker: '#2496ED', gcloud: '#4285F4',
};

const ORDER = ['java', 'spring', 'laravel', 'typescript', 'react', 'next', 'vue', 'node',
               'go', 'swift', 'python', 'astro', 'postgres', 'mysql', 'docker', 'gcloud'];

// Mix a hex toward black (k < 0) or white (k > 0), which is all the lighting model a
// three-faced isometric solid needs.
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  const parts = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return '#' + parts.map((c) => c.toString(16).padStart(2, '0')).join('');
}

// One isometric plinth with its glyph hovering above it. The resting pose is the first
// keyframe of every loop, so the un-animated first frame is already the finished picture.
function plinth(t, key, i) {
  const { label, d, bbox } = ICONS[key];
  const brand = BRAND[key] ?? t.text;
  const [bx, by, bw, bh] = bbox;

  // Normalise every glyph to the same optical box, so a wide flat mark (Go) and a full
  // square one (Swift) carry equal weight.
  const box = 21, s = box / Math.max(bw, bh);
  const gx = -(bx + bw / 2) * s, gy = -(by + bh / 2) * s;

  const lift = 42;
  const phase = ((i * 7) % 10) / 10;
  const dur = (3.4 + ((i * 5) % 9) / 10).toFixed(1);
  const begin = `-${(phase * dur).toFixed(2)}s`;

  return `
  <g>
    <polygon points="0,${HH} ${HW},0 ${HW},${DEPTH} 0,${HH + DEPTH}" fill="${shade(brand, -0.50)}"/>
    <polygon points="0,${HH} ${-HW},0 ${-HW},${DEPTH} 0,${HH + DEPTH}" fill="${shade(brand, -0.70)}"/>
    <line x1="0" y1="${HH}" x2="0" y2="${HH + DEPTH}" stroke="${shade(brand, -0.80)}" stroke-width="1"/>
    <polygon points="0,${-HH} ${HW},0 0,${HH} ${-HW},0" fill="${shade(brand, -0.22)}"/>
    <polygon points="0,${-HH} ${HW},0 0,${HH} ${-HW},0" fill="none"
      stroke="${shade(brand, 0.35)}" stroke-opacity="0.9" stroke-width="1.1"/>

    <ellipse cy="0" rx="13" ry="6.5" fill="${shade(brand, -0.85)}" opacity="0.75">
      <animate attributeName="rx" values="13;9.5;13" dur="${dur}s" begin="${begin}" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.75;0.45;0.75" dur="${dur}s" begin="${begin}" repeatCount="indefinite"/>
    </ellipse>

    <g transform="translate(0,${-lift})">
      <animateTransform attributeName="transform" type="translate"
        values="0 ${-lift}; 0 ${-lift - 9}; 0 ${-lift}" dur="${dur}s"
        begin="${begin}" repeatCount="indefinite"/>
      <g transform="translate(${gx.toFixed(2)},${gy.toFixed(2)}) scale(${s.toFixed(4)})">
        <path d="${d}" fill="${brand}"/>
      </g>
    </g>

    <text y="${HH + DEPTH + 19}" text-anchor="middle" font-family="${MONO}"
      font-size="9.5" fill="${t.dim}">${esc(label)}</text>
  </g>`;
}

export function stack3d(t) {
  const cols = 8, padX = 54;
  const step = (W - padX * 2) / (cols - 1);
  const rowY = [128, 252];

  const tiles = ORDER.map((key, i) => {
    const x = padX + (i % cols) * step, y = rowY[(i / cols) | 0];
    return `<g transform="translate(${x.toFixed(1)},${y})">${plinth(t, key, i)}</g>`;
  }).join('');

  const body = `
  ${defs(t, clipPanel(W, H))}
  ${panel(t, W, H)}
  ${chrome(t, 'stack --render=isometric', W)}
  ${tiles}
  <text x="${padX}" y="${H - 14}" font-family="${MONO}" font-size="10" fill="${t.faint}">
    <tspan fill="${t.accent}">&#9679;</tspan> what I reach for &#183; glyphs from simple-icons (CC0)
  </text>`;
  return svg(W, H, body);
}
