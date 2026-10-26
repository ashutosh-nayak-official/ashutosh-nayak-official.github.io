import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Engine, type EngineProgress } from '../engine/Engine';
import { STAGE_CAMERA } from '../Stage';
import type { SceneProps } from '../SceneSlot';

/** The engine settles: dim, and its rings turn at well under half speed (mockup: t × 0.4). */
const CONTACT_DIM = 0.7;
const CONTACT_TIME_SCALE = 0.4;
/** Fraction of the slot width the outer ring may span on narrow (portrait) slots. */
const FIT = 0.9;

/**
 * 07 · Contact. The Golden Engine, fully built, dim and slow behind the closing line;
 * signals keep firing (off for reduced motion). No scroll choreography.
 *
 * The slot is a centred square on desktop (chapters.css) but narrower than tall on
 * phones; the engine shrinks to fit the slot's width there.
 */
export default function ContactScene({ env }: SceneProps) {
  const progress = useMemo<EngineProgress>(() => ({ build: 1, burst: 0, unwind: 0 }), []);
  const { width, height } = useThree((s) => s.size);
  const halfW = Math.tan(((STAGE_CAMERA.fov / 2) * Math.PI) / 180) * STAGE_CAMERA.position[2] * (width / Math.max(height, 1));
  const scale = Math.min(1, halfW * FIT);

  return (
    <group scale={scale}>
      <Engine
        progress={progress}
        dim={CONTACT_DIM}
        timeScale={CONTACT_TIME_SCALE}
        mode={env.mode}
        signals={!env.reducedMotion}
      />
    </group>
  );
}
