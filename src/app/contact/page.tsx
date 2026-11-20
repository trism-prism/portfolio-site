import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { site } from '@/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Send Tristan Morton a message, or reach him by email, LinkedIn or GitHub.`,
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <>
      <h1>Contact</h1>
      <p className="prose">
        Questions about a project, an opportunity, or something else: write here, or use whichever of these suits you.
      </p>
      <ul className="prose">
        <li>
          Email: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        <li>
          <a href={site.links.linkedin}>LinkedIn</a>
        </li>
        <li>
          <a href={site.links.github}>GitHub</a>
        </li>
      </ul>
      <h2>Send a message</h2>
      <ContactForm email={site.email} />
    </>
  );
}
