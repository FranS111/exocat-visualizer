import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { RISK_LEVELS, WATERSHEDS, type RiskLevel, type Watershed } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { ChartCard, ChartTooltipFrame, TooltipRow } from './ChartCard';

type Row = { name: Watershed; total: number; species: number } & Record<RiskLevel, number>;

function WatershedTooltip({ active, payload }: TooltipProps<number, string>) {
  const { m, fmt, basin } = useI18n();
  const { palette } = useTheme();
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  return (
    <ChartTooltipFrame title={m.watershedChart.tooltipTitle(basin(row.name))}>
      {RISK_LEVELS.map((r) => (
        <TooltipRow key={r} color={palette.risk[r]} label={m.risk[r]} value={fmt(row[r])} />
      ))}
      <p className="chart-tooltip__foot">{m.watershedChart.footer(row.total, row.species)}</p>
    </ChartTooltipFrame>
  );
}

export function WatershedChart() {
  const data = useDataset();
  const { m, fmt, basin } = useI18n();
  const { palette } = useTheme();
  const { filters, actions, occurrencesAnyWatershed } = useSpeciesFilter();

  const rows = useMemo<Row[]>(() => {
    const acc = new Map<Watershed, Row & { set: Set<string> }>();
    WATERSHEDS.forEach((w) => acc.set(w, { name: w, total: 0, species: 0, high: 0, medium: 0, low: 0, set: new Set() }));
    for (const o of occurrencesAnyWatershed) {
      const s = data.speciesById.get(o.speciesId);
      const row = acc.get(o.watershed);
      if (!s || !row) continue;
      row[s.risk]++;
      row.total++;
      row.set.add(s.id);
    }
    return [...acc.values()]
      .map(({ set, ...r }) => ({ ...r, species: set.size }))
      .sort((a, b) => b.total - a.total);
  }, [data, occurrencesAnyWatershed]);

  const dim = (name: Watershed) => (filters.watershed && filters.watershed !== name ? 0.3 : 1);

  const legend = (
    <ul className="chart-legend" aria-label={m.chart.legend}>
      {RISK_LEVELS.map((r) => (
        <li key={r}>
          <span className="legend-dot" style={{ background: palette.risk[r] }} aria-hidden="true" />
          {m.risk[r]}
        </li>
      ))}
    </ul>
  );

  const table = (
    <table className="data-table data-table--compact">
      <caption className="visually-hidden">{m.watershedChart.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{m.watershedChart.colWatershed}</th>
          {RISK_LEVELS.map((r) => (
            <th key={r} scope="col" className="num">
              {m.riskShort[r]}
            </th>
          ))}
          <th scope="col" className="num">{m.chart.total}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} aria-selected={filters.watershed === r.name}>
            <th scope="row">{basin(r.name)}</th>
            {RISK_LEVELS.map((k) => (
              <td key={k} className="num">{fmt(r[k])}</td>
            ))}
            <td className="num">
              <strong>{fmt(r.total)}</strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard
      title={m.watershedChart.title}
      index="C"
      id="section-basins"
      subtitle={filters.watershed ? m.watershedChart.subtitleSelected(basin(filters.watershed)) : m.watershedChart.subtitleHint}
      legend={legend}
      table={table}
      className="chart-card--watershed"
    >
      <ResponsiveContainer width="100%" height={Math.max(320, rows.length * 26 + 30)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }} barCategoryGap={5}>
          <CartesianGrid horizontal={false} stroke={palette.ink.grid} />
          <XAxis type="number" tick={{ fill: palette.ink.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tick={{ fill: palette.ink.secondary, fontSize: 12 }}
            tickFormatter={(v: Watershed) => basin(v)}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip content={<WatershedTooltip />} cursor={{ fill: palette.ink.cursor }} />
          {RISK_LEVELS.map((r, i) => (
            <Bar
              key={r}
              dataKey={r}
              stackId="risk"
              name={m.risk[r]}
              fill={palette.risk[r]}
              stroke={palette.ink.surface}
              strokeWidth={1.5}
              radius={i === RISK_LEVELS.length - 1 ? [0, 4, 4, 0] : 0}
              cursor="pointer"
              isAnimationActive={false}
              onClick={(d: { payload?: Row }) => d.payload && actions.toggleWatershed(d.payload.name)}
            >
              {rows.map((row) => (
                <Cell key={row.name} fillOpacity={dim(row.name)} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
