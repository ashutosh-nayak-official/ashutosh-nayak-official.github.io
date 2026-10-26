# Golden Engine Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the live scroll-story portfolio with the "Golden Engine" site: a pre-rendered, four-language React + React Three Fiber scroll story with dark and light modes, deployed to GitHub Pages by GitHub Actions.

**Architecture:** Vite builds a React app. A prerender script renders every locale to static HTML (`/`, `/de/`, `/nl/`, `/pl/`), so all text is in the HTML at first paint. The client hydrates, then lazy-loads one shared full-screen R3F `<Canvas>` that draws each chapter's scene into its DOM slot through drei `<View>`. Scroll progress per section comes from GSAP ScrollTrigger over Lenis smooth scroll. Visual state is computed by pure, unit-tested functions, and the R3F components only render it. Low-capability, reduced-motion and no-WebGL visitors get pre-captured still images instead of the canvas.

**Tech Stack:** TypeScript 5.6.3, React 18.3.1, Vite 5.4.10, three 0.169.0, @react-three/fiber 8.17.10, @react-three/drei 9.114.3, @react-three/postprocessing 2.16.3, gsap 3.12.5 (ScrollTrigger), lenis 1.1.13, Vitest 2.1.4 + @testing-library/react 16.0.1 + jsdom 25.0.1, @playwright/test 1.48.2 + @axe-core/playwright 4.10.0. Install exact versions (`npm i -E`). npm needs network: run installs with the sandbox disabled.

**Spec:** `docs/superpowers/specs/2026-10-26-golden-engine-portfolio-design.md`. The visual reference is `docs/superpowers/specs/2026-10-26-golden-engine-mockups/site-themes.html`, opened with palette "Gold text + Spectrum visuals", heart "Triacontahedron", signals "On". Read both before starting any task. Where this plan and the mockup disagree on a visual, the spec decides.

## Global Constraints

- Work on branch `feat/golden-engine`, created from `main`. Never commit to or push `main`. Cutover (Task 14) happens only when Ashutosh says go.
- Commits are authored as `ashutosh-nayak-official` (repo-local git config is already set). Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Content truth: `content.md` plus spec §3 and §5a are the only sources. No invented numbers, clients, screenshots, repos or quotes. No latency or call-volume figures for the voice bot. Visual labels must not read as claims: no task counts or "N running".
- Never show a phone number (no number in any form, no `tel:` link). Contact is only `mailto:ashutosh.nayak.formal@gmail.com`, `https://www.linkedin.com/in/ashutosh-nayak-81an` and `https://github.com/ashutosh-nayak-official`.
- Never name the client's internal project codes, client names or internal standard IDs for the mail-service example. It appears only as "a mail-service platform" and only as the chapter 03 example, never as a project card.
- Locales: `en` (path `/`), `de` (`/de/`), `nl` (`/nl/`), `pl` (`/pl/`). Every user-visible string exists, non-empty, in all four.
- Palette: text, labels, buttons, pills and links use gold. 3D and visual elements use Spectrum: `#ffcf6b → #ff8a5c → #e86bff → #7d8cff → #55dcff` (dark), `#c98a12 → #e0532f → #b532d6 → #4a5ee8 → #0e9fc9` (light). Exception: the career timeline dots and line are glowing gold.
- Dark tokens: bg `#04050a`, ink `#f1ead9`, muted `#9c9384`, gold `#f3b24a`, gold-hi `#ffe1a0`, line `#1a1f2a`. Light tokens: bg `#fcfbf8`, ink `#14110c`, muted `#5a5348`, gold `#f2a516`, gold-deep `#c97f00`, label `#b87200`, line `#ebe6dc`. Light accents: headline gradient `#e08a00 → #f5b11c`, button gradient `#ffc23a → #f2a516` with near-black text and a soft gold shadow.
- Chip region colours (dark): compute `#ff8a5c`, schedulers and cache `#ffcf6b`, inference `#e86bff`, agents `#7d8cff`, CI/CD and observability `#55dcff`, network `#7d8cff`, memory `#55dcff` (teal tint).
- Fonts: Inter Tight (400–700) and JetBrains Mono (400–500), loaded from Google Fonts with `display=swap`.
- Engine motion: a ring takes tens of seconds per full rotation. No particle dust. Signals fire a burst every 1300–3200 ms, 1 bolt (p = 0.7) or 2 bolts, staggered 40–130 ms. Each bolt lives 260–440 ms, re-jitters its path every 55 ms, and forks at most once.
- Loader: hard cap 3.5 s, after which content reveals regardless of 3D loading. It is skipped by any click or key, by `prefers-reduced-motion`, and by a repeat visit in the same session (`sessionStorage` key `ge-intro-seen`).
- Storage keys: `ge-mode` (`dark`|`light`) and `ge-locale`. Every storage read and write is wrapped in try/catch.
- Accessibility: one `h1`, ordered headings, visible focus, primary targets at least 44 px, canvas `aria-hidden="true"`, reduced motion respected.

