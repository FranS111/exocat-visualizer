import { useContext } from 'react';
import { ExocatDataContext } from '../context/ExocatDataContext';
import type { ExocatDataset } from '../types';

/** Raw dataset plus load status. */
export function useExocatData() {
  const ctx = useContext(ExocatDataContext);
  if (!ctx) throw new Error('useExocatData must be used inside <ExocatDataProvider>');
  return ctx;
}

/** Non-null dataset, for components that only render once loading has finished. */
export function useDataset(): ExocatDataset {
  const { data } = useExocatData();
  if (!data) throw new Error('useDataset called before the dataset finished loading');
  return data;
}
