import { cleanup, fireEvent, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StageEnvProvider, type StageEnv } from '../../src/three/env';
import { SceneSlot } from '../../src/three/SceneSlot';
import { stageSlots } from '../../src/three/stageStore';
import { applyStillMode, parseStillMode, STILL_PROGRESS } from '../../src/app/stillMode';
import {
  sectionProgressRef,
  setSectionProgress,
  unfreezeSectionProgress,
} from '../../src/scroll/useSectionProgress';
import Infra from '../../src/chapters/Infra';
import Contact from '../../src/chapters/Contact';
import Work from '../../src/chapters/Work';
import { t } from '../../src/i18n';

afterEach(() => {
  cleanup();
  const root = document.documentElement;
  delete root.dataset.mode;
  delete root.dataset.capability;
  delete root.dataset.still;
  unfreezeSectionProgress();
  vi.unstubAllGlobals();
});

function withEnv(initial: Partial<StageEnv>, ui: React.ReactNode) {
  return render(<StageEnvProvider initial={initial}>{ui}</StageEnvProvider>);
}

describe('parseStillMode', () => {
  it('is inert without the query (normal page loads)', () => {
    expect(parseStillMode('')).toBeNull();
    expect(parseStillMode('?utm_source=x')).toBeNull();
    expect(parseStillMode('?mode=light')).toBeNull();
  });

  it('parses every scene id with its representative progress', () => {
    expect(STILL_PROGRESS).toEqual({ top: 0, call: 0.9, agents: 1, infra: 1, contact: 0 });
    for (const id of ['top', 'call', 'agents', 'infra', 'contact'] as const) {
      expect(parseStillMode(`?still=${id}&mode=light`)).toEqual({
        id,
        scene: id,
        mode: 'light',
        progress: STILL_PROGRESS[id],
      });
    }
  });

  it('defaults the mode to dark and supports the og shot (hero, dark)', () => {
    expect(parseStillMode('?still=call')?.mode).toBe('dark');
    expect(parseStillMode('?still=og')).toEqual({ id: 'og', scene: 'top', mode: 'dark', progress: 0 });
  });

  it('rejects unknown ids and modes', () => {
    expect(parseStillMode('?still=work&mode=dark')).toBeNull();
    expect(parseStillMode('?still=top&mode=sepia')).toBeNull();
    expect(parseStillMode('?still=')).toBeNull();
  });
});

describe('applyStillMode', () => {
  it('sets mode + data-still and freezes the scene progress against scroll writes', () => {
    vi.stubGlobal('requestAnimationFrame', () => 0);
    const stop = applyStillMode({ id: 'agents', scene: 'agents', mode: 'light', progress: 0.75 });
    expect(document.documentElement.dataset.mode).toBe('light');
    expect(document.documentElement.dataset.still).toBe('agents');
    expect(sectionProgressRef('agents').current).toBe(0.75);
    setSectionProgress('agents', 0.1);
    expect(sectionProgressRef('agents').current).toBe(0.75);
    // other sections still follow scroll
    setSectionProgress('call', 0.3);
    expect(sectionProgressRef('call').current).toBe(0.3);
    stop();
  });
});

describe('Infra chip frame fallback', () => {
  const aria = t('en', 'infra_chip_aria');

  it('SSR / no JS: the frame carries no img role (CSS hides it until capability is known)', () => {
    const html = renderToString(<Infra locale="en" />);
    expect(html).toContain('data-chip-frame');
    expect(html).not.toContain('role="img"');
    expect(html).not.toContain('/stills/');
  });

  it('static: shows the infra still inside the frame, not in the full-screen slot', () => {
    document.documentElement.dataset.mode = 'light';
    const { container } = withEnv({ capability: 'static' }, <Infra locale="en" />);
    const frame = container.querySelector('[data-chip-frame]')!;
    expect(frame.getAttribute('role')).toBe('img');
    expect(frame.getAttribute('aria-label')).toBe(aria);
    expect(frame.querySelector('img')?.getAttribute('src')).toBe('/stills/infra-light.webp');
    expect(container.querySelector('[data-scene="infra"] img')).toBeNull();
  });

  it('static with a missing still: the frame is hidden and drops role="img"', () => {
    const { container } = withEnv({ capability: 'static', mode: 'dark' }, <Infra locale="en" />);
    fireEvent.error(container.querySelector('[data-chip-frame] img')!);
    const frame = container.querySelector('[data-chip-frame]');
    expect(container.querySelector('[role="img"]')).toBeNull();
    expect(frame === null || (frame as HTMLElement).hidden).toBe(true);
  });

  it('live 3D: the frame is the labelled chip box and has no still', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = withEnv({ capability: 'full', mode: 'dark' }, <Infra locale="en" />);
    const frame = container.querySelector('[data-chip-frame]')!;
    expect(frame.getAttribute('role')).toBe('img');
    expect(frame.getAttribute('aria-label')).toBe(aria);
    expect(frame.querySelector('img')).toBeNull();
  });
});

describe('SceneSlot still opt-out', () => {
  it('renders no still when still={false}', () => {
    const { container } = withEnv({ capability: 'static', mode: 'dark' }, <SceneSlot id="infra" still={false} />);
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('Contact', () => {
  it('mounts the contact engine scene on the stage when 3D runs', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    withEnv({ capability: 'full', mode: 'dark' }, <Contact locale="en" />);
    expect(stageSlots().find((s) => s.id === 'contact')).toBeDefined();
  });

  it('shows the contact still when static', () => {
    const { container } = withEnv({ capability: 'static', mode: 'dark' }, <Contact locale="en" />);
    expect(container.querySelector('[data-scene="contact"] img')?.getAttribute('src')).toBe('/stills/contact-dark.webp');
  });
});

describe('Work featured cards', () => {
  it('featured cards carry the glow element (decorative)', () => {
    const { container } = render(<Work locale="en" />);
    const feats = container.querySelectorAll('.card.feat');
    expect(feats.length).toBeGreaterThan(0);
    feats.forEach((c) => {
      const glow = c.querySelector('.feat-glow');
      expect(glow).not.toBeNull();
      expect(glow!.getAttribute('aria-hidden')).toBe('true');
    });
    container.querySelectorAll('.card:not(.feat)').forEach((c) => expect(c.querySelector('.feat-glow')).toBeNull());
  });
});
