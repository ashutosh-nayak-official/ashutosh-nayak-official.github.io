import { afterEach, describe, expect, it } from 'vitest';
import { pinnedProgress, sectionProgressRef, setSectionProgress } from '../../src/scroll/useSectionProgress';
import { focusTargetFor, hashTarget } from '../../src/scroll/hashLinks';

describe('pinnedProgress', () => {
  // section top 1000, height 3000, viewport 1000 -> scroll range 1000..3000
  it.each([
    ['before the section', 0, 1000, 3000, 1000, 0],
    ['at the section top', 1000, 1000, 3000, 1000, 0],
    ['mid', 2000, 1000, 3000, 1000, 0.5],
    ['at the end of the range', 3000, 1000, 3000, 1000, 1],
    ['after the section', 9000, 1000, 3000, 1000, 1],
  ])('%s', (_name, scrollY, top, height, vh, expected) => {
    expect(pinnedProgress(scrollY, top, height, vh)).toBeCloseTo(expected, 6);
  });

  it.each([
    ['zero height, before', 500, 1000, 0, 1000, 0],
    ['zero height, after', 1500, 1000, 0, 1000, 1],
    ['height equal to viewport, at top', 1000, 1000, 1000, 1000, 1],
    ['zero viewport and height', 10, 0, 0, 0, 1],
  ])('%s is finite and clamped', (_name, scrollY, top, height, vh, expected) => {
    const p = pinnedProgress(scrollY, top, height, vh);
    expect(Number.isFinite(p)).toBe(true);
    expect(p).toBe(expected);
  });
});

describe('section progress refs', () => {
  it('returns one stable mutable ref per section id', () => {
    const a = sectionProgressRef('call');
    expect(sectionProgressRef('call')).toBe(a);
    expect(sectionProgressRef('agents')).not.toBe(a);
    expect(a.current).toBe(0);
  });

  it('setSectionProgress clamps and writes the ref', () => {
    setSectionProgress('infra', 0.25);
    expect(sectionProgressRef('infra').current).toBe(0.25);
    setSectionProgress('infra', 7);
    expect(sectionProgressRef('infra').current).toBe(1);
    setSectionProgress('infra', Number.NaN);
    expect(sectionProgressRef('infra').current).toBe(0);
  });
});

describe('hash link targets', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves same-page hash links only', () => {
    document.body.innerHTML = `
      <section id="call"><h2>Call</h2></section>
      <a id="a1" href="#call">x</a>
      <a id="a2" href="https://example.com/#call">x</a>
      <a id="a3" href="#nope">x</a>
      <a id="a4" href="#">x</a>`;
    const a = (id: string) => document.getElementById(id) as HTMLAnchorElement;
    expect(hashTarget(a('a1'))?.id).toBe('call');
    expect(hashTarget(a('a2'))).toBeNull();
    expect(hashTarget(a('a3'))).toBeNull();
    expect(hashTarget(a('a4'))).toBeNull();
  });

  it('focuses the first heading of a section and makes it programmatically focusable', () => {
    document.body.innerHTML = `<section id="call"><p>x</p><h2>Call</h2><h3>Sub</h3></section>`;
    const f = focusTargetFor(document.getElementById('call')!);
    expect(f.tagName).toBe('H2');
    expect(f.getAttribute('tabindex')).toBe('-1');
  });

  it('focuses a target that is already focusable (e.g. main with tabindex -1) directly', () => {
    document.body.innerHTML = `<main id="main" tabindex="-1"><h1>Name</h1></main>`;
    expect(focusTargetFor(document.getElementById('main')!).id).toBe('main');
  });

  it('falls back to the target itself when it has no heading', () => {
    document.body.innerHTML = `<div id="x"><p>no heading</p></div>`;
    const f = focusTargetFor(document.getElementById('x')!);
    expect(f.id).toBe('x');
    expect(f.getAttribute('tabindex')).toBe('-1');
  });
});
