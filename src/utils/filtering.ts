import type { ExocatDataset, FilterState, Occurrence, Species, Watershed } from '../types';

/** Facets that a chart may ignore so it can keep showing its own siblings. */
export type IgnorableFacet = 'watershed' | 'groups' | 'yearRange';

const normalise = (s: string) =>
  s.toLocaleLowerCase('ca').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Free-text match on scientific, family and common names (accent-insensitive). */
export function speciesMatchesSearch(species: Species, search: string): boolean {
  const q = normalise(search.trim());
  if (!q) return true;
  return normalise(
    [species.scientificName, species.family, species.commonNames.ca, species.commonNames.es, species.commonNames.en].join(' '),
  ).includes(q);
}

export function speciesMatches(species: Species, f: FilterState, ignore?: IgnorableFacet): boolean {
  if (f.focusSpeciesId && species.id !== f.focusSpeciesId) return false;
  if (ignore !== 'groups' && f.groups.length && !f.groups.includes(species.group)) return false;
  if (f.risks.length && !f.risks.includes(species.risk)) return false;
  if (f.habitats.length && !species.habitats.some((h) => f.habitats.includes(h))) return false;
  if (f.euListedOnly && !species.legal.eu) return false;
  if (f.search.trim()) {
    const q = normalise(f.search.trim());
    const haystack = normalise(
      [species.scientificName, species.family, species.commonNames.ca, species.commonNames.es, species.commonNames.en].join(' '),
    );
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export function filterOccurrences(data: ExocatDataset, f: FilterState, ignore?: IgnorableFacet): Occurrence[] {
  const allowed = new Set(data.species.filter((s) => speciesMatches(s, f, ignore)).map((s) => s.id));
  const [y0, y1] = f.yearRange;
  return data.occurrences.filter(
    (o) =>
      allowed.has(o.speciesId) &&
      (ignore === 'yearRange' || (o.year >= y0 && o.year <= y1)) &&
      (ignore === 'watershed' || !f.watershed || o.watershed === f.watershed),
  );
}

export interface SpeciesSummary {
  species: Species;
  records: number;
  watersheds: Watershed[];
  lastRecord: number | null;
}

export function summariseSpecies(data: ExocatDataset, occurrences: Occurrence[]): SpeciesSummary[] {
  const acc = new Map<string, { records: number; watersheds: Set<Watershed>; last: number }>();
  for (const o of occurrences) {
    let entry = acc.get(o.speciesId);
    if (!entry) {
      entry = { records: 0, watersheds: new Set(), last: 0 };
      acc.set(o.speciesId, entry);
    }
    entry.records++;
    entry.watersheds.add(o.watershed);
    if (o.year > entry.last) entry.last = o.year;
  }
  const out: SpeciesSummary[] = [];
  for (const [id, e] of acc) {
    const species = data.speciesById.get(id);
    if (!species) continue;
    out.push({ species, records: e.records, watersheds: [...e.watersheds], lastRecord: e.last || null });
  }
  return out;
}

export function countActiveFilters(f: FilterState, yearBounds: [number, number]): number {
  return (
    (f.search.trim() ? 1 : 0) +
    f.groups.length +
    f.risks.length +
    f.habitats.length +
    (f.watershed ? 1 : 0) +
    (f.euListedOnly ? 1 : 0) +
    (f.focusSpeciesId ? 1 : 0) +
    (f.yearRange[0] !== yearBounds[0] || f.yearRange[1] !== yearBounds[1] ? 1 : 0)
  );
}

export interface SpeciesSuggestion {
  species: Species;
  /** Matched span in the localized common name, for highlighting (null if it matched elsewhere). */
  common: [number, number] | null;
  sci: [number, number] | null;
}

/**
 * Type-ahead suggestions: best matches first (start of the common name, start of a
 * word, scientific name, then anywhere incl. other languages), capped at `limit`.
 */
export function suggestSpecies(all: Species[], query: string, lang: keyof Species['commonNames'], limit = 4): SpeciesSuggestion[] {
  const q = normalise(query.trim());
  if (!q) return [];
  const SEPARATORS = " -'’(";
  /** First occurrence of q that starts a word, or -1. */
  const wordStart = (text: string) => {
    for (let i = text.indexOf(q); i >= 0; i = text.indexOf(q, i + 1)) {
      if (i === 0 || SEPARATORS.includes(text[i - 1])) return i;
    }
    return -1;
  };
  const ranked: { s: SpeciesSuggestion; rank: number; name: string }[] = [];
  for (const sp of all) {
    const common = normalise(sp.commonNames[lang]);
    const sci = normalise(sp.scientificName);
    const ci = common.indexOf(q);
    const si = sci.indexOf(q);
    const cw = wordStart(common);
    let rank: number;
    if (ci === 0) rank = 0; // "vis" → "Visón americano"
    else if (cw > 0) rank = 1; // "amer" → "Visón americano"
    else if (wordStart(sci) >= 0) rank = 2; // "neog" → "Neogale vison"
    else if (ci > 0 || si >= 0) rank = 3; // mid-word
    else if (speciesMatchesSearch(sp, query)) rank = 4; // other language / family
    else continue;
    const cStart = cw >= 0 ? cw : ci;
    ranked.push({
      s: {
        species: sp,
        common: cStart >= 0 ? [cStart, cStart + q.length] : null,
        sci: si >= 0 ? [si, si + q.length] : null,
      },
      rank,
      name: sp.commonNames[lang],
    });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, lang))
    .slice(0, limit)
    .map((r) => r.s);
}
