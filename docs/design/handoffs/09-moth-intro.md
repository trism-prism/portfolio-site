# Handoff 9: the intro, the moth emerges

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **Intro**, **Mascot**, **Moth constellation**, **Characters**), section 2
(principle 4, Motion like a night sky) and section 7. Builds on handoffs 1–8; it replaces the old prism splash
in `src/components/shell/Chrome.tsx`. The designer reviews in the browser after it is built.

## Goal

The first visit of a session opens on the approved nine-frame storyboard,
`docs/design/mockups/mothsky-02-intro-storyboard.png` (source: `IntroSheet` in `src/components/lab/MothSky.tsx`):
- a constellation charts a chrysalis;
- the chrysalis turns prismatic;
- the moth emerges in one smooth, continuous motion;
- it unfolds its wings over the Moth constellation;
- a ring of light lights up the site as the moth flies into the nav logo.

It runs about **4.2 s** on **one eased timeline**: the frames are key moments, not steps, and each beat overlaps
the next by about 0.15 s. It can be skipped at any moment. Tristan asked for "longer, more detail, and a smooth,
continuous emergence", so the motion between the frames matters as much as the frames themselves.

## Source of truth

- **Frames, timings and notes:** the storyboard image and `IntroSheet`. Copy the geometry (`CHRYS`, the facets,
  `Rays`, and the 420 × 236 frame space); never import from `src/components/lab/`.
- **The moth:** the geometry in `src/components/ui/Moth.tsx`.
- **The Moth constellation:** `src/components/ui/MothConstellation.tsx`.

## 1. Timeline: pure module `src/components/shell/intro/timeline.ts` (+ `timeline.test.ts`)

- `INTRO_SECONDS = 4.2`. There are nine beats with the storyboard's ranges: 0.0–0.4, 0.4–1.0, 1.0–1.5, 1.5–1.9,
  1.9–2.3, 2.3–2.8, 2.8–3.3, 3.3–3.6 and 3.6–4.2 s. Each beat's progress is eased (cubic in-out) and starts
  0.15 s before its nominal start (beat 1 excepted), so neighbouring beats blend.
- `introState(t)` returns every animated value for time `t` (clamped to 0–4.2) as plain numbers. Rendering reads
  only this. The values:
  - stars faded in;
  - chrysalis points drawn;
  - facet opacity and the glow's breath;
  - seam width;
  - pulse scale;
  - how far the halves have parted;
  - the head rising, and the left and right antennae uncurling (separately; the left leads by about 0.12 s);
  - wing opening;
  - wing stars lit;
  - the Moth constellation's draw;
  - ring radius (as a fraction);
  - night-sky opacity;
  - flight progress.
- Tests:
  - the values at the nine key moments (0.2, 0.8, 1.3, 1.7, 2.1, 2.6, 3.1, 3.5 and 3.9 s) match the frames: for
    example, at 3.1 s the wings are partly open and only some wing stars are lit;
  - every value is continuous (no jump larger than a small epsilon between t and t + 1 ms);
  - `introState(4.2)` is the finished end state;
  - out-of-range values of t clamp.

## 2. The moth drawing (`src/components/ui/Moth.tsx`, additive only)

Export a new `MothEmerging` component from the same geometry (FORE, HIND, WING_STARS, body, Antennae, eyes), in the
160 × 120 spread box. Props, all 0–1:
- **`wings`:** 0 is folded and crumpled (each wing pair scaled about its root at the body to roughly 15% wide and
  80% tall, rotated slightly toward the body); 1 is exactly the `MothSpread` drawing. The interpolation is
  continuous, with the wings opening from the body outward.
- **`antennaeL`, `antennaeR`:** 0 is curled tight against the head (small spread, tips drooped); 1 is the normal
  antennae. Each side is drawn separately.
- **`wingStars`:** how many of the eight wing stars (with their faint lines) are lit, in order from the body
  outward.

`MothCharacter` and `MothMark` must render **byte-identical** markup to before. Add a test that renders every pose
and the mark with `react-dom/server` and compares the result with snapshots taken **before** your edit.

