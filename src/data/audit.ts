import { isPh, plain } from './ph';
import { personal } from './personal';
import { experience } from './experience';
import { education } from './education';
import { skillCategories, secondarySkills } from './skills';
import { projects, contributions } from './projects';
import { certifications, badges, honors, competitions } from './achievements';
import { news } from './news';
import { codingProfiles } from './stats';

/** Walks every data module and lists each placeholder string or record with its path. */
export function findDataPlaceholders(): { path: string; value: string }[] {
  const out: { path: string; value: string }[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'string') {
      if (isPh(v)) out.push({ path, value: plain(v) });
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') {
      const rec = v as Record<string, unknown>;
      if (rec.placeholder === true) out.push({ path, value: '(whole record)' });
      for (const [k, x] of Object.entries(rec)) walk(x, `${path}.${k}`);
    }
  };
  walk({ personal, experience, education, skillCategories, secondarySkills, projects, contributions, certifications, badges, honors, competitions, news, codingProfiles }, 'data');
  return out;
}

export const hasPlaceholders = findDataPlaceholders().length > 0;
