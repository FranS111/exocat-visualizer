import { useEffect, useMemo, useRef } from 'react';
import { Area, AreaChart, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { RISK_LEVELS, type RiskLevel } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { ChartCard, ChartTooltipFrame, TooltipRow } from './ChartCard';

type YearRow = { year: number; total: number; newSpecies: string[] } & Record<RiskLevel, number>;

function TimelineTooltip({ active, payload }: TooltipProps<number, string>) {
  const { m, fmt } = useI18n();
  const { palette } = useTheme();
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as YearRow;
  return (
    <ChartTooltipFrame title={row.year}>
      {RISK_LEVELS.map((r) => (
        <TooltipRow key={r} color={palette.risk[r]} label={m.risk[r]} value={fmt(row[r])} />
      ))}
      <p className="chart-tooltip__foot">{m.timeline.records(row.total)}</p>
      {row.newSpecies.length > 0 && (
        <p className="chart-tooltip__foot">
          {m.timeline.firstRecorded} <em>{row.newSpecies.join(', ')}</em>
        </p>
      )}
    </ChartTooltipFrame>
  );
}

export function RiskTimeline() {
  const data = useDataset();
  const { m, fmt } = useI18n();
  const { palette } = useTheme();
  const { filters, actions, occurrencesAnyYear } = useSpeciesFilter();
  const [y0, y1] = filters.yearRange;
  const [minYear, maxYear] = data.yearBounds;

  const rows = useMemo<YearRow[]>(() => {
    const byYear = new Map<number, YearRow>();
    for (let y = minYear; y <= maxYear; y++) byYear.set(y, { year: y, total: 0, high: 0, medium: 0, low: 0, newSpecies: [] });
    const seen = new Set<string>();
    for (const o of occurrencesAnyYear) {
      const s = data.speciesById.get(o.speciesId);
      const row = byYear.get(o.year);
      if (!s || !row) continue;
      row[s.risk]++;
      row.total++;
      if (!seen.has(s.id) && s.firstRecord >= minYear) {
        seen.add(s.id);
        byYear.get(s.firstRecord)?.newSpecies.push(s.scientificName);
      }
    }
    return [...byYear.values()];
  }, [data, occurrencesAnyYear, minYear, maxYear]);

  // Brush drags fire continuously; commit to global state on a short trailing debounce.
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onBrushChange = (range: { startIndex?: number; endIndex?: number }) => {
    if (range.startIndex == null || range.endIndex == null) return;
    const next: [number, number] = [rows[range.startIndex].year, rows[range.endIndex].year];
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => actions.setYearRange(next), 160);
  };

  const inRange = rows.filter((r) => r.year >= y0 && r.year <= y1);
  const peak = inRange.reduce<YearRow | null>((best, r) => (!best || r.total > best.total ? r : best), null);

  const legend = (
    <ul className="chart-legend" aria-label={m.chart.legend}>
      {RISK_LEVELS.map((r) => (
        <li key={r}>
          <span className="legend-dot" style={{ background: palette.risk[r] }} aria-hidden="true" />
          {m.risk[r]}
        </li>
      ))}
      <li className="chart-legend__hint">{m.timeline.dragHint}</li>
    </ul>
  );

  const table = (
    <table className="data-table data-table--compact">
      <caption className="visually-hidden">{m.timeline.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{m.timeline.colYear}</th>
          {RISK_LEVELS.map((r) => (
            <th key={r} scope="col" className="num">{m.riskShort[r]}</th>
          ))}
          <th scope="col" className="num">{m.chart.total}</th>
        </tr>
      </thead>
      <tbody>
        {inRange.map((r) => (
          <tr key={r.year}>
            <th scope="row">{r.year}</th>
            {RISK_LEVELS.map((k) => (
              <td key={k} className="num">{fmt(r[k])}</td>
            ))}
            <td className="num"><strong>{fmt(r.total)}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartCard
      title={m.timeline.title}
      index="D"
      id="section-timeline"
      subtitle={
        <>
          {y0}–{y1}
          {peak && peak.total > 0 ? ` · ${m.timeline.peak(peak.total, peak.year)}` : ''}
        </>
      }
      legend={legend}
      table={table}
      className="chart-card--timeline"
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke={palette.ink.grid} />
          <XAxis dataKey="year" tick={{ fill: palette.ink.muted, fontSize: 11 }} tickLine={false} axisLine={{ stroke: palette.ink.grid }} minTickGap={18} />
          <YAxis tick={{ fill: palette.ink.muted, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={44} />
          <Tooltip content={<TimelineTooltip />} cursor={{ stroke: palette.ink.secondary, strokeDasharray: '3 3' }} />
          {[...RISK_LEVELS].reverse().map((r) => (
            <Area
              key={r}
              type="monotone"
              dataKey={r}
              stackId="risk"
              name={m.risk[r]}
              stroke={palette.risk[r]}
              strokeWidth={2}
              fill={palette.risk[r]}
              fillOpacity={0.55}
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: palette.ink.surface, strokeWidth: 2 }}
            />
          ))}
          {/* The brush both selects the global period and zooms this chart; its mini-chart keeps full-range context. */}
          <Brush
            dataKey="year"
            height={34}
            travellerWidth={10}
            stroke={palette.ink.accent}
            fill={palette.ink.subtle}
            startIndex={Math.max(0, y0 - minYear)}
            endIndex={Math.min(rows.length - 1, y1 - minYear)}
            onChange={onBrushChange}
            tickFormatter={(v: number) => String(v)}
          >
            <AreaChart data={rows}>
              <Area type="monotone" dataKey="total" stroke={palette.ink.accent} strokeWidth={1} fill={palette.ink.accent} fillOpacity={0.2} isAnimationActive={false} />
            </AreaChart>
          </Brush>
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
