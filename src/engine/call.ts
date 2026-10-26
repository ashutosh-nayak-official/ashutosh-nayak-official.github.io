/** Pure scroll maths for chapter 02 (one call, step by step). */

export interface CallState {
  /** engine rings unwinding, 0–1 (the engine stops firing signals from 0.7) */
  unwind: number;
  /** sound-wave amplitude, 0–1 */
  wave: number;
  /** how many of the five stops are lit, 0–5 */
  activeStops: number;
}

export const CALL_STOPS = 5;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** Progress through the pinned chapter → engine unwind, wave amplitude and lit stops. */
export function callState(p: number): CallState {
  const q = Number.isFinite(p) ? p : 0;
  return {
    unwind: clamp(2.5 * q),
    wave: clamp(3 * (q - 0.15)),
    activeStops: Math.floor(clamp((q - 0.25) / 0.6) * CALL_STOPS),
  };
}
