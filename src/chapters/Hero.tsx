import { lazy } from 'react';
import { SceneSlot, useT, type ChapterProps } from './shared';
import Loader from './Loader';
import '../styles/hero.css';

const HeroScene = lazy(() => import('../three/scenes/HeroScene'));

export default function Hero({ locale }: ChapterProps) {
  const tr = useT(locale);
  return (
    <section id="top" className="chapter chapter--pinned hero">
      <Loader locale={locale} />
      <div className="pin">
        <SceneSlot id="top" scene={HeroScene} />
        <div className="wrap">
          <div className="copy">
            <h1 className="hero-title">
              <span className="lbl hero-name">
                <span aria-hidden="true">
                  {tr('chapter_00')} <i>·</i>{' '}
                </span>
                {tr('hero_name')}
              </span>{' '}
              <span className="hero-promise">
                {tr('hero_promise_1')} <span className="accent">{tr('hero_promise_2')}</span>
              </span>
            </h1>
            <p className="who">
              {tr('hero_context_1')}
              <br />
              {tr('hero_context_2')}
            </p>
            <div className="actions">
              <a className="cta" href="#call">
                {tr('hero_cta')} <span aria-hidden="true">↓</span>
              </a>
              <a className="cta2" href="#contact">
                {tr('hero_cta_secondary')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
