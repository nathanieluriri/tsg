import fs from 'node:fs';
import path from 'node:path';

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Lists the photos in `public/gallery` as web paths, sorted by filename.
 * Runs server-side (the public homepage is dynamic). Returns [] if the folder
 * is missing so callers can fall back gracefully.
 */
export function getGalleryImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'gallery');
    return fs
      .readdirSync(dir)
      .filter((f) => IMAGE_RE.test(f))
      .sort()
      .map((f) => `/gallery/${f}`);
  } catch {
    return [];
  }
}
