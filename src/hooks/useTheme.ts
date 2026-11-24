import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';

/** Current theme (light/dark), setters and the matching data palette for charts and the map. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
