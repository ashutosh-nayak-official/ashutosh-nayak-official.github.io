import { useEffect, useRef, useState } from 'react';
import { LOCALES, localePath, t, type Locale } from '../i18n';
import type { Key } from '../content/types';
import { applyMode, initialMode, type Mode } from './mode';
import { getLocalStorage, safeGet, safeSet } from './storage';

function currentMode(): Mode {
  if (typeof document === 'undefined') return 'dark';
  const d = document.documentElement.dataset.mode;
  if (d === 'dark' || d === 'light') return d;
  let prefersDark = true;
  try {
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    /* no matchMedia: keep dark */
  }
  return initialMode(safeGet(getLocalStorage(), 'ge-mode'), prefersDark);
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MENU_ID = 'nav-menu';

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Nav({ locale }: { locale: Locale }) {
  const tr = (k: Key) => t(locale, k);
  // Start from a fixed value so the prerendered HTML and the first client render match;
  // the real mode is read from the document after mount.
  const [mode, setMode] = useState<Mode>('dark');

  useEffect(() => {
    const m = currentMode();
    // Without the no-flash script (dev), make sure the page has a mode without persisting it.
    if (!document.documentElement.dataset.mode) document.documentElement.dataset.mode = m;
    setMode(m);
  }, []);

  // Phone / tablet menu: the chapter links collapse below 1080px.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);

  const closeMenu = (refocus: boolean) => {
    setMenuOpen(false);
    if (refocus) menuBtn.current?.focus();
  };

  useEffect(() => {
    if (!menuOpen) return;
    menuPanel.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu(true);
    };
    const onPointer = (e: PointerEvent) => {
      const el = e.target as Node | null;
      if (el && (menuPanel.current?.contains(el) || menuBtn.current?.contains(el))) return;
      closeMenu(true);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen]);

  const toggle = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    applyMode(next);
    setMode(next);
  };

  const chapters: { href: string; n: Key; label: string }[] = [
    { href: '#call', n: 'chapter_02', label: tr('nav_voice') },
    { href: '#agents', n: 'chapter_03', label: tr('nav_agents') },
    { href: '#infra', n: 'chapter_04', label: tr('nav_infra') },
    { href: '#work', n: 'chapter_05', label: tr('nav_work') },
    { href: '#path', n: 'chapter_06', label: tr('nav_path') },
    { href: '#contact', n: 'chapter_07', label: tr('nav_contact') },
  ];

  return (
    <header className="site-nav">
      <nav aria-label={tr('nav_aria')} className="wrap">
        <a className="mark" href="#top">
          {tr('hero_name').split(' ')[0]}
          <b aria-hidden="true">.</b>
        </a>
        <ul className="links" role="list">
          {chapters.map((c) => (
            <li key={c.href}>
              <a href={c.href}>
                <span className="n" aria-hidden="true">
                  {tr(c.n)}
                </span>{' '}
                {c.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="right">
          <button
            type="button"
            className="mode"
            onClick={toggle}
            aria-label={mode === 'dark' ? tr('nav_mode_to_light') : tr('nav_mode_to_dark')}
          >
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <ul className="lang" role="list" aria-label={tr('nav_language_label')}>
            {LOCALES.map((l) => (
              <li key={l}>
                <a
                  href={localePath(l)}
                  hrefLang={l}
                  lang={l}
                  title={tr(`lang_name_${l}` as Key)}
                  aria-current={l === locale ? 'page' : undefined}
                  onClick={() => safeSet(getLocalStorage(), 'ge-locale', l)}
                >
                  {l.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
          <a className="pill" href="#contact">
            {tr('nav_cta')}
          </a>
          <button
            type="button"
            ref={menuBtn}
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            aria-label={menuOpen ? tr('nav_menu_close') : tr('nav_menu_open')}
            onClick={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
        <div id={MENU_ID} className="menu-panel" ref={menuPanel} hidden={!menuOpen}>
          <ul role="list">
            {chapters.map((c) => (
              <li key={c.href}>
                {/* Closes without cancelling: the hash navigation (native or Lenis) proceeds
                    and moves focus to the target heading. */}
                <a href={c.href} onClick={() => closeMenu(false)}>
                  <span className="n" aria-hidden="true">
                    {tr(c.n)}
                  </span>{' '}
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
