# Ashutosh Nayak, Golden Engine portfolio

Single-page portfolio at <https://ashutosh-nayak-official.github.io/>, told as a scroll-driven
"golden engine" in 3D. Available in four locales: English (`/`), German (`/de/`), Dutch (`/nl/`)
and Polish (`/pl/`). Each locale is prerendered to static HTML at build time.

## Stack

TypeScript, React 18, Vite 5, three.js with @react-three/fiber, drei and postprocessing,
GSAP ScrollTrigger and Lenis for scroll. Tests: Vitest (+ Testing Library, jsdom) and
Playwright with axe-core.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Type-check, client build, SSR build, prerender 4 locales and `sitemap.xml` into `dist/` |
| `npm run test:build` | Checks the prerendered output in `dist/` (run after build) |
| `npm run preview` | Serve `dist/` on port 4173 |
| `npm run e2e` | Playwright (desktop, tablet, phone) against `vite preview`; needs a prior build |

## Structure

- `src/content/` and `src/i18n/`: all copy, one file per locale; every string exists in all four
- `src/chapters/`: page sections (hero, one call, agents, infra, work, path, contact)
- `src/engine/`: pure engine logic (geometry, palette, state, signals)
- `src/three/`: R3F scenes
- `src/scroll/`, `src/app/`: scroll engine, mode (dark/light), capability detection, still mode
- `src/entry-client.tsx`, `src/entry-server.tsx`, `scripts/prerender.mjs`: hydration and static prerender
- `public/`: favicon, `robots.txt`, `.nojekyll`, badges, stills, OG image
- `tests/unit`, `tests/build`, `tests/e2e`

## Regenerating stills and the OG image

The static-fallback stills (`public/stills/*.webp`) and `public/og/engine.jpg` are rendered from
the real scenes in headless Chromium:

```
npm run build
node scripts/capture-stills.mjs        # optionally: node scripts/capture-stills.mjs contact og
npm run build                          # again, so dist/ ships the new files
```

The script serves `dist/` with `vite preview` and opens `?still=<id>&mode=<dark|light>` pages.

## Accessibility and fallback

Content is real HTML and readable without JavaScript. When WebGL is unavailable, the device is
low-powered, or the user prefers reduced motion, the site shows the pre-rendered stills instead of
live 3D, with the same content and navigation. Dark and light modes follow the system and can be
toggled. axe-core runs in the e2e suite.

## Deployment

- `.github/workflows/ci.yml`: on pushes to `feat/**` and pull requests to `main`: unit tests,
  build, build tests, Playwright e2e (report uploaded on failure).
- `.github/workflows/deploy.yml`: on push to `main` (or manual dispatch): tests, build, then
  publish `dist/` with GitHub Pages Actions.
- `.npmrc` pins the public npm registry so CI matches the lockfile.

## Cutover (one-time, owner-only)

1. Settings, Pages, Source = **GitHub Actions**.
2. Merge the PR to `main`.
3. Watch the `Deploy to GitHub Pages` run (`deploy.yml`) succeed.
4. Check live: `/`, `/de/`, `/nl/`, `/pl/`.
5. Rollback: revert the merge commit on `main`, and set Source back to
   "Deploy from a branch: `main` `/`".
