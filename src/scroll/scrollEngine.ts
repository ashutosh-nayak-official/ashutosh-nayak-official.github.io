import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setSectionProgress } from './useSectionProgress';
import { interceptHashLinks } from './hashLinks';

gsap.registerPlugin(ScrollTrigger);

const REFRESH_DEBOUNCE_MS = 200;

/**
 * Re-measure every ScrollTrigger (section progress ranges). Call it after changing
 * layout in a way the ResizeObserver on <main> cannot see, e.g. a chapter changing
 * `--pin-screens` at runtime. Safe to call any time.
 */
export function refreshScroll(): void {
  ScrollTrigger.refresh();
}

/** The live Lenis instance (null when native scroll is in use). */
export let lenis: Lenis | null = null;

/**
 * Loaded after hydration when capability is not 'static'. Lenis drives scrolling
 * (unless `smooth` is false) and feeds ScrollTrigger; one ScrollTrigger per
 * `main section.chapter[id]` writes that section's progress ref and `--p`.
 */
export function startScroll({ smooth }: { smooth: boolean }): () => void {
  const cleanups: (() => void)[] = [];

  if (smooth) {
    const l = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis = l;
    l.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // gsap's default
      l.destroy();
      lenis = null;
    });
  }

  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section.chapter[id]'));
  for (const sec of sections) {
    const pinned = sec.classList.contains('chapter--pinned');
    const write = (p: number) => {
      const v = setSectionProgress(sec.id, p);
      sec.style.setProperty('--p', v.toFixed(4));
    };
    const st = ScrollTrigger.create({
      trigger: sec,
      start: pinned ? 'top top' : 'top bottom',
      end: pinned ? 'bottom bottom' : 'bottom top',
      onUpdate: (self) => write(self.progress),
      onRefresh: (self) => write(self.progress),
    });
    cleanups.push(() => st.kill());
  }

  cleanups.push(
    interceptHashLinks((target) => {
      if (lenis) lenis.scrollTo(target, { offset: offsetFor(target) });
      else target.scrollIntoView({ behavior: 'auto' });
    }),
  );

  // Pinned section heights depend on html[data-capability]; measure after that applied.
  ScrollTrigger.refresh();

  // Re-measure when layout shifts: web fonts swapping in, and any change to main's size
  // (images, chapter content, breakpoints). Debounced so a burst of changes costs one refresh.
  let alive = true;
  document.fonts?.ready.then(() => {
    if (alive) refreshScroll();
  });
  cleanups.push(() => {
    alive = false;
  });
  const main = document.querySelector('main');
  if (main && typeof ResizeObserver !== 'undefined') {
    let t: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(refreshScroll, REFRESH_DEBOUNCE_MS);
    });
    ro.observe(main);
    cleanups.push(() => {
      clearTimeout(t);
      ro.disconnect();
    });
  }
  const hash = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (hash) lenis?.scrollTo(hash, { offset: offsetFor(hash), immediate: true });

  return () => cleanups.reverse().forEach((c) => c());
}

/**
 * Lenis ignores CSS scroll-padding, so apply html's scroll-padding-top (the fixed nav)
 * like a native anchor jump would. Pinned chapters already pad their sticky content
 * below the nav, so they land exactly at their top.
 */
function offsetFor(target: HTMLElement): number {
  if (target.classList.contains('chapter--pinned')) return 0;
  return -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
}
