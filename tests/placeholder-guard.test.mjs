import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { findPlaceholders } from '../scripts/placeholder-guard.mjs';

test('flags every placeholder marker and passes clean output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guard-'));
  try {
    writeFileSync(join(dir, 'index.html'), '<a href="mailto:{{EMAIL}}">hi</a><span data-placeholder="">x</span>');
    writeFileSync(join(dir, 'feed.xml'), '<title>[PLACEHOLDER] HackMadison</title>');
    writeFileSync(join(dir, 'raw.json'), '{"a":"[[PH]]Student Staff"}');
    expect(findPlaceholders(dir).map((h) => h.token).sort()).toEqual(['[PLACEHOLDER]', '[[PH]]', '{{EMAIL}}', 'data-placeholder'].sort());
    writeFileSync(join(dir, 'index.html'), '<a href="mailto:a@b.co">hi</a>');
    writeFileSync(join(dir, 'feed.xml'), '<title>Kiln launched</title>');
    writeFileSync(join(dir, 'raw.json'), '{"a":"Intern"}');
    expect(findPlaceholders(dir)).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true });
  }
});
