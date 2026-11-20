import { projects } from '../src/content/projects';

export const publicList = projects.filter((p) => p.visibility !== 'hidden').sort((a, b) => a.order - b.order);
export const hiddenList = projects.filter((p) => p.visibility === 'hidden');
export const withCaseStudy = publicList.find((p) => p.caseStudy)!;
export const withoutCaseStudy = publicList.find((p) => !p.caseStudy)!;

export const pageRoutes = ['/', '/work/', '/about/', '/contact/', ...publicList.map((p) => `/work/${p.slug}/`)];
