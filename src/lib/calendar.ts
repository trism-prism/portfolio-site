import { mulberry32 } from './kit';

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Validates and sorts API rows; drops malformed entries instead of failing the whole calendar. */
export function cleanDays(rows: unknown): Day[] {
  if (!Array.isArray(rows)) return [];
  const out: Day[] = [];
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    const { date, count } = r as { date?: unknown; count?: unknown };
    if (typeof date !== 'string' || !ISO.test(date)) continue;
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) continue;
    out.push({ date, count, level: 0 });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : 1));
  return withLevels(out);
}

export function withLevels(days: Day[]): Day[] {
  const max = Math.max(1, ...days.map((d) => d.count));
  return days.map((d) => ({
    ...d,
    level: (d.count === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((d.count / max) * 4)))) as Day['level'],
  }));
}

const dayMs = 86_400_000;
const utc = (s: string) => Date.parse(s + 'T00:00:00Z');

/** Current streak of consecutive UTC days with activity; a zero on the final day (today) is tolerated. */
export function currentStreak(days: Day[]): number {
  if (!days.length) return 0;
  let i = days.length - 1;
  if (days[i].count === 0) i--;
  let n = 0;
  for (; i >= 0; i--) {
    if (days[i].count === 0) break;
    if (i < days.length - 1 && n > 0 && utc(days[i + 1].date) - utc(days[i].date) !== dayMs) break;
    n++;
  }
  return n;
}

export function longestStreak(days: Day[]): number {
  let best = 0, run = 0;
  for (let i = 0; i < days.length; i++) {
    const contiguous = i > 0 && utc(days[i].date) - utc(days[i - 1].date) === dayMs;
    run = days[i].count > 0 ? (contiguous || run === 0 ? run + 1 : 1) : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** A seeded, obviously synthetic year for the placeholder calendar. */
export function placeholderYear(end = new Date()): Day[] {
  const rand = mulberry32(20261120);
  const days: Day[] = [];
  const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  for (let i = 364; i >= 0; i--) {
    const d = new Date(last - i * dayMs);
    const weekday = d.getUTCDay();
    const busy = rand();
    const base = weekday === 0 || weekday === 6 ? 0.45 : 0.75;
    const count = busy < base ? Math.floor(rand() * 9) : 0;
    days.push({ date: d.toISOString().slice(0, 10), count, level: 0 });
  }
  return withLevels(days);
}

export async function fetchContributions(user: string, signal?: AbortSignal): Promise<Day[]> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { contributions?: unknown };
  return cleanDays(json.contributions);
}
