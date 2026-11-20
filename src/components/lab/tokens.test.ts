import { describe, expect, test } from 'vitest';
import { dark, twilight, type Tokens } from './themeTokens';

// WCAG 2 contrast for the proposed tokens, against every sky stop and against cards composited on the
// palest/darkest stop. Body text needs 4.5:1; kind colours are used for small labels, so they need 4.5:1 too.

const hex = (h: string) => {
  const n = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};
const rgba = (s: string): [number[], number] => {
  if (s.startsWith('#')) return [hex(s), 1];
  const m = s.match(/rgba?\(([^)]+)\)/)!;
  const p = m[1].split(',').map((x) => parseFloat(x));
  return [p.slice(0, 3), p[3] ?? 1];
};
const over = (top: string, under: number[]) => {
  const [c, a] = rgba(top);
  return c.map((v, i) => v * a + under[i] * (1 - a));
};
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

function backgrounds(t: Tokens) {
  const skies = [t.skyTop, t.skyMid, t.skyBottom].map(hex);
  return [...skies, ...skies.map((s) => over(t.card, s))];
}

describe.each([dark, twilight])('$name tokens', (t) => {
  const bgs = backgrounds(t);
  const text: [string, string][] = [
    ['ink', t.ink],
    ['ink2', t.ink2],
    ['ink3', t.ink3],
    ['accentSerif', t.accentSerif],
    ['route', t.route],
    ['rose', t.rose],
    ...Object.entries(t.kind),
  ];
  test.each(text)('%s meets 4.5:1 on every sky stop and card', (_name, colour) => {
    const worst = Math.min(...bgs.map((b) => contrast(hex(colour), b)));
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });
  test('button label meets 4.5:1', () => {
    expect(contrast(hex(t.buttonFg), hex(t.buttonBg))).toBeGreaterThanOrEqual(4.5);
  });
});
