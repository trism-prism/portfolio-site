# Design

## Concept

One lantern in a quiet colonnade. The top of the home page is a flat vector scene of arches and pillars at night with a single amber lantern. The lit area is a true visibility polygon with hard shadows, computed by `src/lib/visibility.ts`. Visitors can move the lantern with the pointer, a sideways touch drag, or the arrow keys when the scene has focus. Nothing essential depends on it: below the scene the page is an ordinary document.

Without JavaScript the scene is still complete, because the polygon for the default lantern position is computed at build time and written into the HTML.

## Rendering language

- Flat cut-shape vector art in inline SVG. Hard edges, flat fills. No gradients, blur, glow, filters or drop shadows on art.
- Depth comes from stacked flat tone layers, like cut paper: sky, far skyline, mid-plane posts and obelisks, near frame (pillars and arches).
- Everything sits on an 8-unit grid. Diagonals are 45 degrees (the pointed arches, obelisk tips, banner tails) or stepped (the skyline and the light bands).
- Light is flat amber at low opacity, hard-edged, in three nested steps cut by a stepped disc. Shadows are simply where the polygon is not.
- Crystal appears in two places only: the prism cluster in the scene and the facet mark (favicon and the small logo). Each facet is one flat fill from the five facet colours.
- Embroidery (small hollow diamonds joined by thin lines) is the only ornament: section rules, corner brackets on screenshots, and the banners in the scene. One stroke weight, one colour.
- Amber means "lit" or "you can act on this": the lantern, its light, link underlines and focus rings.
- Screenshots keep their own interfaces, in a plain frame with corner brackets and a caption.

## Palette

Illustration colours (art only, `src/scene/geometry.ts`): night plum `#1c1626`, indigo `#2a2440`, amethyst `#4a2f5c`, plum `#6b3a6e`, slate `#3d4a5c`, teal `#3f6b6b`, haze blue `#55648a`, embroidery pearl `#e6dccb`, facets cyan `#8fd8e0`, lavender `#b9a7e8`, pink `#e7a9cf`, pearl `#f1ece4`, violet `#7d6bd1`, amber `#e8a44a`, lantern core `#f6cf8a`.

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

Newsreader (serif) for the name and headings, Inter for body and interface, both through `next/font` (self-hosted at build, no runtime request). Body is 17 px with a 40 rem measure. Spacing follows an 8-unit scale.

## Layout

- Home: scene, name, one-sentence introduction and the four icon links (icon plus word) fit in the first screen on a 1366x768 laptop. Then Selected work, More work, Experience, About and a Contact footer.
- Wide screens put each section's heading and embroidery rule in a left column and its content on the right; phones stack them.
- The scene has two arrangements: a wide one (seven bays) and a narrower two-bay one for screens under 700 px, built from the same data and the same visibility function.

## Motion

- The lantern has a very slow idle sway (a few pixels, 7 seconds) only when `prefers-reduced-motion` is not set. With reduced motion nothing moves on its own and the lantern follows direct input without easing.
- Only the polygon's `points` and a few `transform` attributes change per frame, driven by `requestAnimationFrame`. The loop stops when the scene is off screen or the tab is hidden.
- No scroll effects and no entrance animations on text.
- Touch: the scene allows vertical panning (`touch-action: pan-y`), so the page still scrolls over it; horizontal drags move the lantern. Mouse and pen: the light follows the pointer. Keyboard: arrow keys when the scene has focus.

## How the scene works

`src/scene/geometry.ts` defines every shape once, as polygons on the grid. The same shapes draw the SVG (`LanternScene.tsx`, `svgString.ts`) and, where `occlude` is set, give the wall segments for `visibilityPolygon`. Pillars and arches are a front frame that does not cast shadows; posts, obelisks and banners sit in the mid plane and do. The lantern passes in front of everything; a shape the light sits inside is ignored for that frame.

## Adding a project

1. Put two WebP files per screenshot in `public/work/<slug>/`, named `<name>-1280.webp` and `<name>-640.webp` (a phone screenshot can be a single file at its own width).
2. Add an entry to `projects` in `src/content/projects.ts`: slug, summary, what it does, why it matters, what I built, one or two decisions, a one-sentence stack, links, and images with alt text and captions. The page, the home-page entry, the previous/next links and the sitemap line follow from it.
3. Use a number only with what it measures and its conditions. Link only public repositories.
4. Run `npm run check`, `npm test` and `npm run build`. The content test confirms every image file exists.
