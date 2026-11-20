import { defineConfig, devices } from '@playwright/test';

// Serves the static builds made by scripts/build-e2e.mjs. Run `npm run build:e2e` first
// (check:full does). Tests never contact a real relay or send email.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      name: 'site',
      testIgnore: /contact-relay/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'relay',
      testMatch: /contact-relay/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4174' },
    },
  ],
  webServer: [
    {
      command: 'npx serve out -l 4173 --no-clipboard',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npx serve out-relay -l 4174 --no-clipboard',
      url: 'http://localhost:4174',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
