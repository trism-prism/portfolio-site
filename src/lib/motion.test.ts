import { describe, expect, it } from 'vitest';
import { parsePreference, resolveMotion } from './motion';

describe('motion policy', () => {
  it('follows the system setting by default', () => {
    expect(resolveMotion('system', true)).toBe('reduce');
    expect(resolveMotion('system', false)).toBe('full');
  });

  it('lets an explicit choice override the system', () => {
    expect(resolveMotion('reduce', false)).toBe('reduce');
    expect(resolveMotion('full', true)).toBe('full');
  });

  it('treats unknown stored values as system', () => {
    expect(parsePreference(null)).toBe('system');
    expect(parsePreference('fast')).toBe('system');
    expect(parsePreference('reduce')).toBe('reduce');
  });
});
