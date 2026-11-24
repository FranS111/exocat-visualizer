import { Database } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export function Footer() {
  const { m } = useI18n();
  return (
    <footer className="app-footer">
      <p>
        <Database size={14} aria-hidden="true" />
        <span>
          <strong>{m.footer.aboutTitle}</strong> {m.footer.aboutBody}
        </span>
      </p>
      <p className="app-footer__meta">{m.footer.meta}</p>
    </footer>
  );
}
