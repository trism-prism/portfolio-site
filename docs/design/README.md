# Design lab workflow

Design work happens in private lab pages under `src/app/lab/` and is captured as PNGs in `docs/design/mockups/`.
`docs/DESIGN.md` is the source of truth for decisions; this file is only about how to produce and capture mockups.

## Running

- Dev server: the `dev` configuration in `.claude/launch.json` (port 3217).
- Capture: `MSYS_NO_PATHCONV=1 node scripts/capture-lab.mjs docs/design/mockups http://localhost:3217 /lab/<page>/ <prefix>`.
  Every element with `data-sheet="<id>"` becomes `<prefix>NN-<id>.png`.

## Lab pages so far

| Page | Contents |
|---|---|
| `/lab/cartography`, `/lab/refraction` | The two hero motifs (cartography chosen) |
| `/lab/sheets`, `/lab/sheets-refraction` | Six sections in each motif (superseded details: plates, themed labels) |
| `/lab/scripts` | Script faces for the name (Sacramento chosen) |
| `/lab/theme` | Dark vs twilight from `src/components/lab/themeTokens.ts` (approved), rounded cards, Sacramento: the best current reference |
| `/lab/mascots` | Six non-human mascot concepts in hero, logo, section-rule and footer poses (`mascot-*`) |
| `/lab/footer-scenes` | Four night-sky footer scene frames + specs (concepts liked; characters to be replaced) |

## Gotchas found so far

- A server component cannot read objects exported from a `'use client'` module (e.g. the covers registry);
  iterate them inside a client component instead.
- SVG gradients in objectBoundingBox units do not render on perfectly horizontal or vertical lines; use
  `gradientUnits="userSpaceOnUse"`.
- Rounding SVG coordinates avoids hydration warnings caused by tiny float differences between server and browser.
- The in-app browser pane pauses animation while hidden; show it before taking screenshots there, or use the capture script.
- Another session's `next dev` may already hold port 3217 for this folder; a second one exits. Capture from 3217.
- `src/components/lab/tokens.test.ts` checks WCAG contrast for both token sets; keep it passing when tokens change.
