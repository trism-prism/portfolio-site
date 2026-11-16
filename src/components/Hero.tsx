import Image from 'next/image';
import { profile } from '../content/profile';
import { DownloadIcon } from './Icons';
import { Socials } from './Socials';
import { Typewriter } from './Typewriter';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copy} data-reveal>
          <p className={styles.hello}>Hello, I&apos;m</p>
          <h1 className={styles.name}>
            {profile.firstLine}
            <br />
            {profile.lastLine}
          </h1>
          <p className={`mono ${styles.roles}`}>
            A <Typewriter roles={profile.roles} />
          </p>
          <p className={styles.intro}>
            {profile.intro.map((part, i) =>
              part.hl ? (
                <span key={i} className={`mono ${styles.hl}`}>
                  {part.text}
                </span>
              ) : (
                part.text
              ),
            )}
          </p>
          <div className={styles.actions}>
            <Socials />
            <a href={profile.resume} className="btn btnSolid" download>
              <DownloadIcon size={16} />
              RESUME
            </a>
          </div>
        </div>
        <div className={styles.photoWrap} data-reveal>
          <div className={styles.photo}>
            {profile.photo ? (
              <Image src={profile.photo.src} alt={profile.photo.alt} width={640} height={720} priority />
            ) : (
              <span className={`mono ${styles.initials}`} role="img" aria-label={`${profile.name} (photo to come)`}>
                {profile.initials}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
