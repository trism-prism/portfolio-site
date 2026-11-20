import { normalise, type ContactInput } from './validate';

// The delivery boundary. The form knows only `ContactTransport`; which relay (if any) sits
// behind it is configuration. No code path here reports success without a real 2xx response.

export type SendResult =
  | { ok: true }
  | { ok: false; reason: 'unconfigured' | 'network' | 'rejected' | 'timeout'; status?: number };

export interface ContactTransport {
  readonly configured: boolean;
  send(input: ContactInput, signal?: AbortSignal): Promise<SendResult>;
}

/** Used when no endpoint is configured: the form shows the email fallback instead. */
export const unconfiguredTransport: ContactTransport = {
  configured: false,
  async send() {
    return { ok: false, reason: 'unconfigured' };
  },
};

/**
 * Posts JSON to a hosted form relay (Formspree, Web3Forms and similar accept this shape,
 * with any provider-specific fields added in `extraFields`).
 */
export function relayTransport(
  endpoint: string,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number; extraFields?: Record<string, string> } = {},
): ContactTransport {
  const fetchImpl = options.fetchImpl ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const timeoutMs = options.timeoutMs ?? 15000;

  return {
    configured: true,
    async send(raw, signal) {
      const input = normalise(raw);
      // Honeypot filled: drop silently but do not claim delivery to a bot either way.
      if (input.company) return { ok: false, reason: 'rejected' };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      signal?.addEventListener('abort', () => controller.abort(), { once: true });

      try {
        const res = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: input.name,
            email: input.email,
            message: input.message,
            ...options.extraFields,
          }),
          signal: controller.signal,
        });
        return res.ok ? { ok: true } : { ok: false, reason: 'rejected', status: res.status };
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === 'AbortError';
        return { ok: false, reason: aborted ? 'timeout' : 'network' };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/** Mail link carrying the visitor's message, used when no relay is configured. */
export function mailtoHref(to: string, raw: ContactInput): string {
  const input = normalise(raw);
  const subject = `Message from ${input.name} via your site`;
  const body = `${input.message}\n\n${input.name}\n${input.email}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Builds the transport from public build-time configuration. */
export function transportFromEnv(env: { endpoint?: string; accessKey?: string }): ContactTransport {
  const endpoint = env.endpoint?.trim();
  if (!endpoint) return unconfiguredTransport;
  if (!/^https:\/\//.test(endpoint)) return unconfiguredTransport;
  const extraFields = env.accessKey ? { access_key: env.accessKey } : undefined;
  return relayTransport(endpoint, { extraFields });
}
