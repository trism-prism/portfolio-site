export type ContactInput = {
  name: string;
  email: string;
  message: string;
  /** Honeypot. Real visitors never see or fill it. */
  company?: string;
};

export type ContactField = 'name' | 'email' | 'message';
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = { name: 100, email: 254, message: 5000, messageMin: 10 } as const;

// Deliberately permissive: one @, something on each side, a dot in the domain, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalise(input: ContactInput): ContactInput {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    company: input.company?.trim() ?? '',
  };
}

export function validateContact(raw: ContactInput): ContactErrors {
  const input = normalise(raw);
  const errors: ContactErrors = {};

  if (!input.name) errors.name = 'Enter your name.';
  else if (input.name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`;

  if (!input.email) errors.email = 'Enter your email address so I can reply.';
  else if (input.email.length > LIMITS.email || !EMAIL.test(input.email))
    errors.email = 'Enter an email address like name@example.com.';

  if (!input.message) errors.message = 'Write a message.';
  else if (input.message.length < LIMITS.messageMin)
    errors.message = `Write at least ${LIMITS.messageMin} characters.`;
  else if (input.message.length > LIMITS.message)
    errors.message = `Keep the message under ${LIMITS.message} characters.`;

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}
