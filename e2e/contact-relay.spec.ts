import { expect, test, type Page } from '@playwright/test';

// Test-only build wired to https://contact-relay.invalid/submit. Every request to it is answered
// here by page.route; nothing leaves the machine and no message is delivered anywhere.
const RELAY = 'https://contact-relay.invalid/submit';

async function fill(page: Page) {
  await page.goto('/contact/');
  await expect(page.locator('form[data-delivery="relay"]')).toBeVisible();
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('Hello, I enjoyed reading about the engine.');
}

test('success is shown only after the relay accepts, and double clicks send once', async ({ page }) => {
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(RELAY, async (route) => {
    calls += 1;
    await gate;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });

  await fill(page);
  const button = page.getByRole('button', { name: 'Send message' });
  await button.click();
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Sending your message…');
  await page.getByRole('button', { name: 'Sending…' }).click({ force: true });
  await page.locator('form').evaluate((f: HTMLFormElement) => f.requestSubmit());

  release();
  await expect(page.getByRole('status')).toContainText('your message was sent');
  expect(calls).toBe(1);
  await expect(page.getByLabel('Message')).toHaveValue('');
});

test('a relay failure is reported with the email fallback and keeps the message', async ({ page }) => {
  await page.route(RELAY, (route) => route.fulfill({ status: 500, body: 'error' }));
  await fill(page);
  await page.getByRole('button', { name: 'Send message' }).click();

  const status = page.getByRole('status');
  await expect(status).toContainText('did not accept your message');
  await expect(status.getByRole('link', { name: /@/ })).toHaveAttribute('href', /^mailto:/);
  await expect(page.getByLabel('Message')).toHaveValue('Hello, I enjoyed reading about the engine.');
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
});

test('a network failure is reported, not treated as sent', async ({ page }) => {
  await page.route(RELAY, (route) => route.abort('failed'));
  await fill(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status')).toContainText('could not be sent');
  await expect(page.getByRole('status')).not.toContainText('was sent');
});
