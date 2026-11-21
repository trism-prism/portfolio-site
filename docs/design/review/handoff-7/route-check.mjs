// Measures the real route in the browser: samples the drawn path and tests it against the 15 transformed
// constellation lines at several viewport sizes. Usage: node route-check.mjs http://localhost:4321
import { chromium } from 'file:///C:/Studio/code/web/kiln/node_modules/playwright/index.mjs';
const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900], [1440, 1100], [1920, 1080]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.addInitScript(() => { localStorage.setItem('tm-motion', 'reduced'); sessionStorage.setItem('tm-intro', '1'); });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const path = document.querySelector('#hero svg path[mask]');
    const d = path.getAttribute('d');
    const [mx, my, c1x, c1y, c2x, c2y, tx, ty] = d.match(/-?\d+(\.\d+)?/g).map(Number);
    const hero = document.getElementById('hero').getBoundingClientRect();
    const svg = document.querySelector('#hero .hero-moth svg').getBoundingClientRect();
    const s = svg.width / 400;
    const T = ([x, y]) => [svg.left - hero.left + x * s, svg.top - hero.top + y * s];
    const P = { head: [200, 66], antL: [176, 34], antR: [224, 34], thorax: [200, 100], mid: [200, 146], tail: [200, 196], foreL: [70, 52], foreLlow: [112, 134], foreR: [330, 52], foreRlow: [288, 134], hindL: [128, 214], hindR: [272, 214] };
    const L = [['antL','head'],['antR','head'],['head','thorax'],['thorax','mid'],['mid','tail'],['thorax','foreL'],['foreL','foreLlow'],['foreLlow','thorax'],['thorax','foreR'],['foreR','foreRlow'],['foreRlow','thorax'],['foreLlow','hindL'],['hindL','mid'],['foreRlow','hindR'],['hindR','mid']].map(([a, b]) => [T(P[a]), T(P[b])]);
    const tail = T(P.tail);
    const pts = Array.from({ length: 401 }, (_, i) => { const t = i / 400, u = 1 - t; return [u*u*u*mx + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*tx, u*u*u*my + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*ty]; }).filter(([x, y]) => Math.hypot(x - tail[0], y - tail[1]) > 3.4 * s);
    const cr = (o, a, b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);
    const hit = (a, b, c, d) => { const d1=cr(c,d,a), d2=cr(c,d,b), d3=cr(a,b,c), d4=cr(a,b,d); return ((d1>0&&d2<0)||(d1<0&&d2>0)) && ((d3>0&&d4<0)||(d3<0&&d4>0)); };
    let crossed = 0;
    for (const [c, d] of L) for (let i = 0; i < pts.length - 1; i++) if (hit(pts[i], pts[i+1], c, d)) { crossed++; break; }
    return { lines: L.length, crossed, endsAtTail: Math.hypot(tx - tail[0], ty - tail[1]) < 1.5, scale: +s.toFixed(3) };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await page.close();
}
await browser.close();
