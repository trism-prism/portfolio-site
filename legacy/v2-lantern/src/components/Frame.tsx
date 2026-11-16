import { imageSrc, imageSrcSet, type ProjectImage } from '../content/projects';
import styles from './Frame.module.css';

/** A screenshot in a plain frame with embroidery corner brackets and, optionally, a caption. */
export function Frame({
  img,
  priority = false,
  sizes,
  caption = true,
}: {
  img: ProjectImage;
  priority?: boolean;
  sizes: string;
  caption?: boolean;
}) {
  const largest = img.widths[0];
  return (
    <figure className={styles.figure} style={{ flexGrow: img.width }}>
      <div className={styles.shot} style={{ maxWidth: img.width }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; files are already resized */}
        <img
          src={imageSrc(img, largest)}
          srcSet={imageSrcSet(img)}
          sizes={sizes}
          width={img.width}
          height={img.height}
          alt={img.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
        <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />
      </div>
      {caption && <figcaption>{img.caption}</figcaption>}
    </figure>
  );
}
