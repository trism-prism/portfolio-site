# Handoff 3: the four footer scenes, rebuilt around the moth

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **Mascot**, **Characters**, **Footer scene set**, Name in the hero),
section 2 principle 4 (motion like a night sky) and section 7 (handoff rules). Builds on handoff 1 (tokens) and
handoff 2 (`src/components/ui/Moth.tsx`). The advisor reviews the result in the browser before handoff 4 starts.

## Goal

The footer's switchable scene set becomes the four approved night-sky scenes with the moth as the only
character: **Lantern**, **Star trails**, **Name the constellation**, **Orbit**. No people anywhere. Each scene
keeps the interaction of the scene it replaces. Afterwards nothing in the live site imports the prism or the cast.

## Source of truth

- Frames: `docs/design/mockups/footer-01-lantern.png` … `footer-04-orbit.png`.
- Drawing and spec text (Interaction / Response / Idle / Reduced motion): `src/components/lab/FooterMoth.tsx`
  (`footerConcepts`). Copy shapes from it; never import from `src/components/lab/` in site code.
- Character: `MothCharacter` / `MothMark` from `src/components/ui/Moth.tsx` (handoff 2). Spread poses
  (`wave`, `jump`, `cheer`) are the flying moth; seated poses (`sit`, `idle`, `wink`, `sleep`, `crouch`, `land`)
  use `MOTH_FEET_Y` / `mothFeetInset` to stand exactly on a surface.

## What exists already (reuse it)

- `src/components/footer/Footer.tsx`: the scene frame (3:1 `Stage` of `FW × FH` = 720 × 240), previous/next
  buttons, dots, swipe, pause button, saved scene in `localStorage` (`tm-footer-scene`), the email button whose
  hold drives `hold` (0–1) and which listens for `emit({ type: 'email-pulse' })`, `idle` after 30 s.
- `src/components/footer/Scenes.tsx`: `FooterSceneProps = { t, reduced, hold, idle }`, the `footerScenes` list,
  the scroll-velocity handler in `GameDay`, the visibility code used by `Lightroom` (`@/lib/visibility`:
  `visibility`, `polyPath`, `raySeg`), helpers in `@/lib/kit`.
- The stage is dark in both themes (handoff 1 scoped the dark scene variables onto it). Scenes are drawn in
  fixed night colours, so they look the same in dark and twilight, as the frames show.

## Composition at 720 × 240

The lab frames are 1104 × 400. Keep `FW`/`FH` and the 3:1 frame; recompose each scene at 720 × 240 rather than
squashing it: scale the lab geometry by about 0.65 and trim sky from the top so the ground line sits at y ≈ 205.
Shared pieces, drawn once in a small `footer/Night.tsx` and used by all four:
- Sky: vertical gradient `#07080f` → `#10142c` (70%) → `#1c2350` at the horizon, faint graticule arcs
  (`rgba(255,255,255,.045)`), about 120 seeded stars (`mulberry32`, coordinates rounded to one decimal).
- Hills: far hill `#141a3a`, near ground `var(--footer-ground)` (`#0b0e20`).
- One mono annotation at top-left (11px, letter-spacing 2, `#8a879c`), plain words, as in each frame.

## The four scenes

Replace the contents of `footerScenes` with these four, in this order, with ids `lantern`, `trails`, `quiz`,
`orbit`, names as below, and `label`s taken from the lab spec's Interaction sentence (used as the scene's
accessible description). A saved id that no longer exists falls back to the first scene (current code already
ignores unknown ids; keep it that way).

