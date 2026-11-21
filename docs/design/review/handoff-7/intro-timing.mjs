// First-visit capture: the intro splash holds the hero draw; frames just before the splash leaves, 0.6 s and 2.5 s after.
// navigator.webdriver suppresses the splash, so it is forced to false. Usage: node intro-timing.mjs http://localhost:4321
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const out = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript(() => {
  localStorage.setItem('tm-motion', 'full');
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  window.__t = {};
  setInterval(() => {
    const on = document.documentElement?.dataset.intro === 'on';
    if (on && !window.__t.on) window.__t.on = performance.now();
    if (!on && window.__t.on && !window.__t.leave) window.__t.leave = performance.now();
  }, 20);
});
const errors = [];
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()));
await page.goto(base + '/', { waitUntil: 'commit' });
const state = () => page.evaluate(() => {
  const hero = [...document.querySelectorAll('#hero .moth-line')].map((l) => parseFloat(getComputedStyle(l).strokeDashoffset));
  const route = document.querySelector('#hero .hero-route-line');
  return { intro: document.documentElement.dataset.intro ?? null, linesNotDrawn: hero.filter((v) => v > 0.001).length, routeOffset: route ? +parseFloat(getComputedStyle(route).strokeDashoffset).toFixed(2) : null, h1Opacity: +getComputedStyle(document.querySelector('#hero-title span')).opacity, heroInMs: Math.round(document.querySelector('#hero-title span').getAnimations()[0]?.currentTime ?? -1) };
});
await page.waitForFunction(() => window.__t.on, null, { timeout: 15000 });
await page.waitForTimeout(2000); // splash leaves 2.3-3.0 s after it appears
console.log('before leave', JSON.stringify(await state()));
await page.screenshot({ path: `${out}/intro-1-before-leave.png` });
await page.waitForFunction(() => window.__t.leave, null, { timeout: 15000 });
const leaveAt = await page.evaluate(() => window.__t.leave);
for (const [dt, name] of [[0.6, 'intro-2-leave-plus-0.6s'], [2.5, 'intro-3-leave-plus-2.5s']]) {
  await page.waitForFunction(([t0, d]) => performance.now() - t0 >= d * 1000, [leaveAt, dt]);
  console.log(`leave+${dt}s`, JSON.stringify(await state()));
  await page.screenshot({ path: `${out}/${name}.png` });
}
console.log('splash shown for', Math.round((leaveAt - (await page.evaluate(() => window.__t.on))) ) , 'ms; console:', errors.length ? errors : 'clean');
await browser.close();
