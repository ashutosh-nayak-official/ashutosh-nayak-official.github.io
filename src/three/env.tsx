import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { detectCapability, type Capability } from '../app/capability';
import type { Mode } from '../app/mode';

/**
 * Client-only environment for the 3D stage. Deliberately free of three.js imports so
 * it can live in the first-paint bundle. See src/three/Stage.tsx for the full API.
 */
export type StageEnv = { mode: Mode; capability: Capability; reducedMotion: boolean };

/** Chapter ids that have a 3D scene (and a still image for the static fallback). */
export const SCENE_IDS = ['top', 'call', 'agents', 'infra', 'contact'] as const;
export type SceneId = (typeof SCENE_IDS)[number];
export const isSceneId = (id: string): id is SceneId => (SCENE_IDS as readonly string[]).includes(id);

type Ctx = { env: StageEnv | null; downgrade: () => void };
const StageEnvContext = createContext<Ctx>({ env: null, downgrade: () => {} });

/** null during SSR and the hydration render; set right after mount. */
export function useStageEnv(): StageEnv | null {
  return useContext(StageEnvContext).env;
}

/** Switch to the static fallback (e.g. WebGL context creation failed). */
export function useStageDowngrade(): () => void {
  return useContext(StageEnvContext).downgrade;
}

const REDUCED = '(prefers-reduced-motion: reduce)';

function readMode(): Mode {
  return document.documentElement.dataset.mode === 'light' ? 'light' : 'dark';
}

function hasWebGL(): boolean {
  if (typeof WebGLRenderingContext === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function detect(reducedMotion: boolean): Capability {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return detectCapability({
    reducedMotion,
    webgl: hasWebGL(),
    cores: nav.hardwareConcurrency || 4,
    memoryGB: nav.deviceMemory,
    width: window.innerWidth,
  });
}

export function StageEnvProvider({ children, initial }: { children: ReactNode; initial?: Partial<StageEnv> }) {
  const [env, setEnv] = useState<StageEnv | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED);
    const compute = () => {
      const reducedMotion = initial?.reducedMotion ?? !!mq?.matches;
      setEnv({
        mode: initial?.mode ?? readMode(),
        capability: initial?.capability ?? detect(reducedMotion),
        reducedMotion,
      });
    };
    compute();
    const onMode = () => setEnv((e) => (e && !initial?.mode ? { ...e, mode: readMode() } : e));
    const mo = new MutationObserver(onMode);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    mq?.addEventListener?.('change', compute);
    return () => {
      mo.disconnect();
      mq?.removeEventListener?.('change', compute);
    };
    // `initial` is a test seam, read once on mount.
  }, []);

  const effective = useMemo(
    () => (env && failed ? { ...env, capability: 'static' as const } : env),
    [env, failed],
  );

  useEffect(() => {
    if (effective) document.documentElement.dataset.capability = effective.capability;
  }, [effective]);

  const downgrade = useCallback(() => setFailed(true), []);
  const value = useMemo(() => ({ env: effective, downgrade }), [effective, downgrade]);
  return <StageEnvContext.Provider value={value}>{children}</StageEnvContext.Provider>;
}
