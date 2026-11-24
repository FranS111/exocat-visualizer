import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useUi } from '../../hooks/useUi';
import type { SortKey } from '../../types';
import type { SpeciesSummary } from '../../utils/filtering';
import { GroupTag, LegalBadges, RiskBadge } from '../common/Badges';

const COLUMNS: { key: SortKey; numeric?: boolean }[] = [
  { key: 'name' },
  { key: 'riskScore', numeric: true },
  { key: 'firstRecord', numeric: true },
  { key: 'records', numeric: true },
];

const compare: Record<SortKey, (a: SpeciesSummary, b: SpeciesSummary) => number> = {
  name: (a, b) => a.species.scientificName.localeCompare(b.species.scientificName),
  riskScore: (a, b) => a.species.riskScore - b.species.riskScore,
  firstRecord: (a, b) => a.species.firstRecord - b.species.firstRecord,
  records: (a, b) => a.records - b.records,
};

export function SpeciesTable() {
  const { m, fmt, tx } = useI18n();
  const { speciesSummaries, actions } = useSpeciesFilter();
  const { openSpecies } = useUi();
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'records', dir: 'desc' });

  const rows = useMemo(() => {
    const sorted = [...speciesSummaries].sort(compare[sort.key]);
    return sort.dir === 'desc' ? sorted.reverse() : sorted;
  }, [speciesSummaries, sort]);

  const maxRecords = rows.reduce((mx, r) => Math.max(mx, r.records), 1);

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }));

  return (
    <section id="section-catalogue" className="card species-card" aria-labelledby="species-table-title">
      <header className="card__header">
        <div>
          <h2 id="species-table-title" className="card__title">
            <span className="card__index" aria-hidden="true">(E)</span> {m.table.title}
          </h2>
          <p className="card__subtitle">{m.table.subtitle(rows.length)}</p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="empty-state" role="status">
          <p>{m.table.empty}</p>
          <button type="button" className="button button--primary" onClick={actions.reset}>
            {m.map.resetFilters}
          </button>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table species-table">
            <caption className="visually-hidden">{m.table.caption}</caption>
            <thead>
              <tr>
                {COLUMNS.map((c) => {
                  const active = sort.key === c.key;
                  const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      className={c.numeric ? 'num' : undefined}
                      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <button type="button" className={`sort-button ${active ? 'is-active' : ''}`} onClick={() => onSort(c.key)}>
                        {m.table.col[c.key]}
                        <SortIcon size={12} aria-hidden="true" />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="hide-sm">{m.table.col.group}</th>
                <th scope="col" className="hide-md">{m.table.col.basins}</th>
                <th scope="col" className="hide-md">{m.table.col.listed}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ species: s, records, watersheds }) => (
                <tr
                  key={s.id}
                  className="species-row"
                  tabIndex={0}
                  onClick={() => openSpecies(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openSpecies(s.id);
                    }
                  }}
                  aria-label={m.table.rowLabel(s.scientificName, tx(s.commonNames))}
                >
                  <td>
                    <span className="sci-name">{s.scientificName}</span>
                    <span className="common-name">{tx(s.commonNames)}</span>
                  </td>
                  <td className="num">
                    <RiskBadge risk={s.risk} compact />
                  </td>
                  <td className="num tabular">{s.firstRecord}</td>
                  <td className="num">
                    <span className="bar-cell">
                      <span className="tabular">{fmt(records)}</span>
                      <span className="bar-cell__track" aria-hidden="true">
                        <span className="bar-cell__fill" style={{ width: `${(records / maxRecords) * 100}%` }} />
                      </span>
                    </span>
                  </td>
                  <td className="hide-sm">
                    <GroupTag group={s.group} />
                  </td>
                  <td className="hide-md tabular">{watersheds.length}</td>
                  <td className="hide-md">
                    <LegalBadges legal={s.legal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
