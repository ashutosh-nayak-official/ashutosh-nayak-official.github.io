/**
 * The shared 3D stage: one fixed, full-viewport R3F <Canvas> behind the page that
 * draws every chapter scene into its chapter's slot through drei <View>.
 *
 * ── API for chapter scenes ─────────────────────────────────────────────────────
 *
 * 1. Write the scene as a default-exported component in src/three/scenes/<Name>.tsx:
 *
 *      import type { SceneProps } from '../SceneSlot';
 *      export default function CallScene({ id, env, progress }: SceneProps) {
 *        useFrame(() => { const p = progress.current; ... });   // never setState per frame
 *        return <Engine progress={...} mode={env.mode} signals={!env.reducedMotion} />;
 *      }
 *
 * 2. Mount it from the chapter with a lazy import (keeps three.js out of first paint):
 *
 *      const CallScene = lazy(() => import('../three/scenes/CallScene'));
 *      <SceneSlot id="call" scene={CallScene} />
 *
 *    `scene` must be a module-level `lazy()` constant (never created inside render, or
 *    the scene remounts on every render), and each slot id is unique on the page (the
 *    stage keys scenes by id; a second slot with the same id replaces the first).
 *    The scene renders inside a drei <View> that tracks the slot's `[data-scene]` box
 *    (size/position it in CSS). Nothing renders during SSR/hydration. When capability
 *    is 'static' (reduced motion, no WebGL, or a canvas failure) the slot shows
 *    <Stills>: `/stills/<id>-<mode>.webp` as a decorative img (ids: SCENE_IDS in env.tsx).
 *
 * 3. Inputs a scene can use (all also passed as SceneProps):
 *    - useStageEnv() → { mode: 'dark'|'light', capability: 'full'|'lite'|'static',
 *      reducedMotion }. Mode follows html[data-mode] live; the scene re-renders on change.
 *      Always pass `signals={!env.reducedMotion}` to <Engine>.
 *    - useSectionProgress(id) (src/scroll/useSectionProgress.ts) → MutableRefObject<number>,
 *      0–1 through the section (pinned chapters: the sticky range; others: enter→leave).
 *      Updated by ScrollTrigger; read `.current` in useFrame. Also mirrored to CSS `--p`
 *      on the section. Pinned section length: `--pin-screens` on the section (default 2,
 *      i.e. 2 × 100svh tall → 1 screen of pinned scroll); set it in the chapter CSS.
 *    - refreshScroll() (src/scroll/scrollEngine.ts) re-measures all progress ranges.
 *      Fonts loading and size changes of <main> already trigger it (debounced); call it
 *      yourself only for layout changes those miss (e.g. changing --pin-screens at runtime).
 *      `import { refreshScroll } from '../../scroll/scrollEngine'` is fine in scene code
 *      (scene chunks are lazy already).
 *    - `capability === 'lite'`: phones/low-power; render fewer elements, no extras.
 *
 * 4. Camera & units (STAGE_CAMERA): every View shares the root perspective camera,
 *    fov 35°, at (0, 0, 4.2) looking at the origin, near 0.1, far 20. The Golden Engine's
 *    outer ring has radius 1, so a radius-1 object at the origin fills ~70 % of the slot
 *    height (the mockup framing). Keep scene content near z = 0, within about ±1.5.
 *    drei sets the camera aspect to the slot's aspect. A scene that needs its own camera
 *    can add `<PerspectiveCamera makeDefault …/>` inside itself (it becomes that View's
 *    camera only).
 *
 * 5. Look: dark mode runs Bloom (intensity 0.9, threshold 0.25, mipmapBlur) on the whole
 *    stage, plus a subtle DepthOfField when capability is 'full'. Light mode has no
 *    post effects and no CSS filter: render final light-mode colours directly (the
 *    Engine already does). No lights are set up: add what a scene needs inside it.
 *    Materials should set toneMapped=false or expect NoToneMapping (`flat` canvas).
 *
 * 6. Time: the render loop pauses (frameloop 'never') whenever no slot is near the
 *    viewport, and R3F resets clock.elapsedTime when it restarts. Animate by integrating
 *    `Math.min(delta, 0.1)` from useFrame((state, delta) => …), never by
 *    clock.elapsedTime, so motion neither jumps nor rewinds after a pause.
 *
 * 7. A `webglcontextlost` on the canvas downgrades the stage to stills (capability
 *    'static'), the same path as a canvas failure.
 *
 * 8. The canvas is aria-hidden and pointer-events:none; scenes get no R3F pointer
 *    events (use window listeners, as Engine parallax does). The render loop runs only
 *    while at least one slot is near the viewport and the tab is visible.
 * ────────────────────────────────────────────────────────────────────────────────
 */
