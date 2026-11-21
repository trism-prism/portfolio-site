// The star figures for "Name the constellation": each one charts a project. Coordinates are in the
// 720 × 240 footer frame. `lines` index into `points`; dashed lines are rays and links, solid lines are the figure.

export type FigurePoint = readonly [number, number];
export type FigureLine = { a: number; b: number; dashed?: boolean };
export type Figure = {
  /** Slug of the project the figure charts (must exist in `projects`). */
  slug: string;
  /** Shown in Instrument Serif italic once guessed. */
  name: string;
  points: readonly FigurePoint[];
  lines: readonly FigureLine[];
  /** Index into `points`: the star the moth flies to. */
  brightest: number;
  hint: string;
};

export const figures: readonly Figure[] = [
  {
    slug: '2d-visibility-engine',
    name: 'the Visibility Engine',
    // 0 the light; 1–2 the first wall; 3–4 the second wall
    points: [[360, 62], [280, 50], [305, 120], [420, 104], [470, 72]],
    lines: [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 0, b: 1, dashed: true },
      { a: 0, b: 2, dashed: true },
      { a: 0, b: 3, dashed: true },
      { a: 0, b: 4, dashed: true },
    ],
    brightest: 0,
    hint: 'Think about what a light can see.',
  },
  {
    slug: 'docs-qa-copilot',
    name: 'the Docs Q&A Copilot',
    // 0–3 the page outline; 4–9 three text lines; 10 the citation star
    points: [[310, 38], [410, 38], [410, 140], [310, 140], [325, 64], [395, 64], [325, 88], [380, 88], [325, 112], [390, 112], [446, 54]],
    lines: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 0 },
      { a: 4, b: 5 },
      { a: 6, b: 7 },
      { a: 8, b: 9 },
      { a: 10, b: 5, dashed: true },
    ],
    brightest: 10,
    hint: 'Think about answers that cite their source.',
  },
  {
    slug: 'heart-disease-prediction',
    name: 'Heart Disease Prediction',
    // a pulse line
    points: [[270, 104], [318, 104], [340, 62], [362, 140], [384, 86], [404, 104], [450, 104]],
    lines: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 4, b: 5 },
      { a: 5, b: 6 },
    ],
    brightest: 2,
    hint: 'Think about a pulse.',
  },
];
