import { useEffect, useRef, useState } from 'react';
import { safeGet, safeSet } from '../app/storage';
import { useStageEnv } from '../three/env';
import type { Key } from '../content/types';
import { intro } from './introStore';
import { useT, type ChapterProps } from './shared';

/**
 * Phones: viewport narrower than this, the same width test detectCapability uses for
 * 'lite' (src/app/capability.ts: width < 768). Owner decision: phones get a shorter intro.
 */
export const PHONE_MAX_PX = 768;
export type IntroProfile = 'desktop' | 'phone';
export const PHONE_BUILD_MS = 1500;
/** Phone hard cap; hero.css repeats it as the 2 s failsafe in (max-width: 767px). */
export const PHONE_CAP_MS = 2000;
export const introProfile = (): IntroProfile =>
  typeof window !== 'undefined' && window.innerWidth < PHONE_MAX_PX ? 'phone' : 'desktop';

/** Length of the engine's assembly animation. */
export const BUILD_MS = 2400;
const DESKTOP_BUILD_MS = BUILD_MS;
/**
 * Hard cap, measured from navigation start (performance.now() = 0): content reveals by
 * then whatever the 3D is doing, however long the bundle took to arrive. The CSS
 * failsafe in hero.css uses the same 3.5 s.
 */
export const CAP_MS = 3500;
const DESKTOP_CAP_MS = CAP_MS;
const SEEN = 'ge-intro-seen';
const REDUCED = '(prefers-reduced-motion: reduce)';
/** Hashes that point at the top of the page: they still get the intro. */
const TOP_HASHES = ['', '#', '#top', '#main'];
/**
 * A first visit straight to a section (/#contact, /#work) skips the intro: the visitor
 * asked for that section, so the overlay must not stand in the way.
 */
export const isDeepLink = (hash: string): boolean => !TOP_HASHES.includes(hash);
/** How long the overlay takes to fade before it unmounts. */
const FADE_MS = 900;

/**
 * Counter for the assembly loader. The build runs 0→100 over BUILD_MS, holds at 99
 * until the assets are loaded, and is done at BUILD_MS with assets or at CAP_MS anyway.
 */
export function loaderProgress(
  elapsedMs: number,
  assetsLoaded: boolean,
  profile: IntroProfile = 'desktop',
): { pct: number; done: boolean } {
  const buildMs = profile === 'phone' ? PHONE_BUILD_MS : DESKTOP_BUILD_MS;
  const capMs = profile === 'phone' ? PHONE_CAP_MS : DESKTOP_CAP_MS;
  const e = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const done = (assetsLoaded && e >= buildMs) || e >= capMs;
  if (done) return { pct: 100, done };
  const raw = Math.min(100, (e / buildMs) * 100);
  return { pct: assetsLoaded ? raw : Math.min(99, raw), done };
}

const STATUS: [number, Key][] = [
  [0, 'loader_initialising'],
  [20, 'loader_orchestrator'],
  [45, 'loader_shaping'],
  [70, 'loader_aligning'],
  [99.5, 'loader_ready'],
];
const statusKey = (pct: number): Key => STATUS.filter(([at]) => pct >= at).pop()![1];