1. **Lantern** (replaces Lightroom)
   - Five standing stones on the hill; each stone is a set of wall segments for `visibility`. The pointer
     position (within the stage) is the lantern; the glow is a radial gradient clipped to the computed
     visibility polygon (as `Lightroom` does), so stones cast real shadows.
   - The moth (`wave`, about 56px wide) circles the lantern on a tilted ellipse (rx ≈ 64, ry ≈ 24), one lap
     every ~6 s on the scene clock, facing its direction of travel (`flip`).
   - Each stone carries a small carved constellation (3–5 dots and lines). A stone whose centre is lit (use the
     same `raySeg` test as `litBy`) shows it in gold `#f5c45e`; unlit stones show it in `#343c66`.
   - No pointer, or pointer left the stage: the lantern eases to the top of the tallest stone over ~1.2 s and
     the moth lands beside it (`sit`). `idle`: the moth sleeps.
   - Reduced motion: lantern mid-hill, moth seated beside it; the visibility polygon still follows the pointer.

2. **Star trails** (replaces Game day)
   - The pole star sits upper-right (≈ 500, 60). Exposure is an angle in degrees: scrolling down adds to it in
     proportion to scroll speed, scrolling up rewinds it; clamp to 0–360. Reuse the `GameDay` scroll handler.
   - Each of about 100 seeded stars draws an arc around the pole star whose sweep equals the exposure; ~1 in 9
     uses a spectrum colour, the rest white at 0.25–0.8 opacity. Clip trails to the sky above the hills.
   - An old survey pillar (tapered stone, cap, small brass plate) stands at x ≈ 200; the moth sits on its cap,
     eyes looking up while the exposure grows (`cheer` for a beat when it passes each 90°, otherwise `sit`).
   - The annotation reads `EXPOSURE 40°` with the live value, rounded to whole degrees.
   - `idle`: the moth sleeps and the exposure decays back to 0 over ~4 s.
   - Reduced motion: a finished 40° exposure; no scroll response.

3. **Name the constellation** (replaces Trivia)
   - Figures live in a new data file `src/components/footer/figures.ts`: for each, the project `slug`, the star
     points, the line segments, which segments are dashed, the brightest star, and a one-line hint. Start with
     these three (coordinates in the 720 × 240 frame):

     | Project slug | Stars and lines | Brightest | Hint |
     |---|---|---|---|
     | `2d-visibility-engine` | light (360, 62); walls (280, 50)–(305, 120) and (420, 104)–(470, 72) as solid lines; dashed rays from the light to all four wall ends | the light | "Think about what a light can see." |
     | `docs-qa-copilot` | page outline (310, 38)–(410, 38)–(410, 140)–(310, 140) closed; text lines (325, 64)–(395, 64), (325, 88)–(380, 88), (325, 112)–(390, 112); citation star (446, 54) dashed to (395, 64) | the citation star | "Think about answers that cite their source." |
     | `heart-disease-prediction` | pulse line (270, 104)–(318, 104)–(340, 62)–(362, 140)–(384, 86)–(404, 104)–(450, 104) | (340, 62) | "Think about a pulse." |

   - Three answer buttons (the right project title plus two others from `projects`, shuffled with a seeded
     shuffle so server and client agree), styled as the rounded chips in `footer-03-quiz.png`, plus an
     "Another" button that moves to the next figure.
   - Wrong guess: that chip dims with a line-through, the hint appears above the chips, the moth plays `crouch`
     for ~0.4 s (its antennae shake). Right guess: the figure lines brighten to lavender `#cfc9f5`, its name
     appears below in Instrument Serif italic (`the Visibility Engine`, etc., from the project title), the moth
     flies (`jump` then `cheer`) to the brightest star, and a shooting star crosses toward the lower right, then
     `emit({ type: 'email-pulse' })` as Trivia does today.
   - Each visit starts on a different figure (seeded by date is fine).
   - Reduced motion: figure fully drawn; answers work the same; the moth hops (`crouch` → `sit`) instead of
     flying; no shooting star.
   - Add `src/components/footer/figures.test.ts`: every slug exists in `projects`, every line and the brightest
     star refer to existing points, all points lie inside 720 × 240.

