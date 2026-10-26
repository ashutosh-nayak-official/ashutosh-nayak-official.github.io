import {
  AdditiveBlending,
  Color,
  NormalBlending,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector4,
  type IUniform,
  type Object3D,
  type WebGLRenderer,
} from 'three';
import { spectrum, type Mode } from '../../engine/palette';

/**
 * Engine materials. Every engine shader shares one set of uniforms per engine
 * instance (Spectrum stops, tint angle, dim, viewport), so one write per frame
 * recolours the whole object.
 *
 * Spectrum tint: a linear gradient across the viewport whose direction rotates
 * slowly (mockup `tint()`): stops from the 5-stop Spectrum, mixed over the
 * base colour by `uTintAmt` (dark .62 as in the mockup; light 1, so lines are
 * the crisp, deeper light stops).
 *
 * Colours are linear (THREE.Color) and every fragment ends with
 * `colorspace_fragment`, so the output is correct both straight to screen and
 * into a postprocessing (linear) render target.
 */

export interface SharedUniforms {
  [k: string]: IUniform;
  uStops: IUniform<Color[]>;
  uTintAngle: IUniform<number>;
  uDim: IUniform<number>;
  resolution: IUniform<Vector2>;
  uPixelRatio: IUniform<number>;
  /** 1 while drawing into a linear render target (postprocessing), 0 straight to the sRGB canvas */
  uLinearOut: IUniform<number>;
}

