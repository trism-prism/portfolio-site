// Behaviour and motion checks for handoff 8. Usage (Git Bash): MSYS_NO_PATHCONV=1 node docs/design/review/handoff-8/check.mjs http://localhost:3217
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';

const base = process.argv[2] ?? 'http://localhost:3217';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

async function open(path = '/', { motion = 'full', w = 1440 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript((m) => {
    try {
      localStorage.setItem('tm-motion', m);
      sessionStorage.setItem('tm-intro', '1');
    } catch {}
  }, motion);
  const errors = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 120000 });
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  return { ctx, page, errors };
}
const pressed = (page, sel) => page.locator(sel).evaluateAll((els) => els.map((e) => [e.getAttribute('aria-label') ?? e.textContent.trim(), e.getAttribute('aria-pressed')]).filter(([, p]) => p === 'true').map(([l]) => l));
const chip = (page, label) => page.locator('[role="group"][aria-label="Filter projects"] button', { hasText: new RegExp(`^${label}`) });
const mapBtn = (page, kind) => page.locator(`.sky-btn[aria-label^="${kind},"]`);
const chipOn = async (page, label) => (await chip(page, label).getAttribute('aria-pressed')) === 'true';
const mapOn = async (page, kind) => (await mapBtn(page, kind).getAttribute('aria-pressed')) === 'true';

