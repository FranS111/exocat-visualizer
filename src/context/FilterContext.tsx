import { createContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { RECORDS_END_YEAR, RECORDS_START_YEAR } from '../data/generateDataset';
import type { ExocatDataset, FilterState, Habitat, Occurrence, RiskLevel, TaxonGroup, Watershed } from '../types';
import { countActiveFilters, filterOccurrences, summariseSpecies, type SpeciesSummary } from '../utils/filtering';

export const INITIAL_FILTERS: FilterState = {
  search: '',
  groups: [],
  risks: [],
  habitats: [],
  watershed: null,
  yearRange: [RECORDS_START_YEAR, RECORDS_END_YEAR],
  euListedOnly: false,
  focusSpeciesId: null,
};

export type FilterAction =
  | { type: 'setSearch'; value: string }
  | { type: 'toggleGroup'; value: TaxonGroup }
  | { type: 'toggleRisk'; value: RiskLevel }
  | { type: 'toggleHabitat'; value: Habitat }
  | { type: 'setWatershed'; value: Watershed | null }
  | { type: 'setYearRange'; value: [number, number] }
  | { type: 'setEuListedOnly'; value: boolean }
  | { type: 'setFocusSpecies'; value: string | null }
  | { type: 'reset' };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'setSearch':
      return { ...state, search: action.value };
    case 'toggleGroup':
      return { ...state, groups: toggle(state.groups, action.value) };
    case 'toggleRisk':
      return { ...state, risks: toggle(state.risks, action.value) };
    case 'toggleHabitat':
      return { ...state, habitats: toggle(state.habitats, action.value) };
    case 'setWatershed':
      return { ...state, watershed: action.value };
    case 'setYearRange': {
      const [a, b] = action.value;
      const next: [number, number] = a <= b ? [a, b] : [b, a];
      if (next[0] === state.yearRange[0] && next[1] === state.yearRange[1]) return state;
      return { ...state, yearRange: next };
    }
    case 'setEuListedOnly':
      return { ...state, euListedOnly: action.value };
    case 'setFocusSpecies':
      return { ...state, focusSpeciesId: action.value };
    case 'reset':
      return INITIAL_FILTERS;
    default:
      return state;
  }
}

export interface FilterDerived {
  /** Occurrences matching every active filter. */
  occurrences: Occurrence[];
  /** Everything except the watershed facet — feeds the watershed chart. */
  occurrencesAnyWatershed: Occurrence[];
  /** Everything except the taxon facet — feeds the taxon donut. */
  occurrencesAnyGroup: Occurrence[];
  /** Everything except the year range — feeds the timeline. */
  occurrencesAnyYear: Occurrence[];
  speciesSummaries: SpeciesSummary[];
  activeFilterCount: number;
}

export interface FilterContextValue {
  filters: FilterState;
  dispatch: Dispatch<FilterAction>;
  derived: FilterDerived;
}

export const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ data, children }: { data: ExocatDataset; children: ReactNode }) {
  const [filters, dispatch] = useReducer(filterReducer, INITIAL_FILTERS);

  // Computed once per filter change and shared by every consumer.
  const derived = useMemo<FilterDerived>(() => {
    const occurrences = filterOccurrences(data, filters);
    return {
      occurrences,
      occurrencesAnyWatershed: filters.watershed ? filterOccurrences(data, filters, 'watershed') : occurrences,
      occurrencesAnyGroup: filters.groups.length ? filterOccurrences(data, filters, 'groups') : occurrences,
      occurrencesAnyYear: filterOccurrences(data, filters, 'yearRange'),
      speciesSummaries: summariseSpecies(data, occurrences),
      activeFilterCount: countActiveFilters(filters, data.yearBounds),
    };
  }, [data, filters]);

  const value = useMemo(() => ({ filters, dispatch, derived }), [filters, derived]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}
