import type { SpeciesImage } from '../data/speciesImages';

/** Thumbnail widths Wikimedia serves; other sizes are refused. */
const BUCKETS = [250, 330, 500, 960, 1280, 1920];

/**
 * URL for a species photo at roughly `width` CSS pixels (density-aware), snapped to a
 * Wikimedia thumbnail bucket and never larger than the original upload.
 */
export function imageSrc(img: SpeciesImage, width: number): string {
  const want = Math.round(width * Math.min(window.devicePixelRatio || 1, 2));
  if (!img.src.includes('/thumb/')) return img.src; // small originals are served as-is
  const bucket = BUCKETS.find((b) => b >= want) ?? BUCKETS[BUCKETS.length - 1];
  if (bucket >= img.originalWidth) {
    // Original file: drop the /thumb/ segment and the trailing size-prefixed name.
    const [base] = img.src.split('?');
    return base.replace('://thumb.wikimedia.org/', '://upload.wikimedia.org/').replace('/thumb/', '/').replace(/\/[^/]+$/, '');
  }
  return img.src.replace(/\/\d+px-/, `/${bucket}px-`);
}
