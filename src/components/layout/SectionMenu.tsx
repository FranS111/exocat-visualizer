import { Filter, Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useUi } from '../../hooks/useUi';
import type { Messages } from '../../i18n/locales/en';
import { scrollToSection } from '../../utils/smoothScroll';

type SectionDef = { id: string; index: string; label: (m: Messages) => string };

/** Dashboard sections, in page order. Ids live on the section elements themselves. */
const DASHBOARD_SECTIONS: SectionDef[] = [
  { id: 'section-map', index: 'A', label: (m) => m.map.title },
  { id: 'section-taxa', index: 'B', label: (m) => m.donut.title },
  { id: 'section-basins', index: 'C', label: (m) => m.watershedChart.title },
  { id: 'section-timeline', index: 'D', label: (m) => m.timeline.title },
  { id: 'section-catalogue', index: 'E', label: (m) => m.table.title },
];

/** Explore (field guide) sections. */
const EXPLORE_SECTIONS: SectionDef[] = [
  { id: 'explore-intro', index: '00', label: (m) => m.explore.sections.intro },
  { id: 'explore-groups', index: '01', label: (m) => m.explore.sections.groups },
  { id: 'explore-guide', index: '02', label: (m) => m.explore.sections.guide },
  { id: 'explore-origins', index: '03', label: (m) => m.explore.sections.origins },
  { id: 'explore-arrivals', index: '04', label: (m) => m.explore.sections.arrivals },
  { id: 'explore-act', index: '05', label: (m) => m.explore.sections.act },
];

/** Tracks which section sits under the reading line (just below the header). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-30% 0px -65% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')]);
  return active;
}

/**
 * Header "sections" menu (WAI-ARIA menu button pattern): jumps to any part of the
 * dashboard with an eased scroll. In the drawer layout it also opens the filters.
 */
export function SectionMenu() {
  const { m } = useI18n();
  const { activeFilterCount } = useSpeciesFilter();
  const { setFiltersOpen, viewMode } = useUi();
  const sections = viewMode === 'explore' ? EXPLORE_SECTIONS : DASHBOARD_SECTIONS;
  const drawerLayout = useMediaQuery('(max-width: 1024px)') && viewMode === 'data';
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const active = useActiveSection(sections.map((s) => s.id));

  const items = () => Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Focus the current section's item (or the first) when the menu opens.
  useEffect(() => {
    if (!open) return;
    const list = items();
    (list.find((b) => b.getAttribute('aria-current') === 'location') ?? list[0])?.focus();
  }, [open]);

  // Dismiss on outside pointer.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onMenuKey = (e: KeyboardEvent) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (n: number) => list[(n + list.length) % list.length]?.focus();
    if (e.key === 'ArrowDown') { e.preventDefault(); focusAt(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusAt(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }
    else if (e.key === 'End') { e.preventDefault(); focusAt(list.length - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  const goTo = (id: string) => {
    close(false);
    const el = document.getElementById(id);
    if (el) void scrollToSection(el);
  };

  const openFilters = () => {
    close(false);
    setFiltersOpen(true);
  };

  return (
    <div className="section-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`section-menu__trigger ${open ? 'is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="section-menu__label">{m.nav.sections}</span>
        {drawerLayout && activeFilterCount > 0 && (
          <span className="count-dot" aria-label={m.nav.activeFilters(activeFilterCount)}>
            {activeFilterCount}
          </span>
        )}
        <span className="section-menu__icon" aria-hidden="true">
          {open ? <X size={16} /> : <Menu size={16} />}
        </span>
      </button>

      {open && (
        <ul id={listId} className="section-menu__list" role="menu" aria-label={m.nav.sections} onKeyDown={onMenuKey}>
          {drawerLayout && (
            <>
              <li role="none">
                <button type="button" role="menuitem" tabIndex={-1} className="section-menu__item section-menu__item--filters" onClick={openFilters}>
                  <Filter size={14} aria-hidden="true" className="section-menu__index" />
                  <span className="section-menu__name">{m.filters.title}</span>
                  {activeFilterCount > 0 && <span className="count-dot">{activeFilterCount}</span>}
                </button>
              </li>
              <li role="separator" className="section-menu__sep" />
            </>
          )}
          {sections.map((s) => {
            const current = active === s.id;
            return (
              <li role="none" key={s.id}>
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={`section-menu__item ${current ? 'is-current' : ''}`}
                  aria-current={current ? 'location' : undefined}
                  onClick={() => goTo(s.id)}
                >
                  <span className="section-menu__index" aria-hidden="true">
                    ({s.index})
                  </span>
                  <span className="section-menu__name">{s.label(m)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
