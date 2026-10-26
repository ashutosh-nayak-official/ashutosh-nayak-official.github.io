import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import type { Group } from 'three';
import { Engine, type EngineProgress } from '../engine/Engine';
import { HERO_GLOW } from '../../engine/glow';
import { useSectionProgress } from '../../scroll/useSectionProgress';
import { intro, markAssetsLoaded } from '../../chapters/introStore';
import type { SceneProps } from '../SceneSlot';

/** How fast the build completes after the loader is skipped or finishes (per second). */
const SETTLE_RATE = 2.5;
/** Breakout swell of the whole engine at full scroll (mockup: R × (1 + burst × 0.15)). */
const BURST_SWELL = 0.15;

/**
 * 00 · Hero. The Golden Engine assembles while the loader counts (build fed from the
 * intro store), then the hero's scroll progress drives the breakout (burst).
 *
 * Placement is CSS: the slot is centred during the intro and slides right on ready
 * (src/styles/hero.css). On narrow viewports the slot sits centred behind the copy,
 * but slot opacity never reaches the shared canvas, so the scene dims and shrinks the
 * engine itself to keep the text legible.
 */
export default function HeroScene({ env }: SceneProps) {
  const burst = useSectionProgress('top');
  const width = useThree((s) => s.size.width);
  // The Open Graph capture (?still=og) shows the engine at full intensity in a small
  // slot beside the copy, so the narrow-slot dimming does not apply there.
  const og = document.documentElement.dataset.still === 'og';
  const narrow = !og && width < 768;
  const compact = !og && width <= 860;
  const dim = narrow ? 0.45 : compact ? 0.55 : 1;
  const baseScale = narrow ? 0.88 : 1;

  // Asset loading as drei sees it (three's DefaultLoadingManager); the engine is
  // procedural, so in practice this is "the scene chunk is up and nothing is pending".
  const { active } = useProgress();
  const loading = useRef(active);
  loading.current = active;

  const live = useMemo(
    () => ({ current: { build: intro.ready ? 1 : intro.build, burst: 0, unwind: 0 } as EngineProgress }),
    [],
  );
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    // First rendered frame with nothing pending: the loader may complete.
    if (!intro.assetsLoaded && !loading.current) markAssetsLoaded();

    const p = live.current;
    if (intro.ready) p.build = p.build >= 1 ? 1 : Math.min(1, p.build + dt * SETTLE_RATE);
    else p.build = intro.build;
    p.burst = burst.current;

    const g = group.current;
    if (g) g.scale.setScalar(baseScale * (1 + p.burst * BURST_SWELL));
  });

  return (
    <group ref={group}>
      <Engine progress={live} dim={dim} mode={env.mode} signals={!env.reducedMotion} glow={HERO_GLOW} parallax />
    </group>
  );
}
