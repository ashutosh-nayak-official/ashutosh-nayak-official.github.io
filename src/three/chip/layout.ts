/**
 * Chapter 04's chip, the AN·1: an original CPU + GPU system-on-chip whose regions
 * light up one by one with scroll. Pure data and maths (no three.js), so the chapter
 * component can type its terminal from the same state the 3D scene draws.
 */
import type { ChipRegion } from '../../engine/palette';
import type { Key } from '../../content/types';

/** The chip's marking. An original design: no third-party logo, name or trademark. */
export const CHIP_MARK = 'AN·1';

/** Every region, including the unified memory packages beside the die. */
export const CHIP_REGIONS: ChipRegion[] = ['cpu', 'eff', 'gpu', 'npu', 'slc', 'io', 'obs', 'net', 'mem'];

/** What each region stands for in his infrastructure work (label keys in the dictionaries). */
export const REGION_LABEL: Record<ChipRegion, Key> = {
  cpu: 'infra_chip_compute',
  eff: 'infra_chip_schedulers',
  slc: 'infra_chip_cache',
  gpu: 'infra_chip_inference',
  npu: 'infra_chip_agents',
  mem: 'infra_chip_memory',
  io: 'infra_chip_cicd',
  obs: 'infra_chip_observability',
  net: 'infra_chip_network',
};

/** Surface detail drawn on top of a block. */
export type BlockDetail = 'core' | 'small' | 'gpu' | 'npu' | 'cache' | 'io';

export interface ChipBlock {
  region: ChipRegion;
  /** die-local 0–1 coordinates, y down (as in the mockup) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** the block's column/row within its region's grid */
  cols: number;
  rows: number;
  /** progress at which this block starts lighting, and its region's end value */
  start: number;
  end: number;
  detail: BlockDetail;
  /** first block of its region (carries the region label) */
  head: boolean;
}

/** How long one block takes to light, in progress units. */
export const LIGHT_RAMP = 0.08;

function grid(
  region: ChipRegion,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cols: number,
  rows: number,
  gap: number,
  start: number,
  end: number,
  detail: BlockDetail,
): ChipBlock[] {
  const out: ChipBlock[] = [];
  const cw = (x1 - x0 - gap * (cols - 1)) / cols;
  const ch = (y1 - y0 - gap * (rows - 1)) / rows;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const k = (i + j * cols) / (cols * rows);
      out.push({
        region,
        x: x0 + i * (cw + gap),
        y: y0 + j * (ch + gap),
        w: cw,
        h: ch,
        cols,
        rows,
        start: start + (end - start) * k * 0.7,
        end,
        detail,
        head: i === 0 && j === 0,
      });
    }
  return out;
}

/** Die floorplan, copied from the mockup's grid(...) calls. */
export const CHIP_LAYOUT: ChipBlock[] = [
  ...grid('cpu', 0.05, 0.06, 0.42, 0.4, 2, 3, 0.018, 0.14, 0.36, 'core'),
  ...grid('eff', 0.05, 0.43, 0.42, 0.51, 4, 1, 0.014, 0.26, 0.4, 'small'),
  ...grid('gpu', 0.46, 0.06, 0.95, 0.55, 4, 4, 0.014, 0.44, 0.7, 'gpu'),
  ...grid('npu', 0.05, 0.55, 0.42, 0.75, 8, 2, 0.01, 0.52, 0.72, 'npu'),
  ...grid('slc', 0.46, 0.59, 0.95, 0.75, 1, 1, 0, 0.36, 0.48, 'cache'),
  ...grid('io', 0.05, 0.8, 0.34, 0.94, 1, 1, 0, 0.78, 0.86, 'io'),
  ...grid('obs', 0.37, 0.8, 0.66, 0.94, 1, 1, 0, 0.82, 0.9, 'io'),
  ...grid('net', 0.69, 0.8, 0.95, 0.94, 1, 1, 0, 0.86, 0.94, 'io'),
];

/** Sequence onsets for the parts that are not die blocks. */
export const POWER_AT = 0.04;
export const MEMORY_AT = 0.64;
export const SHEEN_AT = 0.9;

/**
 * Progress at which each terminal line starts typing, in step with the region it
 * reports: power on, compute (terraform apply), inference (serve llm), agents,
 * CI/CD (pipeline deploy), observability (cloudwatch).
 */
export const TERMINAL_AT = [POWER_AT, 0.14, 0.44, 0.52, 0.78, 0.82];
const TYPE_RAMP = 0.04;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 0 → 1 over LIGHT_RAMP from `at`. */
export const rampOn = (p: number, at: number) => clamp01((p - at) / LIGHT_RAMP);

export interface ChipState {
  /** 0–1 per region: the mean of its blocks' light */
  lit: Record<ChipRegion, number>;
  power: number;
  memory: number;
  sheen: number;
  /** 0 – number of terminal lines; the fraction is the line being typed */
  terminalLines: number;
}

const BLOCK_COUNT = CHIP_LAYOUT.reduce<Record<string, number>>((m, b) => ((m[b.region] = (m[b.region] ?? 0) + 1), m), {});

export function chipState(progress: number): ChipState {
  const p = clamp01(Number.isFinite(progress) ? progress : 0);
  const lit = { cpu: 0, eff: 0, gpu: 0, npu: 0, slc: 0, io: 0, obs: 0, net: 0, mem: 0 } as Record<ChipRegion, number>;
  for (const b of CHIP_LAYOUT) lit[b.region] += rampOn(p, b.start);
  for (const r of Object.keys(BLOCK_COUNT) as ChipRegion[]) lit[r] /= BLOCK_COUNT[r];
  const memory = rampOn(p, MEMORY_AT);
  lit.mem = memory;
  let terminalLines = 0;
  for (const a of TERMINAL_AT) terminalLines += clamp01((p - a) / TYPE_RAMP);
  return { lit, power: rampOn(p, POWER_AT), memory, sheen: rampOn(p, SHEEN_AT), terminalLines };
}

/**
 * Per-line reveal (0–1) for a terminal of lines with the given character lengths,
 * `lines` lines into the sequence: whole lines before it, the partial one quantised to
 * whole characters, nothing after it.
 */
export function terminalTyping(lines: number, lengths: number[]): number[] {
  return lengths.map((len, i) => {
    const f = clamp01(lines - i);
    if (f >= 1 || len <= 0) return f >= 1 ? 1 : 0;
    return Math.floor(f * len) / len;
  });
}
