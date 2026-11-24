import { ChevronLeft, ChevronRight, Crosshair, Info, MapPin, ShieldAlert, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, type TooltipProps } from 'recharts';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useUi } from '../../hooks/useUi';
import { LANGS, type Watershed } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { GroupIcon, GroupTag, LegalBadges, RiskBadge } from '../common/Badges';
import { SpeciesPhoto } from './SpeciesPhoto';
import { OriginMap } from './OriginMap';

const BASINS_COLLAPSED = 7;

function SparkTooltip({ active, payload }: TooltipProps<number, string>) {
  const { m } = useI18n();
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { year: number; records: number };
  return (
    <div className="chart-tooltip chart-tooltip--mini">
      <strong>{p.year}</strong> · {m.modal.yearRecords(p.records)}
    </div>
  );
}

export function SpeciesModal() {
  const data = useDataset();
  const { m, lang, fmt, tx, basin } = useI18n();
  const { palette } = useTheme();
  const { selectedSpeciesId, openSpecies, closeSpecies } = useUi();
  const { filters, actions, speciesSummaries } = useSpeciesFilter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [showAllBasins, setShowAllBasins] = useState(false);

  useEffect(() => setShowAllBasins(false), [selectedSpeciesId]);

  const species = selectedSpeciesId ? data.speciesById.get(selectedSpeciesId) ?? null : null;

  // Native <dialog> gives us focus trapping, Esc handling and an inert background.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (species && !dlg.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dlg.showModal();
      closeButtonRef.current?.focus();
      document.body.classList.add('has-modal');
    } else if (!species && dlg.open) {
      dlg.close();
    }
  }, [species]);

  const onClose = () => {
    document.body.classList.remove('has-modal');
    closeSpecies();
    returnFocusRef.current?.focus?.();
  };

  const profile = useMemo(() => {
    if (!species) return null;
    const records = data.occurrences.filter((o) => o.speciesId === species.id);
    const [y0, y1] = data.yearBounds;
    const byYear = new Map<number, number>();
    for (let y = y0; y <= y1; y++) byYear.set(y, 0);
    const byBasin = new Map<Watershed, number>();
    for (const r of records) {
      byYear.set(r.year, (byYear.get(r.year) ?? 0) + 1);
      byBasin.set(r.watershed, (byBasin.get(r.watershed) ?? 0) + 1);
    }
    const basins = [...byBasin.entries()].sort((a, b) => b[1] - a[1]);
    const recent = records.filter((r) => r.year >= y1 - 4).length;
    const prior = records.filter((r) => r.year >= y1 - 9 && r.year < y1 - 4).length;
    return {
      total: records.length,
      spark: [...byYear.entries()].map(([year, n]) => ({ year, records: n })),
      basins,
      maxBasin: basins[0]?.[1] ?? 1,
      lastYear: records.reduce((mx, r) => Math.max(mx, r.year), 0),
      trend: prior ? Math.round(((recent - prior) / prior) * 100) : null,
    };
  }, [data, species]);

  // Step through species in the current view (ordered by record count).
  const ordered = useMemo(() => [...speciesSummaries].sort((a, b) => b.records - a.records).map((s) => s.species.id), [speciesSummaries]);
  const idx = species ? ordered.indexOf(species.id) : -1;
  const prevId = idx > 0 ? ordered[idx - 1] : null;
  const nextId = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const isolated = species ? filters.focusSpeciesId === species.id : false;
  const accent = species ? palette.taxon[species.group] : palette.ink.primary;
  // Current language's common name first, then the other two.
  const nameOrder = [lang, ...LANGS.filter((l) => l !== lang)];

  return (
    <dialog
      ref={dialogRef}
      className="species-modal"
      aria-labelledby="species-modal-title"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' && prevId) openSpecies(prevId);
        if (e.key === 'ArrowRight' && nextId) openSpecies(nextId);
      }}
    >
      {species && profile && (
        <article className="species-modal__panel" style={{ ['--accent' as string]: accent }}>
          <header className="species-modal__header">
            <span className="species-modal__icon" aria-hidden="true">
              <GroupIcon group={species.group} size={22} color={palette.onFill} />
            </span>
            <div className="species-modal__titles">
              <p className="eyebrow">
                {species.family} · {m.taxon[species.group]}
              </p>
              <h2 id="species-modal-title" className="sci-name sci-name--lg">
                {species.scientificName}
              </h2>
              <p className="species-modal__common">
                {nameOrder.map((l, i) => (
                  <span key={l} lang={l} className={i === 0 ? 'is-primary' : undefined}>
                    {i > 0 && <span aria-hidden="true">· </span>}
                    {species.commonNames[l]}
                  </span>
                ))}
              </p>
            </div>
            <div className="species-modal__nav">
              <button type="button" className="icon-button" disabled={!prevId} onClick={() => prevId && openSpecies(prevId)} aria-label={m.modal.prev}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="icon-button" disabled={!nextId} onClick={() => nextId && openSpecies(nextId)} aria-label={m.modal.next}>
                <ChevronRight size={18} />
              </button>
              <button type="button" className="icon-button" onClick={() => dialogRef.current?.close()} aria-label={m.modal.close} ref={closeButtonRef}>
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="species-modal__tags">
            <RiskBadge risk={species.risk} />
            <GroupTag group={species.group} />
            {species.habitats.map((h) => (
              <span key={h} className="tag">
                {m.habitat[h]}
              </span>
            ))}
            <LegalBadges legal={species.legal} />
          </div>

          <dl className="stat-grid">
            <div>
              <dt>{m.modal.firstRecord}</dt>
              <dd>{species.firstRecord}</dd>
            </div>
            <div>
              <dt>{m.modal.records}</dt>
              <dd>{fmt(profile.total)}</dd>
            </div>
            <div>
              <dt>{m.modal.watersheds}</dt>
              <dd>{profile.basins.length}</dd>
            </div>
            <div>
              <dt>{m.modal.trend}</dt>
              <dd>{profile.trend === null ? '—' : `${profile.trend > 0 ? '+' : ''}${profile.trend}%`}</dd>
            </div>
          </dl>

          <div className="risk-meter" aria-label={m.modal.scoreLabel(species.riskScore)}>
            <div className="risk-meter__label">
              <span>
                <ShieldAlert size={14} aria-hidden="true" /> {m.modal.score}
              </span>
              <strong>{species.riskScore}/100</strong>
            </div>
            <div className="risk-meter__track">
              <span className="risk-meter__fill" style={{ width: `${species.riskScore}%`, background: palette.risk[species.risk] }} />
            </div>
          </div>

          <div className="species-modal__grid">
            <section>
              <SpeciesPhoto key={species.id} speciesId={species.id} scientificName={species.scientificName} commonName={species.commonNames[lang]} />
              <h3>{m.modal.profile}</h3>
              <p>{tx(species.description)}</p>
              <h3>{m.modal.origin}</h3>
              <OriginMap origin={species.origin} />
            </section>

            <section>
              <h3>{m.modal.perYear}</h3>
              <div className="sparkline">
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={profile.spark} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: palette.ink.muted }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={30} />
                    <Tooltip content={<SparkTooltip />} cursor={{ stroke: palette.ink.secondary, strokeDasharray: '3 3' }} />
                    <Area type="monotone" dataKey="records" stroke={accent} strokeWidth={2} fill={accent} fillOpacity={0.18} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <h3>
                <MapPin size={14} aria-hidden="true" /> {m.modal.distribution}
              </h3>
              <ul className="basin-bars">
                {(showAllBasins ? profile.basins : profile.basins.slice(0, BASINS_COLLAPSED)).map(([name, n]) => (
                  <li key={name}>
                    <button
                      type="button"
                      className={`basin-bars__row ${filters.watershed === name ? 'is-active' : ''}`}
                      onClick={() => actions.toggleWatershed(name)}
                      aria-pressed={filters.watershed === name}
                      title={m.modal.filterBy(basin(name))}
                    >
                      <span className="basin-bars__name">{basin(name)}</span>
                      <span className="basin-bars__track" aria-hidden="true">
                        <span style={{ width: `${(n / profile.maxBasin) * 100}%` }} />
                      </span>
                      <span className="basin-bars__value tabular">{fmt(n)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {profile.basins.length > BASINS_COLLAPSED && (
                <button type="button" className="button button--text basin-bars__more" onClick={() => setShowAllBasins((v) => !v)} aria-expanded={showAllBasins}>
                  {showAllBasins ? m.modal.showFewer : m.modal.showAll(profile.basins.length)}
                </button>
              )}

              <h3>{m.modal.pathway}</h3>
              <p>{m.pathway[species.pathway]}</p>
              <h3>{m.modal.management}</h3>
              <p>{tx(species.management)}</p>
            </section>
          </div>

          <footer className="species-modal__footer">
            <p className="footnote">
              <Info size={13} aria-hidden="true" /> {m.modal.footnote(profile.lastYear)}
            </p>
            <button
              type="button"
              className={`button ${isolated ? 'button--ghost' : 'button--primary'}`}
              onClick={() => {
                actions.setFocusSpecies(isolated ? null : species.id);
                dialogRef.current?.close();
              }}
            >
              <Crosshair size={16} aria-hidden="true" />
              {isolated ? m.modal.showAllSpecies : m.modal.isolate}
            </button>
          </footer>
        </article>
      )}
    </dialog>
  );
}
