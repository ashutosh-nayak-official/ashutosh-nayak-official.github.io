import { useEffect } from 'react';
import { useStageDowngrade } from './env';

/**
 * Listen for `webglcontextlost` on the stage canvas. The default is prevented (so the
 * browser may still restore it without a page error) and `onLost` runs; the stage then
 * downgrades to stills rather than trying to rebuild every scene. Returns a cleanup.
 */
export function watchContextLoss(canvas: HTMLElement, onLost: () => void): () => void {
  const handler = (e: Event) => {
    e.preventDefault();
    onLost();
  };
  canvas.addEventListener('webglcontextlost', handler);
  return () => canvas.removeEventListener('webglcontextlost', handler);
}

/** Downgrade the stage to stills (capability 'static') when `canvas` loses its context. */
export function useDowngradeOnContextLoss(canvas: HTMLElement | null | undefined): void {
  const downgrade = useStageDowngrade();
  useEffect(() => (canvas ? watchContextLoss(canvas, downgrade) : undefined), [canvas, downgrade]);
}
