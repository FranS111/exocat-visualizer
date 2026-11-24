import type { RiskLevel, TaxonGroup } from '../types';

export type Theme = 'light' | 'dark';

/**
 * Data encodings for SVG/canvas consumers (Recharts, Leaflet), one per theme.
 * CSS-styled UI reads the matching custom properties in tokens.css instead.
 * Labels live in the i18n dictionaries, not here.
 *
 * Each categorical/ordinal set was validated against its own chart surface
 * (#ffffff light, #1a2112 dark): lightness band, chroma floor, colour-vision-
 * deficiency separation, normal-vision separation and ≥3:1 contrast.
 * Dark steps are the same hues lifted/deepened into the dark-mode band —
 * colour still follows the entity across themes.
 */
export interface Palette {
  taxon: Record<TaxonGroup, string>;
  risk: Record<RiskLevel, string>;
  /** Sequential single-hue ramp, low → high (always reads "more = more contrast"). */
  density: string[];
  ink: {
    primary: string;
    secondary: string;
    muted: string;
    grid: string;
    surface: string;
    subtle: string;
    accent: string;
    cursor: string;
  };
  /** Icon colour drawn on top of a taxon/risk fill. */
  onFill: string;
  map: {
    markerStroke: string;
    cellHover: string;
    hubFill: string;
    hubSelected: string;
  };
}

export const PALETTES: Record<Theme, Palette> = {
  light: {
    taxon: { Fish: '#1f72a8', Invertebrates: '#c4581d', Birds: '#8b3f86', Herptiles: '#b98a14', Mammals: '#4a7a2a' },
    // Medium (sand) is under 3:1 on white, so it always ships with a text label.
    risk: { high: '#a3401b', medium: '#d9a04a', low: '#5f7d1c' },
    density: ['#eef0d9', '#d3dba6', '#aebd6b', '#83993a', '#5c7420', '#3b4f12'],
    ink: {
      primary: '#283618',
      secondary: '#556042',
      muted: '#7b8466',
      grid: '#ebe8da',
      surface: '#ffffff',
      subtle: '#f9f8f3',
      accent: '#606c38',
      cursor: 'rgba(96, 108, 56, 0.08)',
    },
    onFill: '#ffffff',
    map: { markerStroke: '#ffffff', cellHover: '#283618', hubFill: '#283618', hubSelected: '#a3401b' },
  },
  dark: {
    taxon: { Fish: '#3f8fc4', Invertebrates: '#cf6a30', Birds: '#b56aa8', Herptiles: '#ad8618', Mammals: '#2aa08a' },
    risk: { high: '#cc4838', medium: '#bd8a2a', low: '#4c7c2a' },
    // On a dark surface "more" must mean brighter, so the olive ramp runs dark → light.
    density: ['#2a3318', '#3d4a1f', '#566a26', '#71892f', '#93a843', '#b8c96a'],
    ink: {
      primary: '#fefae0',
      secondary: '#d2cfb2',
      muted: '#a5a88a',
      grid: '#2c3520',
      surface: '#1a2112',
      subtle: '#222a18',
      accent: '#9aab55',
      cursor: 'rgba(154, 171, 85, 0.12)',
    },
    onFill: '#11140c',
    map: { markerStroke: '#11140c', cellHover: '#fefae0', hubFill: '#dda15e', hubSelected: '#fefae0' },
  },
};

/** Lower bound (records per cell) of each density step. */
export const DENSITY_BREAKS = [1, 3, 6, 11, 21, 41];

export function densityColor(count: number, ramp: string[]): string {
  let idx = 0;
  for (let i = 0; i < DENSITY_BREAKS.length; i++) if (count >= DENSITY_BREAKS[i]) idx = i;
  return ramp[idx];
}
