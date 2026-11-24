import { ArrowUpRight } from 'lucide-react';
import { SPECIES_IMAGES } from '../../data/speciesImages';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';
import { TAXON_GROUPS, type TaxonGroup } from '../../types';
import { GroupIcon } from '../common/Badges';
import { SectionHead, SpeciesImg } from './common';

const COVER: Record<TaxonGroup, string> = {
  Fish: 'lepomis-gibbosus',
  Invertebrates: 'vespa-velutina',
  Birds: 'myiopsitta-monachus',
  Herptiles: 'trachemys-scripta',
  Mammals: 'myocastor-coypus',
};
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function GroupsSection({ onPick }: { onPick: (g: TaxonGroup) => void }) {
  const { m } = useI18n();
  const { palette } = useTheme();
  const data = useDataset();

  return (
    <section id="explore-groups" className="ex-section" aria-labelledby="ex-groups-title">
      <SectionHead id="ex-groups-title" index="01" title={m.explore.groupsTitle} lede={m.explore.groupsLede} />
      <ul className="ex-groups">
        {TAXON_GROUPS.map((g, i) => {
          const count = data.species.filter((s) => s.group === g).length;
          const img = SPECIES_IMAGES[COVER[g]];
          return (
            <li key={g}>
              <button type="button" className="ex-group" onClick={() => onPick(g)} aria-label={m.explore.browseGroup(m.taxon[g])}>
                <span className="ex-group__index" aria-hidden="true">
                  ({LETTERS[i]})
                </span>
                <SpeciesImg id={COVER[g]} width={500} className="ex-group__img" />
                <span className="ex-group__body">
                  <span className="ex-group__name">
                    <span className="ex-group__icon" style={{ background: palette.taxon[g] }} aria-hidden="true">
                      <GroupIcon group={g} size={13} color={palette.onFill} strokeWidth={2.4} />
                    </span>
                    {m.taxon[g]}
                  </span>
                  <span className="ex-group__count tabular">{String(count).padStart(2, '0')}</span>
                  <span className="ex-group__blurb">{m.explore.groupBlurb[g]}</span>
                  <span className="ex-group__more" aria-hidden="true">
                    {m.explore.speciesCount(count)} <ArrowUpRight size={13} />
                  </span>
                </span>
                {img && <span className="ex-group__credit">{img.artist}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
