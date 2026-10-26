import { render, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type FrameCb = (state: unknown, delta: number) => void;
const frameCbs: FrameCb[] = [];

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: FrameCb) => {
    frameCbs.push(cb);
  },
}));

import { Engine, type EngineStats, type EngineProgress } from '../../src/three/engine/Engine';

const fakeState = { clock: { elapsedTime: 0 } };

/** Run every captured frame callback `frames` times with a fixed delta (seconds). */
function tick(frames: number, delta = 1 / 60) {
  for (let f = 0; f < frames; f++) {
    // Only the latest render's callbacks are live; earlier ones were from previous renders.
    for (const cb of frameCbs) cb(fakeState, delta);
  }
}

function mount(opts: { progress: EngineProgress; signals: boolean }) {
  frameCbs.length = 0;
  const statsRef: { current: EngineStats | null } = { current: null };
  render(<Engine progress={opts.progress} signals={opts.signals} mode="dark" seed={7} statsRef={statsRef} />);
  return statsRef;
}

let hidden = false;
const realError = console.error;
beforeEach(() => {
  hidden = false;
  // react-dom renders R3F intrinsics (<group>, <primitive>) as unknown tags here; that warning is expected.
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('is unrecognized in this browser')) return;
    realError(...args);
  });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('<Engine> signals', () => {
  it('signals spawn only when signalsAllowed and signals=true', () => {
    // fully built, idle: allowed, but signals prop off
    let stats = mount({ progress: { build: 1, burst: 0, unwind: 0 }, signals: false });
    tick(60 * 15);
    expect(stats.current).not.toBeNull();
    expect(stats.current!.spawned).toBe(0);
    cleanup();

    // signals on, but still building: not allowed
    stats = mount({ progress: { build: 0.6, burst: 0, unwind: 0 }, signals: true });
    tick(60 * 15);
    expect(stats.current!.spawned).toBe(0);
    cleanup();

    // signals on, but breaking apart: not allowed
    stats = mount({ progress: { build: 1, burst: 0.5, unwind: 0 }, signals: true });
    tick(60 * 15);
    expect(stats.current!.spawned).toBe(0);
    cleanup();

    // signals on and allowed: bolts fire
    stats = mount({ progress: { build: 1, burst: 0, unwind: 0 }, signals: true });
    tick(60 * 15);
    expect(stats.current!.spawned).toBeGreaterThan(0);
    expect(stats.current!.bursts).toBeGreaterThan(3);
  });

  it('never more than 2 live bolts per burst', () => {
    const stats = mount({ progress: { build: 1, burst: 0, unwind: 0 }, signals: true });
    let maxLive = 0;
    for (let f = 0; f < 60 * 120; f++) {
      tick(1);
      maxLive = Math.max(maxLive, stats.current!.liveBolts);
    }
    expect(stats.current!.bursts).toBeGreaterThan(20);
    expect(stats.current!.maxLivePerBurst).toBeLessThanOrEqual(2);
    expect(maxLive).toBeLessThanOrEqual(2);
    expect(maxLive).toBeGreaterThan(0);
    // some bursts fire two bolts (p = 0.3), so the cap is actually reached
    expect(stats.current!.maxLivePerBurst).toBe(2);
  });

  it('pauses scheduling while document.hidden', () => {
    const stats = mount({ progress: { build: 1, burst: 0, unwind: 0 }, signals: true });
    tick(60 * 5);
    const before = stats.current!.spawned;
    expect(before).toBeGreaterThan(0);

    hidden = true;
    tick(60 * 30);
    expect(stats.current!.spawned).toBe(before);
    expect(stats.current!.liveBolts).toBe(0);

    hidden = false;
    tick(60 * 10);
    expect(stats.current!.spawned).toBeGreaterThan(before);
  });
});
