import { ph } from './ph';

export type Education = {
  id: string;
  school: string;
  short: string;
  credential: string;
  period: string;
  place: string;
  highlights: string[];
  extras?: { label: string; items: string[] }[];
  links?: { label: string; href: string }[];
};

export const education: Education[] = [
  {
    id: 'jmu',
    school: 'James Madison University',
    short: 'JMU',
    credential: 'B.B.A. in Computer Information Systems · Business Analytics minor',
    period: ph('Aug 2024') + ' – Expected Dec 2027',
    place: 'Harrisonburg, VA',
    highlights: ['Computer Information Systems major', 'Business Analytics (BSAN) minor'],
    extras: [
      {
        label: 'Coursework',
        items: ['Discrete Structures I', 'Business Analytics I', 'Business Analytics II', 'Enterprise Architecture'],
      },
      { label: 'Activities', items: [ph('ACM student chapter'), ph('Hackathon team (JMU HackMadison)')] },
    ],
    links: [
      { label: 'CIS major', href: 'https://www.jmu.edu/academics/undergraduate/majors/computer-information-systems.shtml' },
      { label: 'BSAN minor', href: 'https://www.jmu.edu/academics/undergraduate/minors/business-analytics.shtml' },
    ],
  },
  {
    id: 'nova',
    school: 'Northern Virginia Community College',
    short: 'NOVA',
    credential: "Dean's List · Scholar Honoree",
    period: 'Aug 2023 – May 2024',
    place: 'Virginia',
    highlights: ["Dean's List", 'Scholar Honoree'],
  },
];
