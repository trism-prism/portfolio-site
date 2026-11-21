// Records one full intro (1440 dark) with Playwright's recordVideo. Usage (Git Bash):
// MSYS_NO_PATHCONV=1 node docs/design/review/handoff-9/record.mjs http://localhost:4321 <output folder>
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { statSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4321';
const dir = process.argv[3];
const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  try {
    localStorage.setItem('tm-theme', 'dark');
    localStorage.setItem('tm-motion', 'full');
  } catch {}
});
await page.goto(`${base}/`, { waitUntil: 'load' });
await page.waitForSelector('.intro-overlay');
await page.waitForFunction(() => !document.querySelector('.intro-overlay'), null, { timeout: 15000, polling: 'raf' });
await page.waitForTimeout(2500);
const video = page.video();
await ctx.close();
const src = await video.path();
const dest = join(dir, 'intro-1440-dark.webm');
renameSync(src, dest);
console.log(dest, (statSync(dest).size / 1048576).toFixed(2), 'MB');
await browser.close();
