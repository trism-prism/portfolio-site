export type SectionId =
  | 'about'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'achievements'
  | 'focus'
  | 'stats'
  | 'news'
  | 'contact';

export type SectionDef = {
  id: SectionId;
  nav: string;
  kicker: string;
  title: string;
  accent?: string; // serif-italic word appended to the title
  primary?: boolean; // shown in the top bar; the rest live under "More"
};

export const sections: SectionDef[] = [
  { id: 'about', nav: 'About', kicker: 'Software engineer, full stack and AI', title: 'About', accent: 'me', primary: true },
  { id: 'experience', nav: 'Experience', kicker: 'Where I work', title: 'Experience', primary: true },
  { id: 'education', nav: 'Education', kicker: 'Where I study', title: 'Education' },
  { id: 'skills', nav: 'Skills', kicker: 'What I build with', title: 'Skills &', accent: 'tools', primary: true },
  { id: 'projects', nav: 'Projects', kicker: 'Projects and studies', title: "Things I've", accent: 'built', primary: true },
  { id: 'achievements', nav: 'Achievements', kicker: 'Honors and credentials', title: 'Achievements' },
  { id: 'focus', nav: 'Focus areas', kicker: 'What I work on', title: 'Focus', accent: 'areas' },
  { id: 'stats', nav: 'Stats', kicker: 'Numbers, with their conditions', title: 'By the', accent: 'numbers' },
  { id: 'news', nav: 'Activity', kicker: "What I've been up to", title: 'Recent', accent: 'activity' },
  { id: 'contact', nav: 'Contact', kicker: 'Say hello', title: "Let's", accent: 'talk' },
];

export const sectionIds = sections.map((s) => s.id);
export const sectionNumber = (id: SectionId) => String(sectionIds.indexOf(id) + 1).padStart(2, '0');