## 3. The intro component (`src/components/shell/intro/Intro.tsx`)

- **Where it renders:** it replaces `IntroSplash`. Remove the prism splash code from `Chrome.tsx` and update the
  import in `src/app/layout.tsx`.
- **When it plays:** the rules are unchanged. It plays on the first visit of a session only (sessionStorage
  `tm-intro`); never with Reduced motion, a `#hash`, `?project=`, or `navigator.webdriver`.
- **Review parameter:** `?intro` forces it to play, ignoring the flag and webdriver. `?intro=<seconds>` (e.g.
  `?intro=2.1`) shows it **frozen** at that time, for review captures. Read the parameter once, then remove it
  from the URL with `history.replaceState`.
- **The overlay:**
  - `position: fixed; inset: 0; z-index: 90`.
  - It always plays on the **night sky**, whatever the theme. Pin the dark values on the overlay (a `.intro-night`
    class setting `--constellation`, `--star`, `--star-halo`, `--accent-serif` and the spectrum tokens, as
    `.cover-stage` does), so the components inside draw in dark colours even in twilight.
  - The background is the dark sky gradient, with its own sparse seeded stars that fade in during beat 1.
- **The stage:** one SVG in the storyboard's 420 × 236 frame space, centred and scaled to `min(92vw, 760px)` wide.
  Round coordinates to one decimal.
- **Clock:** one `requestAnimationFrame` loop drives `t`, starting at mount.
- **Beats:**
  1. **Night.** Stars and the single anchor star fade in.
  2. **Charted.** From the anchor, the thread draws down, then the chrysalis points appear one by one with the
     line drawing through them. The next point shows a faint 6px glow just before it appears, as in frame 2.
  3. **Prismatic.** The facets fill in the spectrum colours, the outline turns white, and a soft lavender glow
     breathes once (scale 1 → 1.06 → 1).
  4. **Seam.** A bright vertical seam opens, with a wide, faint lavender bloom. The chrysalis pulses twice, small
     (1.03).
  5. **Head and antennae.** The halves part by about 3 units. Through the opening, `MothEmerging` (wings 0)
     rises behind the chrysalis, revealed from the top by a clip path. Its antennae uncurl, left then right.
  6. **Pulls free.**
     - The halves swing out and fall: translate, rotate about the base, drift down and fade.
     - The facets break into a few drifting shards that fade.
     - The spectrum `Rays` flash briefly.
     - The moth climbs up, wings still crumpled.
  7. **Wings expand.** `wings` goes 0 → 1, and `wingStars` follows a little behind.
  8. **Fully open.** `MothConstellation` (no name) draws in behind the moth, from the head outward, over this beat.
     Add an optional, timeline-driven `progress` prop (0–1) to `MothConstellation`; without it, its behaviour is
     unchanged. A faint gold glow sits behind the moth.
  9. **Light reaches the site.**
     - One wingbeat (wings 1 → 0.7 → 1) sends a **ring of light** outward from the moth. It is a lavender ring,
       2px, fading as it grows.
     - Inside the ring the overlay becomes transparent: a radial `mask-image` on the overlay, with the radius
       growing from 0 to past the viewport's diagonal. The real site shows through behind it.
     - The moth flies to the **nav logo** along a gentle curve, shrinking to the logo's size.
     - The night background's opacity falls to 0 over this beat, so in twilight the dusk sky comes through
       (storyboard note "Twilight").
- **The page behind:** use `data-intro` on `<html>` (handoff 7) with three states.
  - `'on'` from mount until beat 9 starts. This holds the hero entrance and the Moth draw, and it already works.
  - `'landing'` from the start of beat 9 until the end. The hero entrance plays as the ring passes, so the
    page lights up behind it: nav, then the name, then the rest.
  - Removed at the end.
  - While `data-intro` has any value, hide the nav logo's moth (`[data-intro] [data-intro-target]`, opacity 0). It
    fades in over the last 0.1 s as the flying moth arrives, so there is one moth, never two. Add
    `data-intro-target` to the logo link in `src/components/shell/Nav.tsx`; that attribute is the only Nav edit.
    Measure its rectangle when beat 9 starts.
