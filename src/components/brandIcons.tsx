import {
  siC,
  siCloudflareworkers,
  siCplusplus,
  siCss,
  siDocker,
  siDotnet,
  siFastapi,
  siGit,
  siGithub,
  siGithubactions,
  siGnu,
  siGnubash,
  siGodotengine,
  siGooglescholar,
  siGraphql,
  siHtml5,
  siJavascript,
  siJira,
  siJsonwebtokens,
  siLeetcode,
  siLinux,
  siModelcontextprotocol,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPython,
  siQemu,
  siReact,
  siScikitlearn,
  siSpringboot,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siX,
} from 'simple-icons';

type Icon = { path: string };

/** Keys used by `icon` in src/content/skills.ts. */
export const brandIcons: Record<string, Icon> = {
  c: siC,
  cloudflareworkers: siCloudflareworkers,
  cplusplus: siCplusplus,
  css: siCss,
  docker: siDocker,
  dotnet: siDotnet,
  fastapi: siFastapi,
  git: siGit,
  githubactions: siGithubactions,
  gnu: siGnu,
  gnubash: siGnubash,
  godot: siGodotengine,
  graphql: siGraphql,
  html5: siHtml5,
  javascript: siJavascript,
  jira: siJira,
  jwt: siJsonwebtokens,
  linux: siLinux,
  mcp: siModelcontextprotocol,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  numpy: siNumpy,
  openjdk: siOpenjdk,
  pandas: siPandas,
  postgresql: siPostgresql,
  python: siPython,
  qemu: siQemu,
  react: siReact,
  scikitlearn: siScikitlearn,
  springboot: siSpringboot,
  sqlite: siSqlite,
  tailwind: siTailwindcss,
  typescript: siTypescript,
};

function Glyph({ path, size }: { path: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function BrandIcon({ name, size = 28 }: { name: string; size?: number }) {
  return <Glyph path={brandIcons[name].path} size={size} />;
}

// simple-icons dropped LinkedIn, so this one is drawn by hand: a rounded outline with the "in" mark.
const linkedinPath =
  'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z';

const social: Record<string, string> = {
  linkedin: linkedinPath,
  github: siGithub.path,
  leetcode: siLeetcode.path,
  google: siGooglescholar.path,
  x: siX.path,
};

export function SocialIcon({ name, size = 20 }: { name: string; size?: number }) {
  return <Glyph path={social[name]} size={size} />;
}
