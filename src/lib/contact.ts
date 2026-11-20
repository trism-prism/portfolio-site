export type Fields = { name: string; email: string; message: string; website: string };
export type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

export const LIMITS = { name: 100, email: 254, messageMin: 10, messageMax: 5000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export function validate(f: Fields): FieldErrors {
  const e: FieldErrors = {};
  const name = f.name.trim();
  const email = f.email.trim();
  const message = f.message.trim();
  if (!name) e.name = 'Please add your name.';
  else if (name.length > LIMITS.name) e.name = `Keep your name under ${LIMITS.name} characters.`;
  if (!email) e.email = 'Please add your email so I can reply.';
  else if (email.length > LIMITS.email || !EMAIL.test(email)) e.email = 'That email address does not look complete.';
  if (!message) e.message = 'Please write a message.';
  else if (message.length < LIMITS.messageMin) e.message = `A little more, please: at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.messageMax) e.message = `Please keep it under ${LIMITS.messageMax} characters.`;
  return e;
}

/** A filled honeypot means a bot: the form pretends to succeed and sends nothing. */
export const isBot = (f: Fields) => f.website.trim().length > 0;

// Send state. `handoff` means the message was handed to the visitor's email app: we never claim it was sent.
export type SendState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent'; via: 'relay' | 'handoff' }
  | { status: 'error'; message: string; pending: boolean };

export type SendAction =
  | { type: 'submit' }
  | { type: 'success'; via: 'relay' | 'handoff' }
  | { type: 'fail'; message: string }
  | { type: 'timeout' }
  | { type: 'reset' }
  | { type: 'dismiss' };

export function sendReducer(state: SendState, action: SendAction): SendState {
  switch (action.type) {
    case 'submit':
      return state.status === 'sending' ? state : { status: 'sending' };
    case 'success':
      // A late success supersedes a timeout error.
      return state.status === 'sending' || (state.status === 'error' && state.pending)
        ? { status: 'sent', via: action.via }
        : state;
    case 'fail':
      return state.status === 'sending' || state.status === 'error'
        ? { status: 'error', message: action.message, pending: false }
        : state;
    case 'timeout':
      return state.status === 'sending'
        ? { status: 'error', message: 'This is taking longer than expected. You can retry; a still-running send is reused, not duplicated.', pending: true }
        : state;
    case 'dismiss':
      return state.status === 'error' && !state.pending ? { status: 'idle' } : state;
    case 'reset':
      return { status: 'idle' };
  }
}

export function mailtoHref(to: string, f: Fields): string {
  const subject = `Hello from ${f.name.trim()}`;
  const body = `${f.message.trim()}\n\n${f.name.trim()} <${f.email.trim()}>`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
