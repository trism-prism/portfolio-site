import { ph } from './ph';

// Facts come from public/resume.pdf, public/cv.pdf and the public repositories. Anything wrapped in
// ph() is invented or pending and must be replaced or removed before publishing.

export const personal = {
  name: 'Tristan Morton',
  firstName: 'Tristan',
  handle: 'tristan',
  role: 'Software engineer',
  location: 'Leesburg, VA',
  email: 'tristanjmorton@gmail.com',
  siteUrl: 'https://portfolio-site-trism2.vercel.app',
  status: 'SWE & AI Systems Intern @ Formwork',
  headline: {
    lead: 'I build software you can',
    accent: 'inspect',
    tail: '.',
  },
  intro:
    'Full-stack and AI engineering, with a habit of measuring things: evaluation sets for AI features, benchmarks for systems code, and limits written down next to every number.',
  description:
    'Tristan Morton is a software engineer working across full stack and AI engineering. Projects, background, activity and contact.',
  links: {
    github: 'https://github.com/trism-prism',
    githubUser: 'trism-prism',
    linkedin: 'https://www.linkedin.com/in/tristan-morton',
    linkedinHandle: 'tristan-morton',
    resume: '/resume.pdf',
    cv: '/cv.pdf',
    vcard: '/tristan-morton.vcf',
    // No scheduling link exists yet.
    schedule: ph('https://cal.com/your-link'),
  },
  about: {
    now: 'Now: AI systems and QA at Formwork',
    greeting: "Hi, I'm Tristan.",
    cards: [
      {
        icon: 'briefcase',
        tone: 'teal',
        text: 'Software Engineering & AI Systems Intern at Formwork since September 2026: I integrated a custom AI agent over MCP into a multi-tenant project management platform, and ran a 500+ test-case QA pass that surfaced a JWT auth-caching bug.',
      },
      {
        icon: 'cap',
        tone: 'violet',
        text: "B.B.A. in Computer Information Systems at James Madison University, with a Business Analytics minor, expected December 2027. Before JMU: Northern Virginia Community College, Dean's List and Scholar Honoree.",
      },
      {
        icon: 'rocket',
        tone: 'green',
        text: 'Projects span a C++20 visibility engine (127x faster on 4,000-wall mazes), a KVM virtual machine monitor in C, a cited-answer RAG app evaluated on a frozen question set, and two live web apps: Kiln and GengaRate.',
      },
      {
        icon: 'spark',
        tone: 'amber',
        text: ph(
          'Outside of code: gaming, time with friends and family, and building small tools whenever something annoys me twice.',
        ),
      },
    ],
    facts: [
      { label: 'Based in', value: 'Leesburg, VA' },
      { label: 'Studying', value: 'CIS · BSAN minor @ JMU' },
      { label: 'Working on', value: 'AI agents and QA at Formwork' },
      { label: 'Open to', value: ph('Summer 2027 SWE internships') },
    ],
  },
  /** Interests come from the foundation draft (docs/rebuild.md marks them as draft wording). */
  interests: [
    'Geometry and graphics problems where exactness matters',
    'Evaluating AI systems honestly, failures included',
    'Interfaces that explain what they are doing',
    'Games and worlds with atmosphere, scale and a sense of history',
  ],
  easterEgg: ph('You found the prism. Every light here is computed, not painted. Say hi and mention the code.'),
} as const;

export const latest = [
  { label: 'visibility engine shipped', href: 'https://github.com/trism-prism/2d-visibility-engine' },
  { label: 'minivmm boots', href: 'https://github.com/trism-prism/minivmm' },
];
