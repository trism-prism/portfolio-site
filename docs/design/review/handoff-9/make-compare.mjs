// Regenerates compare.html: the storyboard beside a 3 x 3 grid of the nine 1440 frames, images embedded.
// Usage: node docs/design/review/handoff-9/make-compare.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const mock = join(here, '..', '..', 'mockups', 'mothsky-02-intro-storyboard.png');
const uri = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const frames = [
  [0.2, '1 Night'], [0.8, '2 A chrysalis is charted'], [1.3, '3 It turns prismatic'],
  [1.7, '4 A seam of light'], [2.1, '5 Head and antennae'], [2.6, '6 It pulls free'],
  [3.1, '7 Wings expand'], [3.5, '8 Fully open'], [3.9, '9 Light reaches the site'],
];
const grid = frames.map(([t, n]) => `<figure><img alt="${n}" src="${uri(join(here, `intro-dark-1440-${t.toFixed(1)}s.png`))}"><figcaption>${n} · frozen at ${t.toFixed(1)} s</figcaption></figure>`).join('');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Handoff 9: intro comparison</title>
<style>
body{margin:0;background:#101018;color:#e6e4ee;font:15px/1.5 system-ui,sans-serif;padding:32px}
h1{font-size:22px;margin:0 0 4px}p.sub{color:#a9a6b8;margin:0 0 24px;max-width:90ch}
h2{font-size:15px;font-weight:600;margin:0 0 10px;color:#cfc9f5}
.wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:24px;align-items:start}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
figure{margin:0}img{display:block;width:100%;height:auto;border:1px solid #2a2a3a;border-radius:6px}
figcaption{font-size:11.5px;color:#a9a6b8;margin-top:4px}
@media(max-width:1100px){.wrap{grid-template-columns:1fr}}
</style></head><body>
<h1>Handoff 9: the moth intro</h1>
<p class="sub">Left: the approved storyboard. Right: the built intro at 1440 x 900, dark, frozen with <code>?intro=&lt;seconds&gt;</code> on the production build at each key moment (0.2, 0.8, 1.3, 1.7, 2.1, 2.6, 3.1, 3.5 and 3.9 s). The stage is the storyboard's 420 x 236 frame space at min(92vw, 760px), so the drawing is smaller on the page than in the storyboard cards; frame 9 shows the real site behind the ring.</p>
<div class="wrap"><section><h2>Storyboard</h2><img alt="Approved intro storyboard" src="${uri(mock)}"></section><section><h2>Built, 1440 dark</h2><div class="grid">${grid}</div></section></div>
</body></html>`;
writeFileSync(join(here, 'compare.html'), html);
console.log('wrote compare.html', Math.round(html.length / 1024), 'KB');
