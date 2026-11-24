import { CircleDot, Droplets, Grid3x3, Layers, MapPin } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { CATALONIA_BOUNDS } from '../../data/watersheds';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useUi } from '../../hooks/useUi';
import { RISK_LEVELS, TAXON_GROUPS, type MapLayerId } from '../../types';
import { DENSITY_BREAKS } from '../../utils/theme';
import { useTheme } from '../../hooks/useTheme';
import { DensityGridLayer, MapViewController, RecordsLayer, WatershedHubsLayer } from './mapLayers';

const LAYER_OPTIONS: { id: MapLayerId; icon: typeof MapPin }[] = [
  { id: 'records', icon: CircleDot },
  { id: 'grid', icon: Grid3x3 },
  { id: 'hubs', icon: Droplets },
];

export function SpeciesMap() {
  const data = useDataset();
  const { m, basin } = useI18n();
  const { palette } = useTheme();
  const { filters, actions, occurrences } = useSpeciesFilter();
  const { layers, toggleLayer, colorMode, setColorMode, openSpecies } = useUi();

  return (
    <section id="section-map" className="card map-card" aria-labelledby="map-title">
      <header className="card__header">
        <div>
          <h2 id="map-title" className="card__title">
            <span className="card__index" aria-hidden="true">(A)</span> {m.map.title}
          </h2>
          <p className="card__subtitle">
            {filters.watershed ? m.map.subtitleBasin(occurrences.length, basin(filters.watershed)) : m.map.subtitleAll(occurrences.length)}
          </p>
        </div>
        <div className="map-toolbar">
          <div className="toolbar-group" role="group" aria-label={m.map.layers}>
            <Layers size={14} aria-hidden="true" className="toolbar-group__icon" />
            {LAYER_OPTIONS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`toggle ${layers[id] ? 'is-active' : ''}`}
                aria-pressed={layers[id]}
                onClick={() => toggleLayer(id)}
              >
                <Icon size={14} aria-hidden="true" />
                {m.map.layer[id]}
              </button>
            ))}
          </div>
          <div className="toolbar-group" role="radiogroup" aria-label={m.map.colorBy}>
            {(['risk', 'group'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={colorMode === mode}
                className={`toggle ${colorMode === mode ? 'is-active' : ''}`}
                onClick={() => setColorMode(mode)}
              >
                {mode === 'risk' ? m.map.byRisk : m.map.byTaxon}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="map-frame" role="region" aria-label={m.map.region}>
        <MapContainer
          bounds={CATALONIA_BOUNDS}
          minZoom={7}
          maxZoom={13}
          maxBounds={[
            [39.8, -0.8],
            [43.6, 4.3],
          ]}
          scrollWheelZoom
          preferCanvas
          className="leaflet-root"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="basemap-tiles"
          />
          {layers.grid && <DensityGridLayer occurrences={occurrences} />}
          {layers.records && <RecordsLayer data={data} occurrences={occurrences} colorMode={colorMode} onSelect={openSpecies} />}
          {layers.hubs && <WatershedHubsLayer occurrences={occurrences} selected={filters.watershed} onToggle={actions.toggleWatershed} />}
          <MapViewController watershed={filters.watershed} focusSpeciesId={filters.focusSpeciesId} occurrences={occurrences} />
        </MapContainer>

        <div className="map-legend" aria-label={m.map.legend}>
          {layers.records && (
            <div className="map-legend__section">
              <p className="map-legend__title">{colorMode === 'risk' ? m.map.legendRisk : m.map.legendTaxon}</p>
              <ul>
                {colorMode === 'risk'
                  ? RISK_LEVELS.map((r) => (
                      <li key={r}>
                        <span className="legend-dot" style={{ background: palette.risk[r] }} />
                        {m.risk[r]}
                      </li>
                    ))
                  : TAXON_GROUPS.map((g) => (
                      <li key={g}>
                        <span className="legend-dot" style={{ background: palette.taxon[g] }} />
                        {m.taxon[g]}
                      </li>
                    ))}
              </ul>
            </div>
          )}
          {layers.grid && (
            <div className="map-legend__section">
              <p className="map-legend__title">{m.map.legendGrid}</p>
              <div className="density-scale">
                {palette.density.map((c, i) => (
                  <span key={c} style={{ background: c }} title={`${DENSITY_BREAKS[i]}+`} />
                ))}
              </div>
              <div className="density-scale__labels">
                <span>1</span>
                <span>{DENSITY_BREAKS[DENSITY_BREAKS.length - 1]}+</span>
              </div>
            </div>
          )}
          {layers.hubs && (
            <div className="map-legend__section">
              <p className="map-legend__title">{m.map.hubsTitle}</p>
              <p className="map-legend__note">{m.map.hubsNote}</p>
            </div>
          )}
        </div>

        {occurrences.length === 0 && (
          <div className="map-empty" role="status">
            <p>{m.map.empty}</p>
            <button type="button" className="button button--primary" onClick={actions.reset}>
              {m.map.resetFilters}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
