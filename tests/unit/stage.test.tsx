import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StageEnvProvider, useStageEnv, type StageEnv } from '../../src/three/env';
import { SceneSlot } from '../../src/three/SceneSlot';
import { stageSlots } from '../../src/three/stageStore';
import App from '../../src/app/App';

function EnvProbe() {
  const env = useStageEnv();
  return <output data-testid="env">{env ? `${env.mode}/${env.capability}/${env.reducedMotion}` : 'none'}</output>;
}

const Scene = () => null;

function withEnv(initial: Partial<StageEnv>, ui: React.ReactNode) {
  return render(<StageEnvProvider initial={initial}>{ui}</StageEnvProvider>);
}

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.mode;
  delete document.documentElement.dataset.capability;
});

describe('StageEnvProvider', () => {
  it('is null during SSR (no stage, no stills in the prerendered HTML)', () => {
    const html = renderToString(<App locale="en" />);
    expect(html).not.toContain('<canvas');
    expect(html).not.toContain('/stills/');
    expect(html).toContain('data-scene="top"');
  });

  it('detects static in jsdom (no WebGL) and marks html[data-capability]', () => {
    document.documentElement.dataset.mode = 'light';
    const { getByTestId } = render(
      <StageEnvProvider>
        <EnvProbe />
      </StageEnvProvider>,
    );
    expect(getByTestId('env').textContent).toBe('light/static/false');
    expect(document.documentElement.dataset.capability).toBe('static');
  });

  it('follows html[data-mode] changes without reload', async () => {
    document.documentElement.dataset.mode = 'dark';
    const { getByTestId } = withEnv({ capability: 'full' }, <EnvProbe />);
    expect(getByTestId('env').textContent).toBe('dark/full/false');
    await act(async () => {
      document.documentElement.dataset.mode = 'light';
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(getByTestId('env').textContent).toBe('light/full/false');
  });
});

describe('SceneSlot', () => {
  it('renders a decorative still (alt="") of /stills/<id>-<mode>.webp when capability is static', () => {
    document.documentElement.dataset.mode = 'light';
    const { container } = withEnv({ capability: 'static' }, <SceneSlot id="call" />);
    const slot = container.querySelector('[data-scene="call"]')!;
    expect(slot.getAttribute('aria-hidden')).toBe('true');
    const img = slot.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('src')).toBe('/stills/call-light.webp');
  });

  it('removes a still whose image fails to load (no broken-image box, whatever the CSS)', () => {
    const { container } = withEnv({ capability: 'static', mode: 'dark' }, <SceneSlot id="top" />);
    const img = container.querySelector('img')!;
    fireEvent.error(img);
    expect(container.querySelector('[data-scene="top"] img')).toBeNull();
  });

  it('retries the still when the mode changes after a failure', async () => {
    document.documentElement.dataset.mode = 'dark';
    const { container } = withEnv({ capability: 'static' }, <SceneSlot id="top" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    await act(async () => {
      document.documentElement.dataset.mode = 'light';
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/stills/top-light.webp');
  });

  it('does not render stills for chapters without a scene id', () => {
    const { container } = withEnv({ capability: 'static', mode: 'dark' }, <SceneSlot id="work" />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('registers its scene with the stage (and no still) when capability is not static', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container, unmount } = withEnv({ capability: 'full', mode: 'dark' }, <SceneSlot id="top" scene={Scene} />);
    expect(container.querySelector('img')).toBeNull();
    const slot = container.querySelector('[data-scene="top"]');
    const reg = stageSlots().find((s) => s.id === 'top');
    expect(reg?.track.current).toBe(slot);
    expect(reg?.Scene).toBe(Scene);
    expect(reg?.visible).toBe(true);
    unmount();
    expect(stageSlots().find((s) => s.id === 'top')).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it('does not register when capability is static', () => {
    withEnv({ capability: 'static', mode: 'dark' }, <SceneSlot id="top" scene={Scene} />);
    expect(stageSlots()).toHaveLength(0);
  });
});
