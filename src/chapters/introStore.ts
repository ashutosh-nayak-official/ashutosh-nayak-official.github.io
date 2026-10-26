/**
 * Shared, frame-readable state of the intro (assembly loader). Written by the DOM
 * <Loader> (src/chapters/Loader.tsx), read every frame by the hero scene. Free of
 * three.js so it can sit in the first-paint bundle.
 *
 * Defaults describe "no intro running" (SSR, skipped intro, tests): fully built, ready.
 */
export const intro = {
  /** 0–1 engine build fed by the loader counter */
  build: 1,
  /** true once the loader has finished or was skipped; the scene then completes the build */
  ready: true,
  /** set by the hero scene once three.js, the scene and its assets are up */
  assetsLoaded: false,
};

export function markAssetsLoaded(): void {
  intro.assetsLoaded = true;
}

/** Test seam: back to the defaults. */
export function resetIntro(): void {
  intro.build = 1;
  intro.ready = true;
  intro.assetsLoaded = false;
}
