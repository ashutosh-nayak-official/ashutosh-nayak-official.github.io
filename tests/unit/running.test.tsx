import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STOP_GRACE_MS, useRunning } from '../../src/three/useRunning';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useRunning', () => {
  it('starts immediately when a slot becomes visible', () => {
    const { result, rerender } = renderHook(({ v }) => useRunning(v), { initialProps: { v: false } });
    expect(result.current).toBe(false);
    rerender({ v: true });
    expect(result.current).toBe(true);
  });

  it(`keeps running for ${STOP_GRACE_MS} ms after the last slot leaves, then stops`, () => {
    const { result, rerender } = renderHook(({ v }) => useRunning(v), { initialProps: { v: true } });
    rerender({ v: false });
    expect(result.current).toBe(true);
    act(() => {
      vi.advanceTimersByTime(STOP_GRACE_MS - 1);
    });
    expect(result.current).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it('cancels the stop when a slot comes back within the grace period', () => {
    const { result, rerender } = renderHook(({ v }) => useRunning(v), { initialProps: { v: true } });
    rerender({ v: false });
    act(() => {
      vi.advanceTimersByTime(STOP_GRACE_MS / 2);
    });
    rerender({ v: true });
    act(() => {
      vi.advanceTimersByTime(STOP_GRACE_MS * 2);
    });
    expect(result.current).toBe(true);
  });
});
