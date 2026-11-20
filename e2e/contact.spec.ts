import { expect, test } from '@playwright/test';

// Production configuration: no relay is configured, so a valid form hands off to the mail app.

test('invalid input is reported per field and focus moves to the first problem', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Open in email app' }).click();

  await expect(page.getByLabel('Name')).toBeFocused();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Enter your name.')).toBeVisible();
  await expect(page.getByText('Enter an email address like name@example.com.')).toBeVisible();
  await expect(page.getByText('Write a message.')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveAccessibleDescription('Enter an email address like name@example.com.');
});

test('without a relay, a valid message opens the mail app and never claims it was sent', async ({ page }) => {
  const external: string[] = [];
  const mailto: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (url.startsWith('mailto:')) mailto.push(url);
    else if (!url.startsWith('http://localhost')) external.push(url);
  });

  await page.goto('/contact/');
  await expect(page.locator('form[data-delivery="mail-app"]')).toBeVisible();

  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByRole('textbox', { name: 'Message' }).fill('Hello, I enjoyed reading about the engine.');
  await page.getByRole('button', { name: 'Open in email app' }).click();

  const status = page.getByRole('status');
  await expect(status).toContainText('Your email app should open');
  await expect(status).not.toContainText(/was sent|message sent/i);
  // The only thing that leaves the page is the hand-off to the visitor's own mail app.
  expect(external).toEqual([]);
  expect(mailto).toHaveLength(1);
  expect(decodeURIComponent(mailto[0]!)).toContain('Hello, I enjoyed reading about the engine.');
});
