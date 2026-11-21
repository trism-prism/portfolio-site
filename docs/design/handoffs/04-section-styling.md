# Handoff 4: shared section styling

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (rows **Motif**, **Terminal styling**, **Themed vocabulary**, **Cards**,
**Mascot**), section 2 (principles), section 3 (Tokens, Type, Layout), section 4 (Sky backdrop, Chart header,
Card, Star glyph) and section 7. Builds on handoffs 1–3. The advisor reviews in the browser before handoff 5.

## Goal

The pieces every section shares take the approved look: the section heading, the rounded card, the sky behind
the page, and the wording of the command palette and Activity. After this, the per-section handoffs are layout
only. No section's own layout or content changes here.

## Source of truth

- Heading and card: `Header` and `Card` in `src/components/lab/SectionsLab.tsx` and `src/components/lab/ThemeLab.tsx`
  (copy, never import from `src/components/lab/`).
- Look: `docs/design/mockups/sections-01-about-dark.png` (heading with the seated moth, cards),
  `sections-05-about-twilight.png` (the same in twilight), `theme-03-route-*` (sky with graticule arcs).
- Tokens from handoff 1 (`--sky-*`, `--star`, `--star-halo`, `--graticule`, `--constellation`, `--accent-serif`,
  `--panel`, `--line`, `--shadow`).

## Tasks

1. **Section heading** (`src/components/ui/SectionHeader.tsx`), as in the mockups:
   - Top line, mono, uppercase, 12px, wide tracking, `--muted`: a four-point star glyph (12px, `--fg`), the section
     number in `--fg`, then the section's `nav` name (e.g. `★ 01 ABOUT`). Right-aligned on the same line, normal
     case: the section's `kicker` (e.g. "Software engineer, full stack and AI"). Hide the kicker below 768px.
   - Title: as today (display, serif accent word in `--accent-serif`).
   - The rule beside the title becomes a ruler: a 1px `--line` line with ticks hanging up from it, 41 ticks across
     (every 10th 10px tall, every 5th 7px, the rest 4px), 21 ticks below 768px. The roaming moth (`Mascot`) stays
     seated on it, right-aligned about 48px from the end, feet on the line (keep handoff 2's offset).
   - Keep the `id`, `tabIndex` and heading level exactly as they are.
   - Add a small shared `StarGlyph` (`src/components/ui/StarGlyph.tsx`): the four-point star with a faint round halo,
     `color` and `size` props, `aria-hidden`. Later handoffs use it for bullets and legend marks.

2. **Cards** (`.panel` in `src/app/globals.css`): fill `var(--panel)` with `backdrop-filter: blur(8px)`, border
   `1px solid var(--line)`, radius 16px, and `box-shadow: var(--shadow)` in twilight only. Add an optional tone
   accent: an element with `data-tone` gets a 2px × 40px bar on its top edge, 20px from the left, rounded at the
   bottom, coloured by `--tone` (set inline by the caller). Do not change any component markup in this handoff.

3. **Sky backdrop** (`AmbientBackground` in `src/components/shell/Ambient.tsx`, styles in `globals.css`): replace
   the dots, teal/violet glows and beams with the night sky:
   - A fixed, `aria-hidden` layer behind everything: the page sky gradient from handoff 1 stays on `body`; this layer
     adds about 1 star per 6,000 px² of viewport in dark (1 per 9,000 in twilight), seeded (`mulberry32`), sizes
     0.6–1.3px with about 7% at 1.6px, opacity 0.25–0.8, white (`--star`) with a `--star-halo` ring in twilight.
   - Four faint graticule arcs (`--graticule`) centred below the bottom-right corner, as in the mockups.
   - About 8% of stars twinkle slowly (opacity easing over 4–7 s, staggered). Nothing else moves. Reduced motion:
     no twinkle.
   - Draw it once (SVG or canvas) and redraw only on resize; no per-frame JavaScript.
   - Remove the alternating band `.section:nth-of-type(even) { background … }` so the sky runs continuously.
   - Do not touch `TechField` or `ProgressBar` in the same file (the tech tiles are the hero handoff).

4. **Plain words in the command palette** (`src/components/shell/CommandPalette.tsx`, labels and placeholder only):

   | Now | Becomes |
   |---|---|
   | `cd ~` | Go to the top |
   | `cd <id>` | Go to <nav name> (e.g. "Go to About") |
   | `open <slug>` | Open <project title> |
   | `copy email` | Copy email address |
   | `cat cv` / `cat resume` | Read the CV / Read the résumé |
   | `wget resume.pdf` | Download the résumé (PDF) |
   | `schedule call` | Schedule a call |
   | `motion --reduced` / `motion --full` | Reduce motion / Use full motion |
   | placeholder `type a command…` | Search or jump to… |

   Labels use the normal UI font, not mono. Update the file's top comment (it calls the prompt shell styling), and the
   matching annotation body in `src/data/annotations.ts` ("The shell prompt is styling…") to describe a plain search
   and jump list.

5. **Activity wording:** in `src/data/sections.ts` change the `news` kicker from `git log --all` to "What I've been up
   to". In `src/components/sections/News.tsx` remove the FNV-1a hash label from each entry (decision: plain dates and
   type labels, no entry numbers or hashes); keep dates and type labels.

## Files

- **May touch:** `src/components/ui/SectionHeader.tsx`, new `src/components/ui/StarGlyph.tsx`, `src/app/globals.css`
  (`.panel`, the tone accent, ambient/sky styles, the even-section band), `src/components/shell/Ambient.tsx`
  (`AmbientBackground` only), `src/components/shell/CommandPalette.tsx` (labels, placeholder, label font, top comment),
  `src/data/annotations.ts` (that one entry), `src/data/sections.ts` (the `news` kicker only),
  `src/components/sections/News.tsx` (remove the hash label only).
- **Must not touch:** section layouts and their other copy, `TechField`, `ProgressBar`, `src/components/ui/Moth.tsx`,
  `Mascot.tsx` behaviour (the seat offset only if the new ruler needs it), `src/components/scenes/**` (the covers'
  own `cd projects` animation stays, per the covers decision), `src/components/footer/**`, tokens' values,
  `src/components/lab/**`.

## Acceptance checks

- `npm run check`, `npm test`, `npm run build:dev` pass (build in a temporary copy if the dev server locks `out/`,
  and say so).
- Screenshots under `docs/design/review/handoff-4/` at 1440px and 375px, dark and twilight: the About heading
  (zoomed, moth on the ruler), a full screen of cards over the sky (About or Experience), the Activity section, and the
  open command palette.
- Side by side with `docs/design/mockups/sections-01-about-dark.png` and `sections-05-about-twilight.png`, the heading
  and cards match (star, number, name, kicker, ruler ticks, seated moth, card fill and border).
- `grep -rnE "'(cd |cat |wget )" src/components/shell` finds nothing; the palette still runs every command.
- Reduced motion: no twinkling; nothing else moves.
- Scroll performance: no long tasks from the backdrop in a Performance recording while scrolling the page once.
- Report anything not verified, with the reason.

## Notes for the implementer

- A dev server may already serve this folder at `http://localhost:3217`; use it (a second server exits). Capture
  script and gotchas: `docs/design/README.md` (Git Bash needs `MSYS_NO_PATHCONV=1`).
- Round SVG coordinates computed in code to one decimal to avoid hydration warnings; seed anything random.
- Commit on `feat/showcase-rebuild` in small steps with plain messages and no AI attribution. Do not push.
