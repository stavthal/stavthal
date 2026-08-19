import { MONO, defs, panel, clipPanel, svg, esc, textW } from '../theme.mjs';

const W = 900, H = 280;

const TAGLINE = [
  'building reliable fintech & SaaS systems — production APIs,',
  'resilient backends, and AI-enabled developer workflows.',
];

// Equalizer strip along the bottom edge. Each bar's first `values` entry is its resting
// height, so the un-animated first frame is already a full, varied waveform.
const equalizer = (t) => {
  const n = 44, x0 = 44, gap = 8.6, base = 250;
  return `<g>` + Array.from({ length: n }, (_, i) => {
    const h1 = 5 + ((i * 7) % 14), h2 = 8 + ((i * 11) % 22), h3 = 4 + ((i * 5) % 10);
    const dur = (2.2 + ((i * 13) % 17) / 10).toFixed(1);
    const col = i % 3 === 0 ? t.accent : i % 3 === 1 ? t.accent2 : t.accent3;
    return `<rect x="${(x0 + i * gap).toFixed(1)}" y="${base - h1}" width="3.4" height="${h1}" rx="1.7"
      fill="${col}" opacity="${(0.35 + (i % 4) * 0.14).toFixed(2)}">
      <animate attributeName="height" values="${h1};${h2};${h3};${h1}" dur="${dur}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${base - h1};${base - h2};${base - h3};${base - h1}" dur="${dur}s" repeatCount="indefinite"/>
    </rect>`;
  }).join('') + `</g>`;
};

export function hero(t, d) {
  const name = 'STAVROS THALASSINOS';
  const nameSize = 42, nameY = 126;

  const extra = `
    <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="50%" stop-color="${t.text}"/>
      <stop offset="100%" stop-color="${t.accent2}"/>
      <animateTransform attributeName="gradientTransform" type="translate"
        values="0 0; 0.6 0; -0.6 0; 0 0" dur="10s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="50%"  stop-color="#fff" stop-opacity="${t.id === 'dark' ? 0.8 : 0.5}"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="nameMask">
      <text x="44" y="${nameY}" font-family="${MONO}" font-size="${nameSize}" font-weight="700"
        letter-spacing="1.5" fill="#fff">${name}</text>
    </mask>
    <filter id="nameGlow" x="-20%" y="-40%" width="140%" height="180%">
      <feGaussianBlur stdDeviation="1.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${clipPanel(W, H, 22)}`;

  const chipLabel = '~/athens · remote EU';
  const body = `
  ${defs(t, extra)}
  ${panel(t, W, H, 22)}

  <g transform="translate(44,58)">
    <rect x="-1" y="-15" width="${(textW(chipLabel, 11.5) + 30).toFixed(0)}" height="22" rx="11"
      fill="${t.chip}" fill-opacity="${t.id === 'dark' ? 0.7 : 0.9}" stroke="${t.stroke}"/>
    <circle cx="12" cy="-4" r="3.2" fill="${t.accent}">
      <animate attributeName="opacity" values="1;0.25;1" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <text x="24" y="0" font-family="${MONO}" font-size="11.5" fill="${t.dim}" letter-spacing="0.6">${esc(chipLabel)}</text>
  </g>

  <text x="44" y="${nameY}" font-family="${MONO}" font-size="${nameSize}" font-weight="700"
    letter-spacing="1.5" fill="url(#nameGrad)" filter="url(#nameGlow)">${name}</text>
  <g mask="url(#nameMask)">
    <rect x="-170" y="${nameY - 40}" width="150" height="52" fill="url(#shine)">
      <animate attributeName="x" values="-170;${W};${W};-170" keyTimes="0;0.45;0.999;1"
        dur="7s" repeatCount="indefinite"/>
    </rect>
  </g>

  <text x="45" y="${nameY + 22}" font-family="${MONO}" font-size="12.5" fill="${t.faint}" letter-spacing="3.4">
    SENIOR SOFTWARE ENGINEER &#183; PRODUCT BUILDER
  </text>

  <text x="44" y="${nameY + 56}" font-family="${MONO}" font-size="13.5" fill="${t.dim}">${esc(TAGLINE[0])}</text>
  <text x="44" y="${nameY + 76}" font-family="${MONO}" font-size="13.5" fill="${t.dim}">${esc(TAGLINE[1])}</text>
  <rect x="${(44 + textW(TAGLINE[1], 13.5) + 6).toFixed(1)}" y="${nameY + 64}" width="8" height="15" fill="${t.accent}">
    <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.45;0.5;1" dur="1.2s" repeatCount="indefinite"/>
  </rect>

  <g transform="translate(${W - 44},58)" text-anchor="end">
    <text font-family="${MONO}" font-size="11.5" fill="${t.dim}">available for selected work</text>
    <circle cx="12" cy="-4" r="4" fill="${t.accent}" opacity="0.3">
      <animate attributeName="r" values="4;10;4" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="-4" r="3.4" fill="${t.accent}"/>
  </g>

  <text x="44" y="${nameY + 106}" font-family="${MONO}" font-size="12" fill="${t.faint}">
    <tspan fill="${t.accent}">$</tspan> uptime &#8212; <tspan fill="${t.dim}">${d.years}y shipping</tspan>
    &#183; <tspan fill="${t.dim}">${d.repoCount} repos</tspan>
    &#183; <tspan fill="${t.dim}">${d.commitsYear} commits / 12mo</tspan>
    &#183; <tspan fill="${t.dim}">${d.langCount} languages</tspan>
  </text>

  ${equalizer(t)}`;

  return svg(W, H, body);
}
