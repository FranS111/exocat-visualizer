import { Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useSpeciesFilter } from '../../hooks/useSpeciesFilter';
import { useUi } from '../../hooks/useUi';
import { suggestSpecies } from '../../utils/filtering';

const MAX_SUGGESTIONS = 4;

/** Wraps the matched span of `text` in <mark>. */
function Highlight({ text, span }: { text: string; span: [number, number] | null }) {
  if (!span) return <>{text}</>;
  const [a, b] = span;
  return (
    <>
      {text.slice(0, a)}
      <mark>{text.slice(a, b)}</mark>
      {text.slice(b)}
    </>
  );
}

/**
 * Header search (WAI-ARIA combobox): filters the page as you type and offers up
 * to four predictive species suggestions; picking one opens that species.
 */
export function SearchBox() {
  const { m, lang } = useI18n();
  const data = useDataset();
  const { filters, actions } = useSpeciesFilter();
  const { openSpecies } = useUi();
  const [query, setQuery] = useState(filters.search);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounced = useDebouncedValue(query, 180);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Suggestions update on every keystroke (cheap: 31 species); the page filter is debounced.
  const suggestions = useMemo(() => suggestSpecies(data.species, query, lang, MAX_SUGGESTIONS), [data.species, query, lang]);
  const expanded = open && suggestions.length > 0;

  useEffect(() => setActiveIndex(-1), [query]);

  // Local input → global filter (debounced).
  useEffect(() => {
    if (debounced !== filters.search) actions.setSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Global reset → local input.
  useEffect(() => {
    if (filters.search === '' && query !== '') setQuery('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // "/" focuses search, a common pattern in data tools.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (id: string) => {
    setOpen(false);
    setQuery('');
    actions.setSearch('');
    inputRef.current?.blur();
    openSpecies(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      if (suggestions.length) setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length) setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      const pick = suggestions[activeIndex >= 0 ? activeIndex : 0];
      if (expanded && pick) {
        e.preventDefault();
        choose(pick.species.id);
      }
    } else if (e.key === 'Escape') {
      if (expanded) {
        e.preventDefault();
        setOpen(false);
      } else if (query) {
        setQuery('');
      }
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <div className="app-header__search" role="search">
      <label htmlFor="species-search" className="visually-hidden">
        {m.header.searchLabel}
      </label>
      <Search size={16} className="search-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        id="species-search"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        placeholder={m.header.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {query ? (
        <button type="button" className="icon-button search-clear" onClick={() => setQuery('')} aria-label={m.header.clearSearch}>
          <X size={14} />
        </button>
      ) : (
        <kbd className="search-kbd" aria-hidden="true">
          /
        </kbd>
      )}

      <ul id={listId} role="listbox" aria-label={m.header.suggestions} className="search-suggest" hidden={!expanded}>
        {suggestions.map((s, i) => (
          <li
            key={s.species.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === activeIndex}
            className={`search-suggest__item ${i === activeIndex ? 'is-active' : ''}`}
            // Keep focus in the input so blur doesn't close the list before the click lands.
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => choose(s.species.id)}
          >
            <span className="search-suggest__name">
              <Highlight text={s.species.commonNames[lang]} span={s.common} />
            </span>
            <span className="search-suggest__sci">
              <Highlight text={s.species.scientificName} span={s.sci} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