## Review Focus

1. **Jumping by nav link or hash into the middle of a pinned section.** The target section heading should land in the viewport, readable, with no stuck pin and no blank screen. Owner: Task 13 e2e `nav-links-land-on-sections`.
2. **Resizing or rotating the viewport mid-scroll** (1440 → 390). The page should never scroll horizontally, and the canvas should resize. Owner: Task 13 e2e `resize-no-horizontal-overflow`.
3. **Blocked storage** (private mode, where `localStorage` and `sessionStorage` throw). Mode toggle, language switch and loader should still work. Owner: Task 2 unit `stores-survive-throwing-storage` and Task 13 e2e `storage-blocked`.
4. **Long German and Polish strings at 390 px width.** Headings, buttons and nav should not overflow or clip. Owner: Task 13 e2e `locales-fit-on-phone`.
5. **Tab in the background or canvas off-screen.** The render loop should pause to save battery, then resume without a jump. Owner: Task 2 unit `visibility-pauses-frameloop` and Task 6 wiring.

---

### Task 0: Branch, scaffold, retire the old site

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `index.html` (Vite shell), `src/main.tsx`, `src/app/App.tsx`, `tests/unit/app.test.tsx`
- Move: `assets/badges/*` → `public/badges/`, `assets/photos/Ghibli.png` → `public/photos/Ghibli.png`, `assets/favicon.svg` → `public/favicon.svg`, `robots.txt` → `public/robots.txt`
- Delete: `assets/css/story.css`, `assets/js/story.js`, `assets/js/hero3d.js`, `assets/story/`, `assets/layers/`, `story-v2/`, `sitemap.xml` (generated from Task 4 on), `scripts/check-content.sh`, `scripts/check-i18n.js` (replaced by unit tests in Task 1), `NOTES.md`, `CREDITS.md`
- Commit as-is: `docs/superpowers/specs/2026-10-26-golden-engine-portfolio-design.md`, `docs/superpowers/specs/2026-10-26-golden-engine-mockups/`, `docs/superpowers/plans/2026-10-27-golden-engine-portfolio.md`, `content.md` (already updated with the 2025 promotion)

**Interfaces:**
- Produces: npm scripts `dev`, `build` (`tsc -b && vite build && node scripts/prerender.mjs`), `test` (`vitest run`), `e2e` (`playwright test`), `preview` (`vite preview --port 4173`). `App` default export from `src/app/App.tsx` with props `{ locale: Locale }` (the `Locale` type arrives in Task 1; here use the literal `'en'`).

- [ ] **Step 1:** Run `git switch -c feat/golden-engine`. `.gitignore` covers `node_modules/`, `dist/`, `.superpowers/`, `.DS_Store`, `test-results/`, `playwright-report/`, `test.json`. First commit: the spec, the mockups folder, this plan and `content.md`, with message `docs: Golden Engine design, mockups and plan`.
- [ ] **Step 2:** Install the Tech Stack versions exactly. Configure Vitest with the jsdom environment and `tests/unit/**`. Configure Playwright with `webServer: npm run preview`, Chromium only, and projects `desktop` (1440×900), `tablet` (834×1112), `phone` (390×844).
- [ ] **Step 3: Write the failing test** `tests/unit/app.test.tsx`: `it('renders the name as the single h1')`. Render `<App locale="en"/>` and assert `getAllByRole('heading',{level:1})` has length 1 and contains "Ashutosh Nayak".
- [ ] **Step 4:** Run `npm test`. Expected: FAIL, because App does not exist yet.
- [ ] **Step 5:** Implement a minimal `App` rendering `<h1>Ashutosh Nayak</h1>` inside `<main>`. `src/main.tsx` mounts it. Do the file moves and deletions listed above.
- [ ] **Step 6:** Run `npm test` and `npm run build` (the prerender script does not exist yet, so temporarily build without it). Expected: PASS, and `dist/index.html` exists.
- [ ] **Step 7: Commit** with message `chore: scaffold Vite + React + R3F, retire scroll-story site`.

### Task 1: Content model and four-language dictionaries

