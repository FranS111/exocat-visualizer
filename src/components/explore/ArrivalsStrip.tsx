import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';
import { SectionHead, SpeciesImg } from './common';

/** Horizontal, scroll-snapped timeline of first records in Catalonia. */
export function ArrivalsStrip({ onSpecies }: { onSpecies: (id: string) => void }) {
  const { m, lang } = useI18n();
  const { palette } = useTheme();
  const data = useDataset();
  const trackRef = useRef<HTMLOListElement>(null);
  const ordered = useMemo(
    () => [...data.species].sort((a, b) => a.firstRecord - b.firstRecord || a.scientificName.localeCompare(b.scientificName)),
    [data.species],
  );

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };

  let lastDecade = -1;
  return (
    <section id="explore-arrivals" className="ex-section ex-arrivals" aria-labelledby="ex-arrivals-title">
      <div className="ex-arrivals__head">
        <SectionHead id="ex-arrivals-title" index="04" title={m.explore.arrivalsTitle} lede={m.explore.arrivalsLede} />
        <div className="ex-spot__nav">
          <button type="button" className="ex-round" onClick={() => scrollBy(-1)} aria-label={m.explore.arrivalsScrollPrev}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" className="ex-round" onClick={() => scrollBy(1)} aria-label={m.explore.arrivalsScrollNext}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <ol className="ex-timeline" ref={trackRef} tabIndex={0} aria-label={m.explore.sections.arrivals}>
        {ordered.map((s) => {
          const decade = Math.floor(s.firstRecord / 10) * 10;
          const newDecade = decade !== lastDecade;
          lastDecade = decade;
          return (
            <li key={s.id} className={`ex-arrival ${newDecade ? 'has-decade' : ''}`}>
              {newDecade && (
                <span className="ex-arrival__decade tabular" aria-hidden="true">
                  {decade}
                </span>
              )}
              <button type="button" className="ex-arrival__btn" onClick={() => onSpecies(s.id)} aria-label={`${s.firstRecord} · ${m.explore.learnAbout(s.commonNames[lang])}`}>
                <span className="ex-arrival__year tabular">{s.firstRecord}</span>
                <span className="ex-arrival__tick" style={{ background: palette.taxon[s.group] }} aria-hidden="true" />
                <SpeciesImg id={s.id} width={250} className="ex-arrival__img" />
                <span className="ex-arrival__name">{s.commonNames[lang]}</span>
                <span className="ex-arrival__group">{m.taxon[s.group]}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
