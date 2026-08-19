// Shared palette + SVG primitives for every generated card.
// Two themes, one geometry: each card renders twice and README picks with <picture>.

export const THEMES = {
  dark: {
    id: 'dark',
    bg0: '#070B14', bg1: '#0F172A', bg2: '#131E36',
    stroke: '#1E293B', grid: '#22D3EE',
    text: '#E2E8F0', dim: '#94A3B8', faint: '#475569',
    accent: '#22D3EE', accent2: '#7C3AED', accent3: '#F472B6',
    gridOpacity: 0.10, orbOpacity: 0.30, chip: '#0B1220',
  },
  light: {
    id: 'light',
    bg0: '#FFFFFF', bg1: '#F1F5F9', bg2: '#E2E8F0',
    stroke: '#CBD5E1', grid: '#0E7490',
    text: '#0F172A', dim: '#475569', faint: '#94A3B8',
    accent: '#0891B2', accent2: '#6D28D9', accent3: '#DB2777',
    gridOpacity: 0.14, orbOpacity: 0.18, chip: '#FFFFFF',
  },
};

export const MONO = "ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Monospace advance width is a fixed ratio, so text boxes can be sized without a layout engine.
// Tracking is part of that advance: omitting it sizes every box short by tracking x length.
export const textW = (s, size, tracking = 0) => s.length * (size * 0.6 + tracking);

export const defs = (t, extra = '') => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.bg0}"/>
      <stop offset="55%" stop-color="${t.bg1}"/>
      <stop offset="100%" stop-color="${t.bg2}"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="55%" stop-color="${t.accent2}"/>
      <stop offset="100%" stop-color="${t.accent3}"/>
    </linearGradient>
    <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M26 0H0V26" fill="none" stroke="${t.grid}" stroke-width="1" stroke-opacity="${t.gridOpacity}"/>
    </pattern>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${extra}
  </defs>`;

// Panel = gradient plate + drifting grid + slow-moving colour orbs. Every card sits on one.
export const panel = (t, w, h, r = 18) => `
  <rect width="${w}" height="${h}" rx="${r}" fill="url(#bg)"/>
  <g clip-path="url(#clipPanel)">
    <g>
      <rect x="-26" y="-26" width="${w + 52}" height="${h + 52}" fill="url(#grid)"/>
      <animateTransform attributeName="transform" type="translate"
        values="0 0; 26 26; 0 0" dur="14s" repeatCount="indefinite"/>
    </g>
    <g filter="url(#soft)" opacity="${t.orbOpacity}">
      <circle cx="${w * 0.12}" cy="${h * 0.2}" r="${h * 0.34}" fill="${t.accent}">
        <animate attributeName="cy" values="${h * 0.2};${h * 0.62};${h * 0.2}" dur="11s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${w * 0.82}" cy="${h * 0.75}" r="${h * 0.30}" fill="${t.accent2}">
        <animate attributeName="cx" values="${w * 0.82};${w * 0.62};${w * 0.82}" dur="13s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${w * 0.55}" cy="${h * 0.1}" r="${h * 0.22}" fill="${t.accent3}" opacity="0.7">
        <animate attributeName="r" values="${h * 0.22};${h * 0.32};${h * 0.22}" dur="9s" repeatCount="indefinite"/>
      </circle>
    </g>
  </g>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="${t.stroke}"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="url(#accentGrad)" stroke-opacity="0.45"/>`;

export const clipPanel = (w, h, r = 18) =>
  `<clipPath id="clipPanel"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>`;

// Small mac-window dots + a caption, so each card reads as a terminal pane.
export const chrome = (t, label, w) => `
  <g transform="translate(20,22)">
    <circle cx="0"  cy="0" r="4.5" fill="${t.accent3}" opacity="0.85"/>
    <circle cx="15" cy="0" r="4.5" fill="${t.accent}"  opacity="0.55"/>
    <circle cx="30" cy="0" r="4.5" fill="${t.accent2}" opacity="0.55"/>
    <text x="46" y="4" font-family="${MONO}" font-size="11.5" fill="${t.faint}" letter-spacing="1.4">${esc(label)}</text>
  </g>
  <line x1="20" y1="40" x2="${w - 20}" y2="40" stroke="${t.stroke}"/>`;

export const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">${body}</svg>\n`;