**Files:**
- Create: `src/content/types.ts`, `src/content/site.ts`, `src/i18n/en.ts`, `src/i18n/de.ts`, `src/i18n/nl.ts`, `src/i18n/pl.ts`, `src/i18n/index.ts`, `tests/unit/content.test.ts`, `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = 'en'|'de'|'nl'|'pl'`
  - `const LOCALES: Locale[]`
  - `localePath(l: Locale): string` (`'/'` | `'/de/'` …)
  - `type Dict = typeof en` (an object of string keys to strings)
  - `t(locale: Locale, key: keyof Dict): string`
  - `site` object holding all facts:
    - `site.stats: {value: string, labelKey, scopeKey}[]`
    - `site.projects: {id, titleKey, problemKey, approachKey, outcomeKey, stack: string[], featured: boolean}[]`
    - `site.path: {dates: string, titleKey, orgKey, bodyKey}[]`, newest first
    - `site.credentials: {name, issuer, href, badge, earlyAdopter?: true}[]`
    - `site.skills: {groupKey, items: string[]}[]`
    - `site.contact: {email, linkedin, github}`
    - `site.voiceStops: {id, titleKey, bodyKey}[]`
    - `site.agentPhases`
    - `site.chipRegions` (ids only; colours come in Task 5)

- [ ] **Step 1: Write the failing tests.**
  - `content.test.ts`:
    - `it('keeps every required fact')`: the serialised `site` plus the `en` dictionary contains each of `'15,000+'`, `'80%'`, `'99%+'`, `'5+'`, `'15+'`, `'20+'`, `'95%'`, `'Jun 2025'`, `'Jun 2023'`, `'Jun 2021'`, `'Mar 2023'`, `'2017'`, `'2021'`, `'2018'`, `'Silicon Institute of Technology'`, `'Cozentus Technologies'`, `'LiveKit'`, `'SIP'`, `'Asterisk'`, `'Terraform'`, `'AWS Bedrock'`, `'MCP'`.
    - `it('has 8 projects with exactly 2 featured: voice bot and agentic SDLC framework')`
    - `it('lists the path newest first with Senior Technical Manager, DevOps & Innovation Lead (Jun 2025 → present)')`
    - `it('has 4 Credly credentials whose badge files exist in public/badges')`
    - `it('never contains a phone number or tel: link')`: no phone-like run of digits and no `tel:`.
    - `it('never names internal mail-service identifiers')`: no match for the encoded internal-identifier pattern in `site` or any dictionary.
    - `it('uses only the three contact destinations')`
  - `i18n.test.ts`:
    - `it('has the same non-empty keys in all four locales')`
    - `it('every key used by site exists in the dictionaries')`
    - `it('no locale string equals its key')`
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Write `site.ts` from `content.md` and spec §5/§5a/§9. Write the `en` copy within spec §5 directions:
  - hero promise `"I build agents that build software."` / `"And the systems they run on."`;
  - chapter headlines as in the spec;
  - chapter 03 honest line: `"Agents never approve, merge or deploy. I do."`
  
  Translate everything into `de`, `nl` and `pl` with natural, idiomatic phrasing. Reuse the existing translations where content matches (`git show main:assets/js/story.js`, `git show archive/workspace-redesign:assets/js/translations.js`). Keep technical names (LiveKit, SIP, Terraform…) untranslated.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with message `feat: typed content model and EN/DE/NL/PL dictionaries`.

### Task 2: Mode, locale, capability and visibility helpers

**Files:**
- Create: `src/app/storage.ts`, `src/app/mode.ts`, `src/app/locale.ts`, `src/app/capability.ts`, `src/app/useVisibility.ts`, `src/app/noFlash.ts`, `tests/unit/helpers.test.ts`

**Interfaces:**
- Produces:
  - `safeGet(store: Storage|undefined, key): string|null` and `safeSet(store, key, value): void`. Neither ever throws.
  - `initialMode(stored: string|null, prefersDark: boolean): 'dark'|'light'`
  - `applyMode(m)`: sets `document.documentElement.dataset.mode` and persists `ge-mode`.
  - `preferredLocale(stored, current: Locale): Locale|null`: returns a locale to redirect to, or null.
  - `type Capability = 'full'|'lite'|'static'`
  - `detectCapability(env: {reducedMotion: boolean, webgl: boolean, cores: number, memoryGB?: number, width: number}): Capability`. Returns `static` if reduced motion or no WebGL. Returns `lite` if cores ≤ 4, memory ≤ 4, or width < 768. Otherwise `full`.
  - `useVisibility(ref): boolean`: true only while the document is visible and the element intersects the viewport.
  - `NO_FLASH_SCRIPT: string`: an inline head script that sets `data-mode` from storage or the system preference before first paint.

