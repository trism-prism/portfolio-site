// Regenerates compare.html with every image embedded as a data: URI. Usage: node docs/design/review/handoff-8/make-compare.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const mock = join(here, '..', '..', 'mockups');
const uri = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const fig = (p, cap) => `<figure><img alt="${cap}" src="${uri(p)}"><figcaption>${cap}</figcaption></figure>`;
const pair = (title, a, b, c1, c2) => `<section><h2>${title}</h2><div class="pair">${fig(a, c1)}${fig(b, c2)}</div></section>`;
const row = (title, items) => `<section><h2>${title}</h2><div class="row">${items.map(([f, c]) => fig(join(here, f), c)).join('')}</div></section>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Handoff 8: Projects comparison</title>
<style>
body{margin:0;background:#101018;color:#e6e4ee;font:15px/1.5 system-ui,sans-serif;padding:32px}
h1{font-size:22px;margin:0 0 4px}p.sub{color:#a9a6b8;margin:0 0 28px;max-width:84ch}
h2{font-size:15px;font-weight:600;margin:36px 0 10px;color:#cfc9f5}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
.row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
figure{margin:0}img{display:block;width:100%;height:auto;border:1px solid #2a2a3a;border-radius:8px}
.row img{width:auto;max-width:100%}
figcaption{font-size:12px;color:#a9a6b8;margin-top:6px}
@media(max-width:900px){.pair{grid-template-columns:1fr}}
</style></head><body>
<h1>Handoff 8: Projects as a sky map</h1>
<p class="sub">Left: the approved mockup. Right: the built section (1440 px wide, Featured selected, full motion after the draw). Differences are the specified ones: the section header is the shared one (no count aside, the moth on the rule), non-featured stars are dimmed to 40% by the Featured filter, star positions come from each project's slug, the spotlight measurement carries its condition (127x faster at best, on 4,000-wall mazes), cards are sorted newest first after the spotlight, and the built shot also includes the contributions block below the cards.</p>
${pair('Dark, 1440', join(mock, 'theme-02-projects-dark.png'), join(here, 'projects-dark-1440-featured.png'), 'Mockup: theme-02-projects-dark.png', 'Built: projects-dark-1440-featured.png')}
${pair('Twilight, 1440', join(mock, 'theme-06-projects-twilight.png'), join(here, 'projects-twilight-1440-featured.png'), 'Mockup: theme-06-projects-twilight.png', 'Built: projects-twilight-1440-featured.png')}
${row('States at 1440, dark', [
  ['projects-dark-1440-all.png', 'All, nothing dimmed'],
  ['projects-dark-1440-ai-from-map.png', 'AI chosen from the map'],
])}
${row('Search and hover', [
  ['projects-dark-1440-search-python.png', 'Search "Python": non-matching stars dimmed to 20%'],
  ['projects-dark-1440-star-hover.png', 'Hover label on the Kiln star'],
])}
</body></html>`;
writeFileSync(join(here, 'compare.html'), html);
console.log('wrote compare.html', Math.round(html.length / 1024), 'KB');
