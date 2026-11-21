// In `npm run dev` (React StrictMode double-mount), a stored Reduced setting must survive a reload and show the finished hero.
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
const base = process.argv[2] ?? 'http://localhost:3217';
const b = await chromium.launch({ channel: 'chrome' });
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()));
await page.addInitScript(() => sessionStorage.setItem('tm-intro', '1'));
await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 120000 });
await page.evaluate(() => localStorage.setItem('tm-motion', 'reduced'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
console.log(JSON.stringify(await page.evaluate(() => ({
  motion: document.documentElement.dataset.motion,
  heroAnimations: document.getAnimations().filter((a) => a.effect?.target?.closest?.('#hero') && /hero-in|moth-|route-draw/.test(a.animationName ?? '')).length,
  linesDrawn: [...document.querySelectorAll('#hero .moth-line')].every((l) => parseFloat(getComputedStyle(l).strokeDashoffset) === 0),
  routeOffset: getComputedStyle(document.querySelector('#hero .hero-route-line')).strokeDashoffset,
}))));
const btn = page.getByRole('button', { name: /motion/i }).first();
const modes = [];
for (let i = 0; i < 2; i++) { await btn.click(); await page.waitForTimeout(300); modes.push(await page.evaluate(() => document.documentElement.dataset.motion + '/' + localStorage.getItem('tm-motion'))); }
console.log('after two toggles (dataset/stored):', modes.join(', '));
console.log('console errors/warnings:', errors.length ? errors : 'none');
await b.close();
