import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Experience, Education } from '@/components/sections/Experience';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Achievements } from '@/components/sections/Achievements';
import { Focus } from '@/components/sections/Focus';
import { Stats } from '@/components/sections/Stats';
import { News } from '@/components/sections/News';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/footer/Footer';

export default function Home() {
  return (
    <>
      <main id="main" tabIndex={-1} className="relative z-[2]">
        <Hero />
        <About />
        <Experience />
        <Education />
        <Skills />
        <Projects />
        <Achievements />
        <Focus />
        <Stats />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
