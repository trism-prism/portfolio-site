# Handoff 2: the moth replaces the prism

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (row **Mascot**: the moth, one character only; row **Characters**) and
section 7 (handoff rules). Builds on handoff 1 (tokens, commits `6fb3d5d..16671e7`). The advisor reviews the
result in the browser before handoff 3 starts.

## Goal

Wherever the site shows the prism as a character or a logo, it shows the moth instead: nav logo, hero mark,
footer mark, favicon, social image, the roaming mascot on section rules, and the 404 page. Behaviour, timing and
layout stay as they are; only the drawing changes.

**Out of scope:** the footer scenes (`src/components/footer/Scenes.tsx` and `Cast`). Handoff 3 rebuilds them
around the moth, so leave the prism there for now and do not delete `src/components/ui/Prism.tsx` yet. Also out
of scope: the intro splash's light-splitting prism in `Chrome.tsx` and the placeholder easter-egg text in
`src/data/personal.ts`; both are open design questions.

## Source of truth

- Drawing: `Moth`, `MothSpread`, `Antennae`, `Eyes` and the colour constants in `src/components/lab/Mascots.tsx`.
  **Copy** the geometry into the new component; do not import from `src/components/lab/`.
- Look: `docs/design/mockups/mascot-04-mascot-moth.png` (hero, logo at 48/32/16px, seated on a rule) and
  `docs/design/mockups/sections-*` (the moth seated on each section rule at 46px).
- The moth keeps its fixed illustration colours in both themes, with its thin dark outline (`#12122a`), as in the lab.

## Tasks

1. **New component `src/components/ui/Moth.tsx`**, a drop-in for `Prism.tsx`'s exports:
   - `export type MothPose = 'idle' | 'wink' | 'crouch' | 'jump' | 'land' | 'wave' | 'sit' | 'sleep' | 'cheer'`
     (the same names as `PrismPose`, so `Mascot.tsx` keeps its state machine).
   - `MothMark({ size, animated, title })`: the lab's `mark` pose (32×32 viewBox). With `animated`, the eyes use
     the existing `.mark-eyes` blink class, and on hover one eye closes (reuse `.mark`, `.wink`, `.eye-r` from
     `globals.css`). Same accessibility as `PrismMark` (`role="img"` + `aria-label` only when `title` is given).
   - `MothCharacter({ pose, size, flip })`, where `size` is the rendered width. Poses:

     | Pose | Drawing |
     |---|---|
     | `idle` | seated (lab `sit`), eyes open |
     | `sit` | seated, eyes open |
     | `wink` | seated, left eye open, right eye a closed arc |
     | `sleep` | seated, both eyes closed arcs, antennae tips lowered about 4 units |
     | `crouch` | seated, squashed `scale(1.08, .9)` about the feet |
     | `land` | seated, squashed `scale(1.12, .86)` about the feet |
     | `jump` | wings spread (lab `hero`), stretched `scale(.94, 1.06)` |
     | `wave` | wings spread, eyes open |
     | `cheer` | wings spread, eyes looking up (`look` 1.6), three small four-point sparks above the head in spectrum colours |

     Seated poses use a 120×120 viewBox with the feet at y≈117; spread poses use the lab's 160×120 viewBox.
     Expose the feet offset so callers can sit it exactly on a rule.

2. **Roaming mascot** (`src/components/ui/Mascot.tsx`): render `MothCharacter` at 46px instead of
   `PrismCharacter`. Re-tune the `bottom` offset so the seated moth's feet touch the section rule exactly (as in
   `docs/design/mockups/sections-01-about-dark.png`), and the spread poses (drop/leave) stay centred over the
   same spot. Update the file's top comment to say moth. No change to timings or phases.

3. **Logos:** `Nav.tsx` (34px, animated), `Hero.tsx` (64px, animated, title "Moth mark"), `Footer.tsx` (28px)
   switch to `MothMark`.

4. **404 page** (`src/app/not-found.tsx`): `MothCharacter pose="sleep"` at about 96px (the moth is wider than the
   prism was; match the visual weight in the current layout).

5. **Favicon and social image:**
   - `public/favicon.svg`: the moth mark on a rounded square (`rx` 12 on 48) filled with the dark sky `#0a0b16`,
     the mark scaled to about 80% of the square. Check it reads at 16px.
   - `src/app/opengraph-image.tsx`: replace the prism path with the moth mark at the same size and position.

6. **Remove the old CSS name:** rename the `/* ---------- Prism mark ---------- */` comment in `globals.css` to
   "Moth mark" (the class names stay).

## Files

- **May touch:** new `src/components/ui/Moth.tsx`, `src/components/ui/Mascot.tsx`, `src/components/shell/Nav.tsx`,
  `src/components/sections/Hero.tsx` (mark only), `src/components/footer/Footer.tsx` (mark only),
  `src/app/not-found.tsx`, `public/favicon.svg`, `src/app/opengraph-image.tsx`, `src/app/globals.css` (comment only,
  plus any mascot offset rule if one is needed).
- **Must not touch:** `src/components/footer/Scenes.tsx`, `src/components/footer/Cast*`,
  `src/components/ui/Prism.tsx` (leave it for handoff 3 to delete), `src/components/shell/Chrome.tsx`,
  `src/components/scenes/**`, `src/data/**`, `src/components/lab/**` (read only), tokens.

## Acceptance checks

- `npm run check`, `npm test`, `npm run build:dev` all pass.
- `grep -rn "PrismMark\|PrismCharacter" src --include=*.tsx` finds only `Prism.tsx`, `footer/Scenes.tsx` and
  `src/components/lab/**`.
- Screenshots at 1440px and 375px, dark and twilight, saved under `docs/design/review/handoff-2/`: nav + hero,
  one section heading with the seated moth (feet on the rule; zoom in to show it), the footer mark, the 404 page.
- A short screen sequence (3–4 stills is enough) of the roaming mascot arriving at a section: drop, land, wink,
  sit; and the sleep pose after 20 s idle.
- Reduced motion: the mascot simply sits, with no drop or leave animation.
- Favicon: screenshot of a browser tab at normal size; the moth must read as a moth, not a blob.
- Report anything not verified, with the reason.

## Notes for the implementer

- Another session's `next dev` may already serve this folder at `http://localhost:3217`; use it (a second
  server exits). Capture script and gotchas: `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Round SVG coordinates computed in code to one decimal to avoid hydration warnings.
- Commit on `feat/showcase-rebuild` in small steps with plain messages and no AI attribution. Do not push.
