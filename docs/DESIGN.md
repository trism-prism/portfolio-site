# Design

## Concept

One lantern in a quiet colonnade. The top of the home page is a flat vector scene: a stepped-arch arcade at night with a single amber lantern hanging from an iron tie rod. The lit area is a true visibility polygon with hard shadows, computed by `src/lib/visibility.ts`. Visitors can move the lantern with the pointer, a sideways touch drag, or the arrow keys when the scene has focus. Nothing essential depends on it: below the scene the page is an ordinary document.

Without JavaScript the scene is still complete, because the polygon for the default lantern position is computed at build time and written into the HTML.

## Rendering language

- Flat cut-shape vector art in inline SVG. Hard edges, flat fills. No gradients, blur, glow, filters or drop shadows on art.
- Everything sits on an 8-unit grid. Arches are stepped semicircles on that grid; other diagonals are 45 degrees (obelisk tips, the banner tail, capitals).
- Depth comes from stacked flat layers, back to front: sky, far skyline, a low garden wall that catches shadows, mid-plane objects (pedestals, an obelisk, a crystal on a plinth, one banner), the iron rod, and the near frame (wall, voussoir rings, pillars). The picture has a strip of night sky above the cornice.
- **Lit and unlit palettes.** Every near shape has two fills, a cool night colour and a warm lantern colour, chosen by hand so each surface keeps its own hue (masonry becomes sandstone, plum cloth becomes rose, the teal curb stays teal-green). The scene is drawn twice. The lit copy is shown only inside two nested clip paths: the visibility polygon, and a stepped disc on the 8-unit grid (the light's reach, 224 units on the wide scene). A second, smaller disc shows full strength and the ring between them shows a half-lit copy (the two palettes mixed 50/50), so the light falls off in one deliberate step. The polygon's bounding rectangle lies outside the disc, so its edges never show. The sky and the far skyline are never lit: a lantern cannot light them, so through every bay you see cool night beyond warm stone. The edge between lit and shadow is the polygon edge, crisp and exact.
- Crystal appears in two places only: the prism cluster on its plinth and the facet mark (favicon and the small logo). Each facet is one flat fill from the five facet colours; in shadow the same facet is mixed 55% toward night plum.
- Embroidery (small hollow diamonds joined by thin lines) is the only ornament: section rules, corner brackets on screenshots, and the one banner in the scene. One stroke weight.
- Amber means "lit" or "you can act on this": the lantern glass, link underlines and focus rings.
- Screenshots keep their own interfaces, in a plain frame with corner brackets, cropped to the part that tells the story.

## Palette

Illustration colours (`TONES` in `src/scene/geometry.ts`), unlit and lit:

| Surface | Unlit | Lit |
|---|---|---|
| Sky (never lit) | `#2a2440` | none |
| Far skyline (never lit) | `#3d4a5c` | none |
| Wall | `#2a2f45` | `#b88e69` |
| Stone (voussoirs, abacus) | `#3c445f` | `#d7b185` |
| Pillar shaft, mid / lit strip | `#323953` / `#444d68` | `#c79d72` / `#e6c394` |
| Shade (recesses, pillar shadow side) | `#1c1829` | `#80584f` |
| Floor | `#2a2440` | `#74617a` |
| Curb | `#3f6b6b` | `#8cb7a0` |
| Cloth (banner) | `#6b3a6e` | `#c0668f` |
| Pedestals | `#4a2f5c` | `#a05a82` |
| Embroidery thread | `#a49cb3` | `#fbeed2` |

The lantern itself is always lit: amber `#e8a44a`, core `#f6cf8a`, iron `#3b2447`. Facets: cyan `#8fd8e0`, lavender `#b9a7e8`, pink `#e7a9cf`, pearl `#f1ece4`, violet `#7d6bd1`.

Interface colours (`src/styles/tokens.css`), dark theme only. Ratios are measured by `src/lib/contrast.test.ts`, which fails below the thresholds:

| Pair | Ratio | Needs |
|---|---|---|
| Text `#e6dccb` on ground `#1c1626` | 12.97:1 | 7:1 |
| Text on surface `#2a2440` | 10.85:1 | 7:1 |
| Muted text `#b5abc2` on ground | 8.03:1 | 4.5:1 |
| Muted text on surface | 6.72:1 | 4.5:1 |
| Amber `#e8a44a` (link underline, focus ring) on ground | 8.25:1 | 3:1 |
| Amber on surface | 6.91:1 | 3:1 |

Links are also underlined, so colour is never the only cue.

## Type

Newsreader (serif) for the name and headings, Source Sans 3 for body and interface, both through `next/font` (self-hosted at build, no runtime request). Body is 18 px with a 34 rem measure (about 70 characters). Project titles on the home page are 2.25 rem, the size of the largest section heading. Hyphenation is off, so words never break mid-word. Spacing follows an 8-unit scale.

## Layout

- Home: the scene, then the name, a two-sentence introduction, one line about the scene, the four icon links (icon plus word), and from 1100 px a quiet column of facts (studying, working, based). All of it fits in the first screen at 1366x768. On a phone the links follow the introduction directly, then the line about the scene, then the caption; all four links are visible at 390x844. Then Selected work, More work, Experience, About and a Contact footer.
- Selected work alternates image and text. Each image is about 36 rem wide on desktop and full width on a phone. Each project has one tab stop, its title; the image is a mouse-only link.
- Case studies open with a lead image and a two-sentence standfirst (side by side for some projects, stacked for others), then sections titled by what they say, then one closing sentence about the stack.
- The scene has two arrangements: a wide one (seven unequal bays, one wider central bay) and a two-bay one for screens under 700 px, built from the same data and the same visibility function.

## Motion

- The lantern has a very slow idle sway (a few pixels, 7 seconds) only when `prefers-reduced-motion` is not set. The sway ramps up from nothing after the last input, so the lantern never jumps. With reduced motion nothing moves on its own and the lantern follows direct input without easing.
- Per frame, only the clip polygon's `points` and a few `transform` attributes change, driven by `requestAnimationFrame`. While idle the loop redraws about 15 times a second; it stops when the scene is off screen or the tab is hidden.
- No scroll effects and no entrance animations on text.
- Touch: the scene allows vertical panning (`touch-action: pan-y`). The lantern moves only after a horizontal movement of about 10 px, so a scroll that starts on the scene leaves it alone. Mouse and pen: the light follows the pointer. Keyboard: arrow keys when the scene has focus.

## How the scene works

`src/scene/geometry.ts` defines every shape once, as polygons on the grid, with an unlit and a lit tone. `SceneMarkup.tsx` draws them (one render function for the page and the share image). Where `occlude` is set, the same shapes give the wall segments for `visibilityPolygon`. The near frame (wall, arches, pillars) does not cast shadows; the mid-plane pedestals and the banner do. The lantern passes in front of everything; a shape the light sits inside is ignored for that frame, and a wall within a hair of the light is skipped so the polygon never collapses to a point.

## Adding a project

1. Put two WebP files per screenshot in `public/work/<slug>/`, named `<name>-<width>.webp` (a full-size one and a 640 px one; a phone screenshot can be a single file at its own width). Crop to the part that tells the story.
2. Add an entry to `projects` in `src/content/projects.ts`: slug, one-line summary, a two-sentence standfirst, sections titled by what they say (never repeat the title in the first words of the body), one closing sentence about the stack, links, and images with alt text and captions. The page, the home-page entry, the previous/next links and the sitemap line follow from it.
3. Use a number only with what it measures and its conditions. Link only public repositories.
4. Run `npm run check`, `npm test` and `npm run build`. The content test confirms every image file exists.
