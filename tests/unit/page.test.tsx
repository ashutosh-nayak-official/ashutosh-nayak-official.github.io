import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../src/app/App';
import { site } from '../../src/content/site';
import { LOCALES, localePath, t, type Locale } from '../../src/i18n';
import { INTERNAL_IDS, phoneLike } from './guards';

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.mode;
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

const CHAPTER_IDS = ['top', 'production', 'call', 'agents', 'infra', 'work', 'path', 'contact'];

describe.each(LOCALES)('page (%s)', (locale: Locale) => {
  const tr = (k: Parameters<typeof t>[1]) => t(locale, k);

  it('renders every chapter heading in order', () => {
    const { getAllByRole, container } = render(<App locale={locale} />);
    const h1 = getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toContain(tr('hero_name'));
    expect(h1[0].textContent).toContain(tr('hero_promise_1'));

    const h2 = getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual([
      tr('stats_headline'),
      tr('voice_headline'),
      tr('agents_headline'),
      tr('infra_headline'),
      tr('work_headline'),
      tr('path_headline'),
      tr('contact_headline'),
    ]);

    const ids = Array.from(container.querySelectorAll('section[id]')).map((s) => s.id);
    expect(ids).toEqual(CHAPTER_IDS);
    for (const id of CHAPTER_IDS) {
      const slot = container.querySelector(`section#${id} [data-scene="${id}"]`);
      expect(slot, `scene slot for ${id}`).not.toBeNull();
      expect(slot!.getAttribute('aria-hidden')).toBe('true');
      // A slot holds nothing but (in the static fallback) one decorative still.
      for (const child of Array.from(slot!.children)) {
        expect(child.tagName).toBe('IMG');
        expect(child.getAttribute('alt')).toBe('');
      }
    }
  });

  it('nav links point at #call #agents #infra #work #path #contact', () => {
    const { getByRole } = render(<App locale={locale} />);
    const nav = getByRole('navigation', { name: tr('nav_aria') });
    const chapters = nav.querySelector('ul.links') as HTMLElement;
    expect(chapters).not.toBeNull();
    const hrefs = within(chapters)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#call', '#agents', '#infra', '#work', '#path', '#contact']);
    expect(within(nav).getByRole('link', { name: tr('nav_cta') }).getAttribute('href')).toBe('#contact');
  });

  it('language links go to / /de/ /nl/ /pl/ with hreflang', () => {
    const { getByRole } = render(<App locale={locale} />);
    const list = getByRole('list', { name: tr('nav_language_label') });
    const links = within(list).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/de/', '/nl/', '/pl/']);
    links.forEach((a, i) => {
      const l = LOCALES[i];
      expect(a.getAttribute('hreflang')).toBe(l);
      expect(a.getAttribute('lang')).toBe(l);
      expect(a.getAttribute('href')).toBe(localePath(l));
      expect(a.getAttribute('aria-current')).toBe(l === locale ? 'page' : null);
    });
  });

  it('mode toggle flips data-mode and has an accessible name', () => {
    document.documentElement.dataset.mode = 'dark';
    const { getByRole } = render(<App locale={locale} />);
    const toLight = getByRole('button', { name: tr('nav_mode_to_light') });
    fireEvent.click(toLight);
    expect(document.documentElement.dataset.mode).toBe('light');
    const toDark = getByRole('button', { name: tr('nav_mode_to_dark') });
    fireEvent.click(toDark);
    expect(document.documentElement.dataset.mode).toBe('dark');
    expect(getByRole('button', { name: tr('nav_mode_to_light') })).toBeTruthy();
  });

  it('career timeline has 5 entries, Senior Technical Manager first', () => {
    const { container } = render(<App locale={locale} />);
    const entries = container.querySelectorAll('#path ol.tl > li');
    expect(entries).toHaveLength(5);
    expect(entries[0].textContent).toContain(tr('path_title_1'));
    expect(entries[0].textContent).toContain(tr('path_dates_1'));
    if (locale === 'en') expect(entries[0].textContent).toContain('Senior Technical Manager');
    site.path.forEach((p, i) => {
      expect(entries[i].textContent).toContain(tr(p.titleKey));
      expect(entries[i].textContent).toContain(tr(p.orgKey));
    });
  });

  it('credential links open Credly in a new tab with rel=noopener', () => {
    const { container } = render(<App locale={locale} />);
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('#path a.cred'));
    expect(links).toHaveLength(site.credentials.length);
    links.forEach((a, i) => {
      expect(a.getAttribute('href')).toBe(site.credentials[i].href);
      expect(a.getAttribute('href')).toMatch(/^https:\/\/www\.credly\.com\//);
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    });
  });

  it('all chapter-02 stops and chapter-03 gates are present as text', () => {
    const { container } = render(<App locale={locale} />);
    const call = container.querySelector('#call')!.textContent!;
    for (const s of site.voiceStops) {
      expect(call).toContain(tr(s.titleKey));
      expect(call).toContain(tr(s.bodyKey));
    }
    const agents = container.querySelector('#agents')!.textContent!;
    for (const k of ['agents_gate_1', 'agents_gate_2', 'agents_gate_3', 'agents_limits'] as const) {
      expect(agents).toContain(tr(k));
    }
    for (const p of site.agentPhases) {
      expect(agents).toContain(tr(p.pillKey));
      expect(agents).toContain(tr(p.statusKey));
    }
  });

  it('contact offers email, LinkedIn and GitHub only, never a phone', () => {
    const { container } = render(<App locale={locale} />);
    const hrefs = Array.from(container.querySelectorAll('#contact a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([`mailto:${site.contact.email}`, site.contact.linkedin, site.contact.github]);
    expect(container.innerHTML).not.toMatch(/tel:/);
    // every user-visible string on the page, plus every link target
    const visible = [container.textContent ?? '', ...Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '')].join('\n');
    expect(phoneLike(visible)).toEqual([]);
    expect(container.innerHTML).not.toMatch(INTERNAL_IDS);
  });

  it('footer shows copyright, country and back-to-top, no "built with" line', () => {
    const { container } = render(<App locale={locale} />);
    const footer = container.querySelector('footer.site-footer')!;
    expect(footer.textContent).toContain(tr('footer_location'));
    expect(footer.textContent).not.toMatch(/Three\.js|React/);
    expect(container.textContent).not.toMatch(/bhubaneswar/i);
  });

  it('the Agentic SDLC framework card links to its public repo', () => {
    const { container } = render(<App locale={locale} />);
    const card = container.querySelector('#work [data-project="sdlc"]')!;
    const a = card.querySelector('a')!;
    expect(a).not.toBeNull();
    expect(a.getAttribute('href')).toBe('https://github.com/ashutosh-nayak-official/agentic-sdlc-framework');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.getAttribute('aria-label') ?? a.textContent).toContain(tr('proj_sdlc_repo_label'));
    // only that card links out
    expect(container.querySelectorAll('#work a')).toHaveLength(1);
  });
});
