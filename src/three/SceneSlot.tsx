import { useEffect, useState, type ComponentType, type MutableRefObject } from 'react';
import { useVisibility } from '../app/useVisibility';
import { isSceneId, useStageEnv, type StageEnv } from './env';
import { registerSlot, setSlotVisible } from './stageStore';
import { Stills } from './Stills';

/** Props every chapter scene component receives (see the API notes in Stage.tsx). */
export type SceneProps = {
  /** the chapter / slot id, e.g. 'top' */
  id: string;
  /** mode, capability and reducedMotion; also available via useStageEnv() */
  env: StageEnv;
  /** 0–1 scroll progress of the chapter section; same ref as useSectionProgress(id) */
  progress: MutableRefObject<number>;
};

/**
 * The chapter's 3D mount point: an empty, decorative, absolutely positioned box
 * (`[data-scene]`, styled by `.scene-slot` + the chapter CSS) that the shared canvas
 * draws `scene` into. Pass a `React.lazy` component so three.js stays out of the
 * first-paint bundle. On capability 'static' it shows the chapter still instead.
 * Before hydration finishes (and in SSR) it renders only the empty box. A chapter that
 * shows its still elsewhere (chapter 04, inside its chip frame) passes `still={false}`.
 */
export function SceneSlot({
  id,
  scene,
  still = true,
}: {
  id: string;
  scene?: ComponentType<SceneProps>;
  still?: boolean;
}) {
  const env = useStageEnv();
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const live = !!env && env.capability !== 'static' && !!scene;
  // Start drawing a little before the slot scrolls into view.
  const visible = useVisibility(live ? el : null, '25% 0px');

  useEffect(() => {
    if (!live || !el || !scene) return;
    return registerSlot({ id, track: { current: el }, Scene: scene, visible: false });
  }, [live, el, scene, id]);

  useEffect(() => {
    if (live) setSlotVisible(id, visible);
  }, [live, id, visible, el, scene]);

  return (
    <div ref={setEl} data-scene={id} aria-hidden="true" className="scene-slot">
      {still && env?.capability === 'static' && isSceneId(id) && <Stills id={id} mode={env.mode} />}
    </div>
  );
}
