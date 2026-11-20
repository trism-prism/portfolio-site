// Builds the two static outputs the browser tests serve:
//   out-relay/  contact form wired to a fake relay URL that Playwright intercepts (never contacted)
//   out/        the real production configuration (no relay: the form hands off to the mail app)
// The relay build runs first because both builds write to out/.
import { execSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';

const run = (env) =>
  execSync('npx next build', { stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ...env } });

rmSync('out-relay', { recursive: true, force: true });
run({ NEXT_PUBLIC_CONTACT_ENDPOINT: 'https://contact-relay.invalid/submit' });
renameSync('out', 'out-relay');

// The production build must not inherit a relay endpoint from the developer's shell.
run({ NEXT_PUBLIC_CONTACT_ENDPOINT: '', NEXT_PUBLIC_CONTACT_ACCESS_KEY: '' });
if (!existsSync('out/index.html')) throw new Error('production build did not produce out/index.html');
