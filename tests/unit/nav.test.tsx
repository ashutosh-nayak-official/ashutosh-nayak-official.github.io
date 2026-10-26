import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Nav from '../../src/app/Nav';
import { t } from '../../src/i18n';

afterEach(() => {
  cleanup();
});

const tr = (k: Parameters<typeof t>[1]) => t('en', k);

function setup() {
  const r = render(
    <>
      <Nav locale="en" />
      <p data-testid="outside">outside</p>
    </>,
  );
  const button = r.getByRole('button', { name: tr('nav_menu_open') });
  return { ...r, button };
}

describe('Nav mobile menu', () => {
  it('a 44px-class button controls a closed panel', () => {
    const { button } = setup();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    const id = button.getAttribute('aria-controls')!;
    expect(id).toBeTruthy();
    const panel = document.getElementById(id)!;
    expect(panel).not.toBeNull();
    expect(panel.hidden).toBe(true);
    expect(button.className).toContain('menu-btn');
  });

  it('opens: aria-expanded, chapter links + contact, focus moves into the panel', () => {
    const { button, getByRole } = setup();
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe(tr('nav_menu_close'));
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(panel.hidden).toBe(false);
    const hrefs = Array.from(panel.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#call', '#agents', '#infra', '#work', '#path', '#contact']);
    expect(panel.contains(document.activeElement)).toBe(true);
    expect(getByRole('button', { name: tr('nav_menu_close') })).toBe(button);
  });

  it('Escape closes and returns focus to the button', () => {
    const { button } = setup();
    fireEvent.click(button);
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('the button toggles it closed again', () => {
    const { button } = setup();
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('an outside click closes it', () => {
    const { button, getByTestId } = setup();
    fireEvent.click(button);
    act(() => {
      fireEvent.pointerDown(getByTestId('outside'));
    });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('a link click closes it without cancelling the navigation', () => {
    const { button } = setup();
    fireEvent.click(button);
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    const contact = panel.querySelector<HTMLAnchorElement>('a[href="#contact"]')!;
    const notCancelled = fireEvent.click(contact);
    expect(notCancelled).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
  });
});
