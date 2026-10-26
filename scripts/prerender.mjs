import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const SITE = 'https://ashutosh-nayak-official.github.io';
const OG_IMAGE = `${SITE}/og/engine.jpg`;

const { render, meta, LOCALES, localePath, NO_FLASH_SCRIPT } = await import(
  pathToFileURL(resolve(dist, 'server/entry-server.js')).href
);

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo-->') || !template.includes('<!--app-->')) {
  throw new Error('dist/index.html is missing <!--seo--> or <!--app--> placeholders');
}

function head(locale) {
  const m = meta(locale);
  const url = `${SITE}${m.path}`;
  const alternates = [
    ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${localePath(l)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
  ];
  return [
    `<script>${NO_FLASH_SCRIPT}</script>`,
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...alternates,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#04050a" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fcfbf8" />`,
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
  ].join('\n    ');
}

for (const locale of LOCALES) {
  const html = template
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace('<!--seo-->', () => head(locale))
    .replace('<!--app-->', () => render(locale));
  const out = resolve(dist, localePath(locale).slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const date = new Date().toISOString().slice(0, 10);
const urls = LOCALES.map(
  (l) => `  <url>\n    <loc>${SITE}${localePath(l)}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`,
).join('\n');
writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

rmSync(resolve(dist, 'server'), { recursive: true, force: true });
console.log(`prerendered ${LOCALES.length} pages + sitemap.xml`);
