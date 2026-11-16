'use client';

import { useState, type FormEvent } from 'react';
import { profile } from '../content/profile';
import { DownloadIcon, MailIcon, PinIcon, SendIcon } from './Icons';
import { Section } from './Section';
import { Socials } from './Socials';
import styles from './Contact.module.css';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

export function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // No backend in a static export: the form tries to open the visitor's mail app with everything filled in.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const next: Errors = {};
    if (!name) next.name = 'Please enter your name.';
    if (!email) next.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email address.';
    if (!message) next.message = 'Please enter a message.';
    setErrors(next);
    if (Object.keys(next).length) {
      setSent(false);
      return;
    }
    const subject = `Portfolio message from ${name}`;
    const body = `${message}\n\n${name}\n${email}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    setCopied(false);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false); // Clipboard blocked: the address is on screen to copy by hand.
    }
  }

  return (
    <Section id="contact" alt eyebrow="Reach Out" title="Let's Connect">
      <div className={styles.grid}>
        <div className={styles.info} data-reveal>
          <h3 className={styles.h3}>Get in Touch</h3>
          <p className={styles.lead}>
            I&apos;m always open to discussing new opportunities, creative ideas, or opportunities to be part of your visions.
          </p>
          <ul className={styles.cards}>
            <li className={`card ${styles.infoCard}`}>
              <span className={styles.icon}>
                <MailIcon size={20} />
              </span>
              <div>
                <p className={`mono ${styles.k}`}>Email</p>
                <a href={`mailto:${profile.email}`} className={styles.v}>
                  {profile.email}
                </a>
              </div>
            </li>
            <li className={`card ${styles.infoCard}`}>
              <span className={styles.icon}>
                <PinIcon size={20} />
              </span>
              <div>
                <p className={`mono ${styles.k}`}>Location</p>
                <p className={styles.v}>{profile.location}</p>
              </div>
            </li>
          </ul>
          <h4 className={styles.h4}>Social Profiles</h4>
          <Socials />
          <a href={profile.resume} className={`btn btnSolid ${styles.resume}`} download>
            <DownloadIcon size={16} />
            Download Resume
          </a>
        </div>

        <form className={`card ${styles.form}`} onSubmit={onSubmit} noValidate data-reveal>
          <div className={styles.field}>
            <label>
              <span>Your Name</span>
              <input name="name" type="text" autoComplete="name" required placeholder="Your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
            </label>
            {errors.name && (
              <em id="err-name" role="alert">
                {errors.name}
              </em>
            )}
          </div>
          <div className={styles.field}>
            <label>
              <span>Your Email</span>
              <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
            </label>
            {errors.email && (
              <em id="err-email" role="alert">
                {errors.email}
              </em>
            )}
          </div>
          <div className={styles.field}>
            <label>
              <span>Your Message</span>
              <textarea name="message" rows={6} required placeholder="What would you like to talk about?" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : undefined} />
            </label>
            {errors.message && (
              <em id="err-message" role="alert">
                {errors.message}
              </em>
            )}
          </div>
          <button type="submit" className="btn btnSolid">
            <SendIcon size={16} />
            Send Message
          </button>
          <div className={styles.note} aria-live="polite">
            {sent ? (
              <>
                <p>
                  If nothing opened, email <a href={`mailto:${profile.email}`}>{profile.email}</a> directly.
                </p>
                <button type="button" className={styles.copy} onClick={copyEmail}>
                  {copied ? 'Copied' : 'Copy email address'}
                </button>
              </>
            ) : (
              <p>Sending tries to open your email app with the message filled in.</p>
            )}
          </div>
        </form>
      </div>
    </Section>
  );
}
