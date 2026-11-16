# v3 design notes

v3 copies the structure, look, tone and component grouping of haffee.dev (Hafeez Mohamad's portfolio) and fills it with Tristan's facts. The reverse-engineered spec is `docs/V3-REFERENCE.md`; this file records how it was built here. The v2 design notes are in `legacy/v2-lantern/docs/DESIGN.md`.

## Tokens (`src/styles/tokens.css`)

Dark is `:root`; `html.light` overrides. All colours are opaque hex so `src/lib/contrast.test.ts` can check them.

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0f172a` | `#ffffff` |
| `--bg-alt` | `#141c2f` | `#fbfcfd` |
| `--card` | `#172033` | `#ffffff` |
| `--border` | `#1e293b` | `#e2e8f0` |
| `--text` | `#f8fafc` | `#1e293b` |
| `--muted` | `#94a3b8` | `#64748b` |
| `--accent` | `#10b981` | `#10b981` |
| `--accent-text` | `#10b981` | `#065f46` |
| `--accent-hover` | `#34d399` | `#34d399` |
| `--on-accent` | `#022c22` | `#022c22` |
| `--footer` | `#0d121f` | `#f8fafc` |
| `--chip` | `#1e293b` | `#f8fafc` |

Differences from the reference, made so every text pair passes WCAG AA (4.5:1) in both themes:
- Text on solid accent fills (buttons, the active skill tab, the logo tile) is dark (`--on-accent`), not white; white on `#10b981` is about 2.5:1.
- Light theme: `--accent-hover` is `#34d399` (a lighter hover) because `#059669` gave 4.0:1 with dark text; `--chip` is `#f8fafc` because muted text on `#f1f5f9` gave 4.3:1.
- Light accent text uses `#065f46`, as in the reference. Dark accent text is `#10b981`.

Type: Outfit (headings 700, body 400, nav 500) and JetBrains Mono (eyebrows, chips, dates, stat labels), both through `next/font/google`. Hero name 56px, section h2 48px, eyebrow 14px mono uppercase with letter-spacing, 64 x 3px accent bar under each h2. Sections have 96px vertical padding and alternate page and alt backgrounds. Radii: 0.5rem base, 1rem cards, fully rounded buttons and pills.

## Components

| Component | Notes |
|---|---|
| `Header` (client) | Fixed glass bar, wordmark `Tristan.`, scroll-spy nav, theme toggle, "Let's Talk"; hamburger under 900px |
| `ThemeToggle` (client) | Flips `html.light`, saves to `localStorage` in try/catch. The head script in `layout.tsx` applies the saved theme before paint, so there is no flash |
| `Hero` + `Typewriter` | Two columns; photo card rotated 3 degrees. With no `photo`, a "TM" initials card. Typewriter shows the first role under reduced motion |
| `Section` | Eyebrow, centered h2 and bar |
| `Experience` (client) | Timeline, cards expand and collapse, first open |
| `Skills` (client) | Category tabs with counts, tile grid, "N Categories · N Technologies". Brand icons come from `simple-icons` (named imports); tiles without one show a monogram |
| `Dsa` | Stat card, donut ring, 52-week heatmap (`lib/heatmap.ts`). Blank data renders "—", an empty ring and an empty grid |
| `Projects` | Two-column cards: cover, description, KEY FEATURES, chips, public links |
| `Education` | Wide degree card plus smaller cards |
| `Publications` (client) | Paper card with the "Read Full Abstract" toggle, and the Certifications grid; both have "coming soon" empty states |
| `Contact` (client) | Info cards, socials, resume, and a form that validates then opens `mailto:` |
| `RevealObserver` (client) | Adds `.in` to `[data-reveal]` as they scroll in. Content is hidden only when the head script has set `html.js`, and never under `prefers-reduced-motion` |

## Rules kept from earlier versions

Flat shapes, no gradients or glow on content; amber is not used (v3's accent is emerald). Copy rules are in `README.md`.

## Screenshots

`docs/screenshots/v3/`: 1440x900 and 375x812, dark and light, as full-page and above-the-fold images.
