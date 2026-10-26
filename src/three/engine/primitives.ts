import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Float32BufferAttribute,
  InstancedBufferGeometry,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Mesh,
  PlaneGeometry,
  Points,
  type Color,
  type ShaderMaterial,
} from 'three';
import { syncViewport, type SharedUniforms } from './materials';

// Same quad layout as three's LineSegmentsGeometry: y -1/2 are the round caps.
const QUAD_POS = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0];
const QUAD_UV = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2];
const QUAD_INDEX = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];

/** Preallocated instanced fat-line segments; mutate arrays, then `commit()`. */
export class FatLines {
  readonly geometry = new InstancedBufferGeometry();
  readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>;
  readonly pos: Float32Array;
  readonly col: Float32Array;
  private readonly posBuf: InstancedInterleavedBuffer;
  private readonly colBuf: InstancedInterleavedBuffer;

  constructor(readonly capacity: number, material: ShaderMaterial, shared: SharedUniforms, distances?: Float32Array) {
    const g = this.geometry;
    g.setIndex(QUAD_INDEX);
    g.setAttribute('position', new Float32BufferAttribute(QUAD_POS, 3));
    g.setAttribute('uv', new Float32BufferAttribute(QUAD_UV, 2));
    this.pos = new Float32Array(capacity * 6);
    this.col = new Float32Array(capacity * 8);
    this.posBuf = new InstancedInterleavedBuffer(this.pos, 6, 1).setUsage(DynamicDrawUsage);
    this.colBuf = new InstancedInterleavedBuffer(this.col, 8, 1).setUsage(DynamicDrawUsage);
    g.setAttribute('instanceStart', new InterleavedBufferAttribute(this.posBuf, 3, 0));
    g.setAttribute('instanceEnd', new InterleavedBufferAttribute(this.posBuf, 3, 3));
    g.setAttribute('instanceColorStart', new InterleavedBufferAttribute(this.colBuf, 4, 0));
    g.setAttribute('instanceColorEnd', new InterleavedBufferAttribute(this.colBuf, 4, 4));
    if (distances) {
      const d = new InstancedInterleavedBuffer(distances, 2, 1);
      g.setAttribute('instanceDistanceStart', new InterleavedBufferAttribute(d, 1, 0));
      g.setAttribute('instanceDistanceEnd', new InterleavedBufferAttribute(d, 1, 1));
    }
    g.instanceCount = capacity;
    this.mesh = new Mesh(g, material);
    this.mesh.frustumCulled = false;
    syncViewport(this.mesh, shared);
  }

  set count(n: number) {
    this.geometry.instanceCount = n;
    this.mesh.visible = n > 0;
  }

  seg(i: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number): void {
    const o = i * 6;
    const p = this.pos;
    p[o] = ax; p[o + 1] = ay; p[o + 2] = az; p[o + 3] = bx; p[o + 4] = by; p[o + 5] = bz;
  }

  color(i: number, c: Color, a0: number, c1: Color = c, a1: number = a0): void {
    const o = i * 8;
    const k = this.col;
    k[o] = c.r; k[o + 1] = c.g; k[o + 2] = c.b; k[o + 3] = a0;
    k[o + 4] = c1.r; k[o + 5] = c1.g; k[o + 6] = c1.b; k[o + 7] = a1;
  }

  commit(positions = true, colors = true): void {
    if (positions) this.posBuf.needsUpdate = true;
    if (colors) this.colBuf.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
  }
}

/** Preallocated px-sized points (aColor rgba, aSize px diameter). */
export class PointCloud {
  readonly geometry = new BufferGeometry();
  readonly points: Points<BufferGeometry, ShaderMaterial>;
  readonly pos: Float32Array;
  readonly col: Float32Array;
  readonly size: Float32Array;

  constructor(readonly capacity: number, material: ShaderMaterial, shared: SharedUniforms) {
    this.pos = new Float32Array(capacity * 3);
    this.col = new Float32Array(capacity * 4);
    this.size = new Float32Array(capacity);
    this.geometry.setAttribute('position', new BufferAttribute(this.pos, 3).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute('aColor', new BufferAttribute(this.col, 4).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute('aSize', new BufferAttribute(this.size, 1).setUsage(DynamicDrawUsage));
    this.points = new Points(this.geometry, material);
    this.points.frustumCulled = false;
    syncViewport(this.points, shared);
  }

  set count(n: number) {
    this.geometry.setDrawRange(0, n);
    this.points.visible = n > 0;
  }

  set(i: number, x: number, y: number, z: number, c: Color, a: number, sizePx: number): void {
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.col[i * 4] = c.r; this.col[i * 4 + 1] = c.g; this.col[i * 4 + 2] = c.b; this.col[i * 4 + 3] = a;
    this.size[i] = sizePx;
  }

  commit(): void {
    for (const name of ['position', 'aColor', 'aSize']) (this.geometry.getAttribute(name) as BufferAttribute).needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
  }
}

const QUAD = new PlaneGeometry(2, 2);

/** A radial glow disc of world radius `scale`, colour/alpha via `uColor`. */
export function glowQuad(material: ShaderMaterial, shared: SharedUniforms): Mesh<PlaneGeometry, ShaderMaterial> {
  const m = new Mesh(QUAD, material);
  m.frustumCulled = false;
  syncViewport(m, shared);
  return m;
}

/** Set a glow quad's colour, alpha and world radius; hides it when invisible. */
export function setGlow(m: Mesh<PlaneGeometry, ShaderMaterial>, c: Color, a: number, radius: number): void {
  m.visible = a > 0.002 && radius > 0;
  m.scale.setScalar(Math.max(radius, 1e-4));
  (m.material.uniforms.uColor.value as { set(x: number, y: number, z: number, w: number): void }).set(c.r, c.g, c.b, a);
}
