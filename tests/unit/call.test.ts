import { createElement } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { callState } from '../../src/engine/call';
import OneCall from '../../src/chapters/OneCall';
import { site } from '../../src/content/site';
import { LOCALES, t } from '../../src/i18n';
import { sectionProgressRef } from '../../src/scroll/useSectionProgress';

describe('chapter 02 one call', () => {
  it('callState maps progress to unwind, wave and lit stops', () => {
    const cases: [number, number, number, number][] = [
      // p, unwind, wave, activeStops
      [0, 0, 0, 0],
      [0.2, 0.5, 0.15, 0],
      [0.5, 1, 1, 2],
      [0.85, 1, 1, 5],
      [1, 1, 1, 5],
    ];
    for (const [p, unwind, wave, activeStops] of cases) {
      const s = callState(p);
      expect(s.unwind, `unwind @${p}`).toBeCloseTo(unwind, 9);
      expect(s.wave, `wave @${p}`).toBeCloseTo(wave, 9);
      expect(s.activeStops, `activeStops @${p}`).toBe(activeStops);
    }
  });

  it('callState clamps out-of-range progress and only ever lights 0-5 stops, monotonically', () => {
    expect(callState(-1)).toEqual({ unwind: 0, wave: 0, activeStops: 0 });
    expect(callState(2)).toEqual({ unwind: 1, wave: 1, activeStops: 5 });
    let last = 0;
    for (let i = 0; i <= 1000; i++) {
      const n = callState(i / 1000).activeStops;
      expect(Number.isInteger(n) && n >= last && n <= 5).toBe(true);
      last = n;
    }
  });
});

describe('chapter 02 stop cards', () => {
  afterEach(() => {
    cleanup();
    sectionProgressRef('call').current = 0;
  });

  const scrollTo = async (p: number) => {
    sectionProgressRef('call').current = p;
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
  };

  it('shows every stop without JS progress and marks none current', () => {
    const { container } = render(createElement(OneCall, { locale: 'en' }));
    const stops = container.querySelectorAll('#call .stop');
    expect(stops).toHaveLength(5);
    site.voiceStops.forEach((s, i) => {
      expect(stops[i].textContent).toContain(t('en', s.titleKey));
      expect(stops[i].textContent).toContain(t('en', s.bodyKey));
    });
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
    expect(container.querySelector('#call .langs')!.textContent).toBe(t('en', 'voice_languages'));
  });

  it('lights stops in turn as progress grows: lit cards get data-lit, the newest gets aria-current="step"', async () => {
    const { container } = render(createElement(OneCall, { locale: 'en' }));
    const stops = () => Array.from(container.querySelectorAll('#call .stop'));
    const current = () => stops().map((s) => s.getAttribute('aria-current'));
    const lit = () => stops().map((s) => s.hasAttribute('data-lit'));

    await scrollTo(0.5); // 2 lit
    expect(lit()).toEqual([true, true, false, false, false]);
    expect(current()).toEqual([null, 'step', null, null, null]);

    await scrollTo(1); // all 5 lit
    expect(lit()).toEqual([true, true, true, true, true]);
    expect(current()).toEqual([null, null, null, null, 'step']);

    await scrollTo(0.1); // back to none
    expect(lit()).toEqual([false, false, false, false, false]);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
  });

  it('monitoring panel has labels only, no numbers', () => {
    for (const l of LOCALES) {
      const { container, unmount } = render(createElement(OneCall, { locale: l }));
      const monitor = container.querySelector('#call .monitor')!;
      expect(monitor.textContent!.length).toBeGreaterThan(0);
      expect(monitor.textContent, l).not.toMatch(/\d/);
      unmount();
    }
  });
});
