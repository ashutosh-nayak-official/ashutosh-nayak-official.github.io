import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterPageLoad, usePageLoaded } from '../../src/app/afterLoad';

function setReadyState(v: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { value: v, configurable: true });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete (document as { readyState?: unknown }).readyState; // back to jsdom's getter
  delete (window as { requestIdleCallback?: unknown }).requestIdleCallback;
});

describe('afterPageLoad (3D after first paint)', () => {
  it('waits for window load, then an idle moment', () => {
    vi.useFakeTimers();
    setReadyState('interactive');
    const idle: (() => void)[] = [];
    (window as { requestIdleCallback?: unknown }).requestIdleCallback = (cb: () => void) => idle.push(cb);
    const cb = vi.fn();
    afterPageLoad(cb);
    vi.runAllTimers();
    expect(cb).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('load'));
    expect(cb).not.toHaveBeenCalled();
    expect(idle).toHaveLength(1);
    idle[0]();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('runs soon when the page has already loaded (no requestIdleCallback: a timeout)', () => {
    vi.useFakeTimers();
    setReadyState('complete');
    const cb = vi.fn();
    afterPageLoad(cb);
    expect(cb).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('cancel stops it', () => {
    vi.useFakeTimers();
    setReadyState('interactive');
    const cb = vi.fn();
    const cancel = afterPageLoad(cb);
    cancel();
    window.dispatchEvent(new Event('load'));
    vi.runAllTimers();
    expect(cb).not.toHaveBeenCalled();
  });

  it('usePageLoaded is false on first render and true after load', async () => {
    vi.useFakeTimers();
    setReadyState('interactive');
    function Probe() {
      return <output data-testid="v">{String(usePageLoaded())}</output>;
    }
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('v').textContent).toBe('false');
    await act(async () => {
      window.dispatchEvent(new Event('load'));
      vi.runAllTimers();
    });
    expect(getByTestId('v').textContent).toBe('true');
  });
});