export function createSharedUniforms(mode: Mode): SharedUniforms {
  return {
    uStops: { value: spectrum(mode).map((h) => new Color(h)) },
    uTintAngle: { value: 0 },
    uDim: { value: 1 },
    resolution: { value: new Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uLinearOut: { value: 0 },
  };
}

/** Linear colour from 0-255 sRGB components. */
export function srgb(r: number, g: number, b: number): Color {
  return new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
}

/** Mockup's tint alpha: .62 over the gold base in dark; light draws the deep stops directly. */
export const TINT_AMOUNT: Record<Mode, number> = { dark: 0.62, light: 1 };

const TINT_GLSL = /* glsl */ `
  uniform vec3 uStops[5];
  uniform float uTintAngle;
  uniform float uTintAmt;
  uniform float uDim;
  uniform vec2 resolution;
  uniform float uLinearOut;

  // The mockup composites additively in sRGB. Straight to the canvas, WebGL blends the
  // encoded values too; into a linear target (bloom) faint layers would come out far
  // brighter, so additive alpha is gamma-mapped there: one layer over black then
  // matches the canvas exactly.
  float outAlpha(float a) {
    #ifdef ADDITIVE
      return uLinearOut > 0.5 ? pow(a, 2.2) : a;
    #else
      return a;
    #endif
  }

  vec3 spectrumAt(float u) {
    u = clamp(u, 0.0, 1.0) * 4.0;
    vec3 c = mix(uStops[0], uStops[1], clamp(u, 0.0, 1.0));
    c = mix(c, uStops[2], clamp(u - 1.0, 0.0, 1.0));
    c = mix(c, uStops[3], clamp(u - 2.0, 0.0, 1.0));
    return mix(c, uStops[4], clamp(u - 3.0, 0.0, 1.0));
  }

  // Position along the mockup's rotating gradient: from centre -/+ 0.6*(cos a * w, sin a * h),
  // canvas y pointing down. ndc is viewport-relative, so this works inside any View.
  vec3 applyTint(vec3 base, vec2 ndc) {
    float asp = resolution.x / resolution.y;
    float c = cos(uTintAngle);
    float s = sin(uTintAngle);
    float u = 0.5 + (ndc.x * c * asp * asp - ndc.y * s) / (2.4 * (c * c * asp * asp + s * s));
    return mix(base, spectrumAt(u), uTintAmt);
  }
`;

// ---------- fat lines (screen-space width, instanced segments) ----------

const LINE_VERT = /* glsl */ `
  uniform float linewidth;
  uniform vec2 resolution;
  attribute vec3 instanceStart;
  attribute vec3 instanceEnd;
  attribute vec4 instanceColorStart;
  attribute vec4 instanceColorEnd;
  varying vec4 vCol;
  varying vec2 vUv;
  varying vec3 vClip;
  #ifdef USE_DASH
    attribute float instanceDistanceStart;
    attribute float instanceDistanceEnd;
    varying float vDist;
  #endif

  void main() {
    float aspect = resolution.x / resolution.y;
    vec4 cs = projectionMatrix * (modelViewMatrix * vec4(instanceStart, 1.0));
    vec4 ce = projectionMatrix * (modelViewMatrix * vec4(instanceEnd, 1.0));
    vec2 dir = ce.xy / ce.w - cs.xy / cs.w;
    dir.x *= aspect;
    float len = length(dir);
    dir = len > 1e-6 ? dir / len : vec2(1.0, 0.0);
    vec2 offset = vec2(dir.y, -dir.x);
    dir.x /= aspect;
    offset.x /= aspect;
    if (position.x < 0.0) offset *= -1.0;
    if (position.y < 0.0) offset -= dir;
    else if (position.y > 1.0) offset += dir;
    offset *= linewidth / resolution.y;
    vec4 clip = (position.y < 0.5) ? cs : ce;
    clip.xy += offset * clip.w;
    gl_Position = clip;
    vCol = (position.y < 0.5) ? instanceColorStart : instanceColorEnd;
    vUv = uv;
    vClip = clip.xyw;
    #ifdef USE_DASH
      vDist = (position.y < 0.5) ? instanceDistanceStart : instanceDistanceEnd;
    #endif
  }
`;

const LINE_FRAG = /* glsl */ `
  ${TINT_GLSL}
  uniform float opacity;
  varying vec4 vCol;
  varying vec2 vUv;
  varying vec3 vClip;
  #ifdef USE_DASH
    uniform vec4 uDash;
    uniform float uGapScale;
    uniform float uDashOffset;
    varying float vDist;
  #endif

  void main() {
    if (abs(vUv.y) > 1.0) {
      #ifdef USE_CAPS
        float a = vUv.x;
        float b = vUv.y > 0.0 ? vUv.y - 1.0 : vUv.y + 1.0;
        if (a * a + b * b > 1.0) discard;
      #else
        discard;
      #endif
    }
    #ifdef USE_DASH
      // 4-part canvas dash pattern [dash, gap, dash, gap]; gaps widen on burst.
      float g0 = uDash.y * uGapScale;
      float g1 = uDash.w * uGapScale;
      float x = mod(vDist + uDashOffset, uDash.x + g0 + uDash.z + g1);
      if (!(x < uDash.x || (x > uDash.x + g0 && x < uDash.x + g0 + uDash.z))) discard;
    #endif
    float alpha = vCol.a * opacity * uDim;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(applyTint(vCol.rgb, vClip.xy / vClip.z), outAlpha(alpha));
    #include <colorspace_fragment>
  }
`;

export interface LineOpts {
  width: number;
  mode: Mode;
  caps?: boolean;
  /** [dash, gap, dash, gap] in local distance units */
  dash?: [number, number, number, number];
  tint?: number;
  opacity?: number;
}

export function lineMaterial(shared: SharedUniforms, o: LineOpts): ShaderMaterial {
  const defines: Record<string, string> = modeDefines(o.mode);
  if (o.caps) defines.USE_CAPS = '';
  if (o.dash) defines.USE_DASH = '';
  return new ShaderMaterial({
    defines,
    uniforms: {
      ...shared,
      linewidth: { value: o.width },
      opacity: { value: o.opacity ?? 1 },
      uTintAmt: { value: o.tint ?? TINT_AMOUNT[o.mode] },
      uDash: { value: new Vector4(...(o.dash ?? [1, 0, 0, 0])) },
      uGapScale: { value: 1 },
      uDashOffset: { value: 0 },
    },
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    ...blend(o.mode),
  });
}

// ---------- points (px-sized glows, dots and square ticks) ----------

export type PointShape = 'glow' | 'dot' | 'square';

const POINTS_VERT = /* glsl */ `
  uniform float uPixelRatio;
  attribute vec4 aColor;
  attribute float aSize;
  varying vec4 vCol;
  varying vec3 vClip;
  void main() {
    gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
    gl_PointSize = aSize * uPixelRatio;
    vCol = aColor;
    vClip = gl_Position.xyw;
  }
`;

const POINTS_FRAG = /* glsl */ `
  ${TINT_GLSL}
  uniform float opacity;
  varying vec4 vCol;
  varying vec3 vClip;
  void main() {
    float f = 1.0;
    #if defined(SHAPE_GLOW)
      float d = length(gl_PointCoord - 0.5) * 2.0;
      if (d > 1.0) discard;
      f = 1.0 - d; // canvas radial gradient: colour -> transparent
    #elif defined(SHAPE_DOT)
      float d = length(gl_PointCoord - 0.5) * 2.0;
      f = 1.0 - smoothstep(0.7, 1.0, d);
    #endif
    float alpha = vCol.a * f * opacity * uDim;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(applyTint(vCol.rgb, vClip.xy / vClip.z), outAlpha(alpha));
    #include <colorspace_fragment>
  }
`;

export function pointsMaterial(shared: SharedUniforms, mode: Mode, shape: PointShape, tint?: number): ShaderMaterial {
  return new ShaderMaterial({
    defines: { ...modeDefines(mode), [`SHAPE_${shape.toUpperCase()}`]: '' },
    uniforms: { ...shared, opacity: { value: 1 }, uTintAmt: { value: tint ?? TINT_AMOUNT[mode] } },
    vertexShader: POINTS_VERT,
    fragmentShader: POINTS_FRAG,
    ...blend(mode),
  });
}

// ---------- world-sized radial glow on a quad (core halos; too large for gl_PointSize) ----------

const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vClip;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
    vClip = gl_Position.xyw;
  }
