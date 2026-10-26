import { useEffect } from 'react';
import { useStageEnv } from '../three/env';
import { interceptHashLinks } from './hashLinks';
import { afterPageLoad } from '../app/afterLoad';

/**
 * Scroll driver, rendered once by App (renders nothing).
 * - capability 'static' (reduced motion, no WebGL): native scroll; hash links jump
 *   instantly and move focus to the target heading.
 * - otherwise: loads Lenis + ScrollTrigger (src/scroll/scrollEngine.ts) once the page has
 *   loaded (afterPageLoad), off the first-paint path; native scroll works until then.
 *   Lenis is skipped when reduced motion is on (no smooth scroll).
 */
export function SmoothScroll() {
  const env = useStageEnv();
  const capability = env?.capability;
  const reducedMotion = env?.reducedMotion ?? true;

  useEffect(() => {
    if (!capability) return;
    if (capability === 'static') {
      return interceptHashLinks((target) => target.scrollIntoView({ behavior: 'auto' }));
    }
    let stop: (() => void) | null = null;
    let cancelled = false;
    const cancelWait = afterPageLoad(() => {
      import('./scrollEngine').then(
        (m) => {
          if (!cancelled) stop = m.startScroll({ smooth: !reducedMotion });
        },
        () => {
          /* scroll engine failed to load: native scroll keeps working */
        },
      );
    });
    return () => {
      cancelled = true;
      cancelWait();
      stop?.();
    };
  }, [capability, reducedMotion]);

  return null;
}
