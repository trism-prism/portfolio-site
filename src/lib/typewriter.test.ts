import { describe, expect, it } from 'vitest';
import { initialTypeState, typewriterStep, type TypeState } from './typewriter';

const roles = ['ab', 'c'];

function run(steps: number) {
  let s: TypeState = initialTypeState;
  const seen: string[] = [];
  for (let i = 0; i < steps; i++) {
    s = typewriterStep(s, roles).state;
    seen.push(`${s.role}:${s.len}${s.deleting ? 'd' : ''}`);
  }
  return seen;
}

describe('typewriterStep', () => {
  it('types, holds, deletes, then moves to the next role and wraps', () => {
    expect(run(9)).toEqual(['0:1', '0:2', '0:2d', '0:1d', '0:0d', '1:0', '1:1', '1:1d', '1:0d']);
    expect(run(10).at(-1)).toBe('0:0'); // wrapped back to the first role
  });

  it('holds longest on a finished word', () => {
    const full = typewriterStep({ role: 0, len: 2, deleting: false }, roles);
    const typing = typewriterStep({ role: 0, len: 0, deleting: false }, roles);
    expect(full.delay).toBeGreaterThan(typing.delay);
  });
});