- [ ] **Step 1: Write failing tests.**
  - `it('stores-survive-throwing-storage')`: a storage whose `getItem`/`setItem` throw gives `safeGet` → null and `safeSet` no throw; `initialMode(null, false)` → `'light'`.
  - Table tests for `initialMode`, `preferredLocale` and `detectCapability`, covering every branch above.
  - `it('visibility-pauses-frameloop')`: with `document.hidden=true`, `useVisibility` returns false; after a `visibilitychange` to visible plus an intersecting entry, it returns true.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement as specified.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit** with message `feat: defensive mode/locale storage, capability detection, visibility hook`.

### Task 3: The readable page (no 3D yet)

**Files:**
- Create: `src/app/Nav.tsx`, `src/chapters/{Hero,InProduction,OneCall,Agents,Infra,Work,Path,Contact}.tsx`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/chapters.css`, `tests/unit/page.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `t`, `site`, `Locale`, `localePath`, `applyMode`.
- Produces:
  - Each chapter has a `<section id>` from: `top`, `production`, `call`, `agents`, `infra`, `work`, `path`, `contact`.
  - Each chapter has an empty `<div data-scene="<id>" aria-hidden="true">` slot. Task 6 mounts the 3D scene into it.
  - Section-local progress CSS variable `--p` (0–1), set later by Task 6.

- [ ] **Step 1: Write failing tests** in `page.test.tsx`, one block per locale:
  - `it('renders every chapter heading in order')`
  - `it('nav links point at #call #agents #infra #work #path #contact')`
  - `it('language links go to / /de/ /nl/ /pl/ with hreflang')`
  - `it('mode toggle flips data-mode and has an accessible name')`
  - `it('career timeline has 5 entries, Senior Technical Manager first')`
  - `it('credential links open Credly in a new tab with rel=noopener')`
  - `it('all chapter-02 stops and chapter-03 gates are present as text')`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Build semantic markup and CSS from the mockup (`site-themes.html`) using the Global Constraints tokens:
  - gold text and buttons in both modes;
  - glowing gold timeline;
  - featured cards with a Spectrum-tinted background;
  - a light-mode gradient for the hero accent and buttons.
  
  At 390 px, chapters stack with 16 px side gutters and no horizontal overflow.
- [ ] **Step 4:** Run. Expected: PASS. Then run `npm run dev` and compare the page side by side with the mockup in both modes.
- [ ] **Step 5: Commit** with message `feat: semantic chapters, nav, language and mode controls, gold/light styling`.

### Task 4: Per-locale prerender and SEO

**Files:**
- Create: `src/entry-server.tsx`, `src/entry-client.tsx`, `scripts/prerender.mjs`, `tests/unit/prerender.test.ts`
- Modify: `src/main.tsx` (replaced by `entry-client.tsx`), `index.html`, `vite.config.ts` (SSR build of `entry-server.tsx` to `dist/server/`)

**Interfaces:**
- Produces:
  - `render(locale: Locale): string` in `entry-server.tsx`.
  - `prerender.mjs` writes `dist/index.html`, `dist/de/index.html`, `dist/nl/index.html` and `dist/pl/index.html`, plus `dist/sitemap.xml` (4 URLs, `lastmod` = build date). Each page has:
    - `lang`, `<title>` and meta description per locale;
    - canonical `https://ashutosh-nayak-official.github.io<path>`;
    - four `hreflang` alternates plus `x-default` → `/`;
    - Open Graph and Twitter tags with `og:image` = `/og/engine.jpg`;
    - `NO_FLASH_SCRIPT` inline in `<head>`.
  - It then deletes `dist/server/`.
  - The client hydrates with `hydrateRoot`. The locale is read from `document.documentElement.lang`.

- [ ] **Step 1: Write failing test** `prerender.test.ts`, which runs after `npm run build` (Vitest `globalSetup` runs the build once):
  - `it('writes four locale pages with full text in the HTML')`: each file contains its locale's hero line and the contact email.
  - `it('each page has canonical, 4 hreflang + x-default, og:image')`
  - `it('sitemap lists the four URLs')`
  - `it('no page contains tel:')`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. In the client, if `preferredLocale(safeGet(localStorage,'ge-locale'), current)` returns a locale, `location.replace` to it. Language links store the clicked locale before navigating.
