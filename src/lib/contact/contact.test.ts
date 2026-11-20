import { describe, expect, it, vi } from 'vitest';
import { mailtoHref, relayTransport, transportFromEnv } from './transport';
import { hasErrors, validateContact } from './validate';

const good = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, I liked the engine.' };

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(validateContact(good)).toEqual({});
  });

  it('reports each missing or malformed field', () => {
    const errors = validateContact({ name: ' ', email: 'not-an-email', message: 'short' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name']);
    expect(hasErrors(errors)).toBe(true);
  });

  it('trims before checking', () => {
    expect(validateContact({ ...good, email: '  ada@example.com  ' })).toEqual({});
  });

  it('rejects overlong input', () => {
    expect(validateContact({ ...good, message: 'x'.repeat(5001) }).message).toBeDefined();
  });
});

describe('relayTransport', () => {
  it('reports success only for a 2xx response, and posts trimmed JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }));
    const t = relayTransport('https://relay.test/f', { fetchImpl, extraFields: { access_key: 'k' } });
    expect(await t.send({ ...good, name: ' Ada ' })).toEqual({ ok: true });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ ...good, access_key: 'k' });
  });

  it('reports rejection with the status code', async () => {
    const t = relayTransport('https://relay.test/f', { fetchImpl: async () => new Response('', { status: 422 }) });
    expect(await t.send(good)).toEqual({ ok: false, reason: 'rejected', status: 422 });
  });

  it('reports a network failure', async () => {
    const t = relayTransport('https://relay.test/f', {
      fetchImpl: async () => {
        throw new TypeError('fetch failed');
      },
    });
    expect(await t.send(good)).toEqual({ ok: false, reason: 'network' });
  });

  it('times out instead of hanging', async () => {
    const t = relayTransport('https://relay.test/f', {
      timeoutMs: 10,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
        ),
    });
    expect(await t.send(good)).toEqual({ ok: false, reason: 'timeout' });
  });

  it('never sends when the honeypot is filled', async () => {
    const fetchImpl = vi.fn();
    const t = relayTransport('https://relay.test/f', { fetchImpl });
    expect((await t.send({ ...good, company: 'spam inc' })).ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('transportFromEnv', () => {
  it('is unconfigured without an https endpoint', async () => {
    expect(transportFromEnv({}).configured).toBe(false);
    expect(transportFromEnv({ endpoint: 'http://insecure.test' }).configured).toBe(false);
    expect(await transportFromEnv({}).send(good)).toEqual({ ok: false, reason: 'unconfigured' });
  });

  it('is configured with an https endpoint', () => {
    expect(transportFromEnv({ endpoint: 'https://relay.test/f' }).configured).toBe(true);
  });
});

describe('mailtoHref', () => {
  it('encodes the message for the mail app', () => {
    const href = mailtoHref('me@example.com', { ...good, message: 'Hi & bye\nline 2 extra' });
    expect(href.startsWith('mailto:me@example.com?subject=')).toBe(true);
    expect(decodeURIComponent(href.split('body=')[1]!)).toContain('Hi & bye\nline 2 extra');
  });
});
