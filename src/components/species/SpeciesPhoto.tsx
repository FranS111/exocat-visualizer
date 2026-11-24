import { useState } from 'react';
import { SPECIES_IMAGES } from '../../data/speciesImages';
import { useI18n } from '../../hooks/useI18n';

interface Props {
  speciesId: string;
  scientificName: string;
  commonName: string;
}

/**
 * Compact species photo with its attribution (author · licence · source), as the
 * Creative Commons licences require. Hides itself if the image can't be loaded.
 */
export function SpeciesPhoto({ speciesId, scientificName, commonName }: Props) {
  const { m } = useI18n();
  const image = SPECIES_IMAGES[speciesId];
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  if (!image || state === 'failed') return null;

  return (
    <figure className="species-photo">
      <div className={`species-photo__frame ${state === 'ready' ? 'is-ready' : ''}`}>
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={m.modal.photoAlt(commonName, scientificName)}
          loading="lazy"
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
        />
      </div>
      <figcaption className="species-photo__credit">
        {m.modal.photoBy}{' '}
        <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">
          {image.artist}
        </a>
        <span aria-hidden="true"> · </span>
        {image.licenseUrl ? (
          <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer license">
            {image.license}
          </a>
        ) : (
          <span>{image.license === 'Public domain' ? m.modal.publicDomain : image.license}</span>
        )}
        <span aria-hidden="true"> · </span>
        <span>Wikimedia Commons</span>
      </figcaption>
    </figure>
  );
}
