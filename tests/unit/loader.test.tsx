import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Loader, { INTRO_SCRIPT, loaderProgress } from '../../src/chapters/Loader';
import Hero from '../../src/chapters/Hero';
import App from '../../src/app/App';
import { intro, resetIntro } from '../../src/chapters/introStore';
import { StageEnvProvider, type StageEnv } from '../../src/three/env';
import { t } from '../../src/i18n';

const realMatchMedia = window.matchMedia;

function mockReducedMotion(on: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: on && q.includes('prefers-reduced-motion'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as never;
}

function mount(initial: Partial<StageEnv> = { capability: 'full', reducedMotion: false, mode: 'dark' }) {
  return render(
    <StageEnvProvider initial={initial}>
      <Loader locale="en" />
    </StageEnvProvider>,
  );
}

beforeEach(() => {
  // Mounted early in the page's life (100 ms after navigation start) unless a test says otherwise.
  vi.spyOn(performance, 'now').mockReturnValue(100);
  resetIntro();
  mockReducedMotion(false);
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.matchMedia = realMatchMedia;
  delete document.documentElement.dataset.intro;
  delete document.documentElement.dataset.introProfile;
  delete document.documentElement.dataset.capability;
  sessionStorage.clear();
});

describe('loaderProgress', () => {
  it('loaderProgress reaches 100 at 2400ms when assets loaded', () => {
    expect(loaderProgress(0, true)).toEqual({ pct: 0, done: false });
    expect(loaderProgress(1200, true).pct).toBeCloseTo(50);
    expect(loaderProgress(1200, true).done).toBe(false);
    expect(loaderProgress(2400, true)).toEqual({ pct: 100, done: true });
    expect(loaderProgress(2399, true).done).toBe(false);
  });

  it('holds at 99 until assets load', () => {
    expect(loaderProgress(2400, false)).toEqual({ pct: 99, done: false });
    expect(loaderProgress(3000, false)).toEqual({ pct: 99, done: false });
    expect(loaderProgress(1200, false).pct).toBeCloseTo(50);
    // once assets arrive after the build span, it completes
    expect(loaderProgress(3000, true)).toEqual({ pct: 100, done: true });
  });

  it('forces done at 3500ms', () => {
    expect(loaderProgress(3499, false).done).toBe(false);
    expect(loaderProgress(3500, false)).toEqual({ pct: 100, done: true });
    expect(loaderProgress(9000, false).done).toBe(true);
    // garbage input never throws or returns NaN
    expect(loaderProgress(Number.NaN, false)).toEqual({ pct: 0, done: false });
  });
});

describe('loaderProgress phone profile', () => {
  it('is done at 1500ms with assets, holds at 99 without, forced done at 2000ms', () => {
    expect(loaderProgress(750, true, 'phone').pct).toBeCloseTo(50);
    expect(loaderProgress(1499, true, 'phone').done).toBe(false);
    expect(loaderProgress(1500, true, 'phone')).toEqual({ pct: 100, done: true });
    expect(loaderProgress(1500, false, 'phone')).toEqual({ pct: 99, done: false });
    expect(loaderProgress(1999, false, 'phone').done).toBe(false);
    expect(loaderProgress(2000, false, 'phone')).toEqual({ pct: 100, done: true });
  });

  it('desktop stays 2400 / 3500 by default and explicitly', () => {
    expect(loaderProgress(2400, true, 'desktop')).toEqual({ pct: 100, done: true });
    expect(loaderProgress(1500, true).done).toBe(false);
    expect(loaderProgress(3499, false, 'desktop').done).toBe(false);
    expect(loaderProgress(3500, false, 'desktop').done).toBe(true);
  });
});

describe('Loader on phones (< 768px)', () => {
  const realWidth = window.innerWidth;
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true, writable: true });
  });
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: realWidth, configurable: true, writable: true });
  });

  const fake = () =>
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it('forces ready at exactly the 2 s cap', () => {
    fake();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    mount();
    expect(document.documentElement.dataset.introProfile).toBe('phone');
    advance(1999);
    expect(document.documentElement.dataset.intro).toBe('loading');
    advance(1);
    expect(document.documentElement.dataset.intro).toBe('ready');
  });

  it('a resize during the intro does not change the cap', () => {
    fake();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    mount();
    window.innerWidth = 1280;
    window.dispatchEvent(new Event('resize'));
    advance(1999);
    expect(document.documentElement.dataset.intro).toBe('loading');
    expect(document.documentElement.dataset.introProfile).toBe('phone');
    advance(1);
    expect(document.documentElement.dataset.intro).toBe('ready');
  });

  it('desktop (1280px) is still loading at 2 s and ready at 3.5 s', () => {
    window.innerWidth = 1280;
    fake();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    mount();
    expect(document.documentElement.dataset.introProfile).toBe('desktop');
    advance(2000);
    expect(document.documentElement.dataset.intro).toBe('loading');
    advance(1499);
    expect(document.documentElement.dataset.intro).toBe('loading');
    advance(1);
    expect(document.documentElement.dataset.intro).toBe('ready');
  });

  it('a mount after 2 s skips the intro', () => {
    vi.spyOn(performance, 'now').mockReturnValue(2100);
    const { container } = mount();
    expect(container.querySelector('.loader')).toBeNull();
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
  });
});

