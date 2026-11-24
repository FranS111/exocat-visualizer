# EXOCAT Interactive Visualizer — MVP

© 2026 FranS111 — All rights reserved. See [LICENSE](LICENSE).

Interactive dashboard for exploring invasive alien **animal** records across Catalonia's watersheds,
available in Catalan, Spanish and English.
React 18 + TypeScript, plain CSS custom properties, Leaflet / react-leaflet, Recharts, lucide-react.

> **Data notice:** the 31 taxa are real invasive alien animals present in Catalonia, but the occurrence
> records, scores and some dates are **synthetic** (seeded and deterministic) for demo purposes.
> This is an independent project, not an official CREAF product.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle in dist/
```

## Architecture

```
src/
  types.ts                    Domain model (Species, Occurrence, FilterState, Lang…)
  theme/ThemeContext.tsx      Day/night detection, persistence, palette for charts & map
  i18n/
    I18nContext.tsx           Language detection, persistence, <html lang>/title sync, formatters
    locales/en.ts             Source dictionary — its shape is the type every locale must match
    locales/ca.ts, es.ts      Catalan and Spanish dictionaries (compile error if a key is missing)
  data/
    species.ts                Species catalogue + generation profile (abundance, basin affinity)
    watersheds.ts             14 basins with river-course anchor points
    generateDataset.ts        Seeded record generator + async loadExocatDataset() boundary
  context/
    ExocatDataContext.tsx     Load status + dataset
    FilterContext.tsx         useReducer filter state + memoised derived data (computed once)
    UiContext.tsx             Selected species, drawer, map layers, colour mode
  hooks/
    useExocatData.ts          Dataset access
    useSpeciesFilter.ts       Filter state + typed action creators + derived slices
  components/
    layout/                   Header (debounced search, "/" shortcut), Footer
    filters/                  FilterPanel (sidebar / mobile drawer), YearRangeSlider, ActiveFilters
    dashboard/KpiStrip.tsx
    map/                      SpeciesMap + canvas records layer, 10 km GeoJSON grid, basin hubs
    charts/                   WatershedChart, TaxonDonut, RiskTimeline (each with a table view)
    species/                  SpeciesTable (sortable), SpeciesModal (native <dialog>)
  styles/                     tokens.css · base.css · layout.css · components.css
```

### Cross-filtering

Every view reads from `FilterContext`. Charts use a "sibling-preserving" slice: the watershed chart
ignores the watershed facet, the donut ignores the taxon facet and the timeline ignores the year
range. Selecting a bar or slice therefore highlights it instead of collapsing the chart.

| Interaction | Effect |
| --- | --- |
| Click a watershed bar / basin hub / modal basin row | Toggle the watershed filter; map flies to the basin |
| Click a donut slice or legend item | Toggle a taxonomic group |
| Drag the timeline brush / year sliders | Set the record period |
| Click a map point or table row | Open the species profile |
| "Isolate on map" in the profile | Focus the dashboard on one species |

### Languages

Catalan, Spanish and English. On first visit the app picks the first supported language in the
browser/OS preference list (`navigator.languages`, e.g. `ca-ES` → Catalan), falling back to English.
Choosing a language in the header switch saves it to `localStorage` (`exocat.lang`), and it then
takes precedence over the browser setting. Species descriptions and management notes are stored per
language in `data/species.ts`; origins and pathways are keys translated in the dictionaries. Basin
names use the official Catalan toponyms, with Spanish/English exonyms where one exists (Ebre → Ebro,
Garona → Garonne). To add a language, add its code to `LANGS` in `types.ts` and create a dictionary —
TypeScript lists every missing string.

### Day / night mode

On first visit the app follows the OS/browser `prefers-color-scheme` setting (and keeps following it
live). The sun/moon button saves an explicit choice to `localStorage` (`exocat.theme`), which then wins.
An inline script in `index.html` applies the theme before first paint, so there is no light flash.

- **CSS:** brand hues (`--bio-olive`, `--bio-forest`, `--bio-sand`…) never change. Night mode
  (`:root[data-theme='dark']` in `styles/tokens.css`) redefines surfaces, text and semantic roles
  (`--text-strong`, `--accent`, `--solid-bg`…): deep forest surfaces, cream text, lifted olive accents
  and sand for primary actions. Every text pair is ≥ 4.5:1.
- **Charts & map:** `utils/theme.ts` holds one data palette per theme, read through `useTheme()`.
  Dark taxon/risk colours are the same hues re-stepped and validated against the dark surface
  (`#1a2112`); the density ramp flips to dark → light; the OSM basemap is inverted and toned via
  `--basemap-filter`.

### Swapping in real data

Replace the body of `loadExocatDataset()` in `src/data/generateDataset.ts` with a `fetch` that maps
the API response to `ExocatDataset`. No component needs to change.

### Accessibility

Skip link, labelled landmarks, `aria-pressed` toggles, `aria-sort` table headers, keyboard-operable
rows, native `<dialog>` (focus trap, Esc, focus return), table views for every chart, colour never
used alone (risk badges carry icon + label), `prefers-reduced-motion` honoured. Taxon palette was
validated for colour-vision-deficiency separation and ≥3:1 contrast.

### Basemap

Uses OpenStreetMap standard tiles, which suit development and demos. For production traffic, switch
to a tile provider with an SLA (see the OSM tile usage policy).

## Explore view

