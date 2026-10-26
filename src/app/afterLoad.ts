import { useEffect, useState } from 'react';

/** Longest wait for an idle moment once the page has loaded. */
export const IDLE_TIMEOUT_MS = 300;

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Calls `cb` once the page has finished loading (window `load`: the prerendered text,
 * its CSS and fonts are in) and the main thread has an idle moment. Used to keep the
 * 3D stage and the scroll engine off the first-paint critical path (spec §7–8: text
 * first, 3D after). Returns a cancel function.
 */
export function afterPageLoad(cb: () => void): () => void {
  const w = window as IdleWindow;
  let cancelled = false;
  let idle: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    if (!cancelled) cb();
  };
  const whenIdle = () => {
    if (cancelled) return;
    if (w.requestIdleCallback) idle = w.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    else timer = setTimeout(run, 0);
  };
  const onLoad = () => whenIdle();

  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', onLoad, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener('load', onLoad);
    if (idle !== undefined) w.cancelIdleCallback?.(idle);
    clearTimeout(timer);
  };
}

/** False until afterPageLoad fires (always false during SSR and the hydration render). */
export function usePageLoaded(): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => afterPageLoad(() => setLoaded(true)), []);
  return loaded;
}
