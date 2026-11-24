import { useEffect, useMemo, useState } from 'react';
import { ORIGIN_REGIONS } from '../../data/originRegions';
import { useI18n } from '../../hooks/useI18n';
import type { OriginKey } from '../../types';
import { loadWorldGeometry, routePath, type WorldGeometry } from './worldGeometry';

const VIEW_W = 400;
const VIEW_H = 196;

/** Mini world map: native range highlighted, with its route to Catalonia. */
export function OriginMap({ origin }: { origin: OriginKey }) {
  const { m } = useI18n();
  const [geo, setGeo] = useState<WorldGeometry | null>(null);

  useEffect(() => {
    let alive = true;
    loadWorldGeometry().then((g) => alive && setGeo(g)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const region = useMemo(() => new Set(ORIGIN_REGIONS[origin]), [origin]);
  const from = useMemo(() => geo?.centroid(ORIGIN_REGIONS[origin]) ?? null, [geo, origin]);
  const label = m.origin[origin];

  return (
    <figure className="origin-map">
      <svg
        className="origin-map__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={m.modal.originMapLabel(label)}
      >
        {geo && (
          <>
            <g className="origin-map__land">
              {geo.countries.map((c) => (
                <path key={c.id} d={c.d} className={region.has(c.id) ? 'is-native' : undefined} />
              ))}
            </g>
            {from && <path key={origin} className="origin-map__route" d={routePath(from, geo.catalonia)} pathLength={1} />}
            <circle className="origin-map__target-halo" cx={geo.catalonia[0]} cy={geo.catalonia[1]} r={6} />
            <circle className="origin-map__target" cx={geo.catalonia[0]} cy={geo.catalonia[1]} r={3} />
          </>
        )}
      </svg>
      <figcaption className="origin-map__legend">
        <span className="origin-map__key">
          <span className="origin-map__swatch" aria-hidden="true" />
          {label}
        </span>
        <span className="origin-map__key">
          <span className="origin-map__dot" aria-hidden="true" />
          {m.modal.catalonia}
        </span>
      </figcaption>
    </figure>
  );
}
