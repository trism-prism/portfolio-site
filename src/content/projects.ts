/**
 * All project copy lives here. To add a featured project: add an entry to `projects`, put its images in
 * `public/work/<slug>/` (a full-size and a 640 px WebP each), and it gets a page, a home-page entry and a
 * sitemap line automatically. Small projects go in `moreWork`.
 */

export type ProjectImage = {
  dir: string;
  name: string;
  /** Intrinsic size of the largest file. */
  width: number;
  height: number;
  /** Available widths, largest first. */
  widths: number[];
  alt: string;
  caption: string;
};

export type Section = { title: string; body: string[]; figures?: number[] };

export type Project = {
  slug: string;
  title: string;
  /** One line for the home page. */
  summary: string;
  /** Two sentences under the title on the project page. */
  standfirst: string;
  /** Where the lead image sits on the project page. */
  layout: 'wide' | 'split';
  sections: Section[];
  /** One closing sentence about what it is built with. */
  closing: string;
  links: { repo?: string; live?: string };
  images: ProjectImage[];
  /** Index of the image shown on the home page and at the top of the project page. */
  lead: number;
};

export type MoreWork = {
  name: string;
  text: string;
  links: { label: string; href: string }[];
};

const image = (
  dir: string,
  name: string,
  width: number,
  height: number,
  widths: number[],
  alt: string,
  caption: string,
): ProjectImage => ({ dir, name, width, height, widths, alt, caption });

