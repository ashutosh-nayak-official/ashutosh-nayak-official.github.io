import { Component, Suspense, lazy, useEffect, type ReactNode } from 'react';
import { t, type Locale } from '../i18n';
import Nav from './Nav';
import Hero from '../chapters/Hero';
import InProduction from '../chapters/InProduction';
import OneCall from '../chapters/OneCall';
import Agents from '../chapters/Agents';
import Infra from '../chapters/Infra';
import Work from '../chapters/Work';
import Path from '../chapters/Path';
import Contact from '../chapters/Contact';
import { StageEnvProvider, useStageDowngrade, useStageEnv } from '../three/env';
import { SmoothScroll } from '../scroll/SmoothScroll';
import { usePageLoaded } from './afterLoad';

/**
 * The R3F stage (three.js and friends) is its own chunk, requested only once the page
 * has loaded and gone idle, so it never competes with the text, CSS and fonts.
 */
const Stage = lazy(() => import('../three/Stage'));

function StageMount() {
  const env = useStageEnv();
  const downgrade = useStageDowngrade();
  const loaded = usePageLoaded();
  if (!env || env.capability === 'static' || !loaded) return null;
  return (
    <StageBoundary onError={downgrade}>
      <Suspense fallback={null}>
        <Stage />
      </Suspense>
    </StageBoundary>
  );
}

/** WebGL context or chunk failure: fall back to stills and native scroll. */
class StageBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('[stage] 3D disabled', err);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type AppProps = { locale: Locale };

export default function App({ locale }: AppProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <StageEnvProvider>
      <div className="site" lang={locale}>
        <StageMount />
        <SmoothScroll />
        <a className="skip" href="#main">
          {t(locale, 'nav_skip')}
        </a>
        <Nav locale={locale} />
        <main id="main" tabIndex={-1}>
          <Hero locale={locale} />
          <InProduction locale={locale} />
          <OneCall locale={locale} />
          <Agents locale={locale} />
          <Infra locale={locale} />
          <Work locale={locale} />
          <Path locale={locale} />
          <Contact locale={locale} />
        </main>
        <footer className="site-footer">
          <div className="wrap">
            <span>{t(locale, 'footer_copyright')}</span>
            <span>{t(locale, 'footer_location')}</span>
            <a href="#top">
              {t(locale, 'footer_top')} <span aria-hidden="true">↑</span>
            </a>
          </div>
        </footer>
      </div>
    </StageEnvProvider>
  );
}
