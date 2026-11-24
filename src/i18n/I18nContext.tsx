import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { watershedLabel } from '../data/watersheds';
import { LANGS, type Lang, type LocalizedText, type Watershed } from '../types';
import { ca } from './locales/ca';
import { en, type Messages } from './locales/en';
import { es } from './locales/es';

const DICTIONARIES: Record<Lang, Messages> = { ca, es, en };
const LOCALES: Record<Lang, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };
const STORAGE_KEY = 'exocat.lang';
const FALLBACK: Lang = 'en';

/** Endonyms, so each option is readable by its own speakers. */
export const LANG_NAMES: Record<Lang, string> = { ca: 'Català', es: 'Español', en: 'English' };

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

function readStoredLang(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/** First supported language in the browser/OS preference list (e.g. "ca-ES" → "ca"). */
export function detectBrowserLang(): Lang {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of prefs) {
    const base = tag?.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return FALLBACK;
}

export interface I18nContextValue {
  lang: Lang;
  /** Explicit user choice; persisted and takes precedence over the browser setting. */
  setLang: (lang: Lang) => void;
  m: Messages;
  locale: string;
  fmt: (n: number) => string;
  /** Pick the current language from a localized field. */
  tx: (text: LocalizedText) => string;
  basin: (name: Watershed) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Lang | null>(readStoredLang);
  const [browser, setBrowser] = useState<Lang>(detectBrowserLang);
  const lang = stored ?? browser;

  // Follow OS/browser language changes while the user hasn't chosen explicitly.
  useEffect(() => {
    const onChange = () => setBrowser(detectBrowserLang());
    window.addEventListener('languagechange', onChange);
    return () => window.removeEventListener('languagechange', onChange);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setStored(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode): choice lasts for this visit only */
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const m = DICTIONARIES[lang];
    const nf = new Intl.NumberFormat(LOCALES[lang]);
    return {
      lang,
      setLang,
      m,
      locale: LOCALES[lang],
      fmt: (n) => nf.format(n),
      tx: (text) => text[lang],
      basin: (name) => watershedLabel(name, lang),
    };
  }, [lang, setLang]);

  // Keep the document in sync: screen readers, hyphenation and search engines rely on <html lang>.
  useEffect(() => {
    const m = DICTIONARIES[lang];
    document.documentElement.lang = lang;
    document.title = m.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', m.meta.description);
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
