import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { site } from '@/site';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Send Tristan Morton a message, or reach him by email, LinkedIn or GitHub.`,
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <div className={styles.layout}>
      <div className={styles.side}>
        <h1 className="page-title">Contact</h1>
        <p className="lede">
          Questions about a project, an opportunity or something else. Write here, or use whichever of these suits you.
        </p>
        <dl className={styles.channels}>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </dd>
          </div>
          <div>
            <dt>Profiles</dt>
            <dd>
              <a href={site.links.linkedin}>LinkedIn</a>, <a href={site.links.github}>GitHub</a>
            </dd>
          </div>
          <div>
            <dt>Documents</dt>
            <dd>
              <a href={site.links.resume}>Résumé (PDF, one page)</a>, <a href={site.links.cv}>CV (PDF, two pages)</a>
            </dd>
          </div>
        </dl>
      </div>
      <section aria-labelledby="send" className={styles.formWrap}>
        <h2 id="send">Send a message</h2>
        <ContactForm email={site.email} />
      </section>
    </div>
  );
}
