# Handoff 5: About, Achievements, Focus areas, Stats

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **About, Achievements, Focus areas, Stats**, **Where projects appear**,
**Projects rule scope**, **Stats extras**, **About photo**, **Themed vocabulary**, **Cards**), section 2, section 3
and section 7. Builds on handoff 4 (section heading, `.panel` with `data-tone`, `StarGlyph`, star-field backdrop).
The advisor reviews in the browser before handoff 6.

## Goal

The four sections match their approved mockups in dark and twilight. Content and data stay the same; only layout
and presentation change, plus the removals listed below.

## Source of truth

- Mockups: `docs/design/mockups/sections-01..04-*-dark.png` and `sections-05..08-*-twilight.png`.
- Layout reference: `AboutSheet`, `AchievementsSheet`, `FocusSheet`, `StatsSheet` in
  `src/components/lab/SectionsLab.tsx` (copy layout and sizes; never import from `src/components/lab/`).
- **Differences from the lab code** (decided after the mockups):
  - Focus cards have **no** small star figure in the top-right (`EvidenceFigure` is not built).
  - Placeholders use the site's existing `Text` / `PhRibbon` components, not the lab's `T` helper.
  - The lab's `Header` is already built (handoff 4's `SectionHeader`); use `SectionHeader`.

## Shared rules

- Cards are `.panel` with `data-tone` and `--tone` for the thin top bar where the mockup shows one.
- Star bullets and legend marks use `StarGlyph`. Kind colours come from the handoff 1 tokens
  (`--kind-software`, `--kind-systems`, `--kind-ai`, `--kind-data`, `--rose`, `--route`).
- Mono uppercase labels (11px, wide tracking, `--muted`) only for small labels, never prose.
- Keep every existing entrance animation (`Reveal`, `CharacterReveal`) and its Reduced-motion behaviour.
- Below 768px every multi-column grid becomes one column, in reading order; cards keep their padding.

## 1. About (`src/components/sections/About.tsx`)

- Left column (7/12): the "Now" pill stays above the greeting; greeting (`CharacterReveal`, display 34px); intro
  paragraph (`personal.intro`, 17px, `--fg-2`); the four `personal.about.cards` as a 2 × 2 grid of cards. Each card:
  mono label with a `StarGlyph` in its tone colour (Work = software, Study = ai, Projects = systems,
  Outside of code = data), then the text through `GlossText` (keep glossary terms) at 14px, `--fg-2`.
- Right column (5/12): two cards stacked.
  - "Things I keep coming back to": `personal.interests` as one constellation. A 56px-wide strip on the left holds
    one star per interest (spectrum colours in order, faint halo) joined by a `--constellation` polyline, the stars
    zig-zagging at x = 14, 40, 22, 46; each interest's text sits in a 62px row to the right.
  - Facts: `personal.about.facts` as rows (mono label left, value right, hairline between rows).
- **Remove** the `Avatar` (photo placeholder, its orbit of tech tiles and the inline prism triangle).

## 2. Achievements (`src/components/sections/Achievements.tsx`)

- Three columns: Honours, Certifications, Competitions. Each column has a mono label with its count on the right,
  then its cards stacked with 12px gaps.
  - Honour card: `StarGlyph` in `--rose` + title (display 19px), org (14px, `--fg-2`), dates (mono 12px).
    Tone bar `--rose`.
  - Certification card: name (display 17px), issuer, then a row with the level as one to three `StarGlyph`s in
    `--kind-systems` (professional 3, associate 2, foundational 1; unlit ones at 25% opacity) plus the level word,
    and the issued date on the right. Tone bar `--kind-systems`.
  - Competition card: event (display 17px), result with a `StarGlyph` in the medal colour (gold `#fbbf24`,
    silver `#c8cbd8`, bronze `#d08a52` in dark; in twilight use `--route` for all three), date. Tone bar in the
    medal colour (or `--muted` with no medal).
