import { useMemo } from 'react';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { WATERSHEDS } from '../../types';

interface Kpi {
  id: string;
  label: string;
  value: string;
  context: string;
  tone?: 'alert';
}

/** Key figures as an editorial ledger: mono index + label, large grotesk numeral, mono context. */
export function KpiStrip() {
  const data = useDataset();
  const { m, fmt } = useI18n();
  const { occurrences, speciesSummaries } = useSpeciesFilter();

  const kpis = useMemo<Kpi[]>(() => {
    const highRisk = speciesSummaries.filter((s) => s.species.risk === 'high').length;
    const basins = new Set(occurrences.map((o) => o.watershed)).size;
    const newest = speciesSummaries.reduce<(typeof speciesSummaries)[number] | null>(
      (best, s) => (!best || s.species.firstRecord > best.species.firstRecord ? s : best),
      null,
    );
    const share = data.occurrences.length ? Math.round((occurrences.length / data.occurrences.length) * 100) : 0;
    return [
      { id: 'species', label: m.kpi.speciesInView, value: fmt(speciesSummaries.length), context: m.kpi.ofCatalogued(data.species.length) },
      { id: 'records', label: m.kpi.records, value: fmt(occurrences.length), context: m.kpi.shareOfAll(share) },
      {
        id: 'high',
        label: m.kpi.highRisk,
        value: fmt(highRisk),
        context: speciesSummaries.length ? m.kpi.shareOfSpecies(Math.round((highRisk / speciesSummaries.length) * 100)) : '—',
        tone: 'alert',
      },
      { id: 'basins', label: m.kpi.basins, value: `${basins}`, context: m.kpi.ofBasins(WATERSHEDS.length) },
      {
        id: 'newest',
        label: m.kpi.newest,
        value: newest ? `${newest.species.firstRecord}` : '—',
        context: newest ? newest.species.scientificName : m.kpi.noSpecies,
      },
    ];
  }, [data, occurrences, speciesSummaries, m, fmt]);

  return (
    <section id="key-figures" className="kpi-strip" aria-label={m.kpi.label}>
      {kpis.map(({ id, label, value, context, tone }, i) => (
        <article key={id} className={`kpi ${tone === 'alert' ? 'kpi--alert' : ''}`}>
          <p className="kpi__head">
            <span className="kpi__index" aria-hidden="true">
              ({String(i + 1).padStart(2, '0')})
            </span>
            <span className="kpi__label">{label}</span>
          </p>
          <p className="kpi__value">{value}</p>
          <p className={`kpi__context ${id === 'newest' ? 'is-species' : ''}`}>{context}</p>
        </article>
      ))}
    </section>
  );
}
