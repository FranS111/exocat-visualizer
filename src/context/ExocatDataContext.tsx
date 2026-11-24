import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadExocatDataset } from '../data/generateDataset';
import type { ExocatDataset } from '../types';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface ExocatDataContextValue {
  status: LoadStatus;
  data: ExocatDataset | null;
  error: string | null;
  reload: () => void;
}

export const ExocatDataContext = createContext<ExocatDataContextValue | null>(null);

export function ExocatDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [data, setData] = useState<ExocatDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    loadExocatDataset()
      .then((ds) => {
        if (cancelled) return;
        setData(ds);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const value = useMemo(() => ({ status, data, error, reload }), [status, data, error, reload]);

  return <ExocatDataContext.Provider value={value}>{children}</ExocatDataContext.Provider>;
}