The header button **Explore / Data** switches between the analytical dashboard (default) and a visual field guide for a general audience, built from the same dataset: a full-bleed hero, the five taxonomic groups, a species spotlight with photo, story and origin map, an interactive atlas of native ranges, a scrollable timeline of first records and practical advice. The choice is remembered (`localStorage` key `exocat.view`). From any species in the guide, *See its data* opens its profile in the dashboard. Components live in `src/components/explore/`, styles in `src/styles/explore.css`.

## Image credits

Species photos are hot-linked thumbnails from [Wikimedia Commons](https://commons.wikimedia.org), each shown in the species profile with its author, licence and a link to its file page. Only public-domain, CC0, CC BY and CC BY-SA files are used; photos are not modified. Regenerate the manifest with `node scripts/fetch-species-images.mjs`.

| Species | Author | Licence | Source |
|---|---|---|---|
| *Silurus glanis* | Dieter Florian | [CC BY-SA 3.0 de](https://creativecommons.org/licenses/by-sa/3.0/de/deed.en) | [Commons](https://commons.wikimedia.org/wiki/File:Silurus_glanis_02.jpg) |
| *Gambusia holbrooki* | JeffreyGammon | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:EasternMosquitoFishJG_Female.jpg) |
| *Lepomis gibbosus* | Lorenz Seebauer | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Lepomis_adult.jpg) |
| *Micropterus salmoides* | USFWS Mountain Prairie | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Largemouth_Bass_(Micropterus_salmoides)_June_2023_(cropped).jpg) |
| *Alburnus alburnus* | Piet Spaans | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) | [Commons](https://commons.wikimedia.org/wiki/File:AlburnusAlburnus1.JPG) |
| *Sander lucioperca* | eLNuko | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Sander_lucioperca_1.jpg) |
| *Ameiurus melas* | George Chernilevsky | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Ameiurus_melas_2021_G1.jpg) |
| *Esox lucius* | Jik jik | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:Esox_lucius_ZOO_1.jpg) |
| *Pseudorasbora parva* | Seotaro (edited by Estrilda) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:Pseudorasbora_parva(edited_version).jpg) |
| *Pomacea maculata* | Amy Benson, U.S. Geological Survey | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Pomacea_insularum_shell_3.jpg) |
| *Pacifastacus leniusculus* | Astacoides | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:Signal_crayfish_female_Pacifastacus_leniusculus.JPG) |
| *Linepithema humile* | Penarc | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Linepithema_Argentine_ant.jpg) |
| *Paysandisia archon* | Didier Descouens | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Paysandisia_archon_MHNT_Dos_Vif_Fronton.jpg) |
| *Vespa velutina* | Charles J. Sharp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Asian_hornet_(Vespa_velutina).jpg) |
| *Procambarus clarkii* | MikeMurphy | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Procambarus_clarkii.jpg) |
| *Dreissena polymorpha* | Smithsonian Environmental Research Center | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | [Commons](https://commons.wikimedia.org/wiki/File:Dreissena_polymorpha_(I1957)_0265_(39449820624).jpg) |
| *Corbicula fluminea* | USGS | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Corbicula_fluminea.jpg) |
| *Aedes albopictus* | James Gathany, CDC | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:CDC-Gathany-Aedes-albopictus-1.jpg) |
| *Harmonia axyridis* | Scott Bauer, USDA ARS | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Asian_multicolored_lady_beetle.jpg) |
| *Cydalima perspectalis* | Didier Descouens | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:Cydalima_perspectalis_MHNT_Imago.jpg) |
| *Rhynchophorus ferrugineus* | Didier Descouens | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Rhynchophorus_ferrugineus_MHNT.jpg) |
| *Callinectes sapidus* | Wendy Kaveney | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:The_Childrens_Museum_of_Indianapolis_-_Atlantic_blue_crab.jpg) |
| *Myiopsitta monachus* | Charles J. Sharp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Monk_parakeet_(Myiopsitta_monachus)_Santiago.jpg) |
| *Psittacula krameri* | danielskatz | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:African_Rose-ringed_Parakeet,_Tendaba,_Gambia_1.jpg) |
| *Estrilda astrild* | Charles J. Sharp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Common_waxbill_(Estrilda_astrild_jagoensis).jpg) |
| *Alopochen aegyptiaca* | Charles J. Sharp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Egyptian_goose_(Alopochen_aegyptiaca)_London.jpg) |
| *Trachemys scripta* | Happyswissman | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:Red-eared_Slider_Thailand.JPG) |
| *Discoglossus pictus* | Charles J. Sharp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | [Commons](https://commons.wikimedia.org/wiki/File:Painted_frog_(Discoglossus_pictus)_Malta.jpg) |
| *Neogale vison* | Needsmoreritalin | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:MinkforWiki.jpg) |
| *Myocastor coypus* | Petar Milošević | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | [Commons](https://commons.wikimedia.org/wiki/File:Myocastor_coypus_02.jpg) |
| *Ammotragus lervia* | Rei (English Wikipedia) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [Commons](https://commons.wikimedia.org/wiki/File:BarbarySheep4.jpg) |

## Map data credits

The native-range mini-map in each species profile uses country outlines from [Natural Earth](https://www.naturalearthdata.com) (public domain), packaged as TopoJSON by [world-atlas](https://github.com/topojson/world-atlas) (ISC), and drawn with [d3-geo](https://github.com/d3/d3-geo) (ISC). The geometry is loaded lazily the first time a profile opens. Regions are coarse country groups defined in `src/data/originRegions.ts`.

## License

Proprietary. © 2026 FranS111 — all rights reserved; no use, copying, modification or distribution without written permission. See [LICENSE](LICENSE). Third-party photos, map data, fonts and libraries keep their own licences (listed above and in LICENSE).
