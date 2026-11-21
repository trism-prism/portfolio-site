// Captures the handoff 9 intro frames with the ?intro=<seconds> freeze parameter, on the production build.
// Usage (Git Bash): MSYS_NO_PATHCONV=1 node docs/design/review/handoff-9/capture.mjs http://localhost:4321
// Playwright comes from the kiln checkout (see handoff-7/capture.mjs).
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const out = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome' });

async function shot(theme, w, h, t, file) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript((th) => {
    try {
      localStorage.setItem('tm-motion', 'full');
      localStorage.setItem('tm-theme', th);
    } catch {}
  }, theme);
  const errors = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${base}/?intro=${t}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  if (t < 4.2) await page.waitForSelector('.intro-overlay');
  // from beat 9 the hero entrance and the Moth draw play behind the ring: the 3.9 s frames wait 0.5 s of it, the finished site 3 s
  await page.waitForTimeout(t >= 4.2 ? 3000 : t >= 3.6 ? 500 : 400);
  await page.screenshot({ path: `${out}/${file}` });
  console.log(file, errors.length ? errors : 'no console errors');
  await ctx.close();
}

const key = [0.2, 0.8, 1.3, 1.7, 2.1, 2.6, 3.1, 3.5, 3.9];
for (const t of key) await shot('dark', 1440, 900, t, `intro-dark-1440-${t.toFixed(1)}s.png`);
// the ring does the reveal: outside it stays night until about 85% of beat 9
for (const t of [3.75, 4.05]) await shot('dark', 1440, 900, t, `intro-dark-1440-${t.toFixed(2)}s.png`);
for (const t of [3.75, 3.9, 4.05]) await shot('light', 1440, 900, t, `intro-twilight-1440-${t.toFixed(2)}s.png`);
await shot('light', 1440, 900, 4.3, 'intro-twilight-1440-4.3s-finished.png');
// phones: the stage is 125vw wide
for (const t of [0.8, 2.6, 3.5]) await shot('dark', 375, 812, t, `intro-dark-375-${t.toFixed(1)}s.png`);
for (const t of [2.6, 3.5]) await shot('dark', 390, 844, t, `intro-dark-390-${t.toFixed(1)}s.png`);
await browser.close();
