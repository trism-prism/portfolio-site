// Motion checks for handoff 7: mid-draw frame, Reduced motion, and the first-visit intro splash.
// Usage: node docs/design/review/handoff-7/motion-check.mjs http://localhost:3217
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const out = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? 'http://localhost:3217';
const browser = await chromium.launch({ channel: 'chrome' });

const probe = (page) =>
  page.evaluate(() => {
    const anims = document.getAnimations().filter((a) => a.effect?.target?.closest?.('#hero') && /moth-|route-draw|moth-fade/.test(a.animationName ?? ''));
    const running = anims.filter((a) => a.playState === 'running').length;
    const pending = anims.filter((a) => a.playState === 'running' && a.currentTime < (a.effect.getComputedTiming().endTime ?? 0)).length;
    const splash = !!document.querySelector('div[aria-hidden="true"][class*="z-[90]"]');
    const lines = [...document.querySelectorAll('#hero .moth-line')].map((l) => getComputedStyle(l).strokeDashoffset);
    const route = document.querySelector('#hero .hero-route-line');
    return { animations: anims.length, running, splash, linesHidden: lines.filter((v) => parseFloat(v) > 0.001).length, linesTotal: lines.length, routePresent: !!route, routeOffset: route ? getComputedStyle(route).strokeDashoffset : null };
  });

async function run(label, { motion, intro, steps }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(({ motion, intro }) => {
    try {
      localStorage.setItem('tm-motion', motion);
      if (!intro) sessionStorage.setItem('tm-intro', '1');
    } catch {}
    if (intro) Object.defineProperty(navigator, 'webdriver', { get: () => false });
  }, { motion, intro });
  const errors = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const t0 = Date.now();
  await page.goto(base + '/', { waitUntil: 'commit' });
  for (const [t, shot] of steps) {
    const wait = t * 1000 - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    const p = await probe(page);
    console.log(label, `t=${t}s`, JSON.stringify(p));
    if (shot) await page.screenshot({ path: `${out}/${shot}` });
  }
  console.log(label, 'console errors/warnings:', errors.length ? errors : 'none');
  await ctx.close();
}

await run('full/no-intro', { motion: 'full', intro: false, steps: [[1.6, 'motion-mid-draw.png'], [2.6, null], [4.5, null]] });
await run('reduced', { motion: 'reduced', intro: false, steps: [[3, 'motion-reduced-1440.png']] });
await run('full/first-visit-intro', { motion: 'full', intro: true, steps: [[1.5, 'motion-intro-covering.png'], [3, null], [4.2, null], [6.0, 'motion-after-intro-6s.png'], [8, 'motion-after-intro-8s.png']] });
await browser.close();
