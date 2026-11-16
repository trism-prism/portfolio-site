export type Certification = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
  /** Optional verification link and image (in public/). */
  url?: string;
  image?: string;
};

// Empty on purpose: the section shows "Certifications coming soon." until an entry is added.
export const certifications: Certification[] = [
  // {
  //   id: 'example-cert',
  //   title: 'Name of the certification',
  //   issuer: 'Issuing organization',
  //   date: 'Jun 2027',
  //   description: 'One or two sentences on what it covers.',
  //   skills: ['Skill one', 'Skill two'],
  //   url: 'https://example.com/verify/123',
  //   image: '/certifications/example.webp',
  // },
];
