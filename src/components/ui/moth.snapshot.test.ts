import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MothCharacter, MothEmerging, MothMark, type MothPose } from './Moth';

// Snapshots were taken before MothEmerging was added: MothCharacter and MothMark must render identical markup.
const POSES: MothPose[] = ['idle', 'wink', 'crouch', 'jump', 'land', 'wave', 'sit', 'sleep', 'cheer'];

describe('Moth markup is unchanged', () => {
  for (const pose of POSES) {
    it(`MothCharacter ${pose}`, async () => {
      await expect(renderToStaticMarkup(createElement(MothCharacter, { pose, size: 46 }))).toMatchFileSnapshot(`./__snapshots__/character-${pose}.html`);
    });
  }
  it('MothCharacter flipped and sized', async () => {
    await expect(renderToStaticMarkup(createElement(MothCharacter, { pose: 'wave', size: 130, flip: true }))).toMatchFileSnapshot('./__snapshots__/character-wave-flip.html');
  });
  it('MothMark plain, animated and titled', async () => {
    await expect(renderToStaticMarkup(createElement(MothMark, { size: 40 }))).toMatchFileSnapshot('./__snapshots__/mark.html');
    await expect(renderToStaticMarkup(createElement(MothMark, { size: 28, animated: true }))).toMatchFileSnapshot('./__snapshots__/mark-animated.html');
    await expect(renderToStaticMarkup(createElement(MothMark, { size: 32, title: 'Moth' }))).toMatchFileSnapshot('./__snapshots__/mark-titled.html');
  });
});

describe('MothEmerging', () => {
  const draw = (props: Parameters<typeof MothEmerging>[0]) =>
    renderToStaticMarkup(createElement('svg', { viewBox: '0 0 160 120' }, createElement(MothEmerging, props)));
  // the spread pose of MothCharacter ('wave') without its outer svg
  const spread = () => renderToStaticMarkup(createElement(MothCharacter, { pose: 'wave', size: 120 }));

  it('at wings 1, both antennae 1 and all stars lit it is the MothSpread drawing', () => {
    const a = draw({});
    // compare the drawn shapes only: the wing-star lines (a polyline there, lines here), group wrappers and opacities differ in markup
    const norm = (x: string) => x.replace(/<(line|polyline)[^>]*><\/(line|polyline)>/g, '').replace(/<svg[^>]*>|<\/svg>/g, '').replace(/ opacity="[\d.]+"/g, '').replace(/<g[^>]*>|<\/g>/g, '');
    const b = spread();
    expect(norm(a)).toBe(norm(b));
  });
  it('folds the wings about their roots at 0 and unfolds continuously', () => {
    expect(draw({ wings: 0 })).toContain('scale(0.15 0.8)');
    expect(draw({ wings: 0.5 })).toContain('scale(0.575 0.9)');
    expect(draw({ wings: 1 })).not.toContain('rotate(');
  });
  it('lights wing stars from the body outward, in pairs', () => {
    const dots = (n: number) => (draw({ wingStars: n }).match(/r="1.9"/g) ?? []).length;
    expect(dots(0)).toBe(0);
    expect(dots(2 / 8)).toBe(2);
    expect(dots(1)).toBe(8);
  });
  it('draws the antennae separately', () => {
    expect(draw({ antennaeL: 0, antennaeR: 1 })).not.toBe(draw({ antennaeL: 1, antennaeR: 0 }));
  });
});