import { Component, Suspense, useEffect, useMemo, useState, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { HalfFloatType } from 'three';
import { BloomEffect, DepthOfFieldEffect, EffectComposer, EffectPass } from 'postprocessing';
import { useStageEnv } from './env';
import { useStageSlots, type StageSlot } from './stageStore';
import { useRunning } from './useRunning';
import { useDowngradeOnContextLoss } from './contextLoss';
import { sectionProgressRef } from '../scroll/useSectionProgress';
import type { StageEnv } from './env';

export const STAGE_CAMERA = { fov: 35, position: [0, 0, 4.2] as [number, number, number], near: 0.1, far: 20 };

export default function Stage() {
  const env = useStageEnv();
  const slots = useStageSlots();
  const running = useRunning(slots.some((s) => s.visible));
  // A lost WebGL context (GPU reset, too many contexts) drops the whole stage to stills.
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  useDowngradeOnContextLoss(canvasEl);

  if (!env || env.capability === 'static') return null;
  const lite = env.capability === 'lite';

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        dpr={[1, lite ? 1.25 : 2]}
        frameloop={running ? 'always' : 'never'}
        flat
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={STAGE_CAMERA}
        onCreated={({ gl }) => setCanvasEl(gl.domElement)}
      >
        {slots.map((s) => (
          <SlotView key={s.id} slot={s} env={env} />
        ))}
        {env.mode === 'dark' && <DarkPost full={env.capability === 'full'} />}
        <View.Port />
      </Canvas>
    </div>
  );
}

function SlotView({ slot, env }: { slot: StageSlot; env: StageEnv }) {
  const { Scene, id } = slot;
  const progress = sectionProgressRef(id);
  return (
    <View track={slot.track as MutableRefObject<HTMLElement>} visible={slot.visible}>
      <SceneBoundary id={id}>
        <Suspense fallback={null}>
          <Scene id={id} env={env} progress={progress} />
        </Suspense>
      </SceneBoundary>
    </View>
  );
}

/** One broken scene must not take down the others: it just renders nothing. */
class SceneBoundary extends Component<{ id: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn(`[stage] scene "${this.props.id}" failed`, err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Dark-mode post: the Views render (useFrame priority 1) into the composer's input
 * buffer, which this binds and clears first (priority 0.5); afterwards (priority 1000)
 * the composer runs DepthOfField (full only) and Bloom to the screen.
 *
 * The input buffer is deliberately not multisampled: three resolves an MSAA target
 * after every render() call while the View's scissor test is still on, so pixels
 * outside the current slot would keep stale content from earlier frames.
 */
function DarkPost({ full }: { full: boolean }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { frameBufferType: HalfFloatType, multisampling: 0 });
    if (full) {
      // Focus on the engine plane (camera z). The Engine writes no depth, so its pixels
      // read as the far plane; the wide focus range keeps that blur to a subtle softening,
      // while depth-writing geometry near z = 0 stays sharp.
      c.addPass(
        new EffectPass(camera, new DepthOfFieldEffect(camera, { focusDistance: 4.2, focusRange: 30, bokehScale: 1.2 })),
      );
    }
    c.addPass(
      new EffectPass(
        camera,
        new BloomEffect({ intensity: 0.9, luminanceThreshold: 0.25, luminanceSmoothing: 0.4, mipmapBlur: true }),
      ),
    );
    return c;
  }, [gl, camera, full]);

  useEffect(() => () => composer.dispose(), [composer]);
  // dpr is a dep too: moving the window to another screen changes the drawing-buffer size.
  useEffect(() => composer.setSize(size.width, size.height), [composer, size, dpr]);

  useFrame(() => {
    gl.setRenderTarget(composer.inputBuffer);
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true, true);
  }, 0.5);

  useFrame((state, delta) => {
    // drei Views leave the viewport set to the last slot's rect; the composer's
    // full-screen passes need the whole canvas back.
    gl.setRenderTarget(null);
    gl.setScissorTest(false);
    gl.setViewport(0, 0, state.size.width, state.size.height);
    composer.render(delta);
  }, 1000);

  return null;
}
