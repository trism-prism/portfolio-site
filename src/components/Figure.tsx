import type { Media } from '@/content/types';
import styles from './Figure.module.css';

/** Static image with intrinsic dimensions, so layout does not shift while it loads. */
export default function Figure({ media, eager = false }: { media: Media; eager?: boolean }) {
  return (
    <figure className={styles.figure}>
      {/* A static export serves images as-is; next/image would add nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={media.height > media.width ? styles.portrait : undefined}
      />
      {media.caption ? <figcaption className={styles.caption}>{media.caption}</figcaption> : null}
    </figure>
  );
}
