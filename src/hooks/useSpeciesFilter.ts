import { useContext, useMemo } from 'react';
import { FilterContext } from '../context/FilterContext';
import type { Habitat, RiskLevel, TaxonGroup, Watershed } from '../types';

/** Filter state, typed action creators and memoised derived data. */
export function useSpeciesFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useSpeciesFilter must be used inside <FilterProvider>');
  const { filters, dispatch, derived } = ctx;

  const actions = useMemo(
    () => ({
      setSearch: (value: string) => dispatch({ type: 'setSearch', value }),
      toggleGroup: (value: TaxonGroup) => dispatch({ type: 'toggleGroup', value }),
      toggleRisk: (value: RiskLevel) => dispatch({ type: 'toggleRisk', value }),
      toggleHabitat: (value: Habitat) => dispatch({ type: 'toggleHabitat', value }),
      setWatershed: (value: Watershed | null) => dispatch({ type: 'setWatershed', value }),
      toggleWatershed: (value: Watershed) =>
        dispatch({ type: 'setWatershed', value: filters.watershed === value ? null : value }),
      setYearRange: (value: [number, number]) => dispatch({ type: 'setYearRange', value }),
      setEuListedOnly: (value: boolean) => dispatch({ type: 'setEuListedOnly', value }),
      setFocusSpecies: (value: string | null) => dispatch({ type: 'setFocusSpecies', value }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [dispatch, filters.watershed],
  );

  return { filters, actions, ...derived };
}
