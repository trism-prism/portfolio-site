import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { dark, twilight, type Tokens } from '@/components/lab/themeTokens';

// globals.css must carry exactly the approved values from themeTokens.ts, in both theme blocks.

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8');

function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} block`).toBeGreaterThanOrEqual(0);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start));
  const vars = new Map<string, string>();
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) vars.set(m[1], m[2]);
  return vars;
}

const norm = (v: string) => v.replace(/\s+/g, '').toLowerCase();

// CSS variable -> token value, for the variables the handoff maps one to one.
function expected(t: Tokens): Record<string, string> {
  return {
    '--bg': t.skyMid,
    '--bg-alt': t.skyTop,
    '--panel': t.card,
    '--fg': t.ink,
    '--fg-2': t.ink2,
    '--muted': t.ink3,
    '--line': t.rule,
    '--accent': t.kind.software,
    '--accent-soft': t.kind.software,
    '--violet': t.kind.ai,
    '--sky': t.kind.systems,
    '--amber': t.kind.data,
    '--coral': t.rose,
    '--gold': t.route,
    '--sky-top': t.skyTop,
    '--sky-mid': t.skyMid,
    '--sky-bottom': t.skyBottom,
    '--star': t.star,
    '--star-halo': t.starHalo,
    '--graticule': t.graticule,
    '--constellation': t.constellation,
    '--accent-serif': t.accentSerif,
    '--kind-software': t.kind.software,
    '--kind-systems': t.kind.systems,
    '--kind-ai': t.kind.ai,
    '--kind-data': t.kind.data,
    '--rose': t.rose,
    '--route': t.route,
    '--button-bg': t.buttonBg,
    '--button-fg': t.buttonFg,
  };
}

// Values the handoff gives literally (no token field), per theme.
const literal = {
  dark: {
    '--panel-2': 'rgba(255,255,255,.04)',
    '--line-2': 'rgba(255,255,255,.16)',
    '--accent-strong': '#2dd4bf',
    '--accent-pale': '#99f6e4',
    '--accent-ink': '#07080d',
  },
  twilight: {
    '--panel-2': 'rgba(19,26,46,.04)',
    '--line-2': 'rgba(19,26,46,.22)',
    '--accent-strong': '#0b6b62',
    '--accent-pale': '#0b6b62',
    '--accent-ink': '#f4f6fb',
    '--shadow': '0 18px 40px -26px rgba(19,26,46,.45)',
  },
};

describe.each([
  ['dark', ':root', dark, literal.dark],
  ['twilight', ":root[data-theme='light']", twilight, literal.twilight],
] as const)('globals.css %s block', (_name, selector, tokens, lit) => {
  const vars = block(selector);
  const all = { ...expected(tokens), ...lit };

  test.each(Object.entries(all))('%s matches the token file', (name, value) => {
    expect(vars.has(name), `${name} is defined`).toBe(true);
    expect(norm(vars.get(name)!)).toBe(norm(value));
  });

  test('spectrum[0] is the strong accent in twilight', () => {
    if (tokens.name === 'twilight') expect(norm(vars.get('--accent-strong')!)).toBe(norm(tokens.spectrum[0]));
  });
});

test('the footer ground is the same in both themes', () => {
  expect(norm(block(':root').get('--footer-ground')!)).toBe('#0b0e20');
  expect(norm(block(":root[data-theme='light']").get('--footer-ground') ?? '')).toBe('#0b0e20');
});

test('twilight sets color-scheme: light', () => {
  const start = css.indexOf(":root[data-theme='light'] {");
  const body = css.slice(start, css.indexOf('\n}', start));
  expect(body).toMatch(/color-scheme:\s*light;/);
});
