import { ph } from './ph';

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  level: 'professional' | 'associate' | 'foundational';
  issued: string;
  expires?: string;
  href?: string;
  placeholder?: boolean;
};

export type Honor = { id: string; title: string; org: string; when: string; detail: string; placeholder?: boolean };
export type Competition = {
  id: string;
  event: string;
  result: string;
  medal?: 'gold' | 'silver' | 'bronze';
  when: string;
  placeholder?: boolean;
};

// No certifications are on record. Every certification and badge below is an invented placeholder.
export const certifications: Certification[] = [
  {
    id: 'cert-1',
    name: ph('AWS Certified Cloud Practitioner'),
    issuer: 'Amazon Web Services',
    level: 'foundational',
    issued: ph('2027-02'),
    expires: ph('2030-02'),
    placeholder: true,
  },
  {
    id: 'cert-2',
    name: ph('GitHub Actions'),
    issuer: 'GitHub',
    level: 'associate',
    issued: ph('2027-03'),
    placeholder: true,
  },
  {
    id: 'cert-3',
    name: ph('Microsoft Power BI Data Analyst (PL-300)'),
    issuer: 'Microsoft',
    level: 'associate',
    issued: ph('2027-04'),
    placeholder: true,
  },
];

export const badges: { id: string; label: string; placeholder: boolean }[] = [
  'Cloud Essentials',
  'Intro to Generative AI',
  'Git Fundamentals',
  'SQL Practitioner',
  'Docker Basics',
  'Linux Essentials',
  'Data Visualization',
  'Secure Coding',
].map((label, i) => ({ id: `badge-${i}`, label: ph(label), placeholder: true }));

export const honors: Honor[] = [
  {
    id: 'nova-deans-list',
    title: "Dean's List",
    org: 'Northern Virginia Community College',
    when: '2023 – 2024',
    detail: 'Academic recognition at NOVA.',
  },
  {
    id: 'nova-scholar',
    title: 'Scholar Honoree',
    org: 'Northern Virginia Community College',
    when: '2023 – 2024',
    detail: 'Scholar recognition at NOVA.',
  },
  {
    id: 'jmu-honor',
    title: ph("President's List"),
    org: 'James Madison University',
    when: ph('Fall 2025'),
    detail: ph('Semester GPA recognition.'),
    placeholder: true,
  },
];

export const competitions: Competition[] = [
  { id: 'comp-1', event: ph('HackMadison 2026'), result: ph('2nd place, Best Use of Data'), medal: 'silver', when: ph('2026-03'), placeholder: true },
  { id: 'comp-2', event: ph('JMU CIS Case Competition'), result: ph('Finalist'), when: ph('2025-11'), placeholder: true },
  { id: 'comp-3', event: ph('LeetCode Weekly Contest'), result: ph('Top 10%'), medal: 'bronze', when: ph('2026-07'), placeholder: true },
];
