import { WATERSHEDS, type ExocatDataset, type Occurrence, type Species, type Watershed } from '../types';
import { SPECIES_SEED, type SpeciesSeed } from './species';
import { WATERSHED_BY_NAME } from './watersheds';

/** Earliest year for which georeferenced records exist in the demo set. */
export const RECORDS_START_YEAR = 1990;
export const RECORDS_END_YEAR = 2025;
const RECORDS_PER_ABUNDANCE_UNIT = 28;

/** Small, fast, seedable PRNG so the demo dataset is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function weightedPick<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function basinWeights(seed: SpeciesSeed): { names: Watershed[]; weights: number[] } {
  if (seed.basins === 'all') {
    return { names: [...WATERSHEDS], weights: WATERSHEDS.map(() => 1) };
  }
  const entries = Object.entries(seed.basins) as [Watershed, number][];
  return { names: entries.map(([n]) => n), weights: entries.map(([, w]) => w) };
}

function yearWeights(firstRecord: number): { years: number[]; weights: number[] } {
  const start = Math.max(firstRecord, RECORDS_START_YEAR);
  const recent = firstRecord >= RECORDS_START_YEAR;
  const years: number[] = [];
  const weights: number[] = [];
  for (let y = start; y <= RECORDS_END_YEAR; y++) {
    years.push(y);
    // Sampling effort grows over time; recent invaders expand faster.
    weights.push(Math.pow(y - start + 1, recent ? 1.6 : 1.15));
  }
  return { years, weights };
}

function generateOccurrences(seed: SpeciesSeed): Occurrence[] {
  const rand = mulberry32(hashString(seed.id));
  const { names, weights } = basinWeights(seed);
  const { years, weights: yw } = yearWeights(seed.firstRecord);
  const count = Math.round(seed.abundance * RECORDS_PER_ABUNDANCE_UNIT * (0.85 + rand() * 0.3));
  const out: Occurrence[] = [];

  for (let i = 0; i < count; i++) {
    const watershed = weightedPick(names, weights, rand);
    const profile = WATERSHED_BY_NAME.get(watershed)!;
    const [aLat, aLng] = profile.anchors[Math.floor(rand() * profile.anchors.length)];
    out.push({
      id: `${seed.id}-${i}`,
      speciesId: seed.id,
      watershed,
      lat: +(aLat + gaussian(rand) * 0.045).toFixed(4),
      lng: +(aLng + gaussian(rand) * 0.06).toFixed(4),
      year: weightedPick(years, yw, rand),
    });
  }
  return out;
}

function toSpecies({ abundance: _a, basins: _b, ...species }: SpeciesSeed): Species {
  return species;
}

export function buildDataset(): ExocatDataset {
  const species = SPECIES_SEED.map(toSpecies);
  const occurrences = SPECIES_SEED.flatMap(generateOccurrences);
  return {
    species,
    occurrences,
    speciesById: new Map(species.map((s) => [s.id, s])),
    yearBounds: [RECORDS_START_YEAR, RECORDS_END_YEAR],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Async boundary that mirrors a future API call (e.g. CREAF open-data endpoint).
 * Swap the body for a `fetch` without touching any consumer.
 */
export function loadExocatDataset(latencyMs = 450): Promise<ExocatDataset> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(buildDataset()), latencyMs);
  });
}
