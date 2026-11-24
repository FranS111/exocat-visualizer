import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { PALETTES, type Palette, type Theme } from '../utils/theme';

/** Shared with the inline boot script in index.html, which applies the theme before first paint. */
const STORAGE_KEY = 'exocat.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark';

function readStoredTheme(): Theme | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(v) ? v : null;
  } catch {
    return null;
  }
}

const systemTheme = (): Theme => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light');

function applyToDocument(theme: Theme) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12170c' : '#283618');
}

export interface ThemeContextValue {
  theme: Theme;
  /** Explicit user choice; persisted and takes precedence over the OS/browser setting. */
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  palette: Palette;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Theme | null>(readStoredTheme);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = stored ?? system;

  // Follow OS/browser changes (e.g. automatic sunset switching) while the user hasn't chosen.
  useEffect(() => {
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystem(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => applyToDocument(theme), [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: choice lasts for this visit only */
    }
    // Swap everything in one synchronous step: CSS tokens and React-driven palettes land in the same frame.
    const commit = () => {
      applyToDocument(next);
      flushSync(() => setStored(next));
    };
    // View Transitions: the browser snapshots the old page, we commit, then it cross-fades the two
    // snapshots on the compositor. No per-element CSS transitions, so no style recalculation per frame.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(commit);
    } else {
      commit();
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'), palette: PALETTES[theme] }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
