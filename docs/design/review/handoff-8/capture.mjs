// Captures the handoff 8 review shots. Usage (Git Bash): MSYS_NO_PATHCONV=1 node docs/design/review/handoff-8/capture.mjs http://localhost:3217
// Playwright comes from the kiln checkout (see handoff-7/capture.mjs). Motion is full; the intro is skipped for the session.
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const out = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? 'http://localhost:3217';
const browser = await chromium.launch({ channel: 'chrome' });
const sizes = [[1440, 900], [1024, 768], [768, 1024], [375, 812]];

async function open(theme, w, h) {
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
  // Walk down the section so every cover scene starts, then settle at the top of the section.
  const height = await page.evaluate(() => document.getElementById('projects').offsetHeight);
  for (let y = 0; y <= height; y += 500) {
    await page.evaluate((dy) => window.scrollTo(0, document.getElementById('projects').getBoundingClientRect().top + window.scrollY + dy), y);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(1800);
  return { ctx, page, errors };
}

// Cover scenes pause while offscreen, so grow the viewport to the whole section before shooting it.
const section = async (page, file) => {
  const vp = page.viewportSize();
  const h = await page.evaluate(() => document.getElementById('projects').offsetHeight);
  await page.setViewportSize({ width: vp.width, height: h + 200 });
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(1500);
  await page.locator('#projects').screenshot({ path: `${out}/${file}` });
  await page.setViewportSize(vp);
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(500);
};

for (const theme of ['dark', 'light']) {
  for (const [w, h] of sizes) {
    const { ctx, page, errors } = await open(theme, w, h);
    const name = `${theme === 'light' ? 'twilight' : 'dark'}-${w}`;
    await section(page, `projects-${name}-featured.png`);
    console.log(name, errors.length ? errors : 'no console errors');
    await ctx.close();
  }
}

// 1440 dark: the other states.
{
  const { ctx, page, errors } = await open('dark', 1440, 900);
  const map = page.locator('.sky-map');
  const clipAround = async (file, pad = 70) => {
    const b = await map.boundingBox(); // viewport coordinates; the hover must still be active, so no scrolling here
    await page.screenshot({ path: `${out}/${file}`, clip: { x: Math.max(0, b.x - 24), y: Math.max(0, b.y - pad), width: b.width + 48, height: b.height + pad + 150 } });
  };
  await page.locator('[aria-label="Filter projects"] button', { hasText: /^All/ }).click();
  await page.waitForTimeout(600);
  await section(page, 'projects-dark-1440-all.png');

  await page.locator('.sky-btn[aria-label^="AI"]').click();
  await page.waitForTimeout(600);
  await section(page, 'projects-dark-1440-ai-from-map.png');

  await page.locator('.sky-btn[aria-label^="AI"]').click(); // back to All
  await page.getByPlaceholder('Search projects or technology').fill('Python');
  await page.waitForTimeout(800);
  await section(page, 'projects-dark-1440-search-python.png');
  await page.getByPlaceholder('Search projects or technology').fill('');

  await page.locator('[aria-label="Filter projects"] button', { hasText: /^Featured/ }).click();
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollBy(0, document.querySelector('.sky-map').getBoundingClientRect().top - 120));
  await page.waitForTimeout(300);
  await page.locator('.sky-hit[data-slug="kiln"]').hover();
  await page.waitForTimeout(400);
  await clipAround('projects-dark-1440-star-hover.png');
  console.log('1440 states', errors.length ? errors : 'no console errors');
  await ctx.close();
}
await browser.close();
