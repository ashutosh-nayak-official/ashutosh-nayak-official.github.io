import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StageEnvProvider, useStageEnv } from '../../src/three/env';
import { useDowngradeOnContextLoss, watchContextLoss } from '../../src/three/contextLoss';

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.capability;
});

const lose = (el: HTMLElement) => {
  const e = new Event('webglcontextlost', { cancelable: true });
  el.dispatchEvent(e);
  return e;
};

describe('WebGL context loss', () => {
  it('watchContextLoss prevents the default and reports once; cleanup detaches', () => {
    const canvas = document.createElement('canvas');
    const onLost = vi.fn();
    const stop = watchContextLoss(canvas, onLost);
    const e = lose(canvas);
    expect(e.defaultPrevented).toBe(true);
    expect(onLost).toHaveBeenCalledTimes(1);
    stop();
    lose(canvas);
    expect(onLost).toHaveBeenCalledTimes(1);
  });

  it('a lost context downgrades the stage to stills (capability static)', () => {
    const canvas = document.createElement('canvas');
    function Probe() {
      useDowngradeOnContextLoss(canvas);
      const env = useStageEnv();
      return <output data-testid="cap">{env?.capability}</output>;
    }
    const { getByTestId } = render(
      <StageEnvProvider initial={{ capability: 'full', reducedMotion: false, mode: 'dark' }}>
        <Probe />
      </StageEnvProvider>,
    );
    expect(getByTestId('cap').textContent).toBe('full');
    act(() => {
      lose(canvas);
    });
    expect(getByTestId('cap').textContent).toBe('static');
  });
});