export const projects: Project[] = [
  {
    slug: 'visibility-engine',
    title: '2D Visibility & Lighting Engine',
    summary: 'A C++ engine that works out exactly what one point light can see among walls, which is what gives a 2D game sharp shadows.',
    standfirst:
      'A C++ engine that works out exactly what one point light can see among line-segment walls. I wrote the geometry, both search methods, the demo app and the benchmark harness myself.',
    layout: 'wide',
    lead: 0,
    sections: [
      {
        title: 'A corner the light should have reached',
        body: [
          'My first version sorted points by angle with atan2 and compared them with a rounded cross product. In a unit-square test scene with one wall, two targets got the same angle and collapsed into one ray, and a corner the light could see was dropped. The lit area came out as 0.465 when the correct answer is 0.765.',
          'I replaced both with a single orientation predicate that falls back to exact arithmetic when the result is too close to call, and wrote the failing case down in the decision log.',
        ],
      },
      {
        title: 'One ray per target, not three',
        body: [
          'The common approach is three rays per wall end, at a tiny angle below, at and above it. I chose one ray per target instead, with the exact limit of the nearest hit from each side, because offsets leak light through shared corners and miss gaps narrower than the offset.',
          'The lantern on my home page is a small TypeScript version of the same idea, and it does use the simpler three-ray recipe, which is fine for walls I placed by hand.',
        ],
      },
      {
        title: 'Why the grid wins by so much on mazes',
        body: [
          'The engine has two interchangeable methods: test every wall for every ray, or walk a uniform grid so each ray only tests the walls in the cells it crosses. The demo app lets you drag the light, draw walls and watch a work meter count the tests.',
          'On a laptop, single-threaded, the grid is about 1.5x faster than testing every wall on scenes of 250 clustered walls, and over 100x faster on 4,000-wall mazes (120x to 141x across three random seeds). Clustered walls share cells, so a ray still meets many of them; in a maze a ray crosses a few cells with few walls in each.',
          'These numbers come from the committed benchmark run. I sped up the sort afterwards and have not regenerated the file.',
        ],
        figures: [1, 2],
      },
    ],
    closing: 'Built with C++20 and CMake, with GLFW and Dear ImGui for the demo and doctest for tests; it builds with MSVC on Windows.',
    links: { repo: 'https://github.com/trism-prism/2d-visibility-engine' },
    images: [
      image(
        'visibility-engine',
        'room',
        888,
        552,
        [888, 640],
        'The demo app’s room: line-segment walls and one light, with its lit area in warm tones and a hard shadow behind each wall.',
        'The demo app. Drag the light and the lit region is recomputed.',
      ),
      image(
        'visibility-engine',
        'baseline',
        1280,
        800,
        [1280, 640],
        'The demo with one ray selected in all-walls mode. Every wall is outlined as checked and the panel reads "Checks all 59 walls".',
        'Baseline: this one ray tests all 59 walls.',
      ),
      image(
        'visibility-engine',
        'grid',
        1280,
        800,
        [1280, 640],
        'The same ray in grid mode. Only the walls in the squares it passes are outlined, and the panel reads "Passes 2 squares, checks 12 of 59 walls".',
        'Grid: the same ray tests 12 of 59 walls.',
      ),
    ],
  },
  {
    slug: 'kiln',
    title: 'Kiln',
    summary: 'An installable study planner that turns a syllabus or calendar into a daily to-do list, and keeps working offline.',
    standfirst:
      'Kiln turns a syllabus, spreadsheet or LMS calendar into a daily to-do list, and it keeps working with no connection. It is live at kilnstudy.com, and I built the app, the scheduler, the sync and the small server behind it.',
    layout: 'split',
    lead: 0,
    sections: [
      {
        title: 'From a pile of deadlines to today’s list',
        body: [
          'You bring a plan in whichever form you already have it: an AI-written Markdown and JSON plan, a CSV or spreadsheet, quick-add text, or an LMS calendar file. A scheduler then spreads the tasks across the weekly minute budgets you set, and adds reminders, a calendar, a streak heatmap and optional spaced-repetition review.',
        ],
        figures: [1],
      },
      {
        title: 'Deferring work without trying every combination',
        body: [
          'When a deadline is at risk, the scheduler pushes back lower-priority tasks. Trying every combination would be slow, so it binary-searches how many to defer. That is only valid if deferring more never makes things worse, so the assumption is written down in the code next to the search.',
        ],
        figures: [2],
      },
      {
        title: 'Sync with no accounts',
        body: [
          'Every record is encrypted on the device with AES-GCM before it leaves, so the server only ever stores ciphertext. Pairing a second device uses CPace, a password-authenticated key exchange. The pairing code is 6 digits, but only the last 4 are secret; the first 2 pick a slot on the server. A code stops working after 3 wrong attempts.',
        ],
      },
    ],
    closing: 'Built with React 19, TypeScript and Vite, Dexie for local data, and Cloudflare Workers with D1 for the sync server.',
    links: { repo: 'https://github.com/trism-prism/kiln', live: 'https://kilnstudy.com' },
    images: [
      image(
        'kiln',
        'todo-dark',
        1280,
        640,
        [1280, 640],
        'Kiln’s to-do list in the dark theme: overdue tasks first, then today’s tasks, each with its plan, type and minutes.',
        'The to-do list the scheduler produces.',
      ),
      image(
        'kiln',
        'dashboard-dark',
        1280,
        480,
        [1280, 640],
        'Kiln’s dashboard in the dark theme: study plans with progress bars and an expected finish date.',
        'The dashboard: what is left today and when each plan should finish.',
      ),
      image('kiln', 'todo-phone', 390, 844, [390], 'The same to-do list on a phone, with a bottom tab bar.', 'The same list on a 390 px phone screen.'),
    ],
  },
  {
    slug: 'docs-qa',
    title: 'Docs Q&A Copilot',
    summary: 'Answers questions about two public benefits PDFs with page-level citations, and shows its own failures on an evaluation page.',
    standfirst:
      'Docs Q&A Copilot answers questions about two public benefits documents, the FEHB brochure and Medicare & You 2027, and points to the page behind each claim. I built the PDF ingestion, the search, the web app and the evaluation harness.',
    layout: 'wide',
    lead: 0,
    sections: [
      {
        title: 'Answers you can check',
        body: [
          'The two documents run to 296 pages, split into 1,182 chunks. A question finds the closest chunks, a model writes the answer, and each claim links to the page it came from.',
          'Visitors paste their own Anthropic API key, so running the demo costs me nothing.',
        ],
      },
      {
        title: 'Holding questions back',
        body: [
          'I wrote 50 questions: 20 for tuning and 30 held out until the settings were frozen, then run once. The final run got 46 of 50 right, and 28 of the 30 held-out ones.',
          'The set is small, so a single question moves the overall score by 2 points; treat the figure as a rough guide. The evaluation page lists every answer, including the failures.',
        ],
        figures: [1],
      },
      {
        title: 'Keeping the simpler search',
        body: ['I tried adding full-text search alongside vector search. On my questions it scored worse, so I kept plain vector search.'],
      },
    ],
    closing: 'Built with TypeScript, Next.js and PostgreSQL with pgvector; embeddings run locally with bge-small and answers come from the Anthropic API.',
    links: { repo: 'https://github.com/trism-prism/docs-qa-copilot', live: 'https://docs-qa-copilot.vercel.app' },
    images: [
      image(
        'docs-qa',
        'answer',
        960,
        600,
        [960, 640],
        'Docs Q&A answering a question about hospital days under Original Medicare, with numbered citations in the answer and a sources panel that links to page 30.',
        'An answer with its sources: each numbered claim opens the page it came from.',
      ),
      image(
        'docs-qa',
        'eval',
        1280,
        800,
        [1280, 640],
        'The evaluation page: 93.3% answer accuracy on the held-out questions and 92.0% on all 50, above a table of measures.',
        'The evaluation page: 28 of 30 held-out questions correct, 46 of 50 overall.',
      ),
    ],
  },
  {
    slug: 'gengarate',
    title: 'GengaRate',
    summary: 'A live site for rating anime and manga, with more than 1,600 titles imported from AniList.',
    standfirst:
      'GengaRate is a live site for rating anime and manga, with more than 1,600 titles imported from AniList and grouped into series. I built the React front end, the ASP.NET Core API and the PostgreSQL schema, and set up hosting on Vercel and Railway.',
    layout: 'split',
    lead: 0,
    sections: [
      {
        title: 'What you can do there',
        body: ['You can rate titles in four categories, rate whole series and volumes, write reviews and replies, keep watch lists and custom lists, and follow friends.'],
        figures: [1],
      },
      {
        title: 'A refresh token that works once',
        body: [
          'Every refresh token rotates when it is used, and if an old one turns up again the session ends, because it may have been stolen. Two browser tabs refreshing at the same instant look exactly like reuse, so the front end uses the Web Locks API to make the tabs take turns.',
        ],
      },
      {
        title: 'Imports that cannot collide',
        body: [
          'A Postgres advisory lock allows one AniList import at a time, and the importer backs off when AniList asks it to wait with a Retry-After header. The tests for this, and for the database constraints around it, run against a real PostgreSQL rather than a stand-in.',
        ],
      },
    ],
    closing: 'Built with React 19 and TypeScript on Vite, ASP.NET Core 8 with EF Core, and PostgreSQL, hosted on Vercel and Railway.',
    links: { repo: 'https://github.com/trism-prism/anime-rating-platform', live: 'https://www.gengarate.com' },
    images: [
      image(
        'gengarate',
        'title',
        1280,
        640,
        [1280, 640],
        'A title page on GengaRate for One Piece: Defeat the Pirate Ganzack, with genres, a synopsis and the other entries in its series.',
        'A title page: genres, a synopsis and the other entries in the series.',
      ),
      image(
        'gengarate',
        'home',
        1280,
        600,
        [1280, 640],
        'GengaRate’s browse page, logged out: a search box, type and genre filters, and a row of trending anime.',
        'The browse page, logged out.',
      ),
    ],
  },
];

