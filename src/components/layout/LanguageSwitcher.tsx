import { Languages } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { LANG_NAMES } from '../../i18n/I18nContext';
import { LANGS } from '../../types';

/** Compact CA · ES · EN switch. Each option is announced by its endonym in its own language. */
export function LanguageSwitcher() {
  const { lang, setLang, m } = useI18n();
  return (
    <div className="lang-switch" role="radiogroup" aria-label={m.header.language}>
      <Languages size={14} aria-hidden="true" className="lang-switch__icon" />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          lang={l}
          aria-label={LANG_NAMES[l]}
          title={LANG_NAMES[l]}
          className={`lang-switch__item ${lang === l ? 'is-active' : ''}`}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
