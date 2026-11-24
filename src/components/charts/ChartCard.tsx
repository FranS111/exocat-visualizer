import { BarChart3, Table2 } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';

interface ChartCardProps {
  title: string;
  /** Editorial index shown before the title, e.g. "B" → (B). */
  index?: string;
  /** Anchor id for in-page navigation. */
  id?: string;
  subtitle?: ReactNode;
  legend?: ReactNode;
  /** Accessible tabular alternative to the chart. */
  table: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ id: anchorId, title, index, subtitle, legend, table, children, className = '' }: ChartCardProps) {
  const { m } = useI18n();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const id = useId();
  return (
    <section id={anchorId} className={`card chart-card ${className}`} aria-labelledby={`${id}-title`}>
      <header className="card__header">
        <div>
          <h2 id={`${id}-title`} className="card__title">
            {index && <span className="card__index" aria-hidden="true">({index})</span>}
            {title}
          </h2>
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
        <button
          type="button"
          className="icon-button view-toggle"
          onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          aria-label={view === 'chart' ? m.chart.showTable(title) : m.chart.showChart(title)}
          title={view === 'chart' ? m.chart.tableView : m.chart.chartView}
        >
          {view === 'chart' ? <Table2 size={16} /> : <BarChart3 size={16} />}
        </button>
      </header>
      {view === 'chart' && legend}
      <div className="chart-card__body">{view === 'chart' ? children : <div className="chart-table-wrap">{table}</div>}</div>
    </section>
  );
}

export function ChartTooltipFrame({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="chart-tooltip" role="presentation">
      <p className="chart-tooltip__title">{title}</p>
      {children}
    </div>
  );
}

export function TooltipRow({ color, label, value }: { color: string; label: string; value: string | number }) {
  return (
    <p className="chart-tooltip__row">
      <span className="legend-dot" style={{ background: color }} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  );
}
