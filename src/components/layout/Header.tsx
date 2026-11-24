import { PawPrint } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SearchBox } from './SearchBox';
import { SectionMenu } from './SectionMenu';
import { ThemeToggle } from './ThemeToggle';
import { ViewModeToggle } from './ViewModeToggle';

export function Header() {
  const { m } = useI18n();

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="brand-mark" aria-hidden="true">
          <PawPrint size={20} strokeWidth={2.2} />
        </span>
        <div>
          <p className="brand-title">
            EXOCAT <span>{m.header.brandSuffix}</span>
          </p>
          <p className="brand-subtitle">{m.header.subtitle}</p>
        </div>
      </div>

      <SearchBox />

      <div className="app-header__actions">
        <span className="data-pill" title={m.header.demoPillTitle}>
          {m.header.demoPill}
        </span>
        <LanguageSwitcher />
        <ThemeToggle />
        <ViewModeToggle />
        <SectionMenu />
      </div>
    </header>
  );
}
