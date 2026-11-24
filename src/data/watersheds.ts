import type { Lang, LatLng, Watershed, WatershedSystem } from '../types';

export interface WatershedProfile {
  name: Watershed;
  /** Label anchor used for the "hubs" layer. */
  centroid: LatLng;
  /** Points along the river network that synthetic records cluster around. */
  anchors: LatLng[];
  /** Mediterranean-draining internal basin vs. Ebro/Garonne system. */
  system: WatershedSystem;
}

/**
 * Simplified watershed geography for Catalonia. Anchors follow main river
 * courses and stay inland so that jittered records do not fall in the sea.
 */
export const WATERSHED_PROFILES: WatershedProfile[] = [
  { name: 'Garona', system: 'atlantic', centroid: [42.72, 0.86], anchors: [[42.7, 0.8], [42.74, 0.93], [42.68, 0.72]] },
  { name: 'Noguera Pallaresa', system: 'ebro', centroid: [42.25, 1.07], anchors: [[42.42, 1.13], [42.22, 1.06], [42.06, 0.96]] },
  { name: 'Noguera Ribagorçana', system: 'ebro', centroid: [42.1, 0.72], anchors: [[42.3, 0.75], [42.06, 0.7], [41.86, 0.64]] },
  { name: 'Segre', system: 'ebro', centroid: [41.85, 1.1], anchors: [[42.36, 1.5], [42.16, 1.4], [41.92, 1.22], [41.71, 0.96], [41.62, 0.63], [41.48, 0.47]] },
  { name: 'Ebre', system: 'ebro', centroid: [40.95, 0.6], anchors: [[41.15, 0.47], [40.96, 0.53], [40.82, 0.62], [40.73, 0.76], [41.05, 0.72]] },
  { name: 'Francolí', system: 'internal', centroid: [41.3, 1.15], anchors: [[41.41, 1.1], [41.27, 1.15], [41.17, 1.2]] },
  { name: 'Gaià', system: 'internal', centroid: [41.3, 1.38], anchors: [[41.37, 1.4], [41.22, 1.38]] },
  { name: 'Foix', system: 'internal', centroid: [41.35, 1.67], anchors: [[41.41, 1.64], [41.31, 1.69]] },
  { name: 'Llobregat', system: 'internal', centroid: [41.75, 1.88], anchors: [[42.15, 1.85], [41.95, 1.86], [41.73, 1.84], [41.56, 1.9], [41.42, 2.0], [41.34, 2.06]] },
  { name: 'Besòs', system: 'internal', centroid: [41.6, 2.22], anchors: [[41.7, 2.25], [41.59, 2.22], [41.49, 2.19]] },
  { name: 'Tordera', system: 'internal', centroid: [41.74, 2.55], anchors: [[41.79, 2.45], [41.71, 2.63]] },
  { name: 'Ter', system: 'internal', centroid: [42.05, 2.55], anchors: [[42.26, 2.2], [42.06, 2.33], [41.96, 2.64], [41.98, 2.82], [42.03, 3.08]] },
  { name: 'Fluvià', system: 'internal', centroid: [42.18, 2.75], anchors: [[42.21, 2.5], [42.18, 2.76], [42.18, 2.98]] },
  { name: 'Muga', system: 'internal', centroid: [42.3, 2.95], anchors: [[42.36, 2.85], [42.29, 2.97], [42.26, 3.07]] },
];

export const WATERSHED_BY_NAME = new Map(WATERSHED_PROFILES.map((w) => [w.name, w]));

export const WATERSHED_SYSTEMS: WatershedSystem[] = ['internal', 'ebro', 'atlantic'];

/**
 * Official Catalan toponyms are the ids. Spanish/English use their
 * conventional exonyms where one exists; otherwise the Catalan name stands.
 */
const EXONYMS: Partial<Record<Watershed, { es?: string; en?: string }>> = {
  Ebre: { es: 'Ebro', en: 'Ebro' },
  Garona: { en: 'Garonne' },
  'Noguera Ribagorçana': { es: 'Noguera Ribagorzana' },
  Besòs: { es: 'Besós' },
  Gaià: { es: 'Gayá' },
};

export function watershedLabel(name: Watershed, lang: Lang): string {
  if (lang === 'ca') return name;
  return EXONYMS[name]?.[lang] ?? name;
}

/** Map view that frames Catalonia. */
export const CATALONIA_BOUNDS: [LatLng, LatLng] = [
  [40.5, 0.15],
  [42.9, 3.35],
];
