import { describe, expect, it } from 'vitest';
import { buildHeatmap } from './heatmap';

const end = new Date('2026-11-16T12:00:00Z'); // a Monday

describe('buildHeatmap', () => {
  it('builds 52 columns of 7 days, ending on the week of the end date', () => {
    const h = buildHeatmap({}, end);
    expect(h.weeks).toHaveLength(52);
    expect(h.weeks.every((w) => w.length === 7)).toBe(true);
    expect(h.weeks[51][0].date).toBe('2026-11-15'); // Sunday of that week
    expect(h.weeks[51][1].date).toBe('2026-11-16');
  });

  it('is all level 0 for blank data', () => {
    expect(buildHeatmap({}, end).weeks.flat().every((c) => c.level === 0 && c.count === 0)).toBe(true);
  });

  it('maps counts to levels and ignores days after the end date', () => {
    const h = buildHeatmap({ '2026-11-16': 1, '2026-11-15': 2, '2026-11-14': 5, '2026-11-13': 9, '2026-11-17': 4 }, end);
    const by = Object.fromEntries(h.weeks.flat().map((c) => [c.date, c.level]));
    expect([by['2026-11-16'], by['2026-11-15'], by['2026-11-14'], by['2026-11-13']]).toEqual([1, 2, 3, 4]);
    expect(by['2026-11-17']).toBe(0);
  });

  it('labels the months in order, ending on the end month', () => {
    const labels = buildHeatmap({}, end).months.map((m) => m.label);
    expect(labels.at(-1)).toBe('Nov');
    expect(new Set(labels).size).toBe(labels.length); // the partial first Nov is dropped, so no repeats
  });
});
