'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { mailtoHref, transportFromEnv, type ContactTransport, type SendResult } from '@/lib/contact/transport';
import {
  hasErrors,
  LIMITS,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from '@/lib/contact/validate';
import styles from './ContactForm.module.css';

type Status =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'sent' }
  | { kind: 'handoff' }
  | { kind: 'failed'; result: SendResult };

const FIELDS: ContactField[] = ['name', 'email', 'message'];

function failureText(result: SendResult): string {
  if (result.ok) return '';
  switch (result.reason) {
    case 'timeout':
      return 'The message service did not answer in time, so your message may not have been sent.';
    case 'network':
      return 'Your message could not be sent: the network request failed.';
    default:
      return 'The message service did not accept your message.';
  }
}

export default function ContactForm({ email, transport }: { email: string; transport?: ContactTransport }) {
  const active = useMemo(
    () =>
      transport ??
      transportFromEnv({
        endpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT,
        accessKey: process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY,
      }),
    [transport],
  );
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  function read(form: HTMLFormElement): ContactInput {
    const data = new FormData(form);
    return {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''),
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // A second click while a request is in flight is ignored, not queued.
    if (inFlight.current) return;
    const form = event.currentTarget;
    const input = read(form);
    const found = validateContact(input);
    setErrors(found);
    if (hasErrors(found)) {
      setStatus({ kind: 'idle' });
      const first = FIELDS.find((f) => found[f]);
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }

    if (!active.configured) {
      // No relay yet: hand the message to the visitor's own mail app. Nothing is claimed as sent.
      setStatus({ kind: 'handoff' });
      window.location.href = mailtoHref(email, input);
      return;
    }

    inFlight.current = true;
    setStatus({ kind: 'pending' });
    const result = await active.send(input);
    inFlight.current = false;
    if (result.ok) {
      setStatus({ kind: 'sent' });
      formRef.current?.reset();
    } else {
      setStatus({ kind: 'failed', result });
    }
  }

  const pending = status.kind === 'pending';

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-describedby="contact-help"
      data-delivery={active.configured ? 'relay' : 'mail-app'}
    >
      <p id="contact-help" className="muted">
        All fields are required.{' '}
        {active.configured
          ? `I reply from ${email}.`
          : 'Sending opens your email app with the message filled in, addressed to me.'}
      </p>

      {FIELDS.map((field) => {
        const errorId = `${field}-error`;
        const label = field === 'name' ? 'Name' : field === 'email' ? 'Email' : 'Message';
        const common = {
          id: field,
          name: field,
          required: true,
          'aria-invalid': errors[field] ? true : undefined,
          'aria-describedby': errors[field] ? errorId : undefined,
          disabled: pending,
        } as const;
        return (
          <div className={styles.field} key={field}>
            <label htmlFor={field}>{label}</label>
            {field === 'message' ? (
              <textarea {...common} rows={7} maxLength={LIMITS.message} />
            ) : (
              <input
                {...common}
                type={field === 'email' ? 'email' : 'text'}
                autoComplete={field === 'email' ? 'email' : 'name'}
                maxLength={field === 'email' ? LIMITS.email : LIMITS.name}
              />
            )}
            {errors[field] ? (
              <p id={errorId} className={styles.error}>
                {errors[field]}
              </p>
            ) : null}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive technology. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className={styles.button} disabled={pending} aria-disabled={pending}>
        {pending ? 'Sending…' : active.configured ? 'Send message' : 'Open in email app'}
      </button>

      <div className={styles.status} role="status" aria-live="polite">
        {status.kind === 'pending' ? <p>Sending your message…</p> : null}
        {status.kind === 'handoff' ? (
          <p>
            Your email app should open with the message ready to send. If nothing opened, email me at{' '}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        ) : null}
        {status.kind === 'sent' ? (
          <p className={styles.success}>Thanks, your message was sent. I will reply by email.</p>
        ) : null}
        {status.kind === 'failed' ? (
          <p className={styles.failure}>
            {failureText(status.result)} You can try again, or email me at <a href={`mailto:${email}`}>{email}</a>.
          </p>
        ) : null}
      </div>
    </form>
  );
}
