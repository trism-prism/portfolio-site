// Behaviour and performance checks for the intro, on the production build.
// Usage (Git Bash): MSYS_NO_PATHCONV=1 node docs/design/review/handoff-9/check.mjs http://localhost:4321
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';

const base = process.argv[2] ?? 'http://localhost:4321';
// navigator.webdriver is true under automation, which suppresses the intro; this flag makes it false, as in a real browser.
const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-blink-features=AutomationControlled'] });
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

async function fresh(opts = {}, init) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  await page.addInitScript((i) => {
    try {
      localStorage.setItem('tm-theme', 'dark');
      if (i?.motion !== 'keep') localStorage.setItem('tm-motion', i?.motion ?? 'full');
    } catch {}
  }, init);
  const errors = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return { ctx, page, errors };
}
const overlay = (page) => page.locator('.intro-overlay').count();
const intro = (page) => page.evaluate(() => document.documentElement.dataset.intro ?? null);

// ---- skipping at 1.0 s: button, key, click, wheel, touch ----
const way = {
  button: (page) => page.click('.intro-skip'),
  key: (page) => page.keyboard.press('Space'),
  click: (page) => page.mouse.click(300, 300),
  wheel: (page) => page.mouse.wheel(0, 300),
  touch: (page) => page.touchscreen.tap(300, 300),
};
for (const [name, act] of Object.entries(way)) {
  const { ctx, page, errors } = await fresh(name === 'touch' ? { hasTouch: true } : {});
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.waitForSelector('.intro-overlay');
  // time on the page's own clock: from the overlay's first frame to the skip, then to the overlay's removal
  await page.evaluate(() => {
    window.__log = { phases: [], logo: [] };
    const html = document.documentElement;
    const t0 = performance.now();
    window.__t0 = t0;
    // the moment the page itself receives the skipping input (Playwright's round trip is not part of the intro's response)
    for (const e of ['keydown', 'pointerdown', 'wheel', 'touchstart']) window.addEventListener(e, () => (window.__skipAt ??= performance.now()), { capture: true, passive: true });
    const logo = document.querySelector('[data-intro-target]');
    const tick = () => {
      const now = performance.now();
      const last = window.__log.phases.at(-1);
      const ph = html.dataset.intro ?? 'none';
      if (!last || last.ph !== ph) window.__log.phases.push({ ph, at: now });
      window.__log.logo.push([now, +getComputedStyle(logo).opacity, document.querySelector('.intro-overlay') ? 1 : 0]);
      if (!window.__log.done) requestAnimationFrame(tick);
    };
    tick();
  });
  await page.waitForTimeout(1000);
  await act(page);
  const skipAt = await page.evaluate(() => window.__skipAt);
  await page.waitForFunction(() => !document.querySelector('.intro-overlay'), null, { timeout: 3000, polling: 'raf' });
  const log = await page.evaluate(() => {
    window.__log.done = true;
    return window.__log;
  });
  const gone = log.logo.find((x) => x[2] === 0)?.[0];
  const noData = log.phases.find((p) => p.ph === 'none' && p.at > skipAt)?.at;
  const landing = log.phases.find((p) => p.ph === 'landing')?.at;
  const dt = gone - skipAt;
  ok(`skip by ${name} at 1.0 s: overlay gone within 0.35 s`, dt <= 350, `${Math.round(dt)} ms; landing after ${Math.round(landing - skipAt)} ms, data-intro removed after ${Math.round(noData - skipAt)} ms`);
  const maxSum = Math.max(...log.logo.filter((x) => x[0] > skipAt).map((x) => x[1] * (x[2] ? 1 : 0)));
  await page.waitForTimeout(1500);
  const heroIn = await page.evaluate(() => {
    const el = document.querySelector('.hero-in');
    const cs = getComputedStyle(el);
    return { state: cs.animationPlayState, opacity: +cs.opacity };
  });
  ok(`skip by ${name}: the hero entrance then plays`, heroIn.state === 'running' && heroIn.opacity > 0.9, JSON.stringify(heroIn));
  const logoOp = await page.evaluate(() => +getComputedStyle(document.querySelector('[data-intro-target]')).opacity);
  ok(`skip by ${name}: logo moth visible afterwards, data-intro gone`, logoOp === 1 && (await intro(page)) === null, `logo opacity ${logoOp}`);
  if (name === 'button') ok('no console errors or warnings (skip run)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- a second load in the same session has no intro; ?project=, #hash, Reduced motion have none ----
{
  const { ctx, page } = await fresh();
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.waitForSelector('.intro-overlay');
  ok('first load plays the intro', (await page.locator('.intro-overlay').count()) === 1 && (await intro(page)) === 'on');
  await page.mouse.click(300, 300);
  await page.waitForFunction(() => !document.querySelector('.intro-overlay'), null, { polling: 'raf' });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  ok('a second load in the same session has no intro', (await overlay(page)) === 0 && (await intro(page)) === null);
  await ctx.close();
}
for (const [label, url, init] of [
  ['#about', `${base}/#about`, undefined],
  ['?project=kiln', `${base}/?project=kiln`, undefined],
  ['Reduced motion', `${base}/`, { motion: 'reduced' }],
  ['Reduced motion with ?intro', `${base}/?intro`, { motion: 'reduced' }],
]) {
  const { ctx, page } = await fresh({}, init);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  ok(`${label}: no intro`, (await overlay(page)) === 0 && (await intro(page)) === null);
  await ctx.close();
}
{
  // the automation flag itself still suppresses it
  const b2 = await chromium.launch({ channel: 'chrome' });
  const ctx = await b2.newContext();
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  ok('navigator.webdriver: no intro', (await page.locator('.intro-overlay').count()) === 0);
  await page.goto(`${base}/?intro`, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  ok('?intro forces it despite webdriver, and the parameter is removed from the URL', (await page.locator('.intro-overlay').count()) === 1 && !page.url().includes('intro'), page.url());
  await b2.close();
}

// ---- a full run: moths, hold/landing phases, long tasks, frame interval ----
{
  const { ctx, page, errors } = await fresh();
  await page.addInitScript(() => {
    window.__long = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ entryTypes: ['longtask'] });
    window.__frames = [];
    window.__samples = [];
    const html = () => document.documentElement;
    const loop = (now) => {
      window.__frames.push(now);
      const logo = document.querySelector('[data-intro-target]');
      const moth = document.querySelector('[data-intro-moth]');
      const ov = document.querySelector('.intro-overlay');
      const line = document.querySelector('.moth-draw .moth-line');
      const hero = document.querySelector('.hero-in');
      if (logo)
        window.__samples.push({
          now,
          intro: html().dataset.intro ?? null,
          logo: +getComputedStyle(logo).opacity,
          moth: moth && ov && moth.childElementCount ? +moth.getAttribute('opacity') * +(getComputedStyle(ov).opacity) : 0,
          line: line ? getComputedStyle(line).animationPlayState : null,
          hero: hero ? getComputedStyle(hero).animationPlayState : null,
        });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  await page.goto(`${base}/`, { waitUntil: 'load' });
  await page.waitForSelector('.intro-overlay');
  await page.waitForFunction(() => !document.querySelector('.intro-overlay'), null, { timeout: 15000, polling: 'raf' });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const S = window.__samples;
    const first = S.find((s) => s.intro)?.now ?? S[0].now; // the overlay's first frame
    const run = S.filter((s) => s.now >= first);
    const frames = window.__frames.filter((f) => f >= first);
    const end = run.find((s) => s.intro === null && s.now > first + 1000)?.now ?? frames.at(-1);
    const fr = frames.filter((f) => f <= end);
    const d = fr.slice(1).map((f, i) => f - fr[i]);
    const d2 = d.slice(3); // without the first three frames, where the overlay mounts
    return {
      long: window.__long.filter(([at]) => at >= first - 50 && at <= end),
      longAll: window.__long,
      avg: d.reduce((a, b) => a + b, 0) / d.length,
      max: Math.max(...d),
      maxAfter: Math.max(...d2),
      avgAfter: d2.reduce((a, b) => a + b, 0) / d2.length,
      over25: d.filter((x) => x > 25).length,
      n: d.length,
      seconds: (end - first) / 1000,
      beforeLanding: run.filter((s) => s.intro === 'on'),
      landing: run.filter((s) => s.intro === 'landing'),
      maxSum: Math.max(...run.map((s) => s.logo + s.moth)),
      overlapFrames: run.filter((s) => s.logo > 0.01 && s.moth > 0.01).length,
      logoWhileMoth: run.filter((s) => s.moth > 0.01 && s.logo > 0.01).map((s) => [Math.round(s.now - first), s.logo, +s.moth.toFixed(2)]),
    };
  });
  const on = r.beforeLanding;
  ok('hero entrance and Moth draw are held while data-intro is "on"', on.length > 30 && on.every((s) => s.hero === 'paused' && (s.line === null || s.line === 'paused')), `${on.length} frames`);
  const lan = r.landing;
  ok('they play once data-intro is "landing"', lan.length > 5 && lan.at(-1).hero === 'running' && lan.at(-1).line === 'running', `${lan.length} frames`);
  ok('the logo moth is hidden for the whole intro except its last 0.1 s', on.filter((s) => s.moth > 0.01).every((s) => s.logo < 0.01) && lan.filter((s) => s.moth > 0.05 && s.logo > 0.01).length <= 8, `${r.overlapFrames} frames with both visible`);
  ok('never two moths at full strength (max logo + flying moth opacity)', r.maxSum <= 1.2, `max ${r.maxSum.toFixed(2)}`);
  console.log('  crossfade samples [ms since start, logo opacity, flying moth opacity]:', JSON.stringify(r.logoWhileMoth));
  ok('no long task over 50 ms during the intro', r.long.every(([, d]) => d <= 50), `long tasks during the run [start ms, duration ms]: ${JSON.stringify(r.long)}; whole page load: ${JSON.stringify(r.longAll)}`);
  console.log(`  frame interval: avg ${r.avg.toFixed(2)} ms, max ${r.max.toFixed(1)} ms over ${r.n} frames (${r.seconds.toFixed(2)} s run); without the first three frames avg ${r.avgAfter.toFixed(2)} ms, max ${r.maxAfter.toFixed(1)} ms; ${r.over25} frames over 25 ms`);
  ok('no console errors or hydration warnings (full run)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const bad = results.filter((r) => !r.pass);
console.log(bad.length ? `\n${bad.length} FAILED` : '\nall checks passed');
process.exit(bad.length ? 1 : 0);
