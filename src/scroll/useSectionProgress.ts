import { useMemo, type MutableRefObject } from 'react';

/**
 * Scroll progress (0–1) through a section, as a mutable ref.
 *
 * - Pinned chapters (`section.chapter--pinned`): 0 when the section top reaches the
 *   viewport top, 1 when its bottom reaches the viewport bottom (the sticky range).
 * - Other chapters: 0 when the section top enters at the viewport bottom, 1 when its
 *   bottom leaves at the viewport top.
 *
 * Written by ScrollTrigger (src/scroll/scrollEngine.ts) on every scroll update, never
 * through React state: read `ref.current` inside useFrame. The same value is mirrored
 * to the section's CSS custom property `--p`. Stays 0 when capability is 'static'.
 */
export function useSectionProgress(id: string): MutableRefObject<number> {
  return useMemo(() => sectionProgressRef(id), [id]);
}

const refs = new Map<string, MutableRefObject<number>>();

/** The one shared progress ref for a section id (created on first use). */
export function sectionProgressRef(id: string): MutableRefObject<number> {
  let r = refs.get(id);
  if (!r) {
    r = { current: 0 };
    refs.set(id, r);
  }
  return r;
}

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

const frozen = new Map<string, number>();

/**
 * Write a section's progress (clamped; NaN → 0) and return the value now in effect,
 * which differs from `value` only while the section is frozen.
 */
export function setSectionProgress(id: string, value: number): number {
  const v = frozen.get(id) ?? clamp01(value);
  sectionProgressRef(id).current = v;
  return v;
}

/**
 * Pin a section's progress to `value`, ignoring scroll writes (used only by the
 * `?still=` capture mode, src/app/stillMode.ts).
 */
export function freezeSectionProgress(id: string, value: number): void {
  frozen.set(id, clamp01(value));
  sectionProgressRef(id).current = clamp01(value);
}

/** Undo freezeSectionProgress for one section, or for all when no id is given. */
export function unfreezeSectionProgress(id?: string): void {
  if (id === undefined) frozen.clear();
  else frozen.delete(id);
}

/**
 * Progress through a pinned section: 0 at `scrollY = top`, 1 at `scrollY = top + height - vh`.
 * A section no taller than the viewport has no range: 0 before its top, 1 from it on.
 * Non-pinned sections use `pinnedProgress(y, top - vh, height + 2 * vh, vh)`.
 */
export function pinnedProgress(scrollY: number, top: number, height: number, vh: number): number {
  const range = height - vh;
  if (!(range > 0)) return scrollY >= top ? 1 : 0;
  return clamp01((scrollY - top) / range);
}