/**
 * Runs before first paint (inline in the prerendered HTML): if the intro will play,
 * mark html[data-intro="pending"] so the CSS holds the hero copy and shows the
 * overlay instead of flashing the copy first. Without JS nothing is marked and the
 * page is fully visible; a CSS failsafe reveals the copy if the bundle never runs.
 */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement,h=location.hash;if(${JSON.stringify(TOP_HASHES).replace(/"/g, "'")}.indexOf(h)<0){try{sessionStorage.setItem('${SEEN}','1')}catch(e){}d.dataset.intro='ready';return}var s=null;try{s=sessionStorage.getItem('${SEEN}')}catch(e){}var r=window.matchMedia&&window.matchMedia('${REDUCED}').matches;if(!s&&!r)d.dataset.intro='pending'}catch(e){}})();`;

function session(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

type Phase = 'pending' | 'loading' | 'done' | 'gone';

/**
 * The assembly loader: a counter 000→100 and one status line over the page while the
 * hero engine builds. The overlay is decorative and click-through; only a progress
 * bar is exposed to assistive tech. The hero copy stays in the DOM throughout.
 */
export default function Loader({ locale }: ChapterProps) {
  const tr = useT(locale);
  const env = useStageEnv();
  const [phase, setPhase] = useState<Phase>('pending');
  const pctEl = useRef<HTMLParagraphElement>(null);
  const msgEl = useRef<HTMLParagraphElement>(null);
  const barEl = useRef<HTMLDivElement>(null);
  const srEl = useRef<HTMLDivElement>(null);
  const finishRef = useRef<() => void>(() => {});

  const ariaLabel = (n: number) => tr('loader_progress_aria').replace('{pct}', String(n));

  useEffect(() => {
    const root = document.documentElement;
    let finished = false;
    let raf = 0;
    let fade = 0;
    const timers: number[] = [];
    const events = ['pointerdown', 'keydown', 'wheel'] as const;
    const skip = () => finish(false);

    function cleanupLoop() {
      events.forEach((e) => window.removeEventListener(e, skip));
      if (raf) cancelAnimationFrame(raf);
      timers.forEach((id) => clearTimeout(id));
    }

    function finish(instant: boolean) {
      if (finished) return;
      finished = true;
      cleanupLoop();
      intro.ready = true;
      intro.build = 1;
      safeSet(session(), SEEN, '1');
      root.dataset.intro = 'ready';
      if (instant) {
        setPhase('gone');
      } else {
        setPhase('done');
        fade = window.setTimeout(() => setPhase('gone'), FADE_MS);
      }
    }
    finishRef.current = () => finish(true);

    const reduced = !!window.matchMedia?.(REDUCED)?.matches;
    // Time left until the cap, counted from navigation start, not from this mount.
    const profile = introProfile();
    root.dataset.introProfile = profile;
    const cap = profile === 'phone' ? PHONE_CAP_MS : CAP_MS;
    const remaining = cap - performance.now();
    // Bundle arrived after the cap (slow connection): no intro at all.
    // Deep link (/#contact): treated as already seen.
    if (safeGet(session(), SEEN) || reduced || isDeepLink(window.location.hash) || !(remaining > 0)) {
      finish(true);
      return () => clearTimeout(fade);
    }

    intro.ready = false;
    intro.build = 0;
    root.dataset.intro = 'loading';
    setPhase('loading');
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));

    const start = performance.now();
    let shown = -1;
    let status: Key | null = null;
    const tick = () => {
      if (finished) return;
      const now = performance.now();
      const p = loaderProgress(now - start, intro.assetsLoaded, profile);
      const done = p.done || now >= cap;
      const pct = done ? 100 : p.pct;
      intro.build = pct / 100;
      const n = Math.floor(pct);
      if (n !== shown) {
        shown = n;
        if (pctEl.current) pctEl.current.textContent = String(n).padStart(3, '0');
        if (barEl.current) barEl.current.style.width = `${n}%`;
        if (srEl.current) {
          srEl.current.setAttribute('aria-valuenow', String(n));
          srEl.current.setAttribute('aria-label', ariaLabel(n));
        }
        const k = statusKey(pct);
        if (k !== status && msgEl.current) {
          status = k;
          msgEl.current.textContent = tr(k);
        }
      }
      if (done) finish(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // rAF stops in background tabs; the hard cap must hold anyway.
    timers.push(window.setTimeout(() => finish(false), remaining));

    return () => {
      cleanupLoop();
      clearTimeout(fade);
      // Unmounted mid-intro (e.g. tests, locale switch): never leave the page hidden.
      if (!finished) {
        intro.ready = true;
        intro.build = 1;
        root.dataset.intro = 'ready';
      }
    };
    // runs once per mount; strings come from the mount-time locale
  }, []);

  // No WebGL (and so no engine to assemble): reveal immediately, stills take over.
  useEffect(() => {
    if (env?.capability === 'static') finishRef.current();
  }, [env]);

  if (phase === 'gone') return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <div className={`loader loader--${phase}`}>
        <div className="loader-bar" ref={barEl} aria-hidden="true" />
        <p className="loader-msg" ref={msgEl} aria-hidden="true">
          {tr('loader_initialising')}
        </p>
        <p className="loader-pct" ref={pctEl} aria-hidden="true">
          000
        </p>
        <p className="loader-skip" aria-hidden="true">
          {tr('loader_skip')}
        </p>
        {phase !== 'pending' && (
          <div
            ref={srEl}
            className="sr-only"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            aria-label={ariaLabel(0)}
          />
        )}
      </div>
    </>
  );
}
