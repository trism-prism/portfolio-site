'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { personal } from '@/data/personal';
import { isPh, plain } from '@/data/ph';
import { isBot, LIMITS, mailtoHref, sendReducer, validate, type FieldErrors, type Fields } from '@/lib/contact';
import { emit } from '@/lib/nav';
import { useMotion } from '@/lib/motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@/components/ui/Icon';
import { PhRibbon } from '@/components/ui/Text';

// Delivery: if NEXT_PUBLIC_CONTACT_ENDPOINT is set, the form POSTs JSON to that hosted relay. Otherwise it
// hands the message to the visitor's own email app and says so; it never claims a message was sent.
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? '';
const UI_TIMEOUT = 15_000;

const channels = [
  { icon: 'mail', label: 'Email', value: personal.email, href: `mailto:${personal.email}`, action: 'Copy', copy: true, tone: 'var(--accent)' },
  { icon: 'linkedin', label: 'LinkedIn', value: personal.links.linkedinHandle, href: personal.links.linkedin, action: 'Connect', tone: 'var(--sky)' },
  { icon: 'github', label: 'GitHub', value: personal.links.githubUser, href: personal.links.github, action: 'Follow', tone: 'var(--fg-2)' },
  { icon: 'calendar', label: 'Schedule a chat', value: personal.links.schedule, href: personal.links.schedule, action: 'Schedule', tone: 'var(--amber)' },
];

export function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap" style={{ maxWidth: 1000 }}>
        <SectionHeader id="contact" />
        <p className="-mt-4 mb-10 max-w-[560px] text-[16px] text-fg-2">
          Questions about a project, an internship, or something you&apos;re building? Email is fastest. I read everything.
        </p>
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="grid content-start gap-3">
            {channels.map((c) => (
              <Channel key={c.label} {...c} />
            ))}
            <a href={personal.links.vcard} download className="btn mt-1 justify-self-start">
              <Icon name="userPlus" size={16} /> Save contact card
            </a>
            <p className="-mt-1 text-[12.5px] text-muted">Adds me to your phone&apos;s contacts (vCard).</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function Channel({ icon, label, value, href, action, copy, tone }: (typeof channels)[number]) {
  const pending = isPh(value);
  const onCopy = async (e: React.MouseEvent) => {
    if (!copy) return;
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      emit({ type: 'toast', text: `Copied ${value}` });
    } catch {
      window.location.href = href;
    }
  };
  const inner = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>
        <Icon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="label block !text-[10px]">{label}</span>
        <span className={`block truncate text-[15px] font-medium text-fg ${pending ? 'ph-text' : ''}`}>{plain(value)}</span>
      </span>
      {!pending && (
        <span className="flex items-center gap-1 text-[13px] font-medium text-accent">
          {action} <Icon name={copy ? 'copy' : 'arrowUpRight'} size={14} />
        </span>
      )}
    </>
  );
  const cls = `panel glow-card relative flex items-center gap-3 border-l-2 p-3.5 ${pending ? 'ph-card' : ''}`;
  if (pending)
    return (
      <div className={cls} style={{ borderLeftColor: tone }}>
        <PhRibbon />
        {inner}
      </div>
    );
  return (
    <a href={href} onClick={onCopy} target={copy ? undefined : '_blank'} rel={copy ? undefined : 'noopener noreferrer'} className={cls} style={{ borderLeftColor: tone }} aria-label={copy ? `Copy email address ${value}` : `${label}: ${value} (opens in a new tab)`}>
      {inner}
    </a>
  );
}

const empty: Fields = { name: '', email: '', message: '', website: '' };

