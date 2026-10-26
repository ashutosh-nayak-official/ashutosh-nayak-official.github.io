import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LOCALES, localePath, t, type Locale } from '../../src/i18n';

const SITE = 'https://ashutosh-nayak-official.github.io';
const dist = (p: string) => resolve(__dirname, '../../dist', p);
const file = (l: Locale) => (l === 'en' ? 'index.html' : `${l}/index.html`);
const read = (l: Locale) => readFileSync(dist(file(l)), 'utf8');
const unescape = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

describe('prerender', () => {
  it('writes four locale pages with full text in the HTML', () => {
    for (const l of LOCALES) {
      const html = unescape(read(l));
      expect(html).toContain(`<html lang="${l}"`);
      expect(html).toContain(t(l, 'hero_promise_1'));
      expect(html).toContain('ashutosh.nayak.formal@gmail.com');
      expect(html).toContain(`<title>${t(l, 'meta_title')}</title>`);
      expect(html).toContain(t(l, 'meta_description'));
    }
    expect(existsSync(dist('server'))).toBe(false);
  });

  it('each page has canonical, 4 hreflang + x-default, og:image, twitter, theme-color, favicon', () => {
    for (const l of LOCALES) {
      const html = read(l);
      expect(html).toContain(`<link rel="canonical" href="${SITE}${localePath(l)}"`);
      for (const a of LOCALES) {
        expect(html).toContain(`hreflang="${a}" href="${SITE}${localePath(a)}"`);
      }
      expect(html).toContain(`hreflang="x-default" href="${SITE}/"`);
      expect(html).toContain(`property="og:image" content="${SITE}/og/engine.jpg"`);
      expect(html).toContain('property="og:type" content="website"');
      expect(html).toContain(`property="og:url" content="${SITE}${localePath(l)}"`);
      expect(html).toContain('property="og:title"');
      expect(html).toContain('property="og:description"');
      expect(html).toContain('name="twitter:card" content="summary_large_image"');
      expect(html).toContain('name="theme-color"');
      expect(html).toContain('href="/favicon.svg"');
      const head = html.slice(0, html.indexOf('</head>'));
      const flash = head.indexOf('ge-mode');
      expect(flash).toBeGreaterThan(-1);
      expect(flash).toBeLessThan(head.indexOf('rel="stylesheet"'));
    }
  });

  it('web fonts and the 3D chunks never block first paint', () => {
    for (const l of LOCALES) {
      const head = read(l).slice(0, read(l).indexOf('</head>'));
      // every Google Fonts stylesheet outside <noscript> is non-blocking (print → all on load)
      const outside = head.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
      const fontSheets = outside.match(/<link[^>]*rel="stylesheet"[^>]*fonts\.googleapis[^>]*>/g) ?? [];
      expect(fontSheets).toHaveLength(1);
      expect(fontSheets[0]).toContain('media="print"');
      expect(fontSheets[0]).toContain(`onload="this.media='all'"`);
      // without JS the fonts still load
      expect(head).toMatch(/<noscript>\s*<link[^>]*rel="stylesheet"[^>]*fonts\.googleapis/);
      // only the entry script is in the HTML: no three.js / scene chunk, no modulepreload of one
      const scripts = head.match(/<script[^>]*\ssrc="[^"]*"/g) ?? [];
      expect(scripts).toHaveLength(1);
      expect(scripts[0]).toMatch(/\/assets\/index-[\w-]+\.js"/);
      expect(head).not.toMatch(/modulepreload[^>]*(Stage|Scene|Engine|events)/);
    }
  });

  it('ships the production React build (not the development one)', () => {
    // vitest sets NODE_ENV=test; a build inheriting it bundles React's dev build (≈3× larger, slower).
    const entry = read('en').match(/src="\/(assets\/index-[\w-]+\.js)"/)![1];
    const js = readFileSync(dist(entry), 'utf8');
    expect(js.includes('validateDOMNesting'), 'React development build in dist').toBe(false);
    expect(js.length).toBeLessThan(300_000);
  });

  it('sitemap lists the four URLs', () => {
    const xml = readFileSync(dist('sitemap.xml'), 'utf8');
    for (const l of LOCALES) expect(xml).toContain(`<loc>${SITE}${localePath(l)}</loc>`);
    expect(xml.match(/<url>/g)).toHaveLength(4);
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it('robots.txt references the sitemap', () => {
    expect(readFileSync(dist('robots.txt'), 'utf8')).toContain(`${SITE}/sitemap.xml`);
  });

  it('no page contains tel:', () => {
    for (const l of LOCALES) expect(read(l)).not.toContain('tel:');
  });

  it('theme-color has a dark and a light variant', () => {
    for (const l of LOCALES) {
      const html = read(l);
      expect(html).toContain('<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#04050a"');
      expect(html).toContain('<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fcfbf8"');
    }
  });

  it('no page names the city', () => {
    for (const l of LOCALES) expect(read(l)).not.toMatch(/bhubaneswar/i);
  });

  it('ships a 404 page that links home', () => {
    const html = readFileSync(dist('404.html'), 'utf8');
    expect(html).toMatch(/<html lang="en"/);
    expect(html).toContain('href="/"');
    expect(html).toContain('<meta name="robots" content="noindex"');
  });
});
