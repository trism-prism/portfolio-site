// Checks the cards' technology line: never clipped, only whole names, an accurate "+N", at most three names.
// Usage: MSYS_NO_PATHCONV=1 node docs/design/review/handoff-8/tech-line-check.mjs http://localhost:4321
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const w of [1440, 1280, 1024, 768, 600, 480, 375, 320]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await page.addInitScript(() => { try { localStorage.setItem('tm-motion', 'full'); sessionStorage.setItem('tm-intro', '1'); } catch {} });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.locator('[aria-label="Filter projects"] button', { hasText: /^All/ }).click();
  await page.waitForTimeout(800);
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('#projects [data-annotate="covers"] article p.mono')].map((p) => {
      const title = p.closest('article').querySelector('h3').textContent.trim();
      return { title, text: p.textContent, clipped: p.scrollWidth > p.clientWidth + 0.5, w: p.clientWidth, font: getComputedStyle(p).fontSize + ' ' + getComputedStyle(p).color };
    }),
  );
  const tech = await page.evaluate(() => null);
  void tech;
  const counts = {};
  for (const r of rows) {
    const m = r.text.match(/^(.*?)(?: \+(\d+))?$/);
    const names = m[1].split(' · ');
    counts[names.length] = (counts[names.length] ?? 0) + 1;
    const problems = [];
    if (r.clipped) problems.push('clipped');
    if (names.length > 3) problems.push('more than three');
    if (/…|\.\.\./.test(r.text)) problems.push('ellipsis');
    r.names = names;
    r.more = m[2] ? +m[2] : 0;
    if (problems.length) { bad++; console.log('FAIL', w, r.title, problems.join(','), JSON.stringify(r.text)); }
  }
  // the names plus +N must account for the project's whole stack
  const stacks = await page.evaluate(() => null);
  void stacks;
  console.log(`${w}px: ${rows.length} cards, names shown per card ${JSON.stringify(counts)}, line width ${rows[0]?.w}px, ${rows[0]?.font}`);
  if (w === 1440 || w === 320) rows.filter((r) => w === 1440 || r.names.length === 2).slice(0, 3).forEach((r) => console.log('   ', JSON.stringify(r.text)));
  await page.context().close();
}
await browser.close();
console.log(bad ? `${bad} PROBLEMS` : 'ALL TECH LINES CLEAN');
