// Loaded lazily (dynamic import) the first time a species profile opens, so the
// world outline and d3-geo stay out of the main bundle.
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { CATALONIA_POINT } from '../../data/originRegions';

export const MAP_WIDTH = 400;
export const MAP_HEIGHT = 196;
const ANTARCTICA = '010';

export interface WorldGeometry {
  countries: { id: string; d: string }[];
  catalonia: [number, number];
  /** Projected centroid of a set of countries. */
  centroid: (ids: string[]) => [number, number] | null;
}

export function buildWorldGeometry(): WorldGeometry {
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const all = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
  const land = all.features.filter((f) => f.id !== ANTARCTICA && f.id !== undefined);
  const fc: FeatureCollection = { type: 'FeatureCollection', features: land };

  const projection = geoNaturalEarth1().fitExtent(
    [
      [4, 4],
      [MAP_WIDTH - 4, MAP_HEIGHT - 4],
    ],
    fc,
  );
  const path = geoPath(projection);
  const byId = new Map<string, Feature>(land.map((f) => [String(f.id), f]));

  return {
    countries: land.map((f) => ({ id: String(f.id), d: path(f) ?? '' })),
    catalonia: projection(CATALONIA_POINT) as [number, number],
    centroid: (ids) => {
      const features = ids.map((id) => byId.get(id)).filter((f): f is Feature => !!f);
      if (!features.length) return null;
      // Area-weighted mean of the projected country centroids.
      let x = 0, y = 0, w = 0;
      for (const f of features) {
        const a = path.area(f);
        const [cx, cy] = path.centroid(f);
        x += cx * a; y += cy * a; w += a;
      }
      return w ? [x / w, y / w] : null;
    },
  };
}
