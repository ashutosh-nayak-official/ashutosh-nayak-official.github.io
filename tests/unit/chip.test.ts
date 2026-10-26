import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CHIP_LAYOUT,
  CHIP_MARK,
  CHIP_REGIONS,
  REGION_LABEL,
  chipState,
  terminalTyping,
} from '../../src/three/chip/layout';
import { chipColor, type ChipRegion } from '../../src/engine/palette';
import { site } from '../../src/content/site';
import { LOCALES, t } from '../../src/i18n';

/** First p (step 0.0005) at which `f(p)` reaches 1. */
const full = (f: (p: number) => number) => {
  for (let p = 0; p <= 1; p += 0.0005) if (f(p) >= 1 - 1e-9) return p;
  return Infinity;
};
const lit = (r: ChipRegion) => (p: number) => chipState(p).lit[r];

describe('AN·1 chip layout and state', () => {
  it('regions light in the spec order', () => {
    // Spec order (controller ruling): power .04 → compute .14 → schedulers .26 → cache .36 →
    // inference .44 → agents .52 → memory .64 → CI/CD .78 → observability .82 → network .86 → sheen .90
    const expected: [string, (p: number) => number, number][] = [
      ['power', (p) => chipState(p).power, 0.04],
      ['cpu', lit('cpu'), 0.14],
      ['eff', lit('eff'), 0.26],
      ['slc', lit('slc'), 0.36],
      ['gpu', lit('gpu'), 0.44],
      ['npu', lit('npu'), 0.52],
      ['mem', (p) => chipState(p).memory, 0.64],
      ['io', lit('io'), 0.78],
      ['obs', lit('obs'), 0.82],
      ['net', lit('net'), 0.86],
      ['sheen', (p) => chipState(p).sheen, 0.9],
    ];
    // exact onset: dark at the threshold itself, lit immediately after it
    for (const [name, f, at] of expected) {
      expect(f(at), name).toBe(0);
      expect(f(at + 1e-6), name).toBeGreaterThan(0);
    }
    // and the onsets run strictly in that sequence
    for (let i = 1; i < expected.length; i++) expect(expected[i][2]).toBeGreaterThan(expected[i - 1][2]);
    expect(chipState(0).lit.mem).toBe(chipState(0).memory);

    // Die regions also come fully alive in the spec sequence.
    const fulls = [lit('cpu'), lit('eff'), lit('slc'), lit('gpu'), lit('npu')].map(full);
    for (let i = 1; i < fulls.length; i++) expect(fulls[i], `die region ${i}`).toBeGreaterThan(fulls[i - 1]);
    const late = [lit('io'), lit('obs'), lit('net'), (p: number) => chipState(p).sheen].map(full);
    for (let i = 1; i < late.length; i++) expect(late[i], `late region ${i}`).toBeGreaterThan(late[i - 1]);

    // Everything is dark at 0 and fully lit at 1; lit never decreases with progress.
    const s0 = chipState(0);
    const s1 = chipState(1);
    for (const r of CHIP_REGIONS) {
      expect(s0.lit[r]).toBe(0);
      expect(s1.lit[r]).toBe(1);
    }
    expect([s0.power, s0.memory, s0.sheen, s0.terminalLines]).toEqual([0, 0, 0, 0]);
    expect([s1.power, s1.memory, s1.sheen, s1.terminalLines]).toEqual([1, 1, 1, site.infraTerminal.length]);
    let prev = chipState(0);
    for (let p = 0.01; p <= 1.0001; p += 0.01) {
      const s = chipState(p);
      for (const r of CHIP_REGIONS) expect(s.lit[r]).toBeGreaterThanOrEqual(prev.lit[r]);
      expect(s.terminalLines).toBeGreaterThanOrEqual(prev.terminalLines);
      prev = s;
    }
    // out-of-range progress is clamped
    expect(chipState(-1)).toEqual(chipState(0));
    expect(chipState(2)).toEqual(chipState(1));
  });

  it('terminal lines type in step with the regions they report', () => {
    // line k starts typing exactly when its region starts lighting:
    // power on / terraform → compute / serve llm → inference / agents start → agents /
    // pipeline deploy → CI/CD / cloudwatch → observability
    const starts = [0.04, 0.14, 0.44, 0.52, 0.78, 0.82];
    starts.forEach((a, k) => {
      expect(chipState(a - 0.001).terminalLines, `line ${k}`).toBeLessThanOrEqual(k);
      expect(chipState(a + 0.002).terminalLines, `line ${k}`).toBeGreaterThan(k);
    });
    expect(chipState(0.03).terminalLines).toBe(0);
    expect(chipState(0.13).terminalLines).toBeGreaterThanOrEqual(1);
    expect(chipState(0.13).terminalLines).toBeLessThan(2);
    expect(chipState(0.95).terminalLines).toBe(6);
    // typing: whole lines before the cursor, a partial line at it, nothing after it
    expect(terminalTyping(2.5, [10, 10, 10, 10])).toEqual([1, 1, 0.5, 0]);
    expect(terminalTyping(0, [4, 4])).toEqual([0, 0]);
    // whole characters only (quantised to the line length)
    expect(terminalTyping(0.34, [3])).toEqual([1 / 3]);
  });

  it('every region has a label key and a colour', () => {
    const ids = new Set(CHIP_LAYOUT.map((b) => b.region));
    for (const r of CHIP_REGIONS) if (r !== 'mem') expect(ids.has(r), r).toBe(true);
    expect(CHIP_REGIONS).toHaveLength(9);
    const siteKeys = new Set<string>(site.chipRegions.map((c) => c.labelKey));
    for (const r of CHIP_REGIONS) {
      expect(siteKeys.has(REGION_LABEL[r]), r).toBe(true);
      for (const l of LOCALES) expect(t(l, REGION_LABEL[r]).trim(), `${r}/${l}`).not.toBe('');
      expect(chipColor(r, 'dark')).toMatch(/^#[0-9a-f]{6}$/i);
      expect(chipColor(r, 'light')).toMatch(/^#[0-9a-f]{6}$/i);
    }
    // nine distinct labels, one per region
    expect(new Set(Object.values(REGION_LABEL)).size).toBe(9);
    // layout is in die-local 0–1 coordinates and blocks never overlap
    for (const b of CHIP_LAYOUT) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(1);
      expect(b.y + b.h).toBeLessThanOrEqual(1);
    }
    for (let i = 0; i < CHIP_LAYOUT.length; i++)
      for (let j = i + 1; j < CHIP_LAYOUT.length; j++) {
        const a = CHIP_LAYOUT[i];
        const b = CHIP_LAYOUT[j];
        const overlap = a.x < b.x + b.w - 1e-9 && b.x < a.x + a.w - 1e-9 && a.y < b.y + b.h - 1e-9 && b.y < a.y + a.h - 1e-9;
        expect(overlap, `${a.region}#${i} vs ${b.region}#${j}`).toBe(false);
      }
    // block counts from the mockup's grid() calls
    const count = (r: ChipRegion) => CHIP_LAYOUT.filter((b) => b.region === r).length;
    expect([count('cpu'), count('eff'), count('gpu'), count('npu'), count('slc'), count('io'), count('obs'), count('net')]).toEqual([
      6, 4, 16, 16, 1, 1, 1, 1,
    ]);
  });

  it('region colours are the spec hex values', () => {
    const spec: Record<ChipRegion, string> = {
      cpu: '#ff8a5c', // compute
      eff: '#ffcf6b', // schedulers
      slc: '#ffcf6b', // cache
      gpu: '#e86bff', // inference
      npu: '#7d8cff', // agents
      io: '#55dcff', // CI/CD
      obs: '#55dcff', // observability
      net: '#7d8cff', // network
      mem: '#55dcff', // memory
    };
    for (const r of CHIP_REGIONS) expect(chipColor(r, 'dark'), r).toBe(spec[r]);
    expect(REGION_LABEL).toEqual({
      cpu: 'infra_chip_compute',
      eff: 'infra_chip_schedulers',
      slc: 'infra_chip_cache',
      gpu: 'infra_chip_inference',
      npu: 'infra_chip_agents',
      io: 'infra_chip_cicd',
      obs: 'infra_chip_observability',
      net: 'infra_chip_network',
      mem: 'infra_chip_memory',
    });
  });

  it('the chip is marked AN·1 and no label contains Apple, M1-M9 or a logo glyph', () => {
    expect(CHIP_MARK).toBe('AN·1');
    const banned = /apple|\bM[1-9]\b||™|®/i;
    const texts = [CHIP_MARK];
    for (const l of LOCALES) {
      for (const r of CHIP_REGIONS) texts.push(t(l, REGION_LABEL[r]));
      for (const line of site.infraTerminal) texts.push(t(l, line.textKey));
      texts.push(t(l, 'infra_chip_aria'), t(l, 'infra_headline'), t(l, 'infra_lead'), t(l, 'infra_eyebrow'));
    }
    for (const s of texts) expect(s, s).not.toMatch(banned);
    // nor anywhere in the chip's source
    for (const f of ['src/three/chip/layout.ts', 'src/three/scenes/ChipScene.tsx', 'src/chapters/Infra.tsx', 'src/styles/infra.css']) {
      const src = readFileSync(resolve(__dirname, '../..', f), 'utf8');
      expect(src, f).not.toMatch(banned);
    }
  });
});
