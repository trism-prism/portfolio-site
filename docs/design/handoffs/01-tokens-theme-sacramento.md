# Handoff 1: approved tokens, twilight theme, Sacramento

For one implementer in this worktree (`feat/showcase-rebuild`, private: never push, merge or deploy).
Follows `docs/DESIGN.md` section 1 (Theme, Palette, Light mode, Name in the hero, Project cover animations),
section 3 (Tokens, Type) and section 7 (handoff rules). The advisor reviews the result in the browser before
handoff 2 starts.

## Goal

The live site uses the approved dark and twilight token sets instead of the old teal palette, the existing
theme switch toggles dark ↔ twilight, and the owner's name is set in Sacramento instead of Yellowtail.
Nothing else changes: no layout, copy, character or animation work.

## Source of truth

- Values: `src/components/lab/themeTokens.ts` (`dark`, `twilight`). Do not invent values that differ from it.
- Visual reference: `/lab/theme` and `docs/design/mockups/theme-*`.

## What exists already (reuse it)

- Theme switch: `src/components/shell/Theme.tsx` (`toggleTheme`, `ThemeButton`, palette command),
  `src/lib/boot.ts` (`THEME_KEY = 'tm-theme'`, boot script that sets `data-theme` before paint).
  Dark is the default; `:root[data-theme='light']` is the light block in `src/app/globals.css`.
  **Keep the attribute value `light`** (stored preferences keep working); only user-facing words change to "twilight".
- Fonts: `src/app/layout.tsx` loads Yellowtail as `--font-yellowtail`; `globals.css` maps `--font-sig` to it.

## Tasks

1. **Remap the existing variables** in `src/app/globals.css` (`:root` = dark, `:root[data-theme='light']` = twilight):

   | Variable | Dark | Twilight |
   |---|---|---|
   | `--bg` | `skyMid` `#0a0b16` | `skyMid` `#cdd7e9` |
   | `--bg-alt` | `skyTop` `#141428` | `skyTop` `#b8c6e0` |
   | `--panel` | `card` `rgba(17,18,32,.74)` | `card` `rgba(250,251,255,.62)` |
   | `--panel-2` | `rgba(255,255,255,.04)` | `rgba(19,26,46,.04)` |
   | `--fg` / `--fg-2` / `--muted` | `ink` / `ink2` / `ink3` | `ink` / `ink2` / `ink3` |
   | `--line` | `rule` `rgba(255,255,255,.09)` | `rule` `rgba(19,26,46,.14)` |
   | `--line-2` | `rgba(255,255,255,.16)` | `rgba(19,26,46,.22)` |
   | `--accent`, `--accent-soft` | `kind.software` | `kind.software` |
   | `--accent-strong` | `#2dd4bf` | `spectrum[0]` `#0b6b62` |
   | `--accent-pale` | `#99f6e4` | `#0b6b62` |
   | `--accent-ink` (text on accent) | `#07080d` | `#f4f6fb` |
   | `--violet` / `--sky` / `--amber` / `--coral` / `--gold` | `kind.ai` / `kind.systems` / `kind.data` / `rose` / `route` | same keys from `twilight` |
   | `--shadow` | unchanged | `0 18px 40px -26px rgba(19,26,46,.45)` (the lab card shadow) |

   `--green`, `--red`, `--silver`, `--bronze`, `--ph` stay as they are.
   Set `color-scheme: light` inside the twilight block.

2. **Add the new tokens** to both blocks and expose them to Tailwind in the `@theme` block the same way the
   existing ones are (`--color-…`): `--sky-top`, `--sky-mid`, `--sky-bottom`, `--star`, `--star-halo`,
   `--graticule`, `--constellation`, `--accent-serif`, `--kind-software`, `--kind-systems`, `--kind-ai`,
   `--kind-data`, `--rose`, `--route`, `--button-bg`, `--button-fg`, and `--footer-ground: #0b0e20` (same in both).

3. **Page background is the sky.** `body` gets
   `background: var(--bg) linear-gradient(180deg, var(--sky-top), var(--sky-mid) 55%, var(--sky-bottom)) fixed;`
   so every viewport shows dusk-blue at the top warming to the horizon in twilight (and the night gradient in dark).
   Sections that paint their own opaque background over it may keep doing so in this handoff.

4. **Covers stay dark in both themes** (DESIGN section 1, "Project cover animations"; section 3, last note).
   Scope the **dark** `--sc-*` values and a `#0d1220` background onto the cover stage (the root element of
   `src/components/scenes/Stage.tsx`, e.g. with a `cover-stage` class in `globals.css`), so the twilight block's
   `--sc-*` overrides never reach a cover. Do not edit any file under `src/components/scenes/covers/`.

5. **Sacramento replaces Yellowtail.** In `src/app/layout.tsx` load `Sacramento` from `next/font/google`
   (`weight: '400'`, `variable: '--font-sacramento'`, `display: 'swap'`), remove Yellowtail, and set
   `--font-sig: var(--font-sacramento), cursive`. Sacramento is visually smaller: at every use of `--font-sig`
   (grep `font-sig`), raise the size about 15% so the name's cap height matches what Yellowtail had.
   Sacramento is for the name and signature only.

6. **Words on the switch.** The toast and the button's `aria-label` say "twilight" and "dark"
   (e.g. "Theme: twilight", "Switch to the twilight sky" / "Switch to the night sky"). The command-palette
   entry (`src/components/shell/CommandPalette.tsx`, id `theme`) becomes label "Switch theme", hint "Dark / twilight"
   (its current `theme --toggle` is leftover terminal styling). Storage value and `data-theme` value stay `light`/`dark`.

7. **Test the CSS against the token file.** Add `src/app/tokens-css.test.ts` (Vitest) that reads
   `src/app/globals.css`, extracts each variable listed in tasks 1–2 from both blocks, and asserts it equals the
   corresponding `themeTokens.ts` value (normalise whitespace and case). Keep `src/components/lab/tokens.test.ts` passing.

## Files

- **May touch:** `src/app/globals.css`, `src/app/layout.tsx`, `src/components/shell/Theme.tsx`,
  the palette command label (`src/components/shell/CommandPalette.tsx`, label text only),
  `src/components/scenes/Stage.tsx` (root class only), components that use `font-sig` (size only; today that is `src/components/sections/Hero.tsx`),
  new `src/app/tokens-css.test.ts`.
- **Must not touch:** `src/components/scenes/covers/**`, `src/components/ui/Prism.tsx` and any character
  code (the moth replaces the prism in a later handoff), section layouts and copy, `src/data/**`,
  `src/components/lab/**` (read only), `PLACEHOLDERS.md`.

## Acceptance checks

- `npm run check`, `npm test` (including the new test), `npm run build:dev` all pass.
- Screenshots at 1440px and 375px, in dark and twilight, of: hero, projects (a cover visible), experience,
  contact/footer. Twilight shows the dusk-blue sky with warm horizon; text is readable everywhere.
- A project cover looks identical in dark and twilight (same dark panel, same colours).
- The theme button and the palette command both toggle; the choice survives a reload with no flash of the
  other theme; with no stored choice the site opens dark.
- The name in the hero and footer renders in Sacramento (check the computed `font-family` in the browser);
  Yellowtail is no longer requested (network tab).
- Reduced motion: nothing in this handoff adds motion; confirm the site still renders its finished frames.
- Report what was not verified, with the reason.

## Notes for the implementer

- Another session's `next dev` may already hold port 3217 for this folder; a second server exits. Use the
  running one at `http://localhost:3217`.
- Commit on `feat/showcase-rebuild` with plain messages and no AI attribution. Do not push.