- **Skipping:**
  - A **Skip intro** pill is visible from the first frame, bottom right, inset 16px, in the storyboard's style
    (`--panel` and `--line-2` dark values, 12px text). It's a real `<button>`, not focused automatically.
  - Any key, click, tap, wheel or scroll also skips (one listener set, removed afterwards).
  - Skipping jumps to the end state within **0.35 s**: the overlay fades out, `data-intro` moves through
    `'landing'` to removed, and the logo shows. It never jumps abruptly to a blank page.
- **Accessibility:** the stage SVG is `aria-hidden`. The overlay is not `aria-hidden`, because it contains the
  button.
- **Scroll:** don't lock scrolling; a scroll skips the intro.
- **When it ends:** remove the overlay from the DOM and set the session flag (as now).
- **Performance:** animate with transforms and opacity only; no SVG filters and no CSS `filter: blur`. React may
  re-render the stage each frame, but keep it small (about 100 nodes).

## Files

- **May touch:**
  - new `src/components/shell/intro/` (`Intro.tsx`, `timeline.ts`, `timeline.test.ts`, and small drawing pieces
    such as `Chrysalis.tsx`);
  - `src/components/shell/Chrome.tsx` (remove `IntroSplash`);
  - `src/app/layout.tsx` (the import and the element only);
  - `src/components/ui/Moth.tsx` (the additive `MothEmerging` export, plus the snapshot test);
  - `src/components/ui/MothConstellation.tsx` (the optional `progress` prop only);
  - `src/components/shell/Nav.tsx` (the `data-intro-target` attribute only);
  - `src/app/globals.css` (intro styles and the logo rule).
- **Must not touch:** `src/components/sections/**` (the hero's hold on `data-intro='on'` already works), `src/data/**`,
  tokens, the footer, `src/components/lab/**`, and `docs/DESIGN.md` (the designer records the review).

## Acceptance checks

- `pwsh -NoProfile -File scripts/check.ps1 -Tier quick` and `npm run build:dev` pass. If a dev server holds
  `out/`, stop the one you started or build in a temporary copy, and say which.
- The timeline tests and the moth snapshot test pass.
- **Screenshots** go in `docs/design/review/handoff-9/`, captured with `?intro=<t>` on the production build:
  - the nine key moments at 1440 dark;
  - 3.9 s and 4.3 s (the finished site) in twilight;
  - 0.8 s, 2.6 s and 3.5 s at 375 dark;
  - `compare.html` showing the storyboard beside a 3 × 3 grid of the nine 1440 frames, with images embedded so
    they load.
- **Video check:** record the full intro once (Playwright `recordVideo`, 1440 dark) and commit it if it is under
  5 MB. Otherwise report its path in the scratch folder.
- **Behaviour:**
  - skip at 1.0 s by button, key, click, wheel and touch: each reaches the end state within 0.35 s, and the hero
    entrance then plays;
  - a second load in the same session has no intro;
  - Reduced motion, `#about` and `?project=kiln` have no intro;
  - the logo moth is hidden during the intro and visible after, with never two moths;
  - the Moth draw and the route in the hero play after the ring passes.
- **Performance:** during one full intro, no long task over 50 ms (`PerformanceObserver` `longtask`). Report the
  average frame interval from a rAF counter on the production build.
- No console errors or hydration warnings; the old prism splash code is gone (`grep` for `intro-draw` and
  `sig-stroke` finds nothing).
- Report anything not verified, with the reason.

## Notes for the implementer

- A dev server may already serve this folder at `http://localhost:3217`; use it, or start the `dev` launch config.
- Playwright and the capture and check scripts from handoffs 7 and 8 are in `docs/design/review/handoff-7/` and
  `handoff-8/`. Playwright comes from the kiln checkout, and `MSYS_NO_PATHCONV=1` is needed in Git Bash.
- Commit on `feat/showcase-rebuild` in small steps (timeline and tests, `MothEmerging` and snapshot test, intro
  component, wiring and removal of the old splash, screenshots), with plain messages and no AI attribution. Do
  not push.
