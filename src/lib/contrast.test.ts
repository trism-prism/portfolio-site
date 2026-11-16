import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

/** Dark tokens live in :root, light overrides in :root.light. Light inherits any token it does not redefine. */
function tokens(theme: 'dark' | 'light') {
  const read = (block: string) =>
    Object.fromEntries([...block.matchAll(/--([\w-]+): *(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
  const dark = read(css.slice(css.indexOf(':root {'), css.indexOf(':root.light')));
  if (theme === 'dark') return dark;
  return { ...dark, ...read(css.slice(css.indexOf(':root.light'))) };
}

// [foreground, background, minimum ratio]
const pairs: [string, string, number][] = [
  ['text', 'bg', 4.5],
  ['text', 'bg-alt', 4.5],
  ['text', 'card', 4.5],
  ['text', 'footer', 4.5],
  ['muted', 'bg', 4.5],
  ['muted', 'bg-alt', 4.5],
  ['muted', 'card', 4.5],
  ['muted', 'chip', 4.5],
  ['muted', 'footer', 4.5],
  ['accent-text', 'bg', 4.5],
  ['accent-text', 'bg-alt', 4.5],
  ['accent-text', 'card', 4.5],
  ['accent-text', 'footer', 4.5],
  ['on-accent', 'accent', 4.5],
  ['on-accent', 'accent-hover', 4.5],
  ['easy', 'chip', 4.5],
  ['medium', 'chip', 4.5],
  ['hard', 'bg', 4.5],
];

describe.each(['dark', 'light'] as const)('%s theme contrast', (theme) => {
  const t = tokens(theme);
  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, min) => {
    expect(t[fg], `token --${fg}`).toBeDefined();
    expect(t[bg], `token --${bg}`).toBeDefined();
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
  });
});

describe('contrast', () => {
  it('computes known values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});
