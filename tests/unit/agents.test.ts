import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import {
  PHASES,
  PHASE_BOUNDS,
  SCENE_LABELS,
  SPEC_LINES,
  TILE_LABELS,
  agentsState,
  agentsTimeline,
  makeTiles,
  tileState,
} from '../../src/three/agents/state';
import Agents from '../../src/chapters/Agents';
import { LOCALES, t } from '../../src/i18n';
import { INTERNAL_IDS } from './guards';

const sample = (n = 400) => Array.from({ length: n + 1 }, (_, i) => i / n);

describe('chapter 03 agents', () => {
  it('phases advance in order and gates open only at their boundaries', () => {
    expect(PHASES).toEqual(['spec', 'plan', 'build', 'verify', 'ship']);
    let last = -1;
    const lastGates = [false, false, false];
    for (const p of sample()) {
      const s = agentsState(p);
      const i = PHASES.indexOf(s.phase);
      expect(i, `p=${p}`).toBeGreaterThanOrEqual(last); // never goes back
      expect(i - last, `p=${p}`).toBeLessThanOrEqual(1); // never skips a phase
      last = i;
      // Gate 1 opens exactly on entering plan, Gate 2 on entering build, Gate 3 on entering ship.
      expect(s.gates, `p=${p}`).toEqual([i >= 1, i >= 2, i >= 4]);
      s.gates.forEach((g, k) => {
        if (lastGates[k]) expect(g, `gate ${k + 1} re-closed at p=${p}`).toBe(true);
        lastGates[k] = g;
      });
      expect(Number.isInteger(s.specLines)).toBe(true);
      expect(s.specLines).toBeGreaterThanOrEqual(0);
      expect(s.specLines).toBeLessThanOrEqual(SPEC_LINES);
    }
    expect(last).toBe(4);
    expect(agentsState(0)).toEqual({ phase: 'spec', gates: [false, false, false], specLines: 0 });
    expect(agentsState(1)).toEqual({ phase: 'ship', gates: [true, true, true], specLines: SPEC_LINES });

    // Exactly at each boundary, not a hair before.
    const [b1, b2, b3, b4] = PHASE_BOUNDS;
    expect(agentsState(b1 - 1e-6).gates[0]).toBe(false);
    expect(agentsState(b1).phase).toBe('plan');
    expect(agentsState(b1).gates[0]).toBe(true);
    expect(agentsState(b2 - 1e-6).gates[1]).toBe(false);
    expect(agentsState(b2).phase).toBe('build');
    expect(agentsState(b2).gates[1]).toBe(true);
    expect(agentsState(b3).phase).toBe('verify');
    expect(agentsState(b3).gates[2]).toBe(false);
    expect(agentsState(b4 - 1e-6).gates[2]).toBe(false);
    expect(agentsState(b4).phase).toBe('ship');
    expect(agentsState(b4).gates[2]).toBe(true);

    // The spec is fully written before Gate 1 opens.
    expect(agentsState(b1 - 1e-6).specLines).toBe(SPEC_LINES);
    // Out-of-range and NaN inputs clamp.
    expect(agentsState(-3)).toEqual(agentsState(0));
    expect(agentsState(7)).toEqual(agentsState(1));
    expect(agentsState(Number.NaN)).toEqual(agentsState(0));
  });

  it('tile labels are generic nouns only', () => {
    expect([...TILE_LABELS]).toEqual(['api', 'schema', 'ui', 'tests', 'infra', 'docs', 'auth', 'logs', 'perf', 'security']);
    for (const l of TILE_LABELS) expect(l).toMatch(/^[a-z]+$/);
    const tiles = makeTiles(45, 7);
    for (const tile of tiles) expect(TILE_LABELS).toContain(tile.label);
  });

  it('chapter copy states agents never approve, merge or deploy, in every locale', () => {
    expect(t('en', 'agents_limits')).toMatch(/never approve, merge or deploy/);
    expect(t('en', 'agents_lead')).toContain('a mail-service platform');
    for (const l of LOCALES) {
      const html = renderToString(createElement(Agents, { locale: l }));
      const text = html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      expect(text, l).toContain(t(l, 'agents_limits'));
      for (const k of ['agents_gate_1', 'agents_gate_2', 'agents_gate_3'] as const) expect(text, `${l} ${k}`).toContain(t(l, k));
      for (const k of ['spec', 'plan', 'build', 'verify', 'ship'] as const) {
        expect(text, `${l} status ${k}`).toContain(t(l, `agents_status_${k}`));
        // every phase row is in the server HTML (visible without JS)
        expect(html, `${l} row ${k}`).toMatch(new RegExp(`<li data-phase="${k}"><b>`));
      }
      expect(html, l).not.toMatch(INTERNAL_IDS);
    }
  });

  it('no digits appear in the scene labels', () => {
    expect(SCENE_LABELS[0]).toBe('SPEC.md');
    for (const l of SCENE_LABELS) expect(l, l).not.toMatch(/\d/);
    for (const l of TILE_LABELS) expect(SCENE_LABELS).toContain(l);
  });

  it('roughly one in seven tiles fails red once, then retries to done', () => {
    for (const seed of [1, 7, 42]) {
      const tiles = makeTiles(45, seed);
      const failing = tiles.filter((x) => x.fails).length;
      expect(failing / tiles.length).toBeGreaterThan(0.1);
      expect(failing / tiles.length).toBeLessThan(0.18);
      for (const tile of tiles) {
        let redRuns = 0;
        let wasRed = false;
        for (const s of sample(800)) {
          const st = tileState(tile, s);
          if (st.failed && !wasRed) redRuns++;
          wasRed = st.failed;
          expect(st.progress).toBeGreaterThanOrEqual(0);
          expect(st.progress).toBeLessThanOrEqual(1);
        }
        expect(redRuns, `tile ${tile.index}`).toBe(tile.fails ? 1 : 0);
        expect(tileState(tile, 1).done).toBe(true);
        expect(tileState(tile, 0).progress).toBe(0);
      }
    }
    // Small grids still show at least one retry.
    expect(makeTiles(12, 3).some((x) => x.fails)).toBe(true);
  });

  it('timeline sub-progress is monotonic and spans each phase', () => {
    let prev = agentsTimeline(0);
    for (const p of sample()) {
      const tl = agentsTimeline(p);
      for (const k of Object.keys(tl) as (keyof typeof tl)[]) expect(tl[k]).toBeGreaterThanOrEqual(prev[k]);
      prev = tl;
    }
    expect(agentsTimeline(1)).toEqual({ spec: 1, plan: 1, build: 1, verify: 1, ship: 1 });
    expect(agentsTimeline(PHASE_BOUNDS[1]).build).toBe(0);
    expect(agentsTimeline(PHASE_BOUNDS[2]).build).toBe(1);
  });
});
