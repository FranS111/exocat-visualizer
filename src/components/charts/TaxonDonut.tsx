import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { TAXON_GROUPS, type TaxonGroup } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { GroupIcon } from '../common/Badges';
import { ChartCard, ChartTooltipFrame, TooltipRow } from './ChartCard';

interface Slice {
  group: TaxonGroup;
  species: number;
  records: number;
}

function DonutTooltip({ active, payload }: TooltipProps<number, string>) {
  const { m } = useI18n();
  const { palette } = useTheme();
  if (!active || !payload?.length) return null;
  const s = payload[0].payload as Slice;
  return (
    <ChartTooltipFrame title={m.taxon[s.group]}>
      <TooltipRow color={palette.taxon[s.group]} label={m.donut.speciesLabel} value={s.species} />
      <p className="chart-tooltip__foot">{m.donut.records(s.records)}</p>
    </ChartTooltipFrame>
  );
}

export function TaxonDonut() {
  const data = useDataset();
  const { m, fmt } = useI18n();
  const { palette } = useTheme();
  const { filters, actions, occurrencesAnyGroup } = useSpeciesFilter();
  const [hovered, setHovered] = useState<TaxonGroup | null>(null);

  const slices = useMemo<Slice[]>(() => {
    const acc = new Map<TaxonGroup, { species: Set<string>; records: number }>();
    for (const o of occurrencesAnyGroup) {
      const s = data.speciesById.get(o.speciesId);
      if (!s) continue;
      let e = acc.get(s.group);
      if (!e) {
        e = { species: new Set(), records: 0 };
        acc.set(s.group, e);
      }
      e.species.add(s.id);
      e.records++;
    }
    // Fixed category order — colour follows the entity, never its rank.
    return TAXON_GROUPS.map((g) => ({ group: g, species: acc.get(g)?.species.size ?? 0, records: acc.get(g)?.records ?? 0 }));
  }, [data, occurrencesAnyGroup]);

  const visible = slices.filter((s) => s.species > 0);
  const totalSpecies = visible.reduce((n, s) => n + s.species, 0);
  const selectedSpecies = filters.groups.length
    ? visible.filter((s) => filters.groups.includes(s.group)).reduce((n, s) => n + s.species, 0)
    : totalSpecies;
  const emphasis = (g: TaxonGroup) => {
    if (hovered) return hovered === g ? 1 : 0.35;
    if (filters.groups.length) return filters.groups.includes(g) ? 1 : 0.25;
    return 1;
  };

  const table = (
    <table className="data-table data-table--compact">
      <caption className="visually-hidden">{m.donut.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{m.donut.colGroup}</th>
          <th scope="col" className="num">{m.donut.colSpecies}</th>
          <th scope="col" className="num">{m.donut.colRecords}</th>
        </tr>
      </thead>
      <tbody>
        {slices.map((s) => (
          <tr key={s.group}>
            <th scope="row">{m.taxon[s.group]}</th>
            <td className="num">{s.species}</td>
            <td className="num">{fmt(s.records)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard
      title={m.donut.title}
      index="B"
      id="section-taxa"
      subtitle={m.donut.subtitle}
      table={table}
      className="chart-card--donut"
    >
      <div className="donut-layout">
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={visible}
                dataKey="species"
                nameKey="group"
                innerRadius="62%"
                outerRadius="94%"
                paddingAngle={visible.length > 1 ? 2 : 0}
                stroke={palette.ink.surface}
                strokeWidth={2}
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
                onMouseLeave={() => setHovered(null)}
              >
                {visible.map((s) => (
                  <Cell
                    key={s.group}
                    fill={palette.taxon[s.group]}
                    fillOpacity={emphasis(s.group)}
                    cursor="pointer"
                    onClick={() => actions.toggleGroup(s.group)}
                    onMouseEnter={() => setHovered(s.group)}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center" aria-hidden="true">
            <span className="donut-center__value">{selectedSpecies}</span>
            <span className="donut-center__label">{filters.groups.length ? m.donut.selected : m.donut.species}</span>
          </div>
        </div>

        <ul className="donut-legend">
          {slices.map((s) => {
            const active = filters.groups.includes(s.group);
            const pct = totalSpecies ? Math.round((s.species / totalSpecies) * 100) : 0;
            return (
              <li key={s.group}>
                <button
                  type="button"
                  className={`donut-legend__item ${active ? 'is-active' : ''}`}
                  aria-pressed={active}
                  disabled={s.species === 0 && !active}
                  onClick={() => actions.toggleGroup(s.group)}
                  onMouseEnter={() => setHovered(s.group)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(s.group)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="donut-legend__swatch" style={{ background: palette.taxon[s.group] }} aria-hidden="true">
                    <GroupIcon group={s.group} size={11} color={palette.onFill} strokeWidth={2.6} />
                  </span>
                  <span className="donut-legend__name">{m.taxon[s.group]}</span>
                  <span className="donut-legend__value">{s.species}</span>
                  <span className="donut-legend__pct">{pct}%</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </ChartCard>
  );
}
