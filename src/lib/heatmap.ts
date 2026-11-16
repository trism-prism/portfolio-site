export type HeatCell = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Heatmap = { weeks: HeatCell[][]; months: { label: string; week: number }[] };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const iso = (d: Date) => d.toISOString().slice(0, 10);

function level(count: number): HeatCell['level'] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * A GitHub-style grid: `weeks` columns (Sunday first) of 7 days, ending at the week that contains `end`.
 * Days after `end` in the last column are kept as empty cells so every column has 7. Dates use UTC.
 */
export function buildHeatmap(submissions: Record<string, number>, end: Date, weeks = 52): Heatmap {
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  const start = new Date(last);
  start.setUTCDate(start.getUTCDate() - last.getUTCDay() - (weeks - 1) * 7);
  const cols: HeatCell[][] = [];
  const months: Heatmap['months'] = [];
  let prevMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + w * 7 + d);
      const key = iso(day);
      const count = day > last ? 0 : (submissions[key] ?? 0);
      col.push({ date: key, count, level: level(count) });
    }
    const m = new Date(col[0].date).getUTCMonth();
    if (m !== prevMonth) {
      months.push({ label: MONTHS[m], week: w });
      prevMonth = m;
    }
    cols.push(col);
  }
  // A partial first month would collide with the next label.
  if (months.length > 1 && months[1].week - months[0].week < 3) months.shift();
  return { weeks: cols, months };
}