describe('Loader', () => {
  it('skips when ge-intro-seen is set, on keydown, on pointerdown, and under reduced motion', () => {
    // repeat visit in the same session
    sessionStorage.setItem('ge-intro-seen', '1');
    let r = mount();
    expect(r.container.querySelector('.loader')).toBeNull();
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
    cleanup();

    // any key
    sessionStorage.clear();
    resetIntro();
    r = mount();
    expect(r.container.querySelector('.loader')).not.toBeNull();
    expect(document.documentElement.dataset.intro).toBe('loading');
    expect(intro.ready).toBe(false);
    act(() => {
      fireEvent.keyDown(window, { key: 'a' });
    });
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
    expect(sessionStorage.getItem('ge-intro-seen')).toBe('1');
    cleanup();

    // any click / tap
    sessionStorage.clear();
    resetIntro();
    mount();
    expect(document.documentElement.dataset.intro).toBe('loading');
    act(() => {
      fireEvent.pointerDown(window);
    });
    expect(document.documentElement.dataset.intro).toBe('ready');
    cleanup();

    // prefers-reduced-motion
    sessionStorage.clear();
    resetIntro();
    mockReducedMotion(true);
    r = mount({ capability: 'static', reducedMotion: true, mode: 'dark' });
    expect(r.container.querySelector('.loader')).toBeNull();
    expect(document.documentElement.dataset.intro).toBe('ready');
  });

  it('reveals at the 3.5 s hard cap even if the 3D never loads', () => {
    vi.useFakeTimers();
    mount();
    expect(document.documentElement.dataset.intro).toBe('loading');
    act(() => {
      vi.advanceTimersByTime(3600);
    });
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
    expect(intro.build).toBe(1);
  });

  it('anchors the hard cap to navigation start: a mount after 3.5 s skips the intro', () => {
    vi.spyOn(performance, 'now').mockReturnValue(3600);
    const { container } = mount();
    expect(container.querySelector('.loader')).toBeNull();
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
    expect(intro.build).toBe(1);
    expect(sessionStorage.getItem('ge-intro-seen')).toBe('1');
  });

  it('caps at 3.5 s after navigation, not 3.5 s after mount', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    vi.spyOn(performance, 'now').mockReturnValue(3000); // bundle took 3 s to arrive
    mount();
    expect(document.documentElement.dataset.intro).toBe('loading');
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(document.documentElement.dataset.intro).toBe('loading');
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
  });

  it('exposes a labelled progress bar and keeps the visual parts out of the a11y tree', () => {
    const { container } = mount();
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar).not.toBeNull();
    expect(bar.getAttribute('aria-label')).toBe(t('en', 'loader_progress_aria').replace('{pct}', '0'));
    for (const el of container.querySelectorAll('.loader-pct, .loader-msg, .loader-skip, .loader-bar')) {
      expect(el.getAttribute('aria-hidden')).toBe('true');
    }
    expect(container.querySelector('.loader [tabindex]')).toBeNull();
  });

  it('hero copy is in the DOM before the loader finishes', () => {
    const html = renderToString(<App locale="en" />);
    expect(html).toContain(t('en', 'hero_promise_1'));
    expect(html).toContain(INTRO_SCRIPT.slice(0, 40));

    const { container, getByRole } = render(
      <StageEnvProvider initial={{ capability: 'full', reducedMotion: false, mode: 'dark' }}>
        <Hero locale="en" />
      </StageEnvProvider>,
    );
    expect(document.documentElement.dataset.intro).toBe('loading');
    expect(container.querySelector('.loader')).not.toBeNull();
    const h1 = getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain(t('en', 'hero_promise_1'));
    expect(container.textContent).toContain(t('en', 'hero_cta'));
  });
});

describe('Loader deep links', () => {
  afterEach(() => {
    history.replaceState(null, '', '/');
  });

  it('a first visit to /#contact skips the intro: ready, seen set, no overlay', () => {
    history.replaceState(null, '', '/#contact');
    const { container } = mount();
    expect(container.querySelector('.loader')).toBeNull();
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(intro.ready).toBe(true);
    expect(sessionStorage.getItem('ge-intro-seen')).toBe('1');
  });

  it('#top and #main still play the intro', () => {
    for (const h of ['#top', '#main']) {
      history.replaceState(null, '', `/${h}`);
      sessionStorage.clear();
      resetIntro();
      const { container } = mount();
      expect(container.querySelector('.loader')).not.toBeNull();
      expect(document.documentElement.dataset.intro).toBe('loading');
      cleanup();
    }
  });

  it('the inline script never marks pending on a deep link and records the intro as seen', () => {
    history.replaceState(null, '', '/#work');
    new Function(INTRO_SCRIPT)();
    expect(document.documentElement.dataset.intro).toBe('ready');
    expect(sessionStorage.getItem('ge-intro-seen')).toBe('1');

    delete document.documentElement.dataset.intro;
    sessionStorage.clear();
    history.replaceState(null, '', '/#top');
    new Function(INTRO_SCRIPT)();
    expect(document.documentElement.dataset.intro).toBe('pending');
  });
});
