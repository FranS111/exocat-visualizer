import { useDataset } from '../../hooks/useExocatData';
import { useI18n } from '../../hooks/useI18n';
import { WATERSHEDS } from '../../types';

/**
 * Editorial masthead: italic display serif + heavy grotesk in one headline,
 * mono index labels, and an oversized ghost wordmark behind (decorative only).
 */
export function Hero() {
  const data = useDataset();
  const { m } = useI18n();
  const [y0, y1] = data.yearBounds;

  return (
    <section id="overview" className="hero" aria-labelledby="hero-title">
      <span className="hero__ghost" aria-hidden="true">
        EXOCAT
      </span>

      <div className="hero__main">
        <p className="hero__eyebrow">
          <span className="hero__eyebrow-index">(01)</span> {m.hero.eyebrow}
        </p>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__line hero__line--serif">{m.hero.line1}</span>
          <span className="hero__line hero__line--heavy">{m.hero.line2}</span>
          <span className="hero__line hero__line--serif hero__line--indent">{m.hero.line3}</span>
        </h1>
      </div>

      <div className="hero__aside">
        <p className="hero__lede">{m.hero.lede}</p>
        <ul className="hero__facts">
          <li>{m.hero.species(data.species.length)}</li>
          <li>{m.hero.basins(WATERSHEDS.length)}</li>
          <li>
            {y0}—{y1}
          </li>
        </ul>
      </div>
    </section>
  );
}
