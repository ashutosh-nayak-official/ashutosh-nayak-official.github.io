import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../src/app/App';
import { t } from '../../src/i18n';

const css = (f: string) => readFileSync(resolve(__dirname, '../../src/styles', f), 'utf8');

/** Custom properties declared in the first block whose selector matches. */
function block(src: string, selector: string): Record<string, string> {
  const start = src.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const body = src.slice(start, src.indexOf('\n}', start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const lum = (hex: string) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe('light-mode tokens', () => {
  const light = block(css('tokens.css'), ":root[data-mode='light']");
  const dark = block(css('tokens.css'), ':root');

  it('declares the contrast-safe light values', () => {
    expect(light['--bg']).toBe('#fcfbf8');
    expect(light['--label']).toMatch(/^#b87200/);
    expect(light['--label-text']).toMatch(/^#9e6100/);
    expect(light['--focus']).toMatch(/^#c97f00/);
    expect(light['--stat-ink']).toMatch(/^#b56d00/);
  });

  it('meets WCAG floors on the light background', () => {
    const v = (k: string) => light[k].slice(0, 7);
    expect(contrast(v('--label-text'), light['--bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(v('--pill-ink'), light['--bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(v('--focus'), light['--bg'])).toBeGreaterThanOrEqual(3);
    expect(contrast(v('--stat-ink'), light['--bg'])).toBeGreaterThanOrEqual(3);
  });

  it('keeps dark mode on gold', () => {
    expect(dark['--label-text']).toMatch(/^var\(--gold\)/);
    expect(dark['--focus']).toMatch(/^var\(--gold\)/);
  });

  it('small label text never uses the large-only --label token', () => {
    const all = css('base.css') + css('chapters.css');
    expect(all).not.toMatch(/color:\s*var\(--label\)/);
    expect(css('base.css')).toMatch(/outline:\s*2px solid var\(--focus\)/);
  });

  it('does not clip overflow on body and supports forced colours', () => {
    const base = css('base.css');
    const body = base.slice(base.indexOf('\nbody {'), base.indexOf('}', base.indexOf('\nbody {')));
    expect(body).not.toMatch(/overflow/);
    expect(css('chapters.css')).toMatch(/@media \(forced-colors: active\)[^}]*\.accent\s*\{[^}]*color:\s*CanvasText/);
  });
});

describe('hydration-safe mode and skip target', () => {
  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.mode;
  });

  it('server render ignores html[data-mode] (initial state is dark)', () => {
    document.documentElement.dataset.mode = 'light';
    const html = renderToString(<App locale="en" />);
    expect(html).toContain(`aria-label="${t('en', 'nav_mode_to_light')}"`);
  });

  it('client syncs the toggle from html[data-mode] after mount', () => {
    document.documentElement.dataset.mode = 'light';
    const { getByRole } = render(<App locale="en" />);
    expect(getByRole('button', { name: t('en', 'nav_mode_to_dark') })).toBeTruthy();
    expect(document.documentElement.dataset.mode).toBe('light');
  });

  it('skip link target is focusable', () => {
    const { container } = render(<App locale="en" />);
    expect(container.querySelector('main#main')!.getAttribute('tabindex')).toBe('-1');
  });
});
