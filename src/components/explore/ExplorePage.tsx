import { useEffect, useMemo, useState } from 'react';
import { useDataset } from '../../hooks/useExocatData';
import { useUi } from '../../hooks/useUi';
import type { TaxonGroup } from '../../types';
import { scrollToSection } from '../../utils/smoothScroll';
import { Footer } from '../layout/Footer';
import { ActSection } from './ActSection';
import { ArrivalsStrip } from './ArrivalsStrip';
import { ExploreHero } from './ExploreHero';
import { FieldGuide } from './FieldGuide';
import { GroupsSection } from './GroupsSection';
import { Manifesto } from './Manifesto';
import { OriginsAtlas } from './OriginsAtlas';

/** Species shown first in the field guide spotlight. */
const DEFAULT_SPOTLIGHT = 'neogale-vison';

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) void scrollToSection(el);
};

/**
 * "Explore" view: the same dataset told as a visual field guide for a general
 * audience — photos, stories and simple interactions instead of charts.
 */
export function ExplorePage() {
  const data = useDataset();
  const [group, setGroup] = useState<TaxonGroup | null>(null);
  const [spotlightId, setSpotlightId] = useState(() => (data.speciesById.has(DEFAULT_SPOTLIGHT) ? DEFAULT_SPOTLIGHT : data.species[0].id));

  const basinsBySpecies = useMemo(() => {
    const sets = new Map<string, Set<string>>();
    for (const o of data.occurrences) {
      const s = sets.get(o.speciesId) ?? new Set<string>();
      s.add(o.watershed);
      sets.set(o.speciesId, s);
    }
    return new Map([...sets].map(([id, s]) => [id, s.size]));
  }, [data.occurrences]);

  const spotlight = (id: string, scroll = false) => {
    setSpotlightId(id);
    const sp = data.speciesById.get(id);
    // Keep the chosen animal visible in the grid below.
    if (sp && group && sp.group !== group) setGroup(null);
    if (scroll) requestAnimationFrame(() => goTo('explore-spotlight'));
  };

  // A species picked elsewhere (header search) lands in the spotlight.
  const { selectedSpeciesId, closeSpecies } = useUi();
  useEffect(() => {
    if (!selectedSpeciesId) return;
    spotlight(selectedSpeciesId, true);
    closeSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpeciesId]);

  return (
    <main id="main" className="explore" tabIndex={-1}>
      <ExploreHero onStart={() => goTo('explore-intro')} onFeature={(id) => spotlight(id, true)} />
      <Manifesto onNext={() => goTo('explore-groups')} />
      <div className="explore__body">
        <GroupsSection
          onPick={(g) => {
            setGroup(g);
            goTo('explore-guide');
          }}
        />
        <FieldGuide group={group} onGroup={setGroup} spotlightId={spotlightId} onSpotlight={spotlight} basinsBySpecies={basinsBySpecies} />
        <OriginsAtlas onSpecies={(id) => spotlight(id, true)} />
        <ArrivalsStrip onSpecies={(id) => spotlight(id, true)} />
      </div>
      <ActSection />
      <div className="explore__footer">
        <Footer />
      </div>
    </main>
  );
}