- [ ] **Step 4:** Run `npm run build && npm test`. Expected: PASS.
- [ ] **Step 5: Commit** with message `feat: prerender EN/DE/NL/PL pages with hreflang, canonical, OG and sitemap`.

### Task 5: Engine maths (pure, no rendering)

**Files:**
- Create: `src/engine/geometry.ts`, `src/engine/palette.ts`, `src/engine/signals.ts`, `src/engine/state.ts`, `src/engine/rng.ts`, `tests/unit/engine.test.ts`

**Interfaces:**
- Produces:
  - `mulberry32(seed: number): () => number`
  - `triacontahedron(): { vertices: [number,number,number][], edges: [number,number][] }`. Vertices are normalised to radius 1.05. Icosahedral vertices `(0,±φ,±1)` cyclic; dodecahedral vertices `(±1,±1,±1)` and `(0,±1/φ,±φ)` cyclic. Each icosahedral vertex joins its 5 nearest dodecahedral vertices.
  - `RINGS: {r: number, width: number, rot0: number, spin: number, tumble: number, phase: number, ticks: number, dash: number[]}[]`. Four rings with r = `1, .88, .76, .64`. Take the values from the mockup's `ARM`.
  - `spectrum(mode: 'dark'|'light'): string[]`
  - `chipColor(region: ChipRegion, mode): string`
  - `nextBurst(rng): { delayMs: number, bolts: 1|2, staggerMs: number[] }`
  - `boltPath(from: Vec2, to: Vec2, rng, opts?: {fork?: boolean}): { main: Vec2[], branch: Vec2[] }` (midpoint displacement, 5 levels, displacement 0.32 × length; at most one fork)
  - `engineState(input: {t: number, build: number, burst: number, unwind: number}): { rings: {visibleFrac: number, radiusScale: number, opacity: number, gapScale: number, rot: number, squash: number}[], heartEdgeFrac: number[], heartOpacity: number, shardProgress: number, signalsAllowed: boolean }`. Encodes the mockup's `engine()` build, burst and unwind rules. `signalsAllowed` = build ≥ 1, burst < 0.2 and unwind < 0.7.

- [ ] **Step 1: Write failing tests.**
  - `it('triacontahedron has 32 vertices and 60 edges')`
  - `it('icosahedral vertices have degree 5 and dodecahedral degree 3')`
  - `it('all 30 rhombic faces are planar within 1e-9')`: find faces as pairs of icosahedral vertices that share two dodecahedral neighbours.
  - `it('all edges have equal length within 1e-9')`
  - `it('nextBurst stays in 1300–3200 ms and gives 1 bolt ~70% over 10k seeded draws (±3%)')`
  - `it('boltPath starts and ends exactly at its endpoints and forks at most once')`
  - `it('engineState: build=0 hides everything; build=1,burst=0 shows full rings; burst=1 gives ring opacity 0; signals blocked while building or bursting')`
  - `it('palette values match the spec exactly')`: the Spectrum stops and chip colours listed in Global Constraints.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit** with message `feat: engine geometry, palette, signal scheduling and state functions`.

### Task 6: Scroll, shared canvas, capability gating

**Files:**
- Create: `src/scroll/SmoothScroll.tsx`, `src/scroll/useSectionProgress.ts`, `src/three/Stage.tsx`, `src/three/SceneSlot.tsx`, `src/three/Stills.tsx`, `tests/unit/scroll.test.ts`
- Modify: `src/app/App.tsx`, every chapter (wrap its slot in `<SceneSlot id=…>`)

