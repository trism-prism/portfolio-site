import { site } from '../site';
import { Icon, type IconName } from './Icon';
import styles from './ContactLinks.module.css';

const items: { name: IconName; label: string; href: string; note?: string }[] = [
  { name: 'github', label: 'GitHub', href: site.links.github, note: 'external site' },
  { name: 'linkedin', label: 'LinkedIn', href: site.links.linkedin, note: 'external site' },
  { name: 'resume', label: 'Résumé', href: site.links.resume, note: 'PDF' },
  { name: 'email', label: 'Email', href: site.links.email },
];

export function ContactLinks({ label = 'Links' }: { label?: string }) {
  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {items.map((i) => (
          <li key={i.label}>
            <a className={styles.link} href={i.href}>
              <Icon name={i.name} />
              <span className={styles.label}>
                {i.label}
                {i.note && <span className="visually-hidden"> ({i.note})</span>}
              </span>
              {i.note === 'external site' && (
                <span aria-hidden="true" className={styles.mark}>
                  &#8599;
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
