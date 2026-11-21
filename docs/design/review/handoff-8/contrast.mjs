// Measures text contrast in the Projects section from the rendered page (computed text colour, own opacity, and the
// background actually painted behind the text, sampled with the text hidden). Usage:
//   MSYS_NO_PATHCONV=1 node docs/design/review/handoff-8/contrast.mjs http://localhost:3217 [light|dark]
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';

const base = process.argv[2] ?? 'http://localhost:3217';
const theme = process.argv[3] ?? 'light';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript((t) => {
  try {
    localStorage.setItem('tm-motion', 'full');
    localStorage.setItem('tm-theme', t);
    sessionStorage.setItem('tm-intro', '1');
  } catch {}
}, theme);
await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 120000 });
await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
await page.evaluate(() => document.getElementById('projects').scrollIntoView());
await page.waitForTimeout(2500);

const chips = '[aria-label="Filter projects"] button';
const targets = [
  ['Unselected chip label (Software)', `#projects ${chips}[aria-pressed="false"]:has-text("Software")`, 'self-text'],
  ['Unselected chip count (quiet, 75% dark / 85% twilight) (Software 4)', `#projects ${chips}[aria-pressed="false"]:has-text("Software") > span`, 'self'],
  ['Selected chip label (Featured)', `#projects ${chips}[aria-pressed="true"]`, 'self-text'],
  ['Selected chip count (quiet, 75% dark / 85% twilight) (Featured 4)', `#projects ${chips}[aria-pressed="true"] > span`, 'self'],
  ['Map label Software', '#projects .sky-btn:nth-of-type(1) .sky-label', 'self'],
  ['Map label AI', '#projects .sky-btn:nth-of-type(2) .sky-label', 'self'],
  ['Map label Data', '#projects .sky-btn:nth-of-type(3) .sky-label', 'self'],
  ['Map label Systems', '#projects .sky-btn:nth-of-type(4) .sky-label', 'self'],
  ['Search placeholder', '#projects input[type="search"]', 'placeholder'],
  ['Search text', '#projects input[type="search"]', 'self'],
  ['Result line', '#projects p[aria-live="polite"]', 'self'],
  ['Spotlight kicker', '#projects article[data-tone] p:first-of-type', 'self'],
  ['Spotlight summary', '#projects article[data-tone] h3 + p', 'self'],
  ['Tile value (127x)', '#projects ul[aria-label="Measurements"] li:first-child p:first-child', 'self'],
  ['Tile label (muted)', '#projects ul[aria-label="Measurements"] li:first-child p:last-child', 'self'],
  ['Badge chip', '#projects article[data-tone] .chip', 'self'],
  ['Details button', '#projects article[data-tone] .btn-solid', 'self'],
  ['Source button', '#projects article[data-tone] a.btn', 'self'],
  ['Card kind line', '#projects [data-annotate="covers"] li:nth-child(2) article p:first-of-type > span:first-of-type', 'self'],
  ['Card period (muted)', '#projects [data-annotate="covers"] li:nth-child(2) article p:first-of-type > span:last-of-type', 'self'],
  ['Card title', '#projects [data-annotate="covers"] li:nth-child(2) article h3', 'self'],
  ['Card summary', '#projects [data-annotate="covers"] li:nth-child(2) article h3 + p', 'self'],
  ['Card tech line (muted)', '#projects [data-annotate="covers"] li:nth-child(2) article p.mono span:first-child', 'self'],
];

const info = [];
for (const [name, sel, mode] of targets) {
  const loc = page.locator(sel).first();
  if (!(await loc.count())) {
    info.push({ name, missing: true });
    continue;
  }
  info.push({ name, ...(await loc.evaluate((el, mode) => {
    el.scrollIntoView({ block: 'center' });
    const color = mode === 'placeholder' ? getComputedStyle(el, '::placeholder').color : getComputedStyle(el).color;
    let op = 1;
    // "self-text" is a chip's own label, which is not affected by its count span's opacity
    if (mode !== 'self-text') for (let n = el; n && n !== document.body; n = n.parentElement) op *= +getComputedStyle(n).opacity;
    return { color, op };
  }, mode)) });
}

await page.addStyleTag({ content: '#projects *, #projects *::placeholder { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; } #projects .sky-tip { display: none !important }' });

const parse = (c) => c.match(/[\d.]+/g).map(Number);
const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const rows = [];
for (let i = 0; i < targets.length; i++) {
  const t = info[i];
  if (t.missing) {
    rows.push(`MISSING  ${t.name}`);
    continue;
  }
  const el = page.locator(targets[i][1]).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const buf = await el.screenshot();
  const bg = await page.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const c = new OffscreenCanvas(img.width, img.height);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    const ch = [[], [], []];
    for (let p = 0; p < d.length; p += 4) for (let k = 0; k < 3; k++) ch[k].push(d[p + k]);
    return ch.map((a) => a.sort((x, y) => x - y)[a.length >> 1]);
  }, buf.toString('base64'));
  const [r, g, b, a = 1] = parse(t.color);
  const alpha = a * t.op;
  const eff = [r, g, b].map((v, k) => v * alpha + bg[k] * (1 - alpha));
  const cr = ratio(eff, bg);
  rows.push(`${cr >= 4.5 ? 'PASS' : 'FAIL'}  ${cr.toFixed(2)}:1  ${t.name}  (text rgb(${[r, g, b].join(',')}) at ${alpha.toFixed(2)} on rgb(${bg.join(',')}))`);
}
console.log(`Theme: ${theme === 'light' ? 'twilight' : 'dark'}\n` + rows.join('\n'));
await browser.close();
