# Handoff 6: Experience & education as one route, Skills rails restyled

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **Experience + education**, **Skills**, **Themed vocabulary**, **Cards**),
section 2, section 4 (Route, Star glyph, Card) and section 7. Builds on handoffs 4–5 (`SectionHeader`, `.panel` with
`data-tone`, `StarGlyph`). The advisor reviews in the browser before handoff 7.

## Goal

1. Experience and Education become **one section**, "Experience & education": a route map across both, then detail
   cards, as in `docs/design/mockups/theme-03-route-dark.png` and `theme-07-route-twilight.png`.
2. The Skills section keeps its moving marquee rails and gets the approved look (no mockup exists; the spec below
   is the design).

No content or data changes.

## Source of truth

- Route layout: `ThemeRoute` in `src/components/lab/ThemeLab.tsx` (copy; never import from `src/components/lab/`).
  The lab hardcodes four stops; the site builds them from data as described below.

## 1. One section: Experience & education

**Section list** (`src/data/sections.ts`):
- Remove the `education` entry and `'education'` from `SectionId`. Fix every type error this causes (nav, palette,
  section numbers come from this list, so they update themselves).
- The `experience` entry becomes: nav "Experience", kicker "Where I work and study", title "Experience &",
  accent "education".
- `src/app/page.tsx`: render only `<Experience />` for both; remove `<Education />`.
- Old links: keep an element with `id="education"` (and `scroll-margin-top` like the sections) on the education
  cards' column, so `#education` still lands in the right place.

**Route map** (one full-width card, 380px tall at 1440px):
- Stops, left to right, built from data and sorted by start date: every `education` record (oldest first, NOVA then
  JMU) and every `experience` record with `kind: 'primary'`, then one **ahead** stop for the expected graduation,
  whose date is the text after "Expected" in the current school's `period` ("Dec 2027"; if no "Expected" is found,
  leave the ahead stop out).
- Each stop: a 5px filled dot inside a 15px ring at 50% opacity, a mono uppercase kind label (WORK in `--kind-ai`,
  EDUCATION in `--rose`, AHEAD in `--route`), the title (display 17px: school or organisation, "Graduation" for the
  ahead stop) and the period (mono 11px, `--muted`). The ahead stop is hollow with a dashed ring. A record that is a
  placeholder (or whose period is a `ph()` string) shows "· start is a placeholder" after its period, in the
  placeholder colour.
- Positions: spread evenly from x = 210 to x = 1000 in a 1104 × 380 frame, with y alternating low/high
  (300, 210, 270, 170 for four stops; extend the pattern if there are more). Labels sit below a stop, except a stop
  that is higher than both neighbours, whose labels sit above it.
- The route: one dashed `--route` path (1.6px, dash 6 7) through the stops as a smooth curve (cubic segments, as in
  the lab path).
- Below 768px the map becomes vertical: stops top to bottom along a dashed `--route` line on the left, labels to
  the right of each stop, oldest at the top.
- Motion: the route draws once from left to right when the card scrolls into view (about 1.2 s, ease-out), stops
  fading in as the line reaches them. Reduced motion: shown complete.
- Accessibility: the map is `aria-hidden`; the detail cards below carry the same facts.

**Detail cards** (grid `1.4fr 1fr` at ≥768px, one column below):
- Left, the current role (first primary experience): card with tone `--kind-ai`; "Now · {period}" (13px,
  `--kind-ai`), role (display 26px), "{org} · {place}" (`--fg-2`), the first two points with `StarGlyph` bullets
  (glossary terms through `GlossText`), the stack as chips, and the existing "details" button that opens the
  existing `Modal` (keep the modal and its content, including the Formwork scene, unchanged).
- Right, one card per education record, newest first, tone `--rose`: period (13px, `--rose`), school (display
  20px), credential (14.5px, `--fg-2`), and its links if any as small underlined links. Keep placeholder markers.
- Secondary experiences (`kind: 'secondary'`), if any: a row of small cards below (role, org, period), keeping their
  placeholder ribbon.
- Remove the old vertical timelines (`Timeline`, `Dot`, `OrgMark`) once nothing uses them.

## 2. Skills (`src/components/sections/Skills.tsx`)

- Category cards stay a 2-column grid (wide ones span both). Each card is `.panel` with `data-tone`; tone by order
  through the spectrum: software, systems, ai, data, rose, route, then repeat (use the token variables).
- Card head: the label (display 19px) with a `StarGlyph` in the card's tone before it; the item count on the right as
  mono 11px `--muted` ("12 items"); the blurb below (14px, `--fg-2`).
- Rail items: rounded pills (`border: 1px solid var(--line)`, `background: var(--panel-2)`, 12.5px, `--fg`), each with
  a 6px dot in the card's tone before the text. Keep the rail mechanics exactly: measured speed, reverse on alternate
  cards, pause on hover, the screen-reader list, and no animation in Reduced motion.
- Secondary groups (CS fundamentals, soft skills, interests): three `.panel` cards (no dashed border), each with a mono
  uppercase label in `--muted` and its items as the same pills without dots.

## Files

- **May touch:** `src/components/sections/Experience.tsx`, `src/components/sections/Skills.tsx`,
  `src/data/sections.ts` (the two entries and the type only), `src/app/page.tsx` (the Education render only),
  any file that fails to compile only because `'education'` left `SectionId` (minimal fix), `src/app/globals.css`
  (rail pill styles, `scroll-margin` if needed).
- **Must not touch:** `src/data/experience.ts`, `src/data/education.ts`, `src/data/skills.ts`, the details `Modal`'s
  content, `src/components/scenes/**` (including `FormworkScene`), `src/components/ui/**`, the footer, tokens,
  `src/components/lab/**`.

## Acceptance checks

- `npm run check`, `npm test`, `npm run build:dev` pass. If a dev server holds `out/`, stop the one you started or
  build in a temporary copy, and say which.
- Section numbers now run 01 About, 02 Experience & education, 03 Skills, 04 Projects, …; the nav, "More" menu and
  command palette list no Education entry; `/#education` scrolls to the education cards.
- Screenshots under `docs/design/review/handoff-6/` at 1440px and 375px, dark and twilight: the whole route section,
  a side-by-side with `theme-03-route-dark.png` and `theme-07-route-twilight.png`, the vertical route at 375px, the
  Skills section, and the details modal still opening.
- Rails: same speed for all, reverse on alternate cards, pause on hover, still in Reduced motion.
- Route draws once on scroll; complete in Reduced motion.
- No console errors or hydration warnings.
- Report anything not verified, with the reason.

## Notes for the implementer

- Start a dev server with the `dev` launch config (port 3217) if none is running. Capture script and gotchas:
  `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Round SVG coordinates computed in code to one decimal to avoid hydration warnings.
- Commit on `feat/showcase-rebuild` in small steps (route section, then Skills), plain messages, no AI attribution.
  Do not push.
