# Handoff 8: Projects as a sky map whose legend is the filter

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **Hero and Projects**, **Where projects appear**, **Project covers**,
**Projects rule scope**, **Themed vocabulary**, **Cards**), section 2, section 4 (Legend chip, Star glyph, Card) and
section 7. Builds on handoffs 1–7. The designer reviews in the browser before handoff 9.

## Goal

The Projects section matches `docs/design/mockups/theme-02-projects-dark.png` and `theme-06-projects-twilight.png`.
It has four parts:
- a **sky map** card with one small constellation per project kind, which works as the filter;
- rounded **legend chips** and a search pill;
- a **spotlight** card with measurements;
- the **project cards**, restyled.

The cover animations stay exactly as they are (decided). Filtering, search, sorting, deep links (`?project=<slug>`)
and the details modal keep working as they do now.

## Source of truth

- Layout and type: `ThemeProjects` in `src/components/lab/ThemeLab.tsx` and the two mockups. Copy from the lab;
  never import from `src/components/lab/`.
- Behaviour that already exists and must keep working: `src/components/sections/Projects.tsx` and
  `src/lib/search.ts` (`filters`, `filterProjects`, `counts`; don't change their logic).
- Kind colours: `--kind-software`, `--kind-ai`, `--kind-data`, `--kind-systems`. These replace the old `kindColor`
  map (`--accent`/`--violet`/`--amber`/`--sky`) everywhere in `Projects.tsx`, the modal included.

## 1. Sky map layout: pure helper `src/components/sections/skyMap.ts` (+ `skyMap.test.ts`)

The map is generated from `projects`, so a new project joins it with no code change, as with the footer quiz.
- `layoutSkyMap(projects, cols: 4 | 2)` returns one group per kind, in `filters` order (software, ai, data,
  systems). Each group has its stars and its label position. The view box is 1104 × 210 when `cols = 4`, where
  each kind gets a 276-wide column. It is 552 × 380 when `cols = 2` (a 2 × 2 grid for phones).
- Each star's position depends **only on its own slug**: an FNV hash (`src/lib/fnv.ts`) seeds a point inside its
  kind's cell. The inner area is the cell inset by 36px on each side, with the bottom 44px kept clear for the
  label. If a star lands within 30px of a star already placed (process stars by date, oldest first), step it
  along a fixed spiral until it is clear. So adding a project never moves an older star unless it collides
  with it.
- Each group's lines join its stars in **date order**: the line is a path through time, not decoration.
  A kind with one project has no line.
- Round every coordinate to one decimal (hydration).
- Tests:
  - the layout is deterministic;
  - every star sits inside its cell's inner area;
  - all stars are at least 30px apart;
  - adding a synthetic project leaves every existing star's position unchanged, given the current data has no
    collision with it;
  - every project in `projects` appears exactly once;
  - both `cols` values work.

## 2. Sky map component: `src/components/sections/SkyMap.tsx`

A `.panel` card 210px tall at ≥768px, drawn from the helper. Below 768px it uses the 2 × 2 layout.
- Star sizes, which follow the mockup:
  - featured: a 4px core with an 11px halo at 20%;
  - other projects: a 2.6px core with a 6px halo;
  - the spotlight: a dashed ring around it as well (r 15, `stroke-dasharray 2 3`, kind colour at 45%).
- Lines and stars are in the kind colour, lines at 50%. The kind name sits under each group in Instrument Serif
  italic, 19px, kind colour.
- **The legend is the filter.** Each group is a real `<button>`, an HTML overlay on its column with
  `aria-pressed` and the label "Software, 4 projects". Pressing it sets the filter to that kind; pressing the
  active kind returns the filter to **All**. The chips and the map share one `filter` state, so they always
  agree.
- State is shown by opacity, with a 300ms transition (none in Reduced motion):
  - a kind filter dims the other groups to 30%;
  - **Featured** dims non-featured stars to 40%;
  - a search query dims stars that don't match it to 20%;
  - **All** with no query shows everything at full strength.
- Stars are for pointer users and sit above the group buttons. Hovering one shows a small label: the project
  title in 13px `--fg` on a `--panel` chip with a `--line` border, and the period in mono 11px `--muted`. Clicking
  a star opens that project's details, the same as clicking its card. Stars are `aria-hidden`, because keyboard and
  screen-reader users reach every project through the cards.
- The lines draw once when the map first scrolls into view (`useSeenOnce` in `src/lib/hooks.ts`), group by group,
  about 0.9s in all. In Reduced motion they are drawn complete. Use the same `pathLength`/`stroke-dashoffset`
  pattern as `MothConstellation`, so server output is the finished frame.

## 3. Legend chips and search (`Projects.tsx`)

The order on the page is the map, then a row of chips with the search on the right (≥1024px; it stacks below
that), then a quiet result line, then the cards.
- **Chips:** `rounded-full`, 40px tall, 13.5px Inter (not mono).
  - Kind chips start with `StarGlyph` in the kind colour. **All** and **Featured** have no glyph.
  - The count follows at 65% opacity.
  - Selected: `--button-bg` / `--button-fg`, no border.
  - Unselected: `--panel` fill, `--line` border, `--fg-2` text, `--fg` on hover.
  - Keep the existing rule that hides a zero-count chip while searching.
- **Search:** a `rounded-full` pill, 300px wide at ≥1024px and full width below, with the placeholder "Search projects
  or technology". Keep the sr-only label and the search icon.
- **Result line:** keep the `aria-live` "N of M projects" line, in mono 12px `--muted`. Drop the "Spotlight, then
  newest" note.

## 4. Spotlight card

This is the existing wide spotlight variant (shown when not searching), restyled to the mockup.
- A `.panel` with `data-tone` in the kind colour. At ≥1024px it is a grid with `minmax(0,1.15fr) minmax(0,1fr)`
  columns and at least 520px tall. The cover is on the left, with a `--line` divider; the cover keeps its own dark
  stage in twilight. Below 1024px the cover stacks above the text at 16 / 10.
- Text side, 32px padding:
  - the kicker line `★ Spotlight · Systems · Nov 2026`, 13px `--fg-2`, with `StarGlyph` in the kind colour;
  - the title, display 34px;
  - the summary, 15.5px `--fg-2`;
  - the badge (if any), as one quiet `.chip`;
  - a **measurements** row of three rounded tiles (12px radius, `--line` border, 12px padding), each with a value
    in display 22px bold and a label in 12.5px `--muted`;
  - at the bottom, **Details** (`--button-bg`/`--button-fg`) and **Source** (outlined); **Live** if
    `links.live`, or "Private repository" in mono `--muted` when there is no repo.
- Measurements come from data. Add an optional
  `measures?: { value: string; label: string }[]` to `Project` in `src/data/projects.ts`, and fill it for the
  visibility engine only, with these exact values. They come from the public repo's `BENCHMARK.md`, and every
  number carries its condition (copy rule).
  - `{ value: '127x', label: 'faster at best, on 4,000-wall mazes' }`
  - `{ value: '66', label: 'benchmark rows' }`
  - `{ value: '4', label: 'wall layouts tested' }`
  - A spotlight without `measures` simply has no row.

## 5. Project cards

Each card is a `.panel glow-card liftable` with `data-tone` in the kind colour. Keep the pointer glow.
- **Cover:** on top, 16 / 10, with a `--line` divider. Clicking it opens the details, as now.
- **Body**, 20px padding:
  - a line with `StarGlyph` (9px) and the kind label, then `· Live` or `· In progress` when that is the status
    (nothing for complete), in 12.5px `--fg-2`, with the period right-aligned in `--muted`;
  - the title, display 22px, as the button that opens the details;
  - the summary, 14px `--fg-2`, two lines;
  - one quiet line with the first four technologies joined by " · ", in mono 11.5px `--muted`, plus `+N` if
    there are more. This shows a search's technology match without the old chip row.
- **Drop** from the cards: the status and badge chips, the tech chip list and the button row. Source, Live and the
  badge stay in the spotlight and the details modal.
- The grid is unchanged: 1 / 2 / 3 columns, and the spotlight spans the full row when it shows as wide.

## Files

- **May touch:**
  - `src/components/sections/Projects.tsx`
  - new `src/components/sections/SkyMap.tsx`, `skyMap.ts` and `skyMap.test.ts`
  - `src/app/globals.css` (Projects styles only)
  - `src/data/projects.ts`: the `measures` type and the visibility engine's values only. Keep
    `src/data/data.test.ts` passing; extend it only if it checks project fields.
- **Must not touch:** `src/lib/search.ts` logic, `src/components/scenes/**` (covers and demos), the modal component
  `src/components/ui/Modal.tsx`, other sections, the hero, footer, nav, tokens, `src/components/lab/**`, and
  `docs/DESIGN.md` (the designer records the review).

## Acceptance checks

- `pwsh -NoProfile -File scripts/check.ps1 -Tier quick` and `npm run build:dev` pass. If a dev server holds `out/`,
  stop the one you started or build in a temporary copy, and say which.
- `skyMap.test.ts` covers the cases in section 1.
- Screenshots go in `docs/design/review/handoff-8/`:
  - the Projects section at 1440, 1024, 768 and 375px, dark and twilight, with **Featured** selected;
  - at 1440 dark: **All**; **AI** chosen from the map; a search for `Python` with the dimmed stars; the hover label
    on a star;
  - `compare.html` with `theme-02-projects-dark.png` and `theme-06-projects-twilight.png` beside the 1440 shots,
    embedded so they actually load.
  - The capture scripts in `docs/design/review/handoff-7/` and the Playwright install noted there can be reused.
- Behaviour:
  - map buttons and chips stay in sync, in both directions;
  - pressing the active kind returns to All;
  - Tab reaches the four map buttons, and Enter or Space toggles them;
  - clicking a star opens the right project;
  - `?project=kiln#projects` still opens Kiln on load;
  - the search empty state still works.
- Twilight: the chip, label and tile text meets 4.5:1 against its fill (report the ratios), and the covers stay on
  their dark stages.
- Motion: the map's lines draw once on first view; Reduced motion shows them complete; nothing in the section
  loops apart from the existing cover scenes.
- No console errors or hydration warnings.
- Report anything not verified, with the reason.

## Notes for the implementer

- A dev server may already serve this folder at `http://localhost:3217`; use it, or start the `dev` launch config if
  none is running. Gotchas: `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Commit on `feat/showcase-rebuild` in small steps (layout helper and tests, sky map, chips and search, spotlight,
  cards, screenshots), with plain messages and no AI attribution. Do not push.
