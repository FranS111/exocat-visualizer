import { useEffect, useMemo, useState } from 'react';
import { ORIGIN_REGIONS } from '../../data/originRegions';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import type { OriginKey } from '../../types';
import { loadWorldGeometry, routePath, type WorldGeometry } from '../species/worldGeometry';
import { SectionHead, SpeciesImg } from './common';

/** World atlas of native ranges: pick a region, see who travelled from there. */
export function OriginsAtlas({ onSpecies }: { onSpecies: (id: string) => void }) {
  const { m, lang } = useI18n();
  const data = useDataset();
  const [geo, setGeo] = useState<WorldGeometry | null>(null);

  useEffect(() => {
    let alive = true;
    loadWorldGeometry().then((g) => alive && setGeo(g)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Regions that actually have species, most species first.
  const regions = useMemo(() => {
    const by = new Map<OriginKey, string[]>();
    for (const s of data.species) by.set(s.origin, [...(by.get(s.origin) ?? []), s.id]);
    return [...by.entries()].map(([key, ids]) => ({ key, ids })).sort((a, b) => b.ids.length - a.ids.length);
  }, [data.species]);
  const [active, setActive] = useState<OriginKey>(() => regions[0]?.key ?? 'northAmerica');
  const current = regions.find((r) => r.key === active) ?? regions[0];
  const max = Math.max(...regions.map((r) => r.ids.length));

  // Shade each country by the busiest region it belongs to.
  const shade = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of regions) for (const c of ORIGIN_REGIONS[r.key]) map.set(c, Math.max(map.get(c) ?? 0, r.ids.length / max));
    return map;
  }, [regions, max]);
  const activeSet = useMemo(() => new Set(ORIGIN_REGIONS[active]), [active]);

  // Clicking a country picks the most specific region (fewest countries) that contains it.
  const pickCountry = (id: string) => {
    const hit = regions
      .filter((r) => ORIGIN_REGIONS[r.key].includes(id))
      .sort((a, b) => ORIGIN_REGIONS[a.key].length - ORIGIN_REGIONS[b.key].length)[0];
    if (hit) setActive(hit.key);
  };

  return (
    <section id="explore-origins" className="ex-section" aria-labelledby="ex-origins-title">
      <SectionHead id="ex-origins-title" index="03" title={m.explore.originsTitle} lede={m.explore.originsLede} />

      <div className="ex-atlas">
        <div className="ex-atlas__map">
          <svg viewBox="0 0 400 196" role="img" aria-label={m.modal.originMapLabel(m.origin[active])}>
            {geo && (
              <>
                <g className="ex-atlas__land">
                  {geo.countries.map((c) => {
                    const s = shade.get(c.id);
                    return (
                      <path
                        key={c.id}
                        d={c.d}
                        className={activeSet.has(c.id) ? 'is-active' : s ? 'is-origin' : undefined}
                        style={s && !activeSet.has(c.id) ? { fillOpacity: 0.3 + s * 0.5 } : undefined}
                        onClick={s ? () => pickCountry(c.id) : undefined}
                      />
                    );
                  })}
                </g>
                {regions.map((r) => {
                  const from = geo.centroid(ORIGIN_REGIONS[r.key]);
                  return from ? (
                    <path
                      key={r.key}
                      d={routePath(from, geo.catalonia)}
                      className={`ex-atlas__route ${r.key === active ? 'is-active' : ''}`}
                      pathLength={1}
                    />
                  ) : null;
                })}
                <circle className="origin-map__target-halo" cx={geo.catalonia[0]} cy={geo.catalonia[1]} r={7} />
                <circle className="origin-map__target" cx={geo.catalonia[0]} cy={geo.catalonia[1]} r={3.2} />
              </>
            )}
          </svg>
        </div>

        <div className="ex-atlas__side">
          <ul className="ex-regions" aria-label={m.explore.regionsLabel}>
            {regions.map((r) => (
              <li key={r.key}>
                <button type="button" className={`ex-region ${r.key === active ? 'is-active' : ''}`} aria-pressed={r.key === active} onClick={() => setActive(r.key)}>
                  <span className="ex-region__name">{m.origin[r.key]}</span>
                  <span className="ex-region__bar" aria-hidden="true">
                    <span style={{ width: `${(r.ids.length / max) * 100}%` }} />
                  </span>
                  <span className="ex-region__count tabular">{String(r.ids.length).padStart(2, '0')}</span>
                </button>
              </li>
            ))}
          </ul>

          {current && (
            <div className="ex-atlas__species" aria-live="polite">
              <p className="ex-atlas__species-title">
                <em>{m.origin[current.key]}</em> · {m.explore.regionCount(current.ids.length)}
              </p>
              <ul>
                {current.ids.map((id) => {
                  const s = data.speciesById.get(id)!;
                  return (
                    <li key={id}>
                      <button type="button" className="ex-mini" onClick={() => onSpecies(id)} aria-label={m.explore.learnAbout(s.commonNames[lang])}>
                        <SpeciesImg id={id} width={120} className="ex-mini__img" />
                        <span className="ex-mini__text">
                          <span className="ex-mini__name">{s.commonNames[lang]}</span>
                          <span className="ex-mini__sci">{s.scientificName}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
