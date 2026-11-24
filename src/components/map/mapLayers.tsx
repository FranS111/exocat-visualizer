import L from 'leaflet';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import type { ColorMode } from '../../context/UiContext';
import { CATALONIA_BOUNDS, WATERSHED_PROFILES } from '../../data/watersheds';
import { useI18n } from '../../hooks/useI18n';
import type { ExocatDataset, Occurrence, Species, Watershed } from '../../types';
import { densityColor } from '../../utils/theme';
import { useTheme } from '../../hooks/useTheme';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/* ───────────────────────── Records (point) layer ───────────────────────── */

interface RecordsLayerProps {
  data: ExocatDataset;
  occurrences: Occurrence[];
  colorMode: ColorMode;
  onSelect: (speciesId: string) => void;
}

interface PlacedMarker {
  marker: L.CircleMarker;
  species: Species;
}

/**
 * Thousands of points: drawn imperatively on a shared canvas renderer instead of
 * one React component per marker.
 *
 * Geometry and paint are separate effects: markers are only (re)built when the
 * filtered records change. Theme, colour-mode and language switches restyle or
 * re-label the existing markers in place — no teardown, one canvas redraw.
 */
export function RecordsLayer({ data, occurrences, colorMode, onSelect }: RecordsLayerProps) {
  const map = useMap();
  const { m, tx, basin, lang } = useI18n();
  const { palette } = useTheme();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const placedRef = useRef<PlacedMarker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // Latest paint/label inputs, read by the build effect and lazy tooltips without re-running them.
  const paintRef = useRef({ palette, colorMode });
  paintRef.current = { palette, colorMode };
  const textRef = useRef({ m, tx, basin });
  textRef.current = { m, tx, basin };
  const renderer = useMemo(() => L.canvas({ padding: 0.4, tolerance: 4 }), []);

  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;
    return () => {
      group.remove();
      groupRef.current = null;
      placedRef.current = [];
    };
  }, [map]);

  // Geometry: rebuild only when the set of records changes.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const { palette: p, colorMode: mode } = paintRef.current;
    const placed: PlacedMarker[] = [];
    for (const o of occurrences) {
      const s = data.speciesById.get(o.speciesId);
      if (!s) continue;
      const marker = L.circleMarker([o.lat, o.lng], {
        renderer,
        radius: 4.5,
        color: p.map.markerStroke,
        weight: 1,
        fillColor: mode === 'risk' ? p.risk[s.risk] : p.taxon[s.group],
        fillOpacity: 0.88,
      });
      marker.on('mouseover', () => {
        if (!marker.getTooltip()) {
          const t = textRef.current;
          marker.bindTooltip(
            `<strong class="tt-sci">${escapeHtml(s.scientificName)}</strong>
             <span class="tt-row">${escapeHtml(t.tx(s.commonNames))} · ${escapeHtml(t.m.taxon[s.group])}</span>
             <span class="tt-row">${escapeHtml(t.m.risk[s.risk])} · ${escapeHtml(t.basin(o.watershed))} · ${o.year}</span>`,
            { direction: 'top', offset: [0, -6], className: 'map-tooltip' },
          );
        }
        marker.openTooltip();
        marker.setStyle({ radius: 7, weight: 2 });
      });
      marker.on('mouseout', () => marker.setStyle({ radius: 4.5, weight: 1 }));
      marker.on('click', () => onSelectRef.current(o.speciesId));
      group.addLayer(marker);
      placed.push({ marker, species: s });
    }
    placedRef.current = placed;
  }, [data, occurrences, renderer]);

  // Paint: restyle existing markers (the canvas renderer batches these into a single redraw).
  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    for (const { marker, species: s } of placedRef.current) {
      marker.setStyle({
        color: palette.map.markerStroke,
        fillColor: colorMode === 'risk' ? palette.risk[s.risk] : palette.taxon[s.group],
      });
    }
  }, [palette, colorMode]);

  // Language: drop bound tooltips; they're rebuilt lazily in the new language on next hover.
  useEffect(() => {
    for (const { marker } of placedRef.current) if (marker.getTooltip()) marker.unbindTooltip();
  }, [lang]);

  return null;
}

