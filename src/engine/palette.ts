export type Mode = 'dark' | 'light';
/** compute, schedulers, inference, agents, cache, CI/CD, observability, network, memory */
export type ChipRegion = 'cpu' | 'eff' | 'gpu' | 'npu' | 'slc' | 'io' | 'obs' | 'net' | 'mem';

const SPECTRUM: Record<Mode, string[]> = {
  dark: ['#ffcf6b', '#ff8a5c', '#e86bff', '#7d8cff', '#55dcff'],
  light: ['#c98a12', '#e0532f', '#b532d6', '#4a5ee8', '#0e9fc9'],
};

export function spectrum(mode: Mode): string[] {
  return [...SPECTRUM[mode]];
}

/**
 * Chip region colours. Dark values are from the spec; light values are the dark
 * hex with HSL lightness reduced by 18 points:
 *   #ff8a5c -> #ff4800   #ffcf6b -> #ffb10f   #e86bff -> #da0fff
 *   #7d8cff -> #213bff   #55dcff -> #00c5f8
 */
const CHIP: Record<ChipRegion, [string, string]> = {
  cpu: ['#ff8a5c', '#ff4800'],
  eff: ['#ffcf6b', '#ffb10f'],
  slc: ['#ffcf6b', '#ffb10f'],
  gpu: ['#e86bff', '#da0fff'],
  npu: ['#7d8cff', '#213bff'],
  io: ['#55dcff', '#00c5f8'],
  obs: ['#55dcff', '#00c5f8'],
  net: ['#7d8cff', '#213bff'],
  mem: ['#55dcff', '#00c5f8'],
};

export function chipColor(region: ChipRegion, mode: Mode): string {
  return CHIP[region][mode === 'dark' ? 0 : 1];
}
