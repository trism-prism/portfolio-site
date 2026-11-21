# Handoff 7: the hero with the Moth constellation, chart-marker tech tiles

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **Hero and Projects**, **Moth constellation**, **Where projects appear**,
**Name in the hero**, **Tech tiles**, **Themed vocabulary**), section 2, section 4 (Chart marker, Route) and
section 7. Builds on handoffs 1–6. The advisor reviews in the browser before handoff 8.

## Goal

The hero matches `docs/design/mockups/theme-01-hero-dark.png` and `theme-05-hero-twilight.png`, with two approved
changes to those frames: the constellation is **the Moth** (variant A, soft spectrum, no project labels) instead
of the labelled "Prism" triangle, and **no project appears in the hero**. The floating tech tiles take the
chart-marker look everywhere they appear.

## Source of truth

- Layout and type: `ThemeHero` in `src/components/lab/ThemeLab.tsx`.
- The figure: `SPREAD`, `LINES`, `SOFT` and `MothFigure` in `src/components/lab/MothSky.tsx`, and
  `docs/design/mockups/mothsky-01-moth-constellation.png`.
- Copy from the lab; never import from `src/components/lab/`.

## 1. Reusable constellation: `src/components/ui/MothConstellation.tsx`

- Props: `size` (rendered width; height = width × 260/400), `named` (show "the Moth" below), `draw` (animate the
  lines on mount), `className`. Draws in a 400 × 260 viewBox: the 15 lines in `--constellation`; the head star
  brightest (`--star`, 4.6px with a 13px halo at 16%, `--star-halo` ring); the five `SOFT` stars in spectrum tokens
  (3.4px, 9px halo at 18%); the rest 2px `--star` dots. Name in Instrument Serif italic, 20px, `--accent-serif`.
- `aria-hidden`. Expose the head star's position (`MOTH_HEAD = [200, 66]` in viewBox units) for the route and,
  later, the intro.
- `draw`: lines appear one after another from the head outward over about 1.4 s (ease-out), stars fading in as
  their first line reaches them. Reduced motion: drawn complete.

## 2. Hero layout (`src/components/sections/Hero.tsx`)

At ≥1024px, left-aligned in the 1152px content width (the current hero is centred; change it):
- Left column (max 620px): status pill (keep the green pulse), then
  `h1`: "Hi, I'm" on one line, the name below in `font-sig` at 1.35em with a **spectrum gradient** across it
  (`--kind-software` → `--kind-systems` → `--kind-ai` → `--rose` → `--route`), and the full stop in `--route`;
  the subhead "I build software you can *inspect*." (keep `ProximityText`; accent word Instrument Serif italic in
  `--fg`); the intro paragraph; buttons **See projects** (primary, `--button-bg`/`--button-fg`) and **Read CV**
  (outlined); then, on a second row, the existing **Résumé PDF** link and the LinkedIn / GitHub / email icon buttons.
- Right side: `MothConstellation` (`named`, `draw`) at about 460px wide, centred around x ≈ 1030, y ≈ 400 of a
  1440 × 900 viewport, behind nothing interactive.
- The route: a dashed `--route` path (1.5px, dash 5 6) from a "you are here" marker near the bottom centre
  (≈ 640, 770) curving up to the moth's head star, as in the mockup; the marker is a 6px ring with a 2px dot and the
  label `YOU ARE HERE · LEESBURG, VA` in mono 10.5px, wide tracking, `--route`. The route draws after the
  constellation (about 0.8 s). Reduced motion: complete.
- **Remove** from the hero: the large moth mark above the status pill (the moth lives in the nav logo), and the
  "Latest" project links row (projects appear only in the Projects section; the same items are in Activity).
- 640–1023px: single centred column of text; the constellation sits behind the text at the top right at 60% scale
  and 55% opacity; the route and marker are hidden.
- Below 640px: text only; constellation, route and marker hidden.
- Keep `id="hero"`, `aria-labelledby`, the `hero-in` entrance timings and `data-annotate` attributes.

## 3. Tech tiles as chart markers (`TechField` in `src/components/shell/Ambient.tsx`)

Keep the tiles' content, positions, side columns, parallax and visibility rules exactly as they are; change only
their drawing, so they read in both themes (they are faint in twilight today):
- Each tile is a round chart marker: a filled circle (`--panel`, 1px `--line` border, radius = tile size × 0.38), an
  outer dashed ring (radius × 1.2, `stroke-dasharray 2 4`, the tile's colour at 60%), and four short cross ticks at
  12, 3, 6 and 9 o'clock in the tile's colour, as in the mockup's left column.
- Label: mono bold, `--fg` (not the tile colour), so it meets contrast in twilight.
- Tile colours come from the spectrum tokens (cycle software, systems, ai, rose, route by index) instead of the
  hard-coded hex values, so twilight uses its darker set.

## Files

- **May touch:** `src/components/sections/Hero.tsx`, new `src/components/ui/MothConstellation.tsx`,
  `src/components/shell/Ambient.tsx` (`TechField` drawing and its tile colours only), `src/app/globals.css` (hero
  and tile styles only).
- **Must not touch:** `src/data/**` (including `latest` and `personal`; the Latest row simply stops rendering),
  `src/components/ui/Moth.tsx`, `SectionHeader`, `AmbientBackground`, `ProgressBar`, the nav, the intro splash in
  `Chrome.tsx` (a later handoff), the footer, tokens, `src/components/lab/**`.

## Acceptance checks

- `npm run check`, `npm test`, `npm run build:dev` pass. If a dev server holds `out/`, stop the one you started or
  build in a temporary copy, and say which.
- Screenshots under `docs/design/review/handoff-7/` at 1440px, 1024px, 768px and 375px, dark and twilight, of the
  hero, plus a side-by-side with `theme-01-hero-dark.png` and `theme-05-hero-twilight.png` (embed the images so the
  comparison file actually shows them: earlier comparison pages used relative paths that broke).
- `grep -n "latest\|featured" src/components/sections/Hero.tsx` finds nothing.
- Tech tiles: readable in twilight (label contrast ≥ 4.5:1 against the tile fill), same positions and parallax as
  before; screenshot a section further down showing the side tiles.
- Motion: the constellation draws, then the route; Reduced motion shows both complete; nothing loops except the
  existing pulse and the backdrop twinkle.
- No console errors or hydration warnings.
- Report anything not verified, with the reason.

## Notes for the implementer

- A dev server may already serve this folder at `http://localhost:3217`; use it, or start the `dev` launch config if
  none is running. Capture script and gotchas: `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Round SVG coordinates computed in code to one decimal to avoid hydration warnings.
- Commit on `feat/showcase-rebuild` in small steps (constellation component, hero layout, tech tiles), plain
  messages, no AI attribution. Do not push.
