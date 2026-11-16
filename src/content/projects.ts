/**
 * All project copy lives here. To add a featured project: add an entry to `projects`, put its images in
 * `public/work/<slug>/` (a 1280 px and a 640 px WebP each), and it gets a page, a home-page entry and a
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

export type Decision = { title: string; body: string; figures?: number[] };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  does: string;
  matters: string;
  built: string;
  /** Numbers, with what they were measured on. */
  measured?: Decision;
  decisions: Decision[];
  stack: string;
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
    summary: 'A C++ engine that works out exactly what one point light can see among walls, which gives hard-edged shadows.',
    does:
      'Give it a light and a set of line-segment walls and it returns the region the light reaches. It has two interchangeable methods: test every wall for every ray, or walk a uniform grid so each ray only tests the walls near it. The desktop demo lets you drag the light, draw walls and watch a work meter count the wall tests.',
    matters:
      'Shadows in a 2D game come down to one question: what can this point see? It is easy to get nearly right and hard to get exactly right, so I wanted a version I could trust, with the failures written down.',
    built:
      'I wrote all of it: the geometry core, both methods, the demo app, the benchmark harness and the decision log.',
    measured: {
      title: 'What the grid buys',
      body:
        'On one laptop, single-threaded, the grid is about 1.5x faster than testing every wall on scenes of 250 clustered walls, and over 100x faster on 4,000-wall mazes (120x to 141x across three random seeds). The baseline is every ray testing every wall. The gap varies because clustered walls share grid cells, so a ray still meets many of them, while in a maze each ray passes only a few. These numbers come from the committed benchmark run; I sped up the sort afterwards and have not regenerated the file.',
      figures: [1, 2],
    },
    decisions: [
      {
        title: 'A rounded cross product gave the wrong shadow',
        body:
          'An angle sort combined with a rounded cross product reported a lit area of 0.765 in a unit-square scene where the correct area is 0.465. I replaced both with one orientation predicate that falls back to exact arithmetic when the result is too close to call, and wrote the failing case into the decision log.',
      },
      {
        title: 'One ray per target, with exact limits',
        body:
          'Many visibility routines cast three rays per wall endpoint, each nudged by a tiny angle. That breaks down when a user draws walls that cross. The engine casts one ray per target and applies exact one-sided limits to what it hits instead.',
      },
    ],
    stack: 'C++20 with CMake; GLFW and Dear ImGui for the demo, doctest for tests. It builds with MSVC on Windows.',
    links: { repo: 'https://github.com/trism-prism/2d-visibility-engine' },
    lead: 0,
    images: [
      image(
        'visibility-engine',
        'demo',
        1280,
        800,
        [1280, 640],
        'The demo app: a room of line-segment walls with one light, its lit area drawn in warm tones and a hard shadow behind each wall.',
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
    does:
      'You import a plan (an AI-written Markdown and JSON plan, a CSV or spreadsheet, quick-add text, or an LMS calendar file) and a scheduler spreads the tasks across your weekly minute budgets. It adds reminders, a calendar, a streak heatmap and optional spaced-repetition review.',
    matters:
      'Planning is the part of studying people skip. Kiln takes the schedule you already have and decides what to do today, and it works without an account.',
    built:
      'I built the app, the scheduler, the encrypted sync and the small server behind it, on my own.',
    decisions: [
      {
        title: 'Deferring tasks without trying every combination',
        body:
          'When a deadline is at risk the scheduler defers lower-priority tasks. Rather than trying combinations, it binary-searches how many to defer. That is only correct if deferring more never makes things worse, so I wrote that assumption down in the code next to the search.',
        figures: [1, 2],
      },
      {
        title: 'Sync with no accounts',
        body:
          'Each record is encrypted on the device with AES-GCM before it leaves, so the server stores only ciphertext. To pair a second device I used CPace, a password-authenticated key exchange. The pairing code is 6 digits, but only the last 4 are secret; the first 2 pick a slot on the server. A code retires after 3 wrong attempts.',
      },
    ],
    stack: 'React 19, TypeScript and Vite, with Dexie (IndexedDB) for local data and Cloudflare Workers and D1 for the sync server.',
    links: { repo: 'https://github.com/trism-prism/kiln', live: 'https://kilnstudy.com' },
    lead: 0,
    images: [
      image(
        'kiln',
        'dashboard',
        1280,
        800,
        [1280, 640],
        'Kiln dashboard in light mode: two study plans, each with progress bars for essential tasks and mastery and an expected finish date.',
        'Dashboard. Each plan shows what is left today and when it should finish.',
      ),
      image(
        'kiln',
        'todo',
        1280,
        800,
        [1280, 640],
        'Kiln to-do list in dark mode: overdue tasks first, then today’s tasks, each with its plan, type and minutes.',
        'The to-do list the scheduler produces, in the dark theme.',
      ),
      image(
        'kiln',
        'todo-phone',
        390,
        844,
        [390],
        'The same to-do list on a phone, with a bottom tab bar.',
        'The same list on a 390 px phone screen.',
      ),
    ],
  },
  {
    slug: 'docs-qa',
    title: 'Docs Q&A Copilot',
    summary: 'Answers questions about two public benefits PDFs with page-level citations, and shows its own failures on an evaluation page.',
    does:
      'It reads the FEHB brochure and Medicare & You 2027 (296 pages, split into 1,182 chunks), finds the passages that match a question, and has a model answer with a citation to the page. A separate page lists every question it got wrong. Visitors paste their own Anthropic API key, so the demo has no model bill.',
    matters:
      'An answer about insurance is only useful if you can check it. Each answer points to a page, and the evaluation page shows where the system fails.',
    built: 'I built the PDF ingestion, the vector search, the web app and the evaluation harness.',
    measured: {
      title: 'How well it works, and how much to trust that',
      body:
        'On 50 fixed questions it answered 46 correctly (92%), and 28 of the 30 held-out questions. The set is small: one question is worth 2 points, so read these as a rough measure and not a ranking. The scoring is by rule, and the evaluation page shows every answer.',
      figures: [1],
    },
    decisions: [
      {
        title: 'Hold questions out until the end',
        body:
          'Of the 50 questions, 20 were for tuning and 30 were held out until the settings were frozen. I ran the held-out set once, after that, so the number I report is not one I tuned against.',
      },
      {
        title: 'Keep plain vector search',
        body:
          'I tried adding full-text search to the vector search. On my questions it scored worse, so I kept the simpler version.',
      },
    ],
    stack: 'TypeScript, Next.js and PostgreSQL with pgvector. Embeddings run locally with bge-small; answers come from the Anthropic API.',
    links: { repo: 'https://github.com/trism-prism/docs-qa-copilot', live: 'https://docs-qa-copilot.vercel.app' },
    lead: 0,
    images: [
      image(
        'docs-qa',
        'ask',
        1280,
        800,
        [1280, 640],
        'The ask page: a field for your own Anthropic API key, a question box and a list of the two documents to search.',
        'The ask page. You paste your own key, so I do not pay for your questions.',
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
    does:
      'You can rate titles in four categories, rate whole series and volumes, write reviews and replies, keep watch lists and custom lists, and follow friends. Titles come from AniList, grouped into series.',
    matters:
      'A site with accounts has to get the unglamorous parts right: staying signed in safely, imports that must not collide, and a database that behaves the way the code assumes.',
    built:
      'I built the React front end, the ASP.NET Core API and the PostgreSQL schema, and set up hosting on Vercel and Railway.',
    decisions: [
      {
        title: 'Refresh tokens that can be used once',
        body:
          'Each refresh token rotates when it is used, and if an old one shows up again the session ends, because it may have been stolen. Two browser tabs refreshing at the same moment look exactly like reuse, so the front end uses the Web Locks API to make tabs take turns.',
      },
      {
        title: 'One import at a time',
        body:
          'A Postgres advisory lock stops two AniList imports from running together, and the importer backs off when AniList asks it to wait with a Retry-After header. The tests that cover this and the database constraints run against a real PostgreSQL, not a stand-in.',
      },
    ],
    stack: 'React 19 and TypeScript with Vite on the front end, ASP.NET Core 8 with EF Core on the back end, PostgreSQL, hosted on Vercel and Railway.',
    links: { repo: 'https://github.com/trism-prism/anime-rating-platform', live: 'https://www.gengarate.com' },
    lead: 0,
    images: [
      image(
        'gengarate',
        'home',
        1280,
        600,
        [1280, 640],
        'GengaRate’s browse page, logged out: a search box, type and genre filters, and a row of trending anime.',
        'The home page, logged out.',
      ),
      image(
        'gengarate',
        'series',
        1280,
        800,
        [1280, 640],
        'A title page for One Piece: Defeat the Pirate Ganzack, with genres, a synopsis and the other entries in its series.',
        'A title page: genres, a synopsis and the other entries in the series.',
      ),
    ],
  },
];

export const moreWork: MoreWork[] = [
  {
    name: 'Predicting College Football Upsets',
    text: 'Tests whether anything public beats the betting market’s closing spread at predicting college football games. It does not: the spread alone scored a Brier score (the average squared error of predicted probabilities; lower is better) of 0.177 against 0.244 for a naive baseline on the 2023 and 2024 seasons, and five added features gave no out-of-sample gain. The repository is private.',
    links: [],
  },
  {
    name: 'minivmm',
    text: 'A small virtual machine monitor in C, about 500 lines, on top of Linux KVM. It loads a flat 16-bit binary, handles port I/O, memory-mapped I/O and halts, and its output is compared against QEMU. One measurement, with its condition: a VM exit cost about 5.3 µs under nested KVM on WSL2 on a laptop, which says little about bare metal.',
    links: [{ label: 'Repository', href: 'https://github.com/trism-prism/minivmm' }],
  },
  {
    name: 'Internship Scout Agent',
    text: 'A weekly job pulls internship postings from a public GitHub feed, has Claude score each one against my résumé, and emails a digest of the matches scoring 70 or more. The README makes no accuracy claim, and neither do I.',
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