export const moreWork: MoreWork[] = [
  {
    name: 'Predicting College Football Upsets',
    text: 'Tests whether anything public beats the betting market’s closing spread at predicting college football games. It does not: on the 2023 and 2024 seasons the spread alone scored a Brier score (the average squared error of predicted probabilities; lower is better) of 0.177 against 0.244 for a naive baseline, and five added features gave no out-of-sample gain. The repository is private.',
    links: [],
  },
  {
    name: 'minivmm',
    text: 'A small virtual machine monitor in C, about 500 lines, on top of Linux KVM. It loads a flat 16-bit binary, handles port I/O, memory-mapped I/O and halts, and its output is compared against QEMU. One measurement, with its condition: a VM exit cost about 5.3 µs under nested KVM on WSL2 on a laptop, which says little about bare metal.',
    links: [{ label: 'Repository', href: 'https://github.com/trism-prism/minivmm' }],
  },
  {
    name: 'Internship Scout Agent',
    text: 'A weekly job pulls internship postings from a public GitHub feed, has Claude score each one against my résumé, and emails a digest of the matches scoring 70 or more. It has a small public page, and no accuracy figure for the scoring.',
    links: [
      { label: 'Repository', href: 'https://github.com/trism-prism/internship-scout-agent' },
      { label: 'Live page', href: 'https://internship-scout-agent.vercel.app' },
    ],
  },
  {
    name: 'Tripwire',
    text: 'Loads the GDELT events feed into PostgreSQL every 15 minutes, keeps conflict and unrest events that have a location, flags per-country spikes against a 28-day baseline, and shows them on a Streamlit map. I hand-labeled 50 alerts to check the spike score.',
    links: [{ label: 'Repository', href: 'https://github.com/trism-prism/tripwire-awareness-dashboard' }],
  },
  {
    name: 'Heart Disease Prediction',
    text: 'Compares logistic regression, random forest and XGBoost on the UCI Cleveland heart disease data, tuned for recall, and serves the best model in a form. Its stress test shows the limit: recall was 0.96 on 61 held-out patients but 0.70 on data from other UCI sites. An educational demo, not a diagnostic tool.',
    links: [
      { label: 'Repository', href: 'https://github.com/trism-prism/heart-disease-prediction' },
      { label: 'Live demo', href: 'https://heart-disease-prediction-alpha.vercel.app' },
    ],
  },
];

export function imageSrc(img: ProjectImage, width: number) {
  return `/work/${img.dir}/${img.name}-${width}.webp`;
}
export function imageSrcSet(img: ProjectImage) {
  return img.widths.map((w) => `${imageSrc(img, w)} ${w}w`).join(', ');
}
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
