import type { Metadata } from 'next';
import ProjectEntry from '@/components/ProjectEntry';
import { publicProjects } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Every project: software, AI, systems and data work, with links to code and live versions.',
  alternates: { canonical: '/work/' },
};

export default function WorkPage() {
  const list = publicProjects();
  return (
    <>
      <h1>Work</h1>
      <p className="prose">
        {list.length} projects. Each has its own page with what I did, the technology and links to the code where
        it is public. Some also have a longer case study.
      </p>
      <section aria-label="All projects">
        {list.map((p) => (
          <ProjectEntry key={p.id} project={p} headingLevel={2} />
        ))}
      </section>
    </>
  );
}
