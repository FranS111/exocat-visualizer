import { useContext } from 'react';
import { I18nContext } from '../i18n/I18nContext';

/** Current language, typed message dictionary and locale-aware formatters. */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