/* ───────────────────────── 10 km density grid (GeoJSON) ───────────────────────── */

/** ~10 km cells at Catalan latitudes. */
const CELL_LAT = 0.09;
const CELL_LNG = 0.12;

interface CellProps {
  records: number;
  species: number;
}

function buildGrid(occurrences: Occurrence[]): FeatureCollection<Polygon, CellProps> {
  const cells = new Map<string, { i: number; j: number; records: number; species: Set<string> }>();
  for (const o of occurrences) {
    const i = Math.floor(o.lat / CELL_LAT);
    const j = Math.floor(o.lng / CELL_LNG);
    const key = `${i}:${j}`;
    let c = cells.get(key);
    if (!c) {
      c = { i, j, records: 0, species: new Set() };
      cells.set(key, c);
    }
    c.records++;
    c.species.add(o.speciesId);
  }
  const features: Feature<Polygon, CellProps>[] = [];
  for (const c of cells.values()) {
    const lat0 = c.i * CELL_LAT;
    const lng0 = c.j * CELL_LNG;
    features.push({
      type: 'Feature',
      properties: { records: c.records, species: c.species.size },
      geometry: {
        type: 'Polygon',
        coordinates: [[[lng0, lat0], [lng0 + CELL_LNG, lat0], [lng0 + CELL_LNG, lat0 + CELL_LAT], [lng0, lat0 + CELL_LAT], [lng0, lat0]]],
      },
    });
  }
  return { type: 'FeatureCollection', features };
}

