export type Education = {
  id: string;
  degree: string;
  school: string;
  url?: string;
  dates: string;
  description: string;
  coursework: string[];
};

// Taken from the resume. It lists no minor, so none is shown.
export const education: Education[] = [
  {
    id: 'jmu',
    degree: 'B.B.A. in Computer Information Systems',
    school: 'James Madison University',
    url: 'https://www.jmu.edu',
    dates: 'Expected Dec 2027',
    description:
      'Studying computer information systems at James Madison University while building software alongside my coursework, from a virtual machine monitor in C to live full-stack web apps.',
    coursework: ['Discrete Structures I', 'Business Analytics I', 'Business Analytics II', 'Enterprise Architecture'],
  },
  {
    id: 'nova',
    degree: "Dean's List, Scholar Honoree",
    school: 'Northern Virginia Community College',
    dates: 'Aug 2023 – May 2024',
    description: '',
    coursework: [],
  },
];
