export type Difficulty = { solved: number | null; total: number | null };

export type LeetCode = {
  /** Profile link. While this is '' the "View Profile" link stays hidden. */
  url: string;
  maxRating: number | null;
  level: string | null;
  globalRanking: number | null;
  attended: number | null;
  easy: Difficulty;
  medium: Difficulty;
  hard: Difficulty;
  /** Submissions per day, keyed 'YYYY-MM-DD'. Empty means an empty heatmap. */
  submissions: Record<string, number>;
  /** Shown as "Total active days" and "Max streak". null renders "—". */
  activeDays: number | null;
  maxStreak: number | null;
};

/**
 * Blank on purpose: the dashboard renders "—", an empty ring and an empty heatmap.
 * To fill it, copy the numbers from your LeetCode profile into the fields below, set `url`,
 * and add one 'YYYY-MM-DD': count entry per active day to `submissions` (the heatmap shows the last 52 weeks).
 * Nothing is fetched at runtime.
 */
export const leetcode: LeetCode = {
  url: '',
  maxRating: null,
  level: null,
  globalRanking: null,
  attended: null,
  easy: { solved: null, total: null },
  medium: { solved: null, total: null },
  hard: { solved: null, total: null },
  submissions: {},
  activeDays: null,
  maxStreak: null,
};
