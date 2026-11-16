'use client';

import { useState } from 'react';
import { skillCategories } from '../content/skills';
import { BrandIcon, brandIcons } from './brandIcons';
import { Section } from './Section';
import styles from './Skills.module.css';

// Tiles without a brand icon: a short first word as is (x86, SQL, Make), else initials or the first two letters.
function monogram(name: string) {
  const words = name.split(' ');
  if (words[0].length <= 4) return words[0];
  return words.length > 1 ? words.map((w) => w[0]).join('').slice(0, 2).toUpperCase() : name.slice(0, 2);
}

export function Skills() {
  const [active, setActive] = useState(skillCategories[0].id);
  const category = skillCategories.find((c) => c.id === active) ?? skillCategories[0];
  const total = skillCategories.reduce((n, c) => n + c.skills.length, 0);

  return (
    <Section id="skills" alt eyebrow="My Arsenal" title="Technical Skills">
      <div className={styles.tabs} role="tablist" aria-label="Skill categories" data-reveal>
        {skillCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={c.id === active}
            aria-controls="skills-panel"
            className={`${styles.tab} ${c.id === active ? styles.on : ''}`}
            onClick={() => setActive(c.id)}
          >
            {c.label}
            <span className={`mono ${styles.count}`}>{c.skills.length}</span>
          </button>
        ))}
      </div>
      <ul className={styles.grid} id="skills-panel" role="tabpanel" aria-labelledby={`tab-${category.id}`} data-reveal>
        {category.skills.map((s) => (
          <li key={s.name} className={`card ${styles.tile}`}>
            <span className={styles.glyph} aria-hidden="true">
              {s.icon && brandIcons[s.icon] ? <BrandIcon name={s.icon} size={32} /> : <span className={`mono ${styles.mono}`}>{monogram(s.name)}</span>}
            </span>
            <span className={styles.name}>{s.name}</span>
          </li>
        ))}
      </ul>
      <p className={`mono ${styles.foot}`}>
        {skillCategories.length} Categories · {total} Technologies
      </p>
    </Section>
  );
}