- Below: "Badges · N" label and the badges as rounded chips with a small `StarGlyph`.
- Keep all placeholder markers and `PhRibbon`s.

## 3. Focus areas (`src/components/sections/Focus.tsx`)

- The lead area (`lead: true`) is a full-width card: title (display 30px), its points in two columns, then a
  hairline and the "Backed by" row.
- The other six in a 3-column grid of cards: title (display 21px), points (one column), hairline, "Backed by" row.
- Points: small round bullet (3px, `--muted`), 14px, `--fg-2`.
- "Backed by": mono label, then each evidence item as a rounded chip with a `StarGlyph` in the project's kind
  colour (`--route` for `#experience`), keeping the existing click behaviour (open the project, or go to
  Experience). Formwork's chip reads "Formwork internship".
- **Remove** the per-area animated art (`SceneHost` + `focusArt`) from this section. Do not delete
  `src/components/scenes/FocusArt.tsx` or change its data test; it simply stops being rendered here.

## 4. Stats (`src/components/sections/Stats.tsx`)

- "Highlights": the four highlight stats as cards in a row. Each: a hairline chart 132 × 40 drawn in the card's
  colour (systems, ai, data, software in order) by motif: `rise` (curve ending in a dot over a baseline), `ticks`
  (30 bars, the last two dim), `ring` (progress ring at 96.4%), `spark` (zig-zag line over a baseline); then the
  value (display 54px, keep `CountUp`), label (15px semibold), note (13px, `--muted`). Tone bar in the same colour.
- "Shipping" and "Scale": two cards side by side, each a list of its four stats: value (display 30px) in a 110px
  column, then label (14px semibold) and note (13px, `--muted`) on one line; hairlines between rows.
- Contribution heatmap: keep it, below the two lists, in one full-width card titled with a mono label
  ("Contributions"). Restyle the cells as a quiet grid of small stars: each day a 3px dot, opacity by level
  (0 → 0.08, then 0.3 / 0.5 / 0.75 / 1) in `--fg`; today ringed in `--route`. Keep its data loading, states and
  error handling exactly as they are.
- **Do not render** the coding-profile cards (leave `codingProfiles` in `src/data/stats.ts`).

## Files

- **May touch:** `src/components/sections/About.tsx`, `Achievements.tsx`, `Focus.tsx`, `Stats.tsx`, and
  `src/app/globals.css` only for small section-specific classes if inline styles get unwieldy.
- **Must not touch:** `src/data/**`, `src/components/ui/**` (use `SectionHeader`, `StarGlyph`, `Text`, `Gloss`,
  `Reveal` as they are), `src/components/scenes/**` (including `FocusArt.tsx`), `src/lib/calendar.ts`, the footer,
  tokens, `src/components/lab/**`.

## Acceptance checks

- `npm run check`, `npm test`, `npm run build:dev` pass. If a dev server locks `out/`, stop the one you started,
  or build in a temporary copy, and say which.
- Screenshots under `docs/design/review/handoff-5/` at 1440px and 375px, dark and twilight, of each of the four
  sections in full, plus a side-by-side with each mockup in `docs/design/mockups/sections-*`.
- Placeholders still show their amber treatment; `npm run build` (production) still refuses while they remain
  (expected).
- Focus chips still open the right project or go to Experience; glossary terms in About still work.
- Heatmap: placeholder state renders; if live data is configured, the loading and error states still work.
- Reduced motion: entrance animations show their finished state; `CountUp` shows final values.
- No console errors or hydration warnings.
- Report anything not verified, with the reason.

## Notes for the implementer

- No dev server may be running for this folder; start one with the `dev` launch config (port 3217) if needed.
  Capture script and gotchas: `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Round SVG coordinates computed in code to one decimal to avoid hydration warnings.
- Commit on `feat/showcase-rebuild`, one commit per section is ideal, plain messages, no AI attribution. Do not push.
