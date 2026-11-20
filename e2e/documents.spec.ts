import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const sha = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

for (const doc of ['resume.pdf', 'cv.pdf']) {
  test(`${doc} is served as the committed PDF`, async ({ request }) => {
    const res = await request.get(`/${doc}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
    const body = await res.body();
    expect(sha(body)).toBe(sha(readFileSync(path.join('public', doc))));
  });
}

test('résumé and CV are linked from every page footer', async ({ page }) => {
  await page.goto('/work/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: /Résumé/ })).toHaveAttribute('href', '/resume.pdf');
  await expect(footer.getByRole('link', { name: /CV/ })).toHaveAttribute('href', '/cv.pdf');
});
