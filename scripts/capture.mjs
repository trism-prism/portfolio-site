// Review screenshots of a served static build. Not a test: nothing here asserts the design.
// Usage: npx serve out -l 4181  (in another terminal), then: node scripts/capture.mjs [baseURL] [outDir]
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4181';
const outDir = process.argv[3] ?? 'docs/screenshots/trial';
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: 'entry-desktop-1440x1000', path: '/', width: 1440, height: 1000 },
  { name: 'entry-desktop-1440-full', path: '/', width: 1440, height: 1000, fullPage: true },
  { name: 'entry-mobile-390x844', path: '/', width: 390, height: 844 },
  { name: 'entry-mobile-390-full', path: '/', width: 390, height: 844, fullPage: true },
  { name: 'entry-narrow-320-full', path: '/', width: 320, height: 700, fullPage: true },
  { name: 'case-study-engine-desktop-full', path: '/work/visibility-engine/', width: 1440, height: 1000, fullPage: true },
  { name: 'case-study-docs-qa-desktop-full', path: '/work/docs-qa-copilot/', width: 1440, height: 1000, fullPage: true },
  { name: 'case-study-docs-qa-mobile-full', path: '/work/docs-qa-copilot/', width: 390, height: 844, fullPage: true },
  { name: 'project-kiln-no-case-study-desktop-full', path: '/work/kiln/', width: 1440, height: 1000, fullPage: true },
  { name: 'project-tripwire-no-media-mobile-full', path: '/work/tripwire/', width: 390, height: 844, fullPage: true },
  { name: 'contact-desktop-1440x1000', path: '/contact/', width: 1440, height: 1000 },
  { name: 'contact-mobile-390-full', path: '/contact/', width: 390, height: 844, fullPage: true },
  { name: 'entry-desktop-reduced-motion', path: '/', width: 1440, height: 1000, reducedMotion: 'reduce' },
];

const browser = await chromium.launch();
for (const s of shots) {
  const context = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    reducedMotion: s.reducedMotion ?? 'no-preference',
  });
  const page = await context.newPage();
  await page.goto(base + s.path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(outDir, `${s.name}.png`);
  await page.screenshot({ path: file, fullPage: Boolean(s.fullPage) });
  console.log(file);
  await context.close();
}

// Contact path with validation errors visible.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(base + '/contact/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /email app|Send message/ }).click();
  const file = path.join(outDir, 'contact-desktop-errors.png');
  await page.screenshot({ path: file });
  console.log(file);
  await context.close();
}
await browser.close();
