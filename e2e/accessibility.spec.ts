import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { pageRoutes } from './routes';

// Automated checks catch a subset of problems; they do not establish conformance.
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe, ${scheme} scheme`, () => {
    test.use({ colorScheme: scheme });
    for (const route of [...pageRoutes, '/missing-page/']) {
      test(route, async ({ page }) => {
        await page.goto(route);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      });
    }
  });
}

test('keyboard: skip link first, then main navigation, with visible focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();

  await page.goto('/');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // site name
  await page.keyboard.press('Tab'); // Work
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/work/');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('follows the system setting and keeps all content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
    await expect(page.getByRole('region', { name: 'Selected work' })).toBeVisible();
  });

  test('an explicit choice overrides the system and survives reload', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Motion').selectOption('full');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await expect(page.getByLabel('Motion')).toHaveValue('full');
    await page.getByLabel('Motion').selectOption('system');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  });
});