**Interfaces:**
- Consumes: `detectCapability`, `useVisibility`, the scene slots from Task 3.
- Produces:
  - `useSectionProgress(id): MutableRefObject<number>` (0–1 through the section's scroll range, updated by ScrollTrigger and never by React state).
  - `pinnedProgress(scrollY, top, height, vh): number` (pure, exported for tests).
  - `<Stage>` mounts after hydration via `React.lazy`. It is one `<Canvas>` fixed behind content (`aria-hidden`, `pointer-events:none`), with `dpr={[1, capability==='lite' ? 1.25 : 2]}` and `frameloop` set to `'always'` when visible or `'never'` when not. It renders `<View.Port/>`.
  - `<SceneSlot id children>` renders a drei `<View>` tracking the chapter's `[data-scene]` element when capability ≠ `static`. Otherwise it renders `<Stills id>` (an `<img>` of `/stills/<id>-<mode>.webp`, decorative, `alt=""`).
  - The postprocessing `Bloom` is used everywhere; `DepthOfField` only when capability is `full`.

- [ ] **Step 1: Write failing test** `scroll.test.ts`: a table test for `pinnedProgress` covering before the section (0), mid (0.5), after (1), and zero-height safety.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Lenis drives scrolling and feeds `ScrollTrigger.update`; native scroll is used when capability is `static`. Hash links scroll with Lenis `scrollTo(target)` and move focus to the target heading.
- [ ] **Step 4:** Run `npm test` and `npm run dev`. Check that the canvas shows nothing yet and that pages scroll smoothly.
- [ ] **Step 5: Commit** with message `feat: smooth scroll, section progress, shared R3F stage with capability-gated stills`.

### Task 7: The Golden Engine component and electric signals

**Files:**
- Create: `src/three/engine/Engine.tsx`, `src/three/engine/Rings.tsx`, `src/three/engine/Heart.tsx`, `src/three/engine/Signals.tsx`, `src/three/engine/Shards.tsx`, `src/three/engine/materials.ts`, `tests/unit/engine-component.test.tsx`

**Interfaces:**
- Consumes: Task 5 (`triacontahedron`, `RINGS`, `engineState`, `nextBurst`, `boltPath`, `spectrum`).
- Produces: `<Engine progress={{build, burst, unwind}} dim={number} signals={boolean} mode={'dark'|'light'} parallax={boolean} />`. Each frame, inputs are read from refs; React does not re-render per frame.
  - **Rings:** dashed line loops with ticks.
  - **Heart:** line segments plus vertex points, with depth fade.
  - **Spectrum colour:** a gradient along a screen-space direction that rotates slowly (as in the mockup's `tint`).
  - **Dark mode:** additive blending and bloom.
  - **Light mode:** normal blending, saturated deeper Spectrum stops, no halo strokes, a faint core bloom only, and signals drawn as thicker amber lines.

- [ ] **Step 1: Write failing test** `engine-component.test.tsx`. Mock `@react-three/fiber`'s `useFrame` and run the component's frame callback with stubbed clocks:
  - `it('signals spawn only when signalsAllowed and signals=true')`
  - `it('never more than 2 live bolts per burst')`
  - `it('pauses scheduling while document.hidden')`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Ring rotation speeds come from `RINGS`, so a full turn takes tens of seconds. The heart turns on two axes (`0.22·t`, `0.42 + 0.18·sin(0.13·t)`). Parallax tilt is ±3° toward the cursor on fine pointers only.
- [ ] **Step 4:** Run `npm test`. Then, in `npm run dev`, mount `<Engine>` alone in a scratch route and compare with the mockup hero in both modes.
- [ ] **Step 5: Commit** with message `feat: Golden Engine (armillary rings, triacontahedron heart, electric signals)`.

### Task 8: Loader and hero breakout

**Files:**
- Create: `src/chapters/Loader.tsx`, `src/three/scenes/HeroScene.tsx`, `tests/unit/loader.test.tsx`
- Modify: `src/chapters/Hero.tsx`, `src/styles/chapters.css`

**Interfaces:**
- Consumes: `<Engine>`, `useSectionProgress('top')`, drei `useProgress`, `safeGet/safeSet(sessionStorage,'ge-intro-seen')`.
- Produces: `loaderProgress(elapsedMs, assetsLoaded: boolean): {pct: number, done: boolean}` (pure). The build animation spans 2400 ms. If assets are not loaded yet, it holds at 99. It is done at 2400 ms with assets loaded, or at 3500 ms in any case.

- [ ] **Step 1: Write failing tests:**
  - `it('loaderProgress reaches 100 at 2400ms when assets loaded')`
  - `it('holds at 99 until assets load')`
  - `it('forces done at 3500ms')`
  - `it('skips when ge-intro-seen is set, on keydown, on pointerdown, and under reduced motion')`
  - `it('hero copy is in the DOM before the loader finishes')`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - the counter `000`→`100` and status line (keys `loader_initialising`, `loader_orchestrator`, `loader_shaping`, `loader_aligning`, `loader_ready`, in all locales);
  - `build` fed into the engine;
  - the hero section height `210vh` with a sticky pin; `burst` = section progress;
  - the copy lifts −90 px and fades.
  
  The engine sits centred during loading and slides to the right on `ready`; on mobile it stays centred behind the text at reduced opacity.
- [ ] **Step 4:** Run. Expected: PASS. Compare against the mockup's loading and breakout.
- [ ] **Step 5: Commit** with message `feat: assembly loader and scroll-driven hero breakout`.

### Task 9: Chapter 02, one call step by step

**Files:**
- Create: `src/three/scenes/CallScene.tsx`, `tests/unit/call.test.ts`
- Modify: `src/chapters/OneCall.tsx`

**Interfaces:**
- Produces: `callState(p: number): {unwind: number, wave: number, activeStops: number}`. `unwind` = clamp(2.5p). `wave` = clamp(3(p − 0.15)). `activeStops` = floor(clamp((p − 0.25)/0.6) × 5), giving 0–5.

- [ ] **Step 1: Write failing test:** `it('callState maps progress to unwind, wave and lit stops')` with p = 0, 0.2, 0.5, 0.85 and 1.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - a 300 vh sticky section;
  - the engine (with signals) unwinding into a Spectrum sound wave (a line with an animated envelope);
  - five stop nodes lighting in turn, with DOM stop cards getting `aria-current="step"` when lit;
  - the languages line `हिन्दी · English · international languages`;
  - a small monitoring panel with labels only and no numbers.
- [ ] **Step 4:** Run. Expected: PASS. Compare with the mockup.
- [ ] **Step 5: Commit** with message `feat: chapter 02 multilingual voice bot walkthrough`.

### Task 10: Chapter 03, agents through three human gates

**Files:**
- Create: `src/three/scenes/AgentsScene.tsx`, `tests/unit/agents.test.ts`
- Modify: `src/chapters/Agents.tsx`

**Interfaces:**
- Produces: `agentsState(p: number): {phase: 'spec'|'plan'|'build'|'verify'|'ship', gates: [boolean, boolean, boolean], specLines: number}`. Gate 1 opens at the plan→ boundary, Gate 2 opens before build, and Gate 3 opens before ship. Also produces `TILE_LABELS = ['api','schema','ui','tests','infra','docs','auth','obs','perf','security'] as const`.

- [ ] **Step 1: Write failing tests:**
  - `it('phases advance in order and gates open only at their boundaries')`
  - `it('tile labels are generic nouns only')`
  - `it('chapter copy states agents never approve, merge or deploy, in every locale')`
  - `it('no digits appear in the scene labels')`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - `SPEC.md` panel writing lines;
  - the engine as orchestrator (signals on), with a spec→engine thread;
  - task tiles fanning out;
  - parallel agent sparks, with roughly 14% of tiles failing red once and then retrying;
  - three glowing gate thresholds that open on their phase with a short "approved" pulse;
  - finished tiles streaming through Gate 3 to release.
  
  The pill indicator reads SPEC · PLAN · BUILD · VERIFY · SHIP with gate markers between. The copy names the framework's roles generically and uses "a mail-service platform" as the example.
- [ ] **Step 4:** Run. Expected: PASS. Compare with the mockup.
- [ ] **Step 5: Commit** with message `feat: chapter 03 spec-driven parallel agents through human gates`.

### Task 11: Chapter 04, the AN·1 chip

**Files:**
- Create: `src/three/scenes/ChipScene.tsx`, `src/three/chip/layout.ts`, `tests/unit/chip.test.ts`
- Modify: `src/chapters/Infra.tsx`

**Interfaces:**
- Produces:
  - `CHIP_LAYOUT: {region: ChipRegion, x, y, w, h, cols, rows, start, end}[]` in die-local 0–1 coordinates, copied from the mockup's `grid(...)` calls.
  - `chipState(p: number): {lit: Record<ChipRegion, number>, power: number, memory: number, sheen: number, terminalLines: number}`. Order: power .04 → compute .14 → schedulers .26 → cache .44 → inference .36 → agents .52 → memory .64 → CI/CD .78 → observability .82 → network .86 → sheen .90.

- [ ] **Step 1: Write failing tests:**
  - `it('regions light in the spec order')`
  - `it('every region has a label key and a colour')`
  - `it('the chip is marked AN·1 and no label contains Apple, M1-M9 or a logo glyph')`
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement a real 3D chip viewed at a slight angle:
  - a rounded package and die;
  - extruded blocks whose emissive colour is `chipColor(region)` × lit;
  - two memory packages with pulsing bus lines;
  - pins with travelling pulses;
  - a sheen sweep at the end.
  
  In light mode it stays a dark product-shot object. Terminal lines type in step with `terminalLines`, using DOM text in all locales.
- [ ] **Step 4:** Run. Expected: PASS. Compare with the mockup.
- [ ] **Step 5: Commit** with message `feat: chapter 04 AN·1 chip lighting up region by region`.

### Task 12: Contact scene, OG image and fallback stills

**Files:**
- Create: `src/three/scenes/ContactScene.tsx`, `scripts/capture-stills.mjs`, `public/stills/*.webp` (generated), `public/og/engine.jpg` (generated, 1200×630)
- Modify: `src/chapters/Contact.tsx`, `src/chapters/Work.tsx` (featured-card Spectrum glow)

**Interfaces:**
- Produces:
  - `?still=<id>&mode=<m>` query support: freezes the scene at a representative progress (hero 0, call 0.9, agents 0.75, infra 1, contact 0), hides the DOM chrome and signals `window.__stillReady = true`.
  - `capture-stills.mjs` drives Playwright against `vite preview`. It writes `public/stills/{top,call,agents,infra,contact}-{dark,light}.webp` and `public/og/engine.jpg`.

- [ ] **Step 1:** Implement the contact engine (dim 0.7, slow, signals on) and the featured-card glow.
- [ ] **Step 2:** Run `npm run build && node scripts/capture-stills.mjs`. Expected: 10 webp files plus 1 jpg. Open each image and check it shows its chapter's visual in the correct mode.
- [ ] **Step 3:** Run `npm run build` again so the stills ship. Commit the generated images with message `feat: contact scene, OG image and per-chapter fallback stills`.

### Task 13: End-to-end, accessibility and performance verification

**Files:**
- Create: `tests/e2e/site.spec.ts`, `tests/e2e/fallbacks.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/review-focus.spec.ts`

- [ ] **Step 1: Write the e2e tests:**
  - `site.spec.ts`, per project:
    - `it('loads with no console errors and screenshots every chapter in dark and light')` (attach the screenshots);
    - `it('loader can be skipped and is skipped on reload in the same session')`;
    - `it('language switch navigates and is remembered')`;
    - `it('mode toggle persists across reload')`.
  - `fallbacks.spec.ts`:
    - `it('reduced motion: no canvas, stills shown, all text readable')`;
    - `it('WebGL disabled (--disable-gpu --disable-webgl): stills shown')`;
    - `it('JavaScript disabled: every chapter heading and the contact email are visible')`.
  - `a11y.spec.ts`: axe WCAG 2 A/AA on `/` and `/de/`, in both modes, at desktop and phone. Zero violations.
  - `review-focus.spec.ts`:
    - `nav-links-land-on-sections`: click each nav link and assert the target `h2` is in the viewport and visible after 1.5 s.
    - `resize-no-horizontal-overflow`: at mid-page, resize 1440 → 390 → 1440 and assert `scrollWidth <= innerWidth` each time.
    - `storage-blocked`: an init script makes `Storage.prototype` methods throw. Toggle mode, switch language and pass the loader with no page errors.
    - `locales-fit-on-phone`: for each locale at 390 px, no `h1`, `h2`, `.cta` or `nav a` has `scrollWidth > clientWidth` or overflows the viewport.
- [ ] **Step 2:** Run `npm run build && npm run e2e`. Fix the code (not the tests) until all pass.
- [ ] **Step 3:** Performance pass. Run Lighthouse (`npx lighthouse http://localhost:4173 --preset=desktop` and the mobile default) against `vite preview`. Targets: Performance ≥ 85 mobile and ≥ 95 desktop, Accessibility 100. Also check that the 3D chunk is not in the initial HTML's blocking scripts. Record the scores in the PR description.
- [ ] **Step 4: Commit** with message `test: e2e, fallback, accessibility and review-focus coverage`.

### Task 14: CI, deploy workflow, README, and cutover (cutover is owner-gated)

**Files:**
- Create: `.github/workflows/ci.yml` (on push to `feat/**` and pull requests: install, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run e2e`), `.github/workflows/deploy.yml` (on push to `main` only: build, then `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` with `dist`, `actions/deploy-pages@v4`; permissions `pages: write` and `id-token: write`)
- Modify: `README.md` (stack, scripts, how to preview, how stills are regenerated, the deploy and cutover steps)

- [ ] **Step 1:** Add the workflows and README. Push the branch (ask Ashutosh before the first push). Expected: CI is green on `feat/golden-engine`.
- [ ] **Step 2:** Open a pull request to `main` with the screenshots and Lighthouse scores. Do not merge.
- [ ] **Step 3: Cutover, only when Ashutosh says go:**
  1. He (or Claude, with his explicit approval) switches Settings → Pages → Source to "GitHub Actions".
  2. Merge the PR.
  3. Watch `deploy.yml` succeed.
  4. Check `https://ashutosh-nayak-official.github.io/`, `/de/`, `/nl/` and `/pl/` live.
  
  To roll back, revert the merge commit and set the Pages source back to "Deploy from branch: main /".
