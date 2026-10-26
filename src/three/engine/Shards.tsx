import { useEffect, useMemo } from 'react';
import { lineMaterial, srgb } from './materials';
import { FatLines } from './primitives';
import { PX, ease, useEngine, useEngineUpdate } from './frame';

const COUNT = 160;
const COLOR = srgb(255, 220, 150);

/** Burst shards: 160 short streaks flying outward while the engine breaks apart (mockup SH). */
export function Shards() {
  const { mode, shared, rng } = useEngine();

  const parts = useMemo(() => {
    const mat = lineMaterial(shared, { mode, width: mode === 'dark' ? 1.2 : 1.4 });
    const lines = new FatLines(COUNT, mat, shared);
    lines.mesh.renderOrder = 8;
    lines.count = 0;
    const sh = Array.from({ length: COUNT }, () => {
      const a = rng() * Math.PI * 2;
      const e = (rng() - 0.5) * 1.2;
      return {
        dx: Math.cos(a) * Math.cos(e),
        dy: Math.sin(e) * 0.8 + Math.sin(a) * 0.25,
        v: 0.6 + rng() * 1.8,
        len: (4 + rng() * 16) * PX,
        r0: 0.2 + rng() * 0.9,
      };
    });
    return { mat, lines, sh };
  }, [mode, shared, rng]);

  useEffect(
    () => () => {
      parts.lines.dispose();
      parts.mat.dispose();
    },
    [parts],
  );

  useEngineUpdate(3, (f) => {
    const { lines, sh } = parts;
    const al = (1 - f.burst) * 0.9;
    if (f.burst <= 0 || al <= 0) {
      lines.count = 0;
      return;
    }
    const u = ease(f.burst);
    for (let k = 0; k < COUNT; k++) {
      const s = sh[k];
      const rr = s.r0 + u * s.v * 2.2;
      const x = s.dx * rr, y = -s.dy * rr;
      const l = s.len * (1 + u * 3);
      lines.seg(k, x, y, 0, x - s.dx * l, y + s.dy * l, 0);
      lines.color(k, COLOR, al);
    }
    lines.count = COUNT;
    lines.commit();
  });

  return <primitive object={parts.lines.mesh} />;
}