function ContactForm() {
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, dispatch] = useReducer(sendReducer, { status: 'idle' });
  const pending = useRef<Promise<void> | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const busy = state.status === 'sending' || (state.status === 'error' && state.pending);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((x) => ({ ...x, [k]: e.target.value }));
    if (errors[k as keyof FieldErrors]) setErrors((x) => ({ ...x, [k]: undefined }));
    if (state.status === 'error' && !state.pending) dispatch({ type: 'dismiss' });
  };

  const deliver = (): Promise<void> => {
    if (!ENDPOINT) {
      window.location.href = mailtoHref(personal.email, f);
      return Promise.resolve();
    }
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }),
    }).then((r) => {
      if (!r.ok) throw new Error(`The relay answered ${r.status}.`);
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = (['name', 'email', 'message'] as const).find((k) => errs[k]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    dispatch({ type: 'submit' });
    if (isBot(f)) {
      dispatch({ type: 'success', via: 'relay' });
      return;
    }
    // A retry while a send is unsettled reuses it instead of sending twice.
    const p = pending.current ?? deliver();
    pending.current = p;
    const timer = window.setTimeout(() => dispatch({ type: 'timeout' }), UI_TIMEOUT);
    p.then(
      () => {
        dispatch({ type: 'success', via: ENDPOINT ? 'relay' : 'handoff' });
        setF(empty);
      },
      (err: Error) => dispatch({ type: 'fail', message: err.message || 'Something went wrong.' }),
    ).finally(() => {
      clearTimeout(timer);
      pending.current = null;
    });
  };

  if (state.status === 'sent') return <Sent via={state.via} onAgain={() => { dispatch({ type: 'reset' }); setTimeout(() => nameRef.current?.focus(), 30); }} />;

  const field = (k: 'name' | 'email' | 'message', label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={`cf-${k}`} className="label mb-2 block !text-fg-2">
        {label}
      </label>
      {input}
      {errors[k] && (
        <p id={`cf-${k}-err`} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-400">
          <Icon name="warning" size={14} /> {errors[k]}
        </p>
      )}
    </div>
  );
  const cls = (k: keyof FieldErrors) =>
    `w-full rounded-xl border bg-bg px-4 text-[15px] text-fg outline-none placeholder:text-muted focus:border-accent ${errors[k] ? 'border-red-400' : 'border-line-2'}`;

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="panel relative grid gap-4 p-5 md:p-6" aria-busy={busy} aria-describedby="cf-note">
      {field(
        'name',
        'Name',
        <input ref={nameRef} id="cf-name" name="name" autoComplete="name" maxLength={LIMITS.name} value={f.name} onChange={set('name')} readOnly={busy} placeholder="Ada Lovelace" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} className={`${cls('name')} h-12`} />,
      )}
      {field(
        'email',
        'Email',
        <input id="cf-email" name="email" type="email" autoComplete="email" maxLength={LIMITS.email} value={f.email} onChange={set('email')} readOnly={busy} placeholder="ada@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} className={`${cls('email')} h-12`} />,
      )}
      {field(
        'message',
        'Message',
        <textarea id="cf-message" name="message" rows={6} maxLength={LIMITS.messageMax} value={f.message} onChange={set('message')} readOnly={busy} placeholder="What would you like to talk about?" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined} className={`${cls('message')} resize-y py-3`} />,
      )}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
      </div>
      {state.status === 'error' && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--amber)_50%,transparent)] bg-[color-mix(in_srgb,var(--amber)_8%,transparent)] p-3 text-[14px] text-fg">
          <Icon name="warning" size={16} className="mt-0.5 text-amber" />
          <span>
            {state.message} You can also email <a className="link-u" href={`mailto:${personal.email}`}>{personal.email}</a>.
          </span>
        </div>
      )}
      <button type="submit" className="btn btn-primary h-12 text-[15.5px]" disabled={state.status === 'sending'}>
        {state.status === 'sending' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> {ENDPOINT ? 'Sending…' : 'Opening your email app…'}
          </>
        ) : state.status === 'error' ? (
          <>Retry</>
        ) : (
          <>
            <Icon name="send" size={16} /> {ENDPOINT ? 'Send message' : 'Write it in my email app'}
          </>
        )}
      </button>
      <p id="cf-note" className="text-[12.5px] text-muted">
        {ENDPOINT
          ? 'Sent through a form relay. A success here means the relay accepted it.'
          : 'No form relay is configured yet, so this opens your own email app with the message filled in. Nothing is sent until you send it there.'}
      </p>
    </form>
  );
}

function Sent({ via, onAgain }: { via: 'relay' | 'handoff'; onAgain: () => void }) {
  const { reduced } = useMotion();
  const lines =
    via === 'relay'
      ? ['$ git push origin message', 'Enumerating objects: 3, done.', 'Writing objects: 100% (3/3)', `To ${personal.email}`, '   * [new message]  you -> tristan', '✓ accepted by the form relay']
      : ['$ git push origin message', 'Enumerating objects: 3, done.', 'remote: handing off to your email client…', '   * [draft]  you -> your mail app', '✓ press Send there to deliver it'];
  const [n, setN] = useState(reduced ? lines.length : 0);
  useEffect(() => {
    if (reduced) return;
    const ts = lines.map((_, i) => window.setTimeout(() => setN(i + 1), 160 + i * 220));
    return () => ts.forEach(clearTimeout);
  }, [reduced, lines.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="panel grid content-start gap-4 p-5 md:p-6" role="status">
      <div className="mono min-h-[170px] rounded-xl border border-line bg-[#07090a] p-4 text-[12.5px] leading-6 text-[#a6b6b6]">
        {lines.slice(0, n).map((l, i) => (
          <div key={i} className={l.startsWith('✓') ? 'text-green' : l.startsWith('$') ? 'text-[#eef5f4]' : ''}>
            {l}
          </div>
        ))}
      </div>
      <p className="text-[15px] text-fg">{via === 'relay' ? 'Thanks! Your message reached the relay. I usually reply within a few days.' : 'Your email app should have opened with the message ready. Send it from there and I will get back to you.'}</p>
      <button type="button" className="btn justify-self-start" onClick={onAgain}>
        Write another
      </button>
    </div>
  );
}