// ---- Behaviour ----
{
  const { ctx, page, errors } = await open();
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(500);

  ok('map has four kind buttons labelled "<Kind>, N projects"', JSON.stringify(await page.locator('.sky-btn').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label')))) === JSON.stringify(['Software, 4 projects', 'AI, 2 projects', 'Data, 3 projects', 'Systems, 2 projects']));
  ok('starts on Featured (chip pressed, no map button pressed)', (await chipOn(page, 'Featured')) && (await pressed(page, '.sky-btn')).length === 0);

  // map -> chips
  await mapBtn(page, 'Software').click();
  ok('map Software -> chip Software pressed, Featured not', (await chipOn(page, 'Software')) && !(await chipOn(page, 'Featured')) && (await mapOn(page, 'Software')));
  await mapBtn(page, 'Software').click();
  ok('pressing the active kind returns to All (chip and map)', (await chipOn(page, 'All')) && (await pressed(page, '.sky-btn')).length === 0);
  // chips -> map
  await chip(page, 'Data').click();
  ok('chip Data -> map Data pressed', await mapOn(page, 'Data'));
  await chip(page, 'Featured').click();
  ok('chip Featured -> no map button pressed', (await pressed(page, '.sky-btn')).length === 0);

  // dimming
  const opac = (kind) => page.evaluate((k) => {
    const g = [...document.querySelectorAll('.sky-map > svg > g')];
    const kinds = ['software', 'ai', 'data', 'systems'];
    return +getComputedStyle(g[kinds.indexOf(k)]).opacity;
  }, kind);
  await page.waitForTimeout(500);
  await mapBtn(page, 'AI').click();
  await page.waitForTimeout(500);
  ok('kind filter dims the other groups to 0.3 and leaves the chosen one at 1', (await opac('ai')) === 1 && (await opac('software')) === 0.3 && (await opac('data')) === 0.3 && (await opac('systems')) === 0.3);
  await chip(page, 'Featured').click();
  await page.waitForTimeout(500);
  const starOp = (slug) => page.evaluate((s) => {
    const hit = document.querySelector(`.sky-hit[data-slug="${s}"]`);
    const stars = [...document.querySelectorAll('.sky-map > svg .sky-star')];
    // the star <g>s and the hit divs share the layout order
    const all = [...document.querySelectorAll('.sky-hit')];
    return +getComputedStyle(stars[all.indexOf(hit)].parentElement).opacity;
  }, slug);
  ok('Featured dims non-featured stars to 0.4 (tripwire) and not featured ones (kiln)', (await starOp('tripwire')) === 0.4 && (await starOp('kiln')) === 1);
  await chip(page, 'All').click();
  await page.waitForTimeout(500);
  ok('All with no query shows everything at full strength', (await starOp('tripwire')) === 1 && (await opac('software')) === 1);
  await page.getByPlaceholder('Search projects or technology').fill('Python');
  await page.waitForTimeout(1500);
  ok('search "Python" dims non-matching stars to 0.2 (kiln) and keeps matches (tripwire)', (await starOp('kiln')) === 0.2 && (await starOp('tripwire')) === 1, `kiln=${await starOp('kiln')} tripwire=${await starOp('tripwire')}`);
  ok('result line is an aria-live "N of M projects"', (await page.locator('p[aria-live="polite"]').innerText()).match(/^\d+ of \d+ projects$/) !== null, await page.locator('p[aria-live="polite"]').innerText());
  ok('zero-count chip is hidden while searching (Software, 0 matches)', (await chip(page, 'Software').count()) === 0);
  await page.getByPlaceholder('Search projects or technology').fill('zzzzqq');
  await page.waitForTimeout(700);
  ok('search empty state shows and Clear search restores', (await page.getByText('No projects match').count()) === 1 && (await page.getByRole('button', { name: 'Clear search' }).count()) === 1);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.waitForTimeout(500);
  ok('after Clear search the cards are back', (await page.locator('[data-annotate="covers"] > li').count()) > 0 && (await page.getByPlaceholder('Search projects or technology').inputValue()) === '');
  await chip(page, 'All').click();

  // keyboard
  const tabbables = await page.evaluate(() => {
    const sec = document.getElementById('projects');
    return [...sec.querySelectorAll('a[href],button,input,textarea,select,[tabindex]')]
      .filter((e) => e.getAttribute('tabindex') !== '-1' && !e.disabled && e.offsetParent !== null)
      .slice(0, 6)
      .map((e) => e.getAttribute('aria-label') ?? e.textContent.trim().slice(0, 12));
  });
  ok('Tab order inside Projects starts with the four map buttons, then the chips', JSON.stringify(tabbables.slice(0, 4)) === JSON.stringify(['Software, 4 projects', 'AI, 2 projects', 'Data, 3 projects', 'Systems, 2 projects']), tabbables.join(' | '));
  await mapBtn(page, 'Software').focus();
  const seq = [];
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    seq.push(await page.evaluate(() => document.activeElement.getAttribute('aria-label')));
  }
  ok('real Tab presses move through the four map buttons', JSON.stringify(seq) === JSON.stringify(['AI, 2 projects', 'Data, 3 projects', 'Systems, 2 projects']), seq.join(' | '));
  await mapBtn(page, 'Data').focus();
  await page.keyboard.press('Enter');
  const afterEnter = await mapOn(page, 'Data');
  await page.keyboard.press('Space');
  const afterSpace = await mapOn(page, 'Data');
  ok('Enter selects and Space deselects the focused map button', afterEnter && !afterSpace && (await chipOn(page, 'All')), `afterEnter=${afterEnter} afterSpace=${afterSpace}`);

  // stars open the right project
  const slugs = await page.locator('.sky-hit').evaluateAll((e) => e.map((x) => x.dataset.slug));
  const titles = await page.evaluate(async () => null);
  let starsOk = true;
  const wrong = [];
  for (const slug of slugs) {
    await page.locator(`.sky-hit[data-slug="${slug}"]`).click();
    await page.waitForTimeout(350);
    const url = page.url();
    const dlg = await page.getByRole('dialog').count();
    if (!url.includes(`project=${slug}`) || dlg !== 1) {
      starsOk = false;
      wrong.push(slug);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  void titles;
  ok(`clicking each of the ${slugs.length} stars opens that project (URL ?project=<slug> and a dialog)`, starsOk, wrong.join(','));
  await page.locator('.sky-hit[data-slug="kiln"]').click();
  await page.waitForTimeout(400);
  ok('the dialog for the Kiln star is titled Kiln', (await page.getByRole('dialog').getByRole('heading', { name: 'Kiln' }).count()) === 1);
  await page.keyboard.press('Escape');

  ok('every star is aria-hidden', (await page.locator('.sky-hit:not([aria-hidden="true"])').count()) === 0);
  ok('no console errors or hydration warnings', errors.length === 0, errors.join(' // '));
  await ctx.close();
}

// deep link
{
  const { ctx, page, errors } = await open('/?project=kiln#projects');
  await page.waitForTimeout(1200);
  ok('?project=kiln#projects opens Kiln on load', (await page.getByRole('dialog').getByRole('heading', { name: 'Kiln' }).count()) === 1);
  ok('deep link: no console errors', errors.length === 0, errors.join(' // '));
  await ctx.close();
}

// ---- Motion ----
{
  const { ctx, page } = await open('/', { motion: 'full' });
  const lines = () =>
    page.evaluate(() => {
      const ls = [...document.querySelectorAll('.sky-map .sky-line')];
      return { n: ls.length, offsets: ls.map((l) => +parseFloat(getComputedStyle(l).strokeDashoffset).toFixed(2)), cls: document.querySelector('.sky-map').className.match(/sky-(hold|play)/)?.[0] ?? 'none' };
    });
  const before = await lines();
  ok('before first view the lines are held back (class sky-hold, every dashoffset 1)', before.cls === 'sky-hold' && before.offsets.every((o) => o === 1), JSON.stringify(before));
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(250);
  const mid = await page.evaluate(() => document.getAnimations().filter((a) => a.animationName === 'sky-line').map((a) => a.playState));
  ok('on first view the line animations run', mid.length > 0 && mid.includes('running'), `${mid.length} animations`);
  const delays = await page.evaluate(() => document.getAnimations().filter((a) => a.animationName === 'sky-line' || a.animationName === 'sky-fade').map((a) => a.effect.getComputedTiming().delay + a.effect.getComputedTiming().duration));
  ok('whole draw takes about 0.9 s', Math.max(...delays) <= 1100 && Math.max(...delays) >= 800, `longest end ${Math.max(...delays)} ms`);
  await page.waitForTimeout(1500);
  const after = await lines();
  ok('after the draw every line is complete (dashoffset 0)', after.cls === 'sky-play' && after.offsets.every((o) => o === 0), JSON.stringify(after));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(300);
  const again = await page.evaluate(() => document.getAnimations().filter((a) => a.animationName === 'sky-line' && a.playState === 'running').length);
  ok('scrolling away and back does not draw again', again === 0);
  const loops = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.target?.closest?.('#projects') && !a.effect.target.closest('.cover-stage') && a.effect.getComputedTiming().iterations === Infinity)
      .map((a) => a.animationName || a.effect.target.tagName),
  );
  ok('nothing in Projects loops apart from the cover scenes', loops.length === 0, loops.join(','));
  await ctx.close();
}
{
  const { ctx, page, errors } = await open('/', { motion: 'reduced' });
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({
    offsets: [...document.querySelectorAll('.sky-map .sky-line')].map((l) => +parseFloat(getComputedStyle(l).strokeDashoffset).toFixed(2)),
    starOps: [...document.querySelectorAll('.sky-map .sky-star')].map((s) => +getComputedStyle(s).opacity),
    running: document.getAnimations().filter((a) => /^sky-/.test(a.animationName)).length,
    transition: getComputedStyle(document.querySelector('.sky-map .sky-dim')).transitionDuration,
    motion: document.documentElement.dataset.motion,
  }));
  ok('Reduced motion: lines and stars drawn complete, no sky animations, no dim transition', r.motion === 'reduced' && r.offsets.every((o) => o === 0) && r.starOps.every((o) => o === 1) && r.running === 0 && r.transition === '0s', JSON.stringify({ ...r, offsets: r.offsets.length, starOps: r.starOps.length }));
  ok('Reduced motion: no console errors', errors.length === 0, errors.join(' // '));
  await ctx.close();
}
await browser.close();
console.log(results.every(Boolean) ? `\nALL ${results.length} CHECKS PASSED` : `\n${results.filter((x) => !x).length} OF ${results.length} CHECKS FAILED`);
