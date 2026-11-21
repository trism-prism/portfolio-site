import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MothCharacter, MothMark, type MothPose } from './Moth';

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