`;

const GLOW_FRAG = /* glsl */ `
  ${TINT_GLSL}
  uniform vec4 uColor;
  varying vec2 vUv;
  varying vec3 vClip;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    if (d > 1.0) discard;
    float alpha = uColor.a * (1.0 - d) * uDim;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(applyTint(uColor.rgb, vClip.xy / vClip.z), outAlpha(alpha));
    #include <colorspace_fragment>
  }
`;

export function glowMaterial(shared: SharedUniforms, mode: Mode, tint?: number): ShaderMaterial {
  return new ShaderMaterial({
    defines: modeDefines(mode),
    uniforms: { ...shared, uColor: { value: new Vector4(1, 1, 1, 0) }, uTintAmt: { value: tint ?? TINT_AMOUNT[mode] } },
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    ...blend(mode),
  });
}

function modeDefines(mode: Mode): Record<string, string> {
  return mode === 'dark' ? { ADDITIVE: '' } : {};
}

/** Dark: additive (the canvas mockup's 'lighter'), bloom-friendly. Light: normal blending on paper. */
function blend(mode: Mode) {
  return {
    transparent: true,
    depthWrite: false,
    blending: mode === 'dark' ? AdditiveBlending : NormalBlending,
    toneMapped: false,
  };
}

const _vp = new Vector4();
/**
 * Keep `resolution` (CSS px of the current viewport, so it is right inside a
 * drei <View>) and the pixel ratio in sync just before each draw.
 */
export function syncViewport(obj: Object3D, shared: SharedUniforms): void {
  obj.onBeforeRender = (renderer: WebGLRenderer) => {
    renderer.getViewport(_vp);
    if (_vp.z > 0 && _vp.w > 0) shared.resolution.value.set(_vp.z, _vp.w);
    shared.uPixelRatio.value = renderer.getPixelRatio();
    shared.uLinearOut.value = renderer.getRenderTarget() ? 1 : 0;
  };
}
