import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { refresh, lagSmoothing } = vi.hoisted(() => ({ refresh: vi.fn(), lagSmoothing: vi.fn() }));

vi.mock('gsap', () => ({
  gsap: { registerPlugin: () => {}, ticker: { add: () => {}, remove: () => {}, lagSmoothing } },
}));
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { create: () => ({ kill: () => {} }), refresh, update: () => {} },
}));
vi.mock('lenis', () => ({
  default: class {
    on() {}
    raf() {}
    destroy() {}
    scrollTo() {}
  },
}));

type ROCb = () => void;
const observers: FakeRO[] = [];
class FakeRO {
  targets: Element[] = [];
  disconnected = false;
  cb: ROCb;
  constructor(cb: ROCb) {
    this.cb = cb;
    observers.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
}

import { refreshScroll, startScroll } from '../../src/scroll/scrollEngine';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('ResizeObserver', FakeRO);
  document.body.innerHTML = '<main><section class="chapter" id="call"></section></main>';
  refresh.mockClear();
  lagSmoothing.mockClear();
  observers.length = 0;
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('scroll engine re-measuring', () => {
  it('refreshes ScrollTrigger once fonts are ready', async () => {
    let resolveFonts!: () => void;
    const ready = new Promise<void>((r) => (resolveFonts = r));
    Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
    const stop = startScroll({ smooth: false });
    refresh.mockClear();
    resolveFonts();
    await ready;
    await Promise.resolve();
    expect(refresh).toHaveBeenCalledTimes(1);
    stop();
  });

  it('refreshes (debounced) when main resizes and disconnects on cleanup', () => {
    const stop = startScroll({ smooth: false });
    const ro = observers.find((o) => o.targets.includes(document.querySelector('main')!));
    expect(ro).toBeDefined();
    refresh.mockClear();
    ro!.cb();
    ro!.cb();
    ro!.cb();
    expect(refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(refresh).toHaveBeenCalledTimes(1);
    stop();
    expect(ro!.disconnected).toBe(true);
  });

  it('refreshScroll() re-measures on demand', () => {
    refreshScroll();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('restores gsap lag smoothing on cleanup when Lenis was running', () => {
    const stop = startScroll({ smooth: true });
    expect(lagSmoothing).toHaveBeenLastCalledWith(0);
    stop();
    expect(lagSmoothing).toHaveBeenLastCalledWith(500, 33);
  });
});
