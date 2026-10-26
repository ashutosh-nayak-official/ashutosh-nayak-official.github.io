import { createContext, useContext, useEffect, useRef } from 'react';
import type { Object3D } from 'three';
import type { EngineState } from '../../engine/state';
import type { Mode } from '../../engine/palette';
import type { SharedUniforms } from './materials';

/**
 * World units: the outer ring's radius at rest is 1 (the mockup's R).
 * Mockup lengths given in px were drawn at R ~ 300 px, so PX converts them.
 */
export const PX = 1 / 300;

export interface EngineStats {
  /** bolts currently scheduled or visible */
  liveBolts: number;
  /** bolts spawned since mount */
  spawned: number;
  /** bursts fired since mount */
  bursts: number;
  /** most bolts ever alive that came from the same burst */
  maxLivePerBurst: number;
}

/** Per-frame data, computed once by <Engine> and read by its parts. Mutated in place. */
export interface EngineFrame {
  /** engine time in seconds (speeds up during burst, as in the mockup hero) */
  t: number;
  /** real seconds since mount, drives the Spectrum tint rotation */
  wall: number;
  /** heart breathing clock in seconds (integrated from the clamped frame delta) */
  breathT: number;
  /** signal scheduler clock in ms; advances only while the document is visible */
  clockMs: number;
  build: number;
  burst: number;
  unwind: number;
  state: EngineState;
  /** heart vertices in engine space (32 x 3) */
  heartPos: Float32Array;
  /** heart vertex depth before projection, roughly -1.05 (back) .. 1.05 (front) */
  heartZ: Float32Array;
  /** ring transform objects (index = RINGS index); bolt ends are placed through them */
  rings: Object3D[];
  signals: boolean;
  hidden: boolean;
  /** glow boost, already clamped (engineGlow); 1 = standard, the hero is slightly brighter */
  glow: number;
}

export type Updater = (f: EngineFrame) => void;

export interface EngineCtx {
  mode: Mode;
  shared: SharedUniforms;
  frame: EngineFrame;
  stats: EngineStats;
  rng: () => number;
  register: (order: number, fn: Updater) => () => void;
}

export const EngineContext = createContext<EngineCtx | null>(null);

export function useEngine(): EngineCtx {
  const c = useContext(EngineContext);
  if (!c) throw new Error('Engine parts must be rendered inside <Engine>');
  return c;
}

/** Register a per-frame updater; runs inside <Engine>'s single useFrame in `order`. */
export function useEngineUpdate(order: number, fn: Updater): void {
  const ctx = useEngine();
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => ctx.register(order, (f) => fnRef.current(f)), [ctx, order]);
}

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (u: number) => 1 - Math.pow(1 - u, 3);
