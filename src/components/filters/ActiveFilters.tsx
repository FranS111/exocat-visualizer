import { X } from 'lucide-react';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';

interface Token {
  key: string;
  label: string;
  onRemove: () => void;
}

/** Removable summary of every active facet, so state is never hidden inside a closed drawer. */
export function ActiveFilters() {
  const data = useDataset();
  const { m, basin } = useI18n();
  const { filters, actions, activeFilterCount } = useSpeciesFilter();
  if (activeFilterCount === 0) return null;

  const tokens: Token[] = [];
  if (filters.focusSpeciesId) {
    const s = data.speciesById.get(filters.focusSpeciesId);
    tokens.push({ key: 'focus', label: m.active.isolated(s?.scientificName ?? '—'), onRemove: () => actions.setFocusSpecies(null) });
  }
  if (filters.search.trim()) tokens.push({ key: 'q', label: `“${filters.search.trim()}”`, onRemove: () => actions.setSearch('') });
  filters.groups.forEach((g) => tokens.push({ key: `g-${g}`, label: m.taxon[g], onRemove: () => actions.toggleGroup(g) }));
  filters.risks.forEach((r) => tokens.push({ key: `r-${r}`, label: m.risk[r], onRemove: () => actions.toggleRisk(r) }));
  filters.habitats.forEach((h) => tokens.push({ key: `h-${h}`, label: m.habitat[h], onRemove: () => actions.toggleHabitat(h) }));
  if (filters.watershed) tokens.push({ key: 'w', label: m.active.basin(basin(filters.watershed)), onRemove: () => actions.setWatershed(null) });
  const [y0, y1] = filters.yearRange;
  if (y0 !== data.yearBounds[0] || y1 !== data.yearBounds[1]) {
    tokens.push({ key: 'y', label: `${y0}–${y1}`, onRemove: () => actions.setYearRange(data.yearBounds) });
  }
  if (filters.euListedOnly) tokens.push({ key: 'eu', label: m.active.euList, onRemove: () => actions.setEuListedOnly(false) });

  return (
    <div className="active-filters" aria-label={m.active.label}>
      <ul>
        {tokens.map((t) => (
          <li key={t.key}>
            <button type="button" className="token" onClick={t.onRemove} aria-label={m.active.remove(t.label)}>
              {t.label}
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="button button--text" onClick={actions.reset}>
        {m.active.clearAll}
      </button>
    </div>
  );
}
