import { expect, test, type Page } from '@playwright/test';
import { pageRoutes } from './routes';

const widths = [320, 390, 1440];

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const width of widths) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of pageRoutes) {
      await page.goto(route);
      expect(await overflow(page), route).toBeLessThanOrEqual(0);
    }
  });
}

test('long titles, unbroken words and long lists stay inside the page at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/work/');
  await page.evaluate(() => {
    const heading = document.querySelector('main h2 a');
    if (heading) heading.textContent = 'A'.repeat(120) + ' with a much longer project title than any real one';
    const list = document.querySelector('main section');
    const entry = list?.querySelector('article');
    for (let i = 0; i < 30 && entry; i += 1) list!.appendChild(entry.cloneNode(true));
  });
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Contact' })).toBeInViewport();
});

test('images reserve their space and load lazily below the first one', async ({ page }) => {
  await page.goto('/work/visibility-engine/');
  const imgs = page.locator('main img');
  const count = await imgs.count();
  expect(count).toBeGreaterThan(1);
  for (let i = 0; i < count; i += 1) {
    const img = imgs.nth(i);
    await expect(img).toHaveAttribute('width', /\d+/);
    await expect(img).toHaveAttribute('height', /\d+/);
    await expect(img).toHaveAttribute('loading', i === 0 ? 'eager' : 'lazy');
  }
});
