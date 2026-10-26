import type { Mode } from './mode';
import { isSceneId, type SceneId } from '../three/env';
import { freezeSectionProgress, unfreezeSectionProgress } from '../scroll/useSectionProgress';

/**
 * Still-capture mode, used only by scripts/capture-stills.mjs to render the static
 * fallback images (`public/stills/<id>-<mode>.webp`) and the Open Graph image from the
 * real scenes. It is inert unless the URL carries `?still=<id>`:
 *
 *   ?still=<top|call|agents|infra|contact>&mode=<dark|light>   one chapter's scene
 *   ?still=og                                                  hero + name/promise, dark
 *
 * It pins the chapter's progress to a representative value, hides the DOM chrome
 * (html[data-still], src/styles/still.css), scrolls the chapter into view and, once
 * the scene has had time to settle, sets `window.__stillReady = true`. No visible UI.
 */
export const STILL_PROGRESS: Record<SceneId, number> = { top: 0, call: 0.9, agents: 1, infra: 1, contact: 0 };

export type StillRequest = {
  /** what is captured: a scene id, or 'og' (the hero with its copy) */
  id: SceneId | 'og';
  /** the chapter / scene that is shown */
  scene: SceneId;
  mode: Mode;
  progress: number;
};

/** Parse `location.search`; null (inert) unless it asks for a known still. */
export function parseStillMode(search: string): StillRequest | null {
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(search);
  } catch {
    return null;
  }
  const id = q.get('still');
  if (!id) return null;
  const m = q.get('mode') ?? 'dark';
  if (m !== 'dark' && m !== 'light') return null;
  if (id === 'og') return { id: 'og', scene: 'top', mode: 'dark', progress: STILL_PROGRESS.top };
  if (!isSceneId(id)) return null;
  return { id, scene: id, mode: m, progress: STILL_PROGRESS[id] };
}

/** How long the scene runs, in view, before the shot (rings settle, a signal or two). */
const SETTLE_MS = 2500;
const POLL_MS = 100;

declare global {
  interface Window {
    __stillReady?: boolean;
  }
}

/** Enter still mode (call before hydration). Returns a cleanup (tests). */
export function applyStillMode(req: StillRequest): () => void {
  const root = document.documentElement;
  root.dataset.mode = req.mode;
  root.dataset.still = req.id;
  freezeSectionProgress(req.scene, req.progress);
  window.__stillReady = false;

  let since = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tick = () => {
    const section = document.getElementById(req.scene);
    const canvas = document.querySelector('.stage canvas');
    if (section && canvas) {
      // Pinned chapters: their sticky screen sits at the section top. Others: centred.
      const r = section.getBoundingClientRect();
      const pinned = section.classList.contains('chapter--pinned');
      const y = pinned ? r.top : r.top + r.height / 2 - window.innerHeight / 2;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const to = Math.min(Math.max(0, window.scrollY + y), Math.max(0, max));
      if (Math.abs(to - window.scrollY) > 1) {
        window.scrollTo(0, to);
        since = 0; // moved: let the scene settle in its final place
      }
      if (!since) since = Date.now();
      if (Date.now() - since >= SETTLE_MS) {
        window.__stillReady = true;
        return;
      }
    }
    timer = setTimeout(tick, POLL_MS);
  };
  timer = setTimeout(tick, POLL_MS);

  return () => {
    clearTimeout(timer);
    unfreezeSectionProgress(req.scene);
    delete root.dataset.still;
  };
}
