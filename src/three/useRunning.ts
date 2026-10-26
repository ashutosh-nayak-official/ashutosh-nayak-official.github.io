import { useEffect, useState } from 'react';

/** Keeps rendering this long after the last slot leaves the viewport, so the canvas clears. */
export const STOP_GRACE_MS = 200;

/**
 * Whether the stage's render loop should run: true as soon as any slot is visible,
 * false only after STOP_GRACE_MS with none visible (a slot returning cancels the stop).
 */
export function useRunning(anyVisible: boolean): boolean {
  const [running, setRunning] = useState(anyVisible);
  useEffect(() => {
    if (anyVisible) {
      setRunning(true);
      return;
    }
    const t = window.setTimeout(() => setRunning(false), STOP_GRACE_MS);
    return () => window.clearTimeout(t);
  }, [anyVisible]);
  return running;
}
