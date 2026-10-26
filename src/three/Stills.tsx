import { useState } from 'react';
import type { Mode } from '../app/mode';
import type { SceneId } from './env';

/** The still image of a scene: `/stills/<id>-<mode>.webp` (scripts/capture-stills.mjs). */
export function stillSrc(id: SceneId, mode: Mode): string {
  return `${import.meta.env.BASE_URL}stills/${id}-${mode}.webp`;
}

/**
 * Load state of a scene still. `failed` turns true when the image errors and resets
 * when the src changes (e.g. a mode change tries again). Lets a container that exists
 * only to frame the still (chapter 04's chip frame) hide itself when there is none.
 */
export function useStill(id: SceneId, mode: Mode): { src: string; failed: boolean; onError: () => void } {
  const src = stillSrc(id, mode);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return { src, failed: failedSrc === src, onError: () => setFailedSrc(src) };
}

/** The decorative <img> of a still (alt=""), lazily loaded. */
export function StillImg({ src, onError }: { src: string; onError: () => void }) {
  return (
    <img
      className="scene-still"
      src={src}
      alt=""
      decoding="async"
      loading="lazy"
      draggable={false}
      onError={onError}
    />
  );
}

/**
 * Static fallback for a chapter scene: a decorative still of the real scene. An image
 * that fails to load is unmounted (not just `hidden`, which author CSS like
 * `display:block` would beat), so it never shows a broken-image box.
 */
export function Stills({ id, mode }: { id: SceneId; mode: Mode }) {
  const still = useStill(id, mode);
  if (still.failed) return null;
  return <StillImg src={still.src} onError={still.onError} />;
}
