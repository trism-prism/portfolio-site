import { expect, test } from '@playwright/test';
import { hiddenList, publicList, withCaseStudy, withoutCaseStudy } from './routes';

test('entry to a featured project and its case study', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tristan Morton');
  const featured = publicList.filter((p) => p.visibility === 'featured');
  const section = page.getByRole('region', { name: 'Selected work' });
  for (const p of featured) await expect(section.getByRole('link', { name: p.title })).toBeVisible();

  await section.getByRole('link', { name: withCaseStudy.title }).click();
  await expect(page).toHaveURL(`/work/${withCaseStudy.slug}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(withCaseStudy.title);
  await expect(page.getByRole('heading', { name: 'Highlights' })).toBeVisible();
  // Case-study headings are authored per project; check one exists and the source link is present.
  await expect(page.getByRole('region', { name: 'Case study' }).getByRole('heading', { level: 2 }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Source code' })).toHaveAttribute('href', withCaseStudy.links.repo!);
});

test('a project without a case study still has a complete page', async ({ page }) => {
  await page.goto(`/work/${withoutCaseStudy.slug}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(withoutCaseStudy.title);
  await expect(page.getByText(withoutCaseStudy.summary)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Case study' })).toHaveCount(0);
});

test('direct URL, reload, back and forward keep the right page', async ({ page }) => {
  const [first, second] = publicList;
  await page.goto(`/work/${first!.slug}/`);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(first!.title);

  await page.getByRole('navigation', { name: 'More projects' }).getByRole('link', { name: second!.title }).click();
  await expect(page).toHaveURL(`/work/${second!.slug}/`);
  await page.goBack();
  await expect(page).toHaveURL(`/work/${first!.slug}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(first!.title);
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(second!.title);
});

test('the work collection lists every public project in order and no hidden ones', async ({ page }) => {
  await page.goto('/work/');
  const titles = page.getByRole('region', { name: 'All projects' }).getByRole('heading', { level: 2 });
  await expect(titles).toHaveText(publicList.map((p) => p.title));
  for (const h of hiddenList) await expect(page.getByText(h.title, { exact: true })).toHaveCount(0);
});

test('invalid and hidden slugs give a 404 page with a way back', async ({ page }) => {
  for (const path of ['/work/not-a-project/', ...hiddenList.map((h) => `/work/${h.slug}/`), '/nope/']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.getByRole('main').getByRole('link', { name: 'All projects' })).toBeVisible();
  }
});

test('main navigation marks the current section', async ({ page }) => {
  await page.goto(`/work/${publicList[0]!.slug}/`);
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL('/about/');
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current', 'page');
});
