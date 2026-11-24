import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import type { MapLayerId } from '../types';

export type ColorMode = 'risk' | 'group';
/** 'data' = analytical dashboard (default); 'explore' = visual, educational field guide. */
export type ViewMode = 'data' | 'explore';

const VIEW_KEY = 'exocat.view';
const readView = (): ViewMode => {
  try {
    return window.localStorage.getItem(VIEW_KEY) === 'explore' ? 'explore' : 'data';
  } catch {
    return 'data';
  }
};

export interface UiContextValue {
  selectedSpeciesId: string | null;
  openSpecies: (id: string) => void;
  closeSpecies: () => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  layers: Record<MapLayerId, boolean>;
  toggleLayer: (id: MapLayerId) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  viewMode: ViewMode;
  /** Switch views; optionally open a species profile in the destination view. */
  setViewMode: (mode: ViewMode, openSpeciesId?: string) => void;
}

export const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [selectedSpeciesId, setSelected] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layers, setLayers] = useState<Record<MapLayerId, boolean>>({ records: true, grid: false, hubs: false });
  const [colorMode, setColorMode] = useState<ColorMode>('risk');
  const [viewMode, setViewState] = useState<ViewMode>(readView);

  const setViewMode = useCallback((mode: ViewMode, openSpeciesId?: string) => {
    try {
      window.localStorage.setItem(VIEW_KEY, mode);
    } catch {
      /* storage unavailable */
    }
    const commit = () => {
      flushSync(() => {
        setViewState(mode);
        setSelected(openSpeciesId ?? null);
        setFiltersOpen(false);
      });
      window.scrollTo({ top: 0 });
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) doc.startViewTransition(commit);
    else commit();
  }, []);

  const openSpecies = useCallback((id: string) => setSelected(id), []);
  const closeSpecies = useCallback(() => setSelected(null), []);
  const toggleLayer = useCallback((id: MapLayerId) => setLayers((l) => ({ ...l, [id]: !l[id] })), []);

  const value = useMemo(
    () => ({ selectedSpeciesId, openSpecies, closeSpecies, filtersOpen, setFiltersOpen, layers, toggleLayer, colorMode, setColorMode, viewMode, setViewMode }),
    [selectedSpeciesId, openSpecies, closeSpecies, filtersOpen, layers, toggleLayer, colorMode, viewMode, setViewMode],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
