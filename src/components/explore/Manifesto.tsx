import { ArrowRight } from 'lucide-react';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';

/** Big bracketed statement over a hairline grid, then a slow ticker of species names. */
export function Manifesto({ onNext }: { onNext: () => void }) {
  const { m, lang } = useI18n();
  const data = useDataset();
  const names = data.species.map((s) => ({ id: s.id, common: s.commonNames[lang], sci: s.scientificName }));

  const ticker = (hidden: boolean) => (
    <ul className="ex-ticker__track" aria-hidden={hidden || undefined}>
      {names.map((n) => (
        <li key={n.id}>
          <em>{n.common}</em>
          <span>{n.sci}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section id="explore-intro" className="ex-band ex-manifesto" aria-labelledby="ex-manifesto-title">
      <div className="ex-gridlines" aria-hidden="true" />
      <div className="ex-manifesto__inner">
        <span className="ex-manifesto__paren" aria-hidden="true">
          (
        </span>
        <h2 id="ex-manifesto-title" className="ex-manifesto__text">
          {m.explore.manifesto.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <span key={i}>{part}</span>))}
        </h2>
        <span className="ex-manifesto__paren" aria-hidden="true">
          )
        </span>
      </div>
      <button type="button" className="ex-button ex-button--ghost-light ex-manifesto__cta" onClick={onNext}>
        {m.explore.manifestoCta}
        <ArrowRight size={14} aria-hidden="true" />
      </button>

      <div className="ex-ticker">
        {ticker(false)}
        {ticker(true)}
      </div>
    </section>
  );
}
