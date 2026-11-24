import { BarChart3, Leaf } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useUi } from '../../hooks/useUi';

/** Switches between the data dashboard and the visual field guide. Shows the view you'll go *to*. */
export function ViewModeToggle() {
  const { m } = useI18n();
  const { viewMode, setViewMode } = useUi();
  const exploring = viewMode === 'explore';
  return (
    <button
      type="button"
      className={`view-toggle ${exploring ? 'is-explore' : ''}`}
      onClick={() => setViewMode(exploring ? 'data' : 'explore')}
      title={exploring ? m.header.viewToData : m.header.viewToExplore}
    >
      <span className="view-toggle__icon" aria-hidden="true">
        {exploring ? <BarChart3 size={15} /> : <Leaf size={15} />}
      </span>
      <span className="view-toggle__label">{exploring ? m.header.viewData : m.header.viewExplore}</span>
    </button>
  );
}
