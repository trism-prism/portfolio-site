// Captures the handoff 7 review shots. Usage (Git Bash): node docs/design/review/handoff-7/capture.mjs http://localhost:3217
// Playwright comes from the kiln checkout (the foundation worktree used by scripts/capture-lab.mjs no longer exists). Motion is set to full with the draw
// finished (waits 4 s) unless a mode is given: node capture.mjs <base> reduced   or   node capture.mjs <base> full-intro
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const out = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? 'http://localhost:3217';
const browser = await chromium.launch({ channel: 'chrome' });
const sizes = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [375, 812],
];
for (const theme of ['dark', 'light']) {
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.addInitScript((t) => {
      try {
        localStorage.setItem('tm-motion', 'full');
        localStorage.setItem('tm-theme', t);
        sessionStorage.setItem('tm-intro', '1');
      } catch {}
    }, theme);
    const errors = [];
    page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 120000 });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(4200);
    const name = `${theme === 'light' ? 'twilight' : 'dark'}-${w}`;
    await page.screenshot({ path: `${out}/hero-${name}.png` });
    if (w === 1440) {
      // a section further down, with the side tiles in view
      await page.evaluate(() => window.scrollTo(0, 2600));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${out}/tiles-${name}.png` });
    }
    console.log(name, errors.length ? errors : 'no console errors');
    await ctx.close();
  }
}
await browser.close();
