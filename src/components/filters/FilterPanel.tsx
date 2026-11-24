import { Droplets, Filter, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { WATERSHED_PROFILES, WATERSHED_SYSTEMS } from '../../data/watersheds';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useUi } from '../../hooks/useUi';
import { HABITATS, RISK_LEVELS, TAXON_GROUPS, type Watershed } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { GroupIcon } from '../common/Badges';
import { YearRangeSlider } from './YearRangeSlider';

export function FilterPanel() {
  const data = useDataset();
  const { m, basin, locale } = useI18n();
  const { palette } = useTheme();
  const { filters, actions, activeFilterCount } = useSpeciesFilter();
  const { filtersOpen, setFiltersOpen } = useUi();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Species counts per facet value over the full catalogue — gives scale context next to each chip.
  const counts = useMemo(() => {
    const byGroup = new Map<string, number>();
    const byRisk = new Map<string, number>();
    const byHabitat = new Map<string, number>();
    for (const s of data.species) {
      byGroup.set(s.group, (byGroup.get(s.group) ?? 0) + 1);
      byRisk.set(s.risk, (byRisk.get(s.risk) ?? 0) + 1);
      s.habitats.forEach((h) => byHabitat.set(h, (byHabitat.get(h) ?? 0) + 1));
    }
    return { byGroup, byRisk, byHabitat };
  }, [data]);

  useEffect(() => {
    if (!filtersOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFiltersOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtersOpen, setFiltersOpen]);

  return (
    <>
      <div className={`drawer-scrim ${filtersOpen ? 'is-open' : ''}`} onClick={() => setFiltersOpen(false)} aria-hidden="true" />
      <aside id="filter-panel" className={`filter-panel ${filtersOpen ? 'is-open' : ''}`} aria-label={m.filters.title}>
        <div className="filter-panel__header">
          <h2>
            <Filter size={16} aria-hidden="true" /> {m.filters.title}
          </h2>
          <div className="filter-panel__header-actions">
            <button type="button" className="button button--text" onClick={actions.reset} disabled={activeFilterCount === 0}>
              <RotateCcw size={14} aria-hidden="true" /> {m.filters.reset}
            </button>
            <button
              ref={closeRef}
              type="button"
              className="icon-button drawer-close"
              onClick={() => setFiltersOpen(false)}
              aria-label={m.filters.close}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="filter-panel__body">
          <fieldset className="filter-group">
            <legend>{m.filters.group}</legend>
            <div className="chip-list">
              {TAXON_GROUPS.map((g) => {
                const active = filters.groups.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    className={`chip ${active ? 'is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => actions.toggleGroup(g)}
                    style={{ ['--chip-accent' as string]: palette.taxon[g] }}
                  >
                    <GroupIcon group={g} size={14} />
                    <span>{m.taxon[g]}</span>
                    <span className="chip__count">{counts.byGroup.get(g) ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>{m.filters.risk}</legend>
            <div className="segmented" role="group">
              {RISK_LEVELS.map((r) => {
                const active = filters.risks.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    className={`segmented__item ${active ? 'is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => actions.toggleRisk(r)}
                  >
                    <span className="swatch" style={{ background: palette.risk[r] }} aria-hidden="true" />
                    {m.riskShort[r]}
                    <span className="visually-hidden">, {m.filters.speciesCount(counts.byRisk.get(r) ?? 0)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>{m.filters.habitat}</legend>
            <div className="check-list">
              {HABITATS.map((h) => (
                <label key={h} className="check">
                  <input type="checkbox" checked={filters.habitats.includes(h)} onChange={() => actions.toggleHabitat(h)} />
                  <span className="check__box" aria-hidden="true" />
                  <span className="check__label">{m.habitat[h]}</span>
                  <span className="chip__count">{counts.byHabitat.get(h) ?? 0}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>
              <Droplets size={14} aria-hidden="true" /> {m.filters.watershed}
            </legend>
            <div className="select-wrap">
              <select
                aria-label={m.filters.watershed}
                value={filters.watershed ?? ''}
                onChange={(e) => actions.setWatershed((e.target.value || null) as Watershed | null)}
              >
                <option value="">{m.filters.allWatersheds}</option>
                {WATERSHED_SYSTEMS.map((system) => (
                  <optgroup key={system} label={m.system[system]}>
                    {WATERSHED_PROFILES.filter((w) => w.system === system)
                      .sort((a, b) => basin(a.name).localeCompare(basin(b.name), locale))
                      .map((w) => (
                        <option key={w.name} value={w.name}>
                          {basin(w.name)}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>{m.filters.period}</legend>
            <YearRangeSlider
              min={data.yearBounds[0]}
              max={data.yearBounds[1]}
              value={filters.yearRange}
              onChange={actions.setYearRange}
              startLabel={m.filters.startYear}
              endLabel={m.filters.endYear}
            />
          </fieldset>

          <fieldset className="filter-group">
            <legend>{m.filters.legal}</legend>
            <label className="switch">
              <input type="checkbox" role="switch" checked={filters.euListedOnly} onChange={(e) => actions.setEuListedOnly(e.target.checked)} />
              <span className="switch__track" aria-hidden="true">
                <span className="switch__thumb" />
              </span>
              <span>
                {m.filters.euOnly}
                <small>{m.filters.euOnlyHint}</small>
              </span>
            </label>
          </fieldset>
        </div>

        <p className="filter-panel__footer">{m.filters.footer(data.species.length, data.occurrences.length)}</p>
      </aside>
    </>
  );
}
