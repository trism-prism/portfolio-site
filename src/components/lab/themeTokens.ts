// Proposed design tokens for the constellation direction: dark (default) and twilight (light).
// Lab reference for the palette handoff; values are checked for contrast in src/components/lab/tokens.test.ts.

export type Tokens = {
  name: 'dark' | 'twilight';
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  haze: string; // faint milky-way band
  ink: string; // primary text
  ink2: string; // secondary text
  ink3: string; // labels, captions
  rule: string;
  card: string;
  cardBorder: string;
  star: string;
  starHalo: string; // ring that keeps stars visible on a pale sky
  graticule: string;
  constellation: string; // constellation lines
  accentSerif: string;
  buttonBg: string;
  buttonFg: string;
  kind: { software: string; systems: string; ai: string; data: string };
  rose: string;
  route: string;
  spectrum: string[];
  horizon: string;
};

export const dark: Tokens = {
  name: 'dark',
  skyTop: '#141428',
  skyMid: '#0a0b16',
  skyBottom: '#05060b',
  haze: '#a78bfa',
  ink: '#eceaf3',
  ink2: '#a9a6b8',
  ink3: '#8a879c',
  rule: 'rgba(255,255,255,.09)',
  card: 'rgba(17,18,32,.74)',
  cardBorder: 'rgba(255,255,255,.09)',
  star: '#ffffff',
  starHalo: 'transparent',
  graticule: 'rgba(255,255,255,.055)',
  constellation: 'rgba(236,234,243,.35)',
  accentSerif: '#cfc9f5',
  buttonBg: '#eceaf3',
  buttonFg: '#07080d',
  kind: { software: '#5eead4', systems: '#60a5fa', ai: '#a78bfa', data: '#fbbf24' },
  rose: '#f472b6',
  route: '#fbbf24',
  spectrum: ['#5eead4', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'],
  horizon: '#05060b',
};

// Twilight: a pale dusk-blue sky that warms toward the horizon, with soft stars still visible.
// Text and signal colours are darkened so every pairing meets WCAG AA (4.5:1) on every sky stop and on cards.
export const twilight: Tokens = {
  name: 'twilight',
  skyTop: '#b8c6e0',
  skyMid: '#cdd7e9',
  skyBottom: '#ecdfd8',
  haze: '#8b7fd1',
  ink: '#131a2e',
  ink2: '#35405e',
  ink3: '#47506e',
  rule: 'rgba(19,26,46,.14)',
  card: 'rgba(250,251,255,.62)',
  cardBorder: 'rgba(19,26,46,.12)',
  star: '#ffffff',
  starHalo: 'rgba(44,58,104,.28)',
  graticule: 'rgba(19,26,46,.08)',
  constellation: 'rgba(19,26,46,.42)',
  accentSerif: '#563ca7',
  buttonBg: '#131a2e',
  buttonFg: '#f4f6fb',
  kind: { software: '#095951', systems: '#1944bd', ai: '#6026c5', data: '#7b4304' },
  rose: '#99144e',
  route: '#8b3708',
  spectrum: ['#0b6b62', '#1944bd', '#6026c5', '#99144e', '#8b3708'],
  horizon: '#1b2240',
};
