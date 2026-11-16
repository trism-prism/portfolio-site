import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const token = (name: string) => {
  const m = css.match(new RegExp(`--${name}: *(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found`);
  return m[1];
};

// [foreground, background, minimum ratio]
const pairs: [string, string, number][] = [
  ['text', 'ground', 7],
  ['text', 'surface', 7],
  ['text-muted', 'ground', 4.5],
  ['text-muted', 'surface', 4.5],
  ['accent', 'ground', 3], // link underline and focus ring
  ['accent', 'surface', 3], // focus ring on the scene
];

describe('colour contrast', () => {
  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, min) => {
    const ratio = contrast(token(fg), token(bg));
    console.log(`${fg} on ${bg}: ${ratio.toFixed(2)}:1 (needs ${min})`);
    expect(ratio).toBeGreaterThanOrEqual(min);
  });

  it('computes known values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});
