/** `icon` is a key of brandIcons in src/components/brandIcons.ts; tiles without one show a monogram. */
export type Skill = { name: string; icon?: string };
export type SkillCategory = { id: string; label: string; skills: Skill[] };

// From the resume's Technical Skills section.
export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    label: 'Languages',
    skills: [
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Python', icon: 'python' },
      { name: 'C', icon: 'c' },
      { name: 'C++', icon: 'cplusplus' },
      { name: 'x86 Assembly' },
      { name: 'Bash', icon: 'gnubash' },
      { name: 'C#' },
      { name: 'Java', icon: 'openjdk' },
      { name: 'GDScript', icon: 'godot' },
      { name: 'HTML', icon: 'html5' },
      { name: 'CSS', icon: 'css' },
    ],
  },
  {
    id: 'databases',
    label: 'Databases',
    skills: [
      { name: 'SQL' },
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'SQLite', icon: 'sqlite' },
      { name: 'IndexedDB' },
    ],
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    skills: [
      { name: 'React', icon: 'react' },
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'Node.js', icon: 'nodejs' },
      { name: 'ASP.NET Core', icon: 'dotnet' },
      { name: 'Spring Boot', icon: 'springboot' },
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'Tailwind CSS', icon: 'tailwind' },
    ],
  },
  {
    id: 'libraries',
    label: 'Libraries',
    skills: [
      { name: 'pandas', icon: 'pandas' },
      { name: 'NumPy', icon: 'numpy' },
      { name: 'scikit-learn', icon: 'scikitlearn' },
      { name: 'Matplotlib' },
      { name: 'statsmodels' },
      { name: 'XGBoost' },
    ],
  },
  {
    id: 'tools',
    label: 'Developer Tools',
    skills: [
      { name: 'Linux', icon: 'linux' },
      { name: 'KVM' },
      { name: 'QEMU', icon: 'qemu' },
      { name: 'GCC', icon: 'gnu' },
      { name: 'Make' },
      { name: 'Git', icon: 'git' },
      { name: 'GitHub Actions', icon: 'githubactions' },
      { name: 'Docker', icon: 'docker' },
      { name: 'REST' },
      { name: 'GraphQL', icon: 'graphql' },
      { name: 'OAuth 2.0' },
      { name: 'JWT', icon: 'jwt' },
      { name: 'MCP', icon: 'mcp' },
      { name: 'Cloudflare Workers', icon: 'cloudflareworkers' },
      { name: 'Jira', icon: 'jira' },
      { name: 'Power BI' },
    ],
  },
];
