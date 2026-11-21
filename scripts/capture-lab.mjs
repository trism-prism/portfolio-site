// Captures every [data-sheet] section on a lab page as its own PNG, at 1440px wide and full height.
// Usage (Git Bash: keep MSYS_NO_PATHCONV=1 so the URL path is not rewritten into a Windows path):
//   MSYS_NO_PATHCONV=1 node scripts/capture-lab.mjs docs/design/mockups http://localhost:3217 /lab/theme/ theme-
// Uses Playwright from the foundation worktree with the installed Chrome, so nothing is downloaded.
import { chromium } from 'file:///C:/Studio/_trials/portfolio-site-rebuild/node_modules/playwright/index.mjs';

const [out, base, path, prefix = ''] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await page.addInitScript(() => {
  try {
    localStorage.setItem('tm-motion', 'reduced');
    sessionStorage.setItem('tm-intro', '1');
  } catch {}
});
await page.goto(base + path, { waitUntil: 'networkidle', timeout: 120000 });
await page.addStyleTag({ content: 'nextjs-portal,.skip-link{display:none!important}' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
const info = await page.$$eval('[data-sheet]', (els) => els.map((e) => ({ id: e.getAttribute('data-sheet'), top: e.offsetTop, h: e.offsetHeight })));
let i = 1;
for (const s of info) {
  // Size the viewport to the section so tall sections render fully (element screenshots of
  // off-screen parts inside a fixed scroll container come out blank).
  await page.setViewportSize({ width: 1440, height: s.h });
  await page.evaluate((top) => {
    document.querySelector('[data-lenis-prevent]').scrollTop = top;
    document.activeElement?.blur?.();
  }, s.top);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${prefix}${String(i++).padStart(2, '0')}-${s.id}.png` });
  console.log('saved', s.id, s.h);
}
await browser.close();
