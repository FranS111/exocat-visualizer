import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { SPECIES_IMAGES } from '../../data/speciesImages';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { WATERSHEDS } from '../../types';
import { SpeciesImg } from './common';

const HERO_SPECIES = 'alopochen-aegyptiaca';

export function ExploreHero({ onStart, onFeature }: { onStart: () => void; onFeature: (id: string) => void }) {
  const { m, lang } = useI18n();
  const data = useDataset();
  const featured = data.speciesById.get(HERO_SPECIES);
  const img = SPECIES_IMAGES[HERO_SPECIES];
  const firsts = data.species.map((s) => s.firstRecord);
  const years = [Math.min(...firsts), Math.max(...firsts)];

  return (
    <section className="ex-hero" aria-labelledby="ex-hero-title">
      <SpeciesImg id={HERO_SPECIES} width={1920} className="ex-hero__photo" eager />
      <div className="ex-hero__scrim" aria-hidden="true" />

      <ul className="ex-hero__chips" aria-label={m.explore.eyebrow}>
        <li>{m.hero.species(data.species.length)}</li>
        <li>{m.hero.basins(WATERSHEDS.length)}</li>
        <li className="tabular">
          {years[0]}–{years[1]}
        </li>
      </ul>

      <div className="ex-hero__copy">
        <p className="ex-eyebrow">{m.explore.eyebrow}</p>
        <h1 id="ex-hero-title" className="ex-hero__title">
          {m.explore.heroLine1}
          <br />
          <em>{m.explore.heroLine2}</em>
        </h1>
        <p className="ex-hero__lede">{m.explore.heroLede}</p>
        <button type="button" className="ex-button ex-button--light" onClick={onStart}>
          {m.explore.heroCta}
          <ArrowDown size={15} aria-hidden="true" />
        </button>
      </div>

      {featured && (
        <button type="button" className="ex-hero__card" onClick={() => onFeature(featured.id)} aria-label={m.explore.learnAbout(featured.commonNames[lang])}>
          <span className="ex-hero__card-top">
            <span>{m.explore.heroCard}</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
          <SpeciesImg id={featured.id} width={330} className="ex-hero__card-img" />
          <span className="ex-hero__card-name">{featured.commonNames[lang]}</span>
          <span className="ex-hero__card-sci">{featured.scientificName}</span>
          <span className="ex-hero__card-meta">
            <span>{m.origin[featured.origin]}</span>
            <span className="tabular">{featured.firstRecord}</span>
          </span>
        </button>
      )}

      {img && <p className="ex-hero__credit">{m.explore.photoBy(img.artist, img.license)}</p>}
    </section>
  );
}
