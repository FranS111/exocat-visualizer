import { BarChart3 } from 'lucide-react';
import { SPECIES_IMAGES } from '../../data/speciesImages';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useUi } from '../../hooks/useUi';
import { SectionHead } from './common';

/** Practical advice for the public, then the photo credits for every image on the page. */
export function ActSection() {
  const { m, lang } = useI18n();
  const { setViewMode } = useUi();
  const data = useDataset();

  return (
    <>
      <section id="explore-act" className="ex-band ex-act" aria-labelledby="ex-act-title">
        <div className="ex-gridlines" aria-hidden="true" />
        <div className="ex-act__inner">
          <SectionHead id="ex-act-title" index="05" title={m.explore.actTitle} tone="light" />
          <ol className="ex-tips">
            {m.explore.tips.map((t, i) => (
              <li key={t.title} className="ex-tip">
                <span className="ex-tip__num tabular" aria-hidden="true">
                  ({String(i + 1).padStart(2, '0')})
                </span>
                <h3 className="ex-tip__title">{t.title}</h3>
                <p className="ex-tip__body">{t.body}</p>
              </li>
            ))}
          </ol>
          <button type="button" className="ex-button ex-button--light" onClick={() => setViewMode('data')}>
            <BarChart3 size={14} aria-hidden="true" />
            {m.explore.backToData}
          </button>
        </div>
      </section>

      <details className="ex-credits">
        <summary>{m.explore.creditsTitle}</summary>
        <p>{m.explore.creditsNote}</p>
        <ul>
          {data.species.map((s) => {
            const img = SPECIES_IMAGES[s.id];
            if (!img) return null;
            return (
              <li key={s.id}>
                <em>{s.commonNames[lang]}</em> —{' '}
                <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {img.artist}
                </a>
                ,{' '}
                {img.licenseUrl ? (
                  <a href={img.licenseUrl} target="_blank" rel="noopener noreferrer license">
                    {img.license}
                  </a>
                ) : (
                  m.modal.publicDomain
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </>
  );
}