export function DensityGridLayer({ occurrences }: { occurrences: Occurrence[] }) {
  const { m, lang } = useI18n();
  const { palette } = useTheme();
  const layerRef = useRef<L.GeoJSON | null>(null);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const versionRef = useRef(0);
  const grid = useMemo(() => {
    versionRef.current += 1;
    return buildGrid(occurrences);
  }, [occurrences]);

  const cellStyle = (f?: Feature): L.PathOptions => ({
    color: paletteRef.current.ink.surface,
    weight: 1,
    fillColor: densityColor((f?.properties as CellProps).records, paletteRef.current.density),
    fillOpacity: 0.78,
  });

  // Theme switch: restyle the existing cells instead of remounting the layer.
  useEffect(() => {
    layerRef.current?.setStyle(cellStyle as L.StyleFunction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette]);

  return (
    <GeoJSON
      ref={layerRef}
      // GeoJSON data and bound tooltips are immutable in react-leaflet; new data or language remounts it.
      key={`${versionRef.current}-${lang}`}
      data={grid}
      style={cellStyle}
      onEachFeature={(f, layer) => {
        const p = f.properties as CellProps;
        layer.bindTooltip(
          `<strong>${escapeHtml(m.map.cellRecords(p.records))}</strong><span class="tt-row">${escapeHtml(m.map.cellSpecies(p.species))}</span>`,
          { className: 'map-tooltip', sticky: true },
        );
        layer.on('mouseover', () => (layer as L.Path).setStyle({ weight: 2, color: paletteRef.current.map.cellHover }));
        layer.on('mouseout', () => (layer as L.Path).setStyle({ weight: 1, color: paletteRef.current.ink.surface }));
      }}
    />
  );
}

/* ───────────────────────── Watershed hubs ───────────────────────── */

interface HubsProps {
  occurrences: Occurrence[];
  selected: Watershed | null;
  onToggle: (w: Watershed) => void;
}

export function WatershedHubsLayer({ occurrences, selected, onToggle }: HubsProps) {
  const { m, basin } = useI18n();
  const { palette } = useTheme();
  const stats = useMemo(() => {
    const acc = new Map<Watershed, { records: number; species: Set<string> }>();
    for (const o of occurrences) {
      let e = acc.get(o.watershed);
      if (!e) {
        e = { records: 0, species: new Set() };
        acc.set(o.watershed, e);
      }
      e.records++;
      e.species.add(o.speciesId);
    }
    return acc;
  }, [occurrences]);

  return (
    <>
      {WATERSHED_PROFILES.map((w) => {
        const s = stats.get(w.name);
        if (!s) return null;
        const isSelected = selected === w.name;
        return (
          <CircleMarker
            key={w.name}
            center={w.centroid}
            radius={Math.min(34, 9 + Math.sqrt(s.records) * 1.1)}
            pathOptions={{
              color: isSelected ? palette.map.hubSelected : palette.ink.surface,
              weight: isSelected ? 3 : 2,
              fillColor: palette.map.hubFill,
              fillOpacity: isSelected ? 0.75 : 0.5,
            }}
            eventHandlers={{ click: () => onToggle(w.name) }}
          >
            <Tooltip direction="top" className="map-tooltip">
              <strong>{basin(w.name)}</strong>
              <span className="tt-row">{m.map.hubStats(s.records, s.species.size)}</span>
              <span className="tt-row tt-hint">{isSelected ? m.map.hubClear : m.map.hubFilter}</span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}

/* ───────────────────────── View controller ───────────────────────── */

interface ViewProps {
  watershed: Watershed | null;
  focusSpeciesId: string | null;
  occurrences: Occurrence[];
}

/** Moves the camera in response to filter changes and keeps Leaflet sized to its container. */
export function MapViewController({ watershed, focusSpeciesId, occurrences }: ViewProps) {
  const map = useMap();
  const occRef = useRef(occurrences);
  occRef.current = occurrences;

  useEffect(() => {
    const animate = !prefersReducedMotion();
    let bounds: L.LatLngBounds | null = null;
    if (focusSpeciesId && occRef.current.length) {
      bounds = L.latLngBounds(occRef.current.map((o) => [o.lat, o.lng] as [number, number]));
    } else if (watershed) {
      const profile = WATERSHED_PROFILES.find((w) => w.name === watershed);
      if (profile) bounds = L.latLngBounds(profile.anchors).pad(0.6);
    }
    const target = bounds ?? L.latLngBounds(CATALONIA_BOUNDS);
    map.flyToBounds(target, { padding: [24, 24], maxZoom: 10, animate, duration: 0.8 });
  }, [map, watershed, focusSpeciesId]);

  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  // Don't hijack page scrolling: wheel-zoom activates once the user engages with the map.
  useEffect(() => {
    map.scrollWheelZoom.disable();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    map.on('click focus mousedown', enable);
    map.on('mouseout blur', disable);
    return () => {
      map.off('click focus mousedown', enable);
      map.off('mouseout blur', disable);
    };
  }, [map]);

  // Wheel-zoom while the mouse button is held (mid-pan). Leaflet's own wheel handler
  // fights the active drag, so we zoom around the cursor ourselves and re-anchor the
  // drag at the new view, letting the pan continue seamlessly.
  useEffect(() => {
    const container = map.getContainer();
    type DraggableInternals = { _startPoint?: L.Point; _startPos?: L.Point; _newPos?: L.Point };
    type DragInternals = { _draggable?: DraggableInternals; _positions?: unknown[]; _times?: unknown[] };
    let pressed = false;
    let lastStep = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button === 0) pressed = true;
    };
    const onUp = () => {
      pressed = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (!pressed || (e.buttons & 1) === 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.deltaY === 0 || e.timeStamp - lastStep < 90) return;
      lastStep = e.timeStamp;

      const zoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), map.getZoom() + (e.deltaY < 0 ? 1 : -1)));
      if (zoom === map.getZoom()) return;
      map.setZoomAround(map.mouseEventToContainerPoint(e), zoom, { animate: false });

      const drag = map.dragging as unknown as DragInternals;
      const draggable = drag._draggable;
      if (draggable) {
        const pos = L.DomUtil.getPosition(map.getPane('mapPane')!);
        draggable._startPoint = L.point(e.clientX, e.clientY);
        draggable._startPos = pos;
        draggable._newPos = pos;
      }
      // Drop pre-zoom samples so releasing doesn't fling with stale inertia.
      drag._positions = [];
      drag._times = [];
    };

    container.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    window.addEventListener('blur', onUp);
    container.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => {
      container.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onUp);
      container.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [map]);

  return null;
}
