// The cover before first paint: the head script sets data-intro='on', so the page is hidden before <Intro> mounts.
// Usage (Git Bash): MSYS_NO_PATHCONV=1 node docs/design/review/handoff-9/cover.mjs http://localhost:4321
// 1) scripts are delayed 1.5 s, and a frame is taken right after DOMContentLoaded (about 50 ms after first paint): it must show the cover, not the site.
// 2) scripts are blocked altogether: the cover must lift by itself after 6 s (the failsafe), and the hold must go with it.
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const out = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-blink-features=AutomationControlled'] });
let bad = 0;
const ok = (n, p, d = '') => (console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`), p || bad++);
const init = () => {
  try {
    localStorage.setItem('tm-motion', 'full');
    localStorage.setItem('tm-theme', 'dark');
  } catch {}
};

{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(init);
  await page.route('**/_next/static/**/*.js', async (r) => {
    await new Promise((res) => setTimeout(res, 1500));
    await r.continue();
  });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(50);
  await page.screenshot({ path: `${out}/cover-before-mount-1440.png` });
  const st = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement, '::after');
    return { intro: document.documentElement.dataset.intro, pos: cs.position, z: cs.zIndex, vis: cs.visibility, overlay: !!document.querySelector('.intro-overlay'), hero: !!document.querySelector('#hero') };
  });
  ok('before the overlay mounts: data-intro="on" and the fixed cover is up (site markup is in the DOM)', st.intro === 'on' && st.pos === 'fixed' && st.z === '89' && st.vis === 'visible' && !st.overlay && st.hero, JSON.stringify(st));
  await page.waitForSelector('.intro-overlay', { timeout: 10000 });
  ok('then the intro mounts and takes over', true);
  await ctx.close();
}
for (const [label, killTimer] of [['the boot script timer lifts it', false], ['the CSS animation alone hides it (timer disabled)', true]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(init);
  if (killTimer) await page.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => (ms === 6000 ? 0 : st(f, ms, ...a)); });
  await page.route('**/_next/static/**/*.js', (r) => r.abort());
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  const at = () => page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement, '::after');
    return { intro: document.documentElement.dataset.intro ?? null, shown: cs.content !== 'none' && cs.visibility === 'visible' && +cs.opacity > 0 };
  });
  const early = await at();
  await page.waitForTimeout(6500);
  const late = await at();
  ok(`failsafe, scripts never load: cover up at first, gone after 6 s (${label})`, early.intro === 'on' && early.shown && !late.shown, `${JSON.stringify(early)} -> ${JSON.stringify(late)}`);
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
