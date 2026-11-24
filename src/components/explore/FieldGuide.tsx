import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { SPECIES_IMAGES } from '../../data/speciesImages';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useTheme } from '../../hooks/useTheme';
import { useUi } from '../../hooks/useUi';
import { TAXON_GROUPS, WATERSHEDS, type RiskLevel, type Species, type TaxonGroup } from '../../types';
import { speciesMatchesSearch } from '../../utils/filtering';
import { GroupIcon } from '../common/Badges';
import { OriginMap } from '../species/OriginMap';
import { SectionHead, SpeciesImg } from './common';

const RISK_DOTS: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

interface Props {
  group: TaxonGroup | null;
  onGroup: (g: TaxonGroup | null) => void;
  spotlightId: string;
  onSpotlight: (id: string, scroll?: boolean) => void;
  basinsBySpecies: Map<string, number>;
}

export function FieldGuide({ group, onGroup, spotlightId, onSpotlight, basinsBySpecies }: Props) {
  const { m, lang } = useI18n();
  const { palette } = useTheme();
  const { setViewMode } = useUi();
  const { filters } = useSpeciesFilter();
  const data = useDataset();

  // Alphabetical by common name in the current language: easy to scan for a lay reader.
  const sorted = useMemo(
    () => [...data.species].sort((a, b) => a.commonNames[lang].localeCompare(b.commonNames[lang], lang)),
    [data.species, lang],
  );
  const visible = sorted.filter((s) => (!group || s.group === group) && speciesMatchesSearch(s, filters.search));
  const spot = data.speciesById.get(spotlightId) ?? visible[0] ?? sorted[0];
  const ring = visible.length ? visible : sorted;
  const at = Math.max(0, ring.findIndex((s) => s.id === spot.id));
  const step = (d: number) => onSpotlight(ring[(at + d + ring.length) % ring.length].id);

  return (
    <section id="explore-guide" className="ex-section" aria-labelledby="ex-guide-title">
      <SectionHead id="ex-guide-title" index="02" title={m.explore.guideTitle} lede={m.explore.guideLede} />

      <Spotlight
        species={spot}
        index={at + 1}
        total={ring.length}
        basins={basinsBySpecies.get(spot.id) ?? 0}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onData={() => setViewMode('data', spot.id)}
      />

      <div className="ex-chips" role="group" aria-label={m.explore.filterBy}>
        <button type="button" className={`ex-chip ${!group ? 'is-active' : ''}`} aria-pressed={!group} onClick={() => onGroup(null)}>
          {m.explore.all} <span className="tabular">{data.species.length}</span>
        </button>
        {TAXON_GROUPS.map((g) => (
          <button key={g} type="button" className={`ex-chip ${group === g ? 'is-active' : ''}`} aria-pressed={group === g} onClick={() => onGroup(group === g ? null : g)}>
            <span className="ex-chip__dot" style={{ background: palette.taxon[g] }} aria-hidden="true" />
            {m.taxon[g]} <span className="tabular">{data.species.filter((s) => s.group === g).length}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="ex-empty">{m.explore.noResults(filters.search)}</p>
      ) : (
        <ul className="ex-cards">
          {visible.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`ex-card ${s.id === spot.id ? 'is-active' : ''}`}
                aria-pressed={s.id === spot.id}
                aria-label={m.explore.learnAbout(s.commonNames[lang])}
                onClick={() => onSpotlight(s.id, true)}
              >
                <SpeciesImg id={s.id} width={330} className="ex-card__img" />
                <span className="ex-card__index tabular" aria-hidden="true">
                  ({String(i + 1).padStart(2, '0')})
                </span>
                <span className="ex-card__name">{s.commonNames[lang]}</span>
                <span className="ex-card__sci">{s.scientificName}</span>
                <span className="ex-card__meta">
                  <span>
                    <span className="ex-chip__dot" style={{ background: palette.taxon[s.group] }} aria-hidden="true" />
                    {m.taxon[s.group]}
                  </span>
                  <span className="tabular">{s.firstRecord}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Spotlight({
  species,
  index,
  total,
  basins,
  onPrev,
  onNext,
  onData,
}: {
  species: Species;
  index: number;
  total: number;
  basins: number;
  onPrev: () => void;
  onNext: () => void;
  onData: () => void;
}) {
  const { m, lang } = useI18n();
  const { palette } = useTheme();
  const img = SPECIES_IMAGES[species.id];
  const accent = palette.taxon[species.group];
  const data = useDataset();
  const ghosts = data.species.filter((s) => s.id !== species.id);

  return (
    <article id="explore-spotlight" className="ex-spot" style={{ ['--accent' as string]: accent }} aria-live="polite" tabIndex={-1}>
      <div className="ex-spot__media">
        <SpeciesImg key={species.id} id={species.id} width={960} className="ex-spot__img" alt={m.modal.photoAlt(species.commonNames[lang], species.scientificName)} />
        <span className="ex-spot__counter tabular" aria-hidden="true">
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        {img && (
          <a className="ex-spot__credit" href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
            {m.explore.photoBy(img.artist, img.license === 'Public domain' ? m.modal.publicDomain : img.license)}
          </a>
        )}
      </div>

      <div className="ex-spot__body">
        <div className="ex-spot__stack">
          {ghosts.map((g) => (
            <SpotContent key={g.id} species={g} basins={WATERSHEDS.length} ghost />
          ))}
          <SpotContent key={`active-${species.id}`} species={species} basins={basins} />
        </div>

        <div className="ex-spot__actions">
          <div className="ex-spot__nav">
            <button type="button" className="ex-round" onClick={onPrev} aria-label={m.explore.prevSpecies}>
              <ArrowLeft size={16} />
            </button>
            <button type="button" className="ex-round" onClick={onNext} aria-label={m.explore.nextSpecies}>
              <ArrowRight size={16} />
            </button>
          </div>
          <button type="button" className="ex-button ex-button--outline" onClick={onData}>
            <BarChart3 size={14} aria-hidden="true" />
            {m.explore.seeData}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Text side of the spotlight. Ghost copies are invisible and only reserve height. */
function SpotContent({ species, basins, ghost = false }: { species: Species; basins: number; ghost?: boolean }) {
  const { m, lang, tx } = useI18n();
  const { palette } = useTheme();
  const accent = palette.taxon[species.group];
  return (
    <div className={`ex-spot__content ${ghost ? 'is-ghost' : ''}`} aria-hidden={ghost || undefined}>
        <p className="ex-spot__group">
          <span className="ex-group__icon" style={{ background: accent }} aria-hidden="true">
            <GroupIcon group={species.group} size={13} color={palette.onFill} strokeWidth={2.4} />
          </span>
          {m.taxon[species.group]} · {species.family}
        </p>
        <h3 className="ex-spot__name">{species.commonNames[lang]}</h3>
        <p className="ex-spot__sci">{species.scientificName}</p>

        <dl className="ex-facts">
          <div>
            <dt>{m.explore.firstSeen}</dt>
            <dd className="ex-facts__big tabular">{species.firstRecord}</dd>
          </div>
          <div>
            <dt>{m.explore.riskLabel}</dt>
            <dd>
              <span className={`ex-risk ex-risk--${species.risk}`} aria-hidden="true">
                {[1, 2, 3].map((d) => (
                  <i key={d} className={d <= RISK_DOTS[species.risk] ? 'is-on' : undefined} />
                ))}
              </span>
              {m.riskShort[species.risk]}
            </dd>
          </div>
          <div>
            <dt>{m.explore.comesFrom}</dt>
            <dd>{m.origin[species.origin]}</dd>
          </div>
          <div>
            <dt>{m.explore.arrivedBy}</dt>
            <dd>{m.pathway[species.pathway]}</dd>
          </div>
        </dl>

        <div className="ex-spot__story">
          <div>
            <h4>{m.explore.whyItMatters}</h4>
            <p>{tx(species.description)}</p>
            <h4>{m.explore.whatIsDone}</h4>
            <p>{tx(species.management)}</p>
          </div>
          <div>
            {ghost ? (
              <figure className="origin-map">
                <div className="origin-map__svg" />
                <figcaption className="origin-map__legend">
                  <span className="origin-map__key">{m.origin[species.origin]}</span>
                </figcaption>
              </figure>
            ) : (
              <OriginMap origin={species.origin} />
            )}
            <p className="ex-spot__presence">{m.explore.presentIn(basins, WATERSHEDS.length)}</p>
          </div>
        </div>

    </div>
  );
}