4. **Orbit** (recast)
   - An armillary sphere (three rings, gold `#f5c45e` and lavender, a bright core star) on a stone plinth on the
     hill crest at (360, ~140). The moth (`wave`) flies a tilted orbit (rx ≈ 150, ry ≈ 42) around it: scale
     0.8 at the back to 1.1 at the front, drawn behind the sphere on the back half and in front on the front
     half; a fading trail of ~20 lavender dots follows it along the front arc.
   - `hold` speeds the orbit up to ~4× and turns stars into short arcs around the top of the frame whose length
     grows with `hold` (as in `footer-04-orbit.png`); releasing eases both back over ~0.8 s.
   - `idle` (30 s): the moth lands on the sphere (`sit`, then `sleep`); any input wakes it with one `cheer`.
   - Reduced motion: the moth seated on the sphere; rings still.

Motion follows principle 4: slow, sparse, interruptible; nothing loops fast except Orbit while the email button
is held. Pausing (the existing pause button) freezes the scene clock as today.

## Signature

`DESIGN.md` section 3 (Type) puts Sacramento on the footer signature, and the frames show it; the live footer has
none. Add "Tristan Morton" in `font-sig` (about 30px, `--fg`) centred under the scene controls, above the existing
footer text. Use `personal.name`.

## Clean-up

- Move `src/components/ui/Prism.tsx` and `src/components/footer/Cast.tsx` to `src/components/lab/legacy/`
  (lab pages still render them) and update only the import lines in the lab files that use them
  (`src/app/lab/scripts/page.tsx`, `ChartKit.tsx`, `FooterLab.tsx`, `LabHero.tsx`, `Mascots.tsx`,
  `RefractKit.tsx`, `RefractSheets.tsx`, `Sheets.tsx`, `ThemeLab.tsx`). No other lab edits.
- Update the comment headers in `Scenes.tsx` to describe the new scenes.

## Files

- **May touch:** `src/components/footer/Scenes.tsx` (rewrite), new `src/components/footer/Night.tsx`,
  new `src/components/footer/figures.ts` and `figures.test.ts`, `src/components/footer/Footer.tsx` (signature
  only, plus wiring if a scene needs a new prop), the two file moves above and the lab import lines.
- **Must not touch:** `src/components/ui/Moth.tsx` (use it as is; if a pose is missing, report it rather than
  editing), `src/lib/visibility.ts`, `src/components/scenes/**`, tokens and `globals.css`, `src/data/**`,
  the email button's behaviour, any lab file beyond its import lines.

## Acceptance checks

- `npm run check`, `npm test` (including `figures.test.ts`), `npm run build:dev` pass. If the running dev server
  locks `out/`, run the build in a temporary copy as handoff 2 did, and say so.
- `grep -rn "PrismCharacter|PrismMark|footer/Cast|from './Cast'|LOOKS" src --include=*.tsx\|PrismMark\|from './Cast'\|Person" src --include=*.tsx` finds nothing outside
  `src/components/lab/`.
- Screenshots saved under `docs/design/review/handoff-3/`, at 1440px and 375px, dark and twilight, of each scene,
  plus these states: Lantern with the pointer at two positions (show shadows moving and stones lighting);
  Star trails after scrolling (exposure > 90°); Quiz after a wrong guess and after the right one; Orbit while the
  email button is held; each scene's idle state; each scene in Reduced motion.
- Side by side with `docs/design/mockups/footer-0*.png`, each scene matches the frame's composition and colours.
- Scene switching (buttons, dots, swipe), pause, and the saved scene still work; the old saved ids fall back to
  Lantern.
- No console errors or hydration warnings; scroll and pointer listeners are passive and removed on unmount.
- Report anything not verified, with the reason.

## Notes for the implementer

- Another session's `next dev` may already serve this folder at `http://localhost:3217`; use it (a second server
  exits). Capture script and gotchas: `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Round SVG coordinates computed in code to one decimal to avoid hydration warnings.
- Commit on `feat/showcase-rebuild` in small steps (one per scene is ideal) with plain messages and no AI
  attribution. Do not push.
