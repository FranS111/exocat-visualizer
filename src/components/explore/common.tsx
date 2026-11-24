import { useState, type ReactNode } from 'react';
import { SPECIES_IMAGES } from '../../data/speciesImages';
import { imageSrc } from '../../utils/images';

/** Species photo at a given display width, fading in once decoded. */
export function SpeciesImg({
  id,
  width,
  alt = '',
  className = '',
  eager = false,
}: {
  id: string;
  width: number;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const img = SPECIES_IMAGES[id];
  const [ready, setReady] = useState(false);
  if (!img) return <span className={`ex-img ex-img--empty ${className}`} aria-hidden="true" />;
  return (
    <span className={`ex-img ${ready ? 'is-ready' : ''} ${className}`}>
      <img
        src={imageSrc(img, width)}
        alt={alt}
        width={img.width}
        height={img.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setReady(true)}
      />
    </span>
  );
}

/** Editorial section heading: mono index, serif title with an italic second half. */
export function SectionHead({
  index,
  title,
  lede,
  id,
  tone,
}: {
  index: string;
  title: string[];
  lede?: ReactNode;
  id: string;
  tone?: 'light';
}) {
  return (
    <header className={`ex-head ${tone === 'light' ? 'ex-head--light' : ''}`}>
      <span className="ex-index" aria-hidden="true">
        ({index})
      </span>
      <h2 id={id} className="ex-title">
        {title[0]} <em>{title[1]}</em>
      </h2>
      {lede && <p className="ex-lede">{lede}</p>}
    </header>
  );
}
