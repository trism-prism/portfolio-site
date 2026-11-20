import { expect, test } from '@playwright/test';
import { hiddenList, publicList, withCaseStudy, withoutCaseStudy } from './routes';

test('entry to a featured project and its case study', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tristan Morton');
  const featured = publicList.filter((p) => p.visibility === 'featured');
  // Trial: selected work is a tabbed viewer; every featured project has a tab.
  const viewer = page.getByRole('region', { name: 'Selected work' });
  await expect(viewer.getByRole('tab')).toHaveText(featured.map((p) => new RegExp(escapeRe(p.title))));
  // The full index on the entry view links every public project.
  const index = page.getByRole('region', { name: 'Index of work' });
  for (const p of publicList) await expect(index.getByRole('link', { name: p.title, exact: true })).toBeVisible();

  const target = featured.find((p) => p.caseStudy && p.slug !== featured[0]!.slug) ?? withCaseStudy;
  await viewer.getByRole('tab', { name: new RegExp(escapeRe(target.title)) }).click();
  await viewer.getByRole('link', { name: `Read about ${target.title}` }).click();
  await expect(page).toHaveURL(`/work/${target.slug}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(target.title);
  await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
  // Case-study headings are authored per project; check one exists and the source link is present.
  await expect(page.getByRole('region', { name: 'Case study' }).getByRole('heading', { level: 2 }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Source code', exact: true })).toHaveAttribute('href', target.links.repo!);
  await expect(page.getByRole('link', { name: 'Read the source code' })).toHaveAttribute('href', target.links.repo!);
});

test('the selected-work viewer follows the tabs keyboard pattern', async ({ page }) => {
  await page.goto('/');
  const featured = publicList.filter((p) => p.visibility === 'featured');
  const viewer = page.getByRole('region', { name: 'Selected work' });
  const first = viewer.getByRole('tab').first();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  const second = viewer.getByRole('tab').nth(1);
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(viewer.getByRole('tabpanel')).toHaveCount(1);
  await expect(viewer.getByRole('link', { name: `Read about ${featured[1]!.title}` })).toBeVisible();
  await page.keyboard.press('End');
  await expect(viewer.getByRole('tab').last()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(first).toBeFocused();
});

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
