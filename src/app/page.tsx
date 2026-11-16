import { Contact } from '../components/Contact';
import { Dsa } from '../components/Dsa';
import { Education } from '../components/Education';
import { Experience } from '../components/Experience';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Projects } from '../components/Projects';
import { Publications } from '../components/Publications';
import { RevealObserver } from '../components/RevealObserver';
import { Skills } from '../components/Skills';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Experience />
        <Skills />
        <Dsa />
        <Projects />
        <Education />
        <Publications />
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
