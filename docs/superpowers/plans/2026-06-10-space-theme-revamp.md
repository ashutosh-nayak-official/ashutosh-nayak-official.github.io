# The Cosmic Voyage — Space Theme Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's presentation as a scroll-driven voyage through deep space (Three.js), preserving every piece of content, the 4-language i18n system, the light/dark toggle, and the Harry Potter easter egg.

**Architecture:** One fixed full-screen WebGL canvas behind the DOM renders a continuous 3D scene (solar system → asteroids → Mars → wormhole → black hole → supernova/constellations → galaxy). Scroll progress drives the camera; DOM sections overlay as HUD panels. The current single `index.html` is split into `index.html` + `assets/css/space.css` + `assets/js/main.js` (UI) + `assets/js/scene.js` (3D). On any WebGL/CDN failure, the existing 2D particle canvas is the fallback.

**Tech Stack:** Vanilla HTML/CSS/JS, Three.js v0.160.0 (ES module, dynamic `import()` from jsDelivr CDN, no build tooling), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-06-10-space-theme-revamp-design.md`

**Testing approach:** This is a zero-build static site with no test framework; "tests" are (a) a content-preservation grep script run after every task, and (b) browser verification with a local server (`python3 -m http.server 8000`) checking console errors and visuals. The executor should use the frontend-design skill for visual polish during CSS-heavy tasks.

---

## Module contract (locked — all tasks must conform)

`assets/js/scene.js` (classic script, uses dynamic `import()` internally) exposes:

```js
window.SpaceScene = {
  // Builds renderer + scene into #spaceCanvas. Returns false (and dispatches
  // 'scene:fallback' on document) if WebGL/CDN unavailable. Async.
  init: async function () {},
  // p in [0,1] = overall page scroll progress. Drives camera along the path.
  setScrollProgress: function (p) {},
  // 'dark' | 'light' | 'magic' — re-tints materials. 'magic' = gold particles.
  setTheme: function (mode) {},
  // Plays the supernova burst once (no-op on repeat calls or reduced motion).
  triggerSupernova: function () {},
  // Recomputes landmark depths from current DOM section offsets.
  layout: function () {},
};
```

`assets/js/main.js` (classic script) owns: i18n, theme toggle, HP magic system, mobile menu, smooth scroll, counters, about-reveal, experience crossfade, projects horizontal scroll, observers, cursor, scroll progress bar, and the wiring INTO `SpaceScene` (scroll events → `setScrollProgress`, theme changes → `setTheme`, skills IntersectionObserver → `triggerSupernova`, resize → `layout`, `scene:fallback` event → start 2D particle fallback).

Landmark depth model inside scene.js: a 4000-unit path along −Z. At `layout()`, each anchor section's vertical center (fraction of total scrollable height) maps to a Z depth: `z = -fraction * 4000`. Camera: `camera.position.z = 50 - progress * 4050`. Landmarks: hero=solar system, about=asteroid field, experience=Mars, gap(experience→projects)=wormhole tunnel, projects=black hole, skills=supernova origin + constellations, contact=spiral galaxy. Starfield is camera-relative (re-wraps around camera Z).

---

### Task 0: Content-preservation guard script

**Files:**
- Create: `scripts/check-content.sh`

- [ ] **Step 1: Write the guard script**

```bash
#!/usr/bin/env bash
# Verifies all portfolio content survives the revamp. Greps across index.html + assets/js.
set -u
FILES="index.html"
[ -d assets/js ] && FILES="$FILES $(ls assets/js/*.js 2>/dev/null)"
fail=0
check() {
  if ! grep -qF -- "$1" $FILES; then echo "MISSING: $1"; fail=1; fi
}
# Identity & meta
check "Ashutosh Nayak — GenAI Developer & Cloud/DevOps Engineer"
check "assets/photos/Ghibli.png"
# Hero stats
check "5+"; check "99%+"; check "15+"; check "95%"
check "stat_experience"; check "stat_uptime"; check "stat_workshops"; check "stat_bonus"; check "stat_success"
# Experience
check "Cozentus Technologies, Bhubaneswar"
check "Jun 2023 → Present"; check "Jun 2021 → Mar 2023"
for k in rh_1_1 rh_1_2 rh_1_3 rh_1_4 rh_1_5 rh_1_6 rh_1_7 rh_2_1 rh_2_2 rh_2_3 rh_2_4 rh_2_5; do check "$k"; done
# Projects
for k in proj_1_title proj_2_title proj_3_title proj_4_title proj_5_title proj_6_title; do check "$k"; done
check "AWS Bedrock"; check "Smart Drainage System"
# Skills
check "RAG Pipelines"; check "Terraform"; check "LangChain"; check "EC2 / ECS / EKS"; check "Blue/Green Deploys"
# Certs
check "credly.com/badges/50474776-14fd-448c-9065-e9afd8b5f8c1"
check "credly.com/badges/2690d4e9-b081-4710-8dba-c2b5a4563804"
check "credly.com/badges/b8b0dd03-129a-41d5-b0fa-bb38bbf9d6fb"
check "credly.com/badges/aefab590-c7db-46f8-a15f-a3bcd2123d5e"
check "aws-certified-generative-ai-developer-professional-EA.png"
check "aws-certified-machine-learning-specialty.png"
# Contact
check "ashutosh.nayak.formal@gmail.com"
check "linkedin.com/in/ashutosh-nayak-81an"
check "+919778108181"
# i18n — all four dictionaries and the system
for k in 'en: {' 'de: {' 'nl: {' 'pl: {'; do check "$k"; done
check "data-i18n"; check "applyTranslations"
check "DIE ZUKUNFT ERKUNDEN"; check "DE TOEKOMST VERKENNEN"; check "ODKRYWAM PRZYSZŁOŚĆ"
# HP easter egg
check "I solemnly swear that I am up to no good"
check "Mischief Managed"; check "wandToggle"; check "data-magic"
# Theme toggle
check "themeToggle"; check "localStorage.getItem('theme')"
if [ $fail -eq 1 ]; then echo "CONTENT CHECK FAILED"; exit 1; else echo "CONTENT CHECK PASSED"; fi
```

- [ ] **Step 2: Make executable and verify it passes against the CURRENT site**

Run: `chmod +x scripts/check-content.sh && ./scripts/check-content.sh`
Expected: `CONTENT CHECK PASSED` (proves the guard works before any change).

- [ ] **Step 3: Commit**

```bash
git add scripts/check-content.sh
git commit -m "test: add content-preservation guard script"
```

---

### Task 1: Pure refactor — split the single file (no visual change)

**Files:**
- Modify: `index.html` (3,591 lines → ~620 lines of DOM)
- Create: `assets/css/space.css` (receives lines 11–2021, the entire `<style>` body)
- Create: `assets/js/main.js` (receives lines 2629–3589, the entire `<script>` body)

- [ ] **Step 1: Move CSS out.** Cut everything between `<style>` and `</style>` into `assets/css/space.css` verbatim. Replace the style block in `index.html` with:

```html
<link rel="stylesheet" href="assets/css/space.css">
```

- [ ] **Step 2: Move JS out.** Cut everything inside the final `<script>...</script>` into `assets/js/main.js` verbatim. Replace with `<script src="assets/js/main.js"></script>` just before `</body>`. While here, delete the two duplicate Cloudflare `email-decode.min.js` script tags on line 2628 — they are injected artifacts of a past Cloudflare deployment, 404 on GitHub Pages, and do nothing.

- [ ] **Step 3: Run the content guard**

Run: `./scripts/check-content.sh`
Expected: `CONTENT CHECK PASSED`

- [ ] **Step 4: Browser-verify identical behavior**

Run: `python3 -m http.server 8000` then open `http://localhost:8000`.
Expected: site looks and behaves exactly as before (particles, cursor, themes, languages, HP wand, all sections). Zero console errors except the now-removed Cloudflare scripts no longer 404ing.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/space.css assets/js/main.js
git commit -m "refactor: split index.html into separate CSS/JS files (no behavior change)"
```

---

### Task 2: Space design language — tokens, fonts, nav HUD, footer

**Files:**
- Modify: `index.html` (font link), `assets/css/space.css` (tokens + nav + footer + section labels)

- [ ] **Step 1: Swap display font.** In `index.html`, replace the Google Fonts link's `Syne` family with `Space+Grotesk:wght@400;500;600;700` (keep DM Sans, JetBrains Mono, Cinzel, Cinzel Decorative, Crimson Text — the last three serve the HP theme).

- [ ] **Step 2: Update root tokens** in `space.css`:

```css
:root {
  --bg: #030308;
  --bg-elevated: #0a0d1f;
  --surface: rgba(150,180,255,0.04);
  --surface-hover: rgba(150,180,255,0.08);
  --border: rgba(150,180,255,0.10);
  --border-accent: rgba(0,229,255,0.25);
  --text: #e9edf7;
  --text-dim: #8a93b5;
  --text-muted: #4a5170;
  --cyan: #00E5FF;          /* plasma cyan */
  --cyan-glow: rgba(0,229,255,0.12);
  --amber: #FFB547;          /* solar amber */
  --amber-glow: rgba(255,181,71,0.10);
  --magenta: #B388FF;        /* nebula violet */
  --green: #00E88F;
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

(`--magenta` keeps its variable name so HP overrides and existing rules continue to work; its value becomes nebula violet.)

- [ ] **Step 3: HUD-ify chrome.** Restyle in place (selectors unchanged): nav becomes a mission-console bar — `nav-logo` text changes in `index.html` to `MISSION CONTROL // ashutosh.dev` (keep the pulsing dot), nav links get mono font + radar-sweep underline (reuse the existing `::after` underline, add a brief `box-shadow` sweep). Section labels (`.section-label`) get bracketed HUD framing via `::before`/`::after` content `'[ '` / `' ]'` in mono. Footer text in `index.html` becomes `© 2026 Ashutosh Nayak — End of transmission.` and the EN i18n `footer` value in `main.js` is updated to match (other languages: DE `— Ende der Übertragung.`, NL `— Einde van transmissie.`, PL `— Koniec transmisji.`).

- [ ] **Step 4: Scroll progress → flight trajectory.** In `main.js`, the injected `.scroll-progress-bar` gets a small glowing "craft" dot at its leading edge: after `bar` creation, append `<div>` 6px circle with `box-shadow: 0 0 8px var(--cyan)` positioned at the bar's right end.

- [ ] **Step 5: Verify + commit**

Run guard + browser check (fonts swapped, nav/footers restyled, nothing broken in light or HP mode).

```bash
git add index.html assets/css/space.css assets/js/main.js
git commit -m "feat: space design tokens, Space Grotesk, mission-console chrome"
```

---

### Task 3: scene.js skeleton — renderer, starfield, camera path, fallback

**Files:**
- Create: `assets/js/scene.js`
- Modify: `index.html` (add `<canvas id="spaceCanvas">` + script tag), `assets/css/space.css` (canvas rules), `assets/js/main.js` (wiring + fallback)

- [ ] **Step 1: Add canvas + script.** In `index.html`, directly after `<canvas id="particleCanvas"></canvas>` add `<canvas id="spaceCanvas"></canvas>`, and before the `main.js` script tag add `<script src="assets/js/scene.js"></script>`. In `space.css`:

```css
#spaceCanvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
/* particleCanvas becomes the fallback layer — hidden while WebGL is alive */
body.scene-active #particleCanvas { display: none; }
```

- [ ] **Step 2: Write scene.js core** (complete file at this stage):

```js
// assets/js/scene.js — The Cosmic Voyage 3D engine
(function () {
  'use strict';
  const PATH = 4000;                 // total camera travel along -Z
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  let THREE, renderer, scene, camera, starLayers = [], landmarks = {};
  let progress = 0, theme = 'dark', mouse = { x: 0, y: 0 }, ready = false;

  const PALETTES = {
    dark:  { star: 0xffffff, accent: 0x00e5ff, warm: 0xffb547 },
    light: { star: 0x1a2a4a, accent: 0x0066cc, warm: 0xb45309 },
    magic: { star: 0xd3a625, accent: 0xd3a625, warm: 0xae0001 },
  };

  function fail() {
    document.dispatchEvent(new CustomEvent('scene:fallback'));
  }

  async function init() {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return fail();
    try { THREE = await import(CDN); } catch (e) { return fail(); }
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
    } catch (e) { return fail(); }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.00045);
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 50);
    buildStarfield();
    document.body.classList.add('scene-active');
    window.addEventListener('resize', onResize);
    if (!isMobile) document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / innerHeight - 0.5) * 2;
    });
    ready = true;
    layout();
    animate(0);
    return true;
  }

  // 3 parallax star layers that wrap around the camera as it travels
  function buildStarfield() {
    const counts = isMobile ? [400, 250, 120] : [900, 500, 250];
    const sizes = [1.0, 1.8, 2.8];
    counts.forEach((count, li) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const phase = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 800;
        pos[i * 3 + 2] = -Math.random() * (PATH + 600) + 100;
        phase[i] = Math.random() * Math.PI * 2;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: PALETTES.dark.star, size: sizes[li], sizeAttenuation: false,
        transparent: true, opacity: 0.5 + li * 0.2,
      });
      const pts = new THREE.Points(geo, mat);
      pts.userData = { phase, baseOpacity: mat.opacity, parallax: 0.2 + li * 0.4 };
      starLayers.push(pts);
      scene.add(pts);
    });
  }

  // Map each anchor section's page position to a Z depth. Landmark builders
  // (added in later tasks) are re-positioned here.
  const ANCHORS = ['hero', 'about', 'experience', 'wormhole', 'projects', 'skills', 'contact'];
  function sectionFraction(id) {
    const docH = document.documentElement.scrollHeight - innerHeight;
    if (docH <= 0) return 0;
    if (id === 'hero') return 0;
    if (id === 'wormhole') { // midpoint of the experience→projects gap
      const exp = document.getElementById('expScroll');
      const proj = document.getElementById('projectsScroll');
      if (!exp || !proj) return 0.45;
      return ((exp.offsetTop + exp.offsetHeight + proj.offsetTop) / 2 - innerHeight / 2) / docH;
    }
    const map = { about: 'about', experience: 'expScroll', projects: 'projectsScroll', skills: 'skills', contact: 'contact' };
    const el = document.getElementById(map[id]);
    if (!el) return 0;
    return Math.min(1, Math.max(0, (el.offsetTop + el.offsetHeight / 2 - innerHeight / 2) / docH));
  }
  function layout() {
    if (!ready) return;
    ANCHORS.forEach((id) => {
      const z = -sectionFraction(id) * PATH;
      if (landmarks[id]) landmarks[id].position.z = z;
      depths[id] = z;
    });
  }
  const depths = {};

  function onResize() {
    if (!ready) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    layout();
  }

  let last = 0;
  function animate(t) {
    requestAnimationFrame(animate);
    const dt = Math.min((t - last) / 1000, 0.05); last = t;
    const camZ = 50 - progress * (PATH + 50);
    camera.position.z += (camZ - camera.position.z) * 0.08; // glide easing
    camera.position.x += (mouse.x * 6 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 4 - camera.position.y) * 0.04;
    camera.lookAt(camera.position.x * 0.5, camera.position.y * 0.5, camera.position.z - 100);
    // wrap stars around camera & twinkle
    starLayers.forEach((layer) => {
      const pos = layer.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        if (z > camera.position.z + 50) pos.setZ(i, z - (PATH + 600));
        if (z < camera.position.z - (PATH + 550)) pos.setZ(i, z + (PATH + 600));
      }
      pos.needsUpdate = true;
      if (!reduced) layer.material.opacity =
        layer.userData.baseOpacity * (0.85 + 0.15 * Math.sin(t * 0.001 + layer.userData.parallax * 7));
    });
    tickLandmarks(dt, t);
    renderer.render(scene, camera);
  }
  // Landmark per-frame updates, filled in by later tasks
  const tickers = [];
  function tickLandmarks(dt, t) { tickers.forEach((fn) => fn(dt, t)); }

  function setTheme(mode) {
    theme = PALETTES[mode] ? mode : 'dark';
    if (!ready) return;
    const p = PALETTES[theme];
    starLayers.forEach((l) => l.material.color.setHex(p.star));
    scene.fog.color.setHex(theme === 'light' ? 0xf0f2f8 : 0x030308);
    themeListeners.forEach((fn) => fn(p, theme));
  }
  const themeListeners = [];

  window.SpaceScene = {
    init,
    setScrollProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    setTheme,
    triggerSupernova() {},            // implemented in Task 8
    layout,
    _internals: { get THREE() { return THREE; }, get scene() { return scene; },
      get camera() { return camera; }, landmarks, tickers, themeListeners,
      PALETTES, depths, isMobile, reduced, PATH },
  };
  init();
})();
```

- [ ] **Step 3: Wire main.js.** At the top of `main.js` add the bridge (before the particle IIFE):

```js
// ============================================================
// SPACE SCENE BRIDGE — drives the 3D voyage; falls back to 2D particles
// ============================================================
window.__sceneFallback = false;
document.addEventListener('scene:fallback', () => {
  window.__sceneFallback = true;
  document.body.classList.remove('scene-active');
});
(function () {
  function pageProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    return docH > 0 ? window.pageYOffset / docH : 0;
  }
  window.addEventListener('scroll', () => {
    if (window.SpaceScene) window.SpaceScene.setScrollProgress(pageProgress());
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (window.SpaceScene) window.SpaceScene.layout();
  });
})();
```

Gate the existing particle IIFE: change its first line to `if (!document.body.classList.contains('scene-active') && !window.__deferParticles) { ... }` — simplest correct approach: wrap the particle system in a function `startParticles()`, call it only when `scene:fallback` fires, OR after a 1500ms timeout if `scene-active` never appeared. Then in the theme toggle handler and HP activate/deactivate, add `if (window.SpaceScene) window.SpaceScene.setTheme(<'light'|'dark'|'magic'>)` calls (magic wins when `data-magic` present).

- [ ] **Step 4: Verify**

Browser: deep-space starfield visible behind all content, stars drift past as you scroll, gentle mouse parallax, twinkling. Test fallback: block `cdn.jsdelivr.net` in DevTools → old particle network appears, no errors. Run `./scripts/check-content.sh` → PASSED.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/space.css assets/js/main.js assets/js/scene.js
git commit -m "feat: Three.js voyage engine — starfield, camera path, 2D fallback"
```

---

### Task 4: Hero — live solar system + HUD overlay

**Files:**
- Modify: `assets/js/scene.js` (solar system builder), `assets/css/space.css` (hero restyle), `index.html` (remove `.hero-mesh` orbs + `.hero-grid`, they're superseded)

- [ ] **Step 1: Build the solar system** in scene.js (new IIFE-internal function, registered as `landmarks.hero`):

```js
function buildSolarSystem() {
  const g = new THREE.Group();
  // Sun: core sphere + 2 additive glow sprites
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(8, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb547 }));
  g.add(sun);
  [22, 40].forEach((size, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, i ? 'rgba(255,181,71,0.35)' : 'rgba(255,220,150,0.9)');
    grad.addColorStop(1, 'rgba(255,181,71,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false }));
    spr.scale.setScalar(size); g.add(spr);
  });
  // Planets: [radius, orbitR, speed, color, hasRing]
  const DEFS = [
    [1.0, 16, 1.6, 0x9c9c9c, 0], [1.6, 22, 1.17, 0xd8a05a, 0],
    [1.7, 29, 1.0, 0x3a7bd5, 0], [1.3, 37, 0.8, 0xc1440e, 0],
    [4.2, 52, 0.43, 0xc9a06c, 0], [3.6, 68, 0.32, 0xe0c47c, 1],
    [2.4, 82, 0.23, 0x7fd4d4, 0], [2.3, 94, 0.18, 0x3f54ba, 0],
  ];
  const planets = [];
  DEFS.forEach(([r, oR, sp, col, ring]) => {
    const pivot = new THREE.Object3D();
    pivot.rotation.y = Math.random() * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 }));
    m.position.x = oR; pivot.add(m); g.add(pivot);
    if (ring) {
      const rg = new THREE.Mesh(new THREE.RingGeometry(r * 1.5, r * 2.4, 48),
        new THREE.MeshBasicMaterial({ color: 0xd9c79a, side: THREE.DoubleSide,
          transparent: true, opacity: 0.55 }));
      rg.rotation.x = Math.PI / 2.4; m.add(rg);
    }
    const orbit = new THREE.Mesh(new THREE.RingGeometry(oR - 0.06, oR + 0.06, 96),
      new THREE.MeshBasicMaterial({ color: 0x96b4ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
    orbit.rotation.x = Math.PI / 2; g.add(orbit);
    planets.push({ pivot, speed: sp });
  });
  g.add(new THREE.PointLight(0xffd9a0, 2.2, 400));
  g.add(new THREE.AmbientLight(0x404060, 0.6));
  g.rotation.x = 0.42;                       // tilt the plane toward viewer
  g.position.set(isMobile ? 0 : 38, -6, 0);  // offset right of hero text on desktop
  tickers.push((dt) => { if (!reduced) planets.forEach(p => p.pivot.rotation.y += p.speed * dt * 0.25); });
  landmarks.hero = g; scene.add(g);
}
```

Call `buildSolarSystem()` inside `init()` after `buildStarfield()`.

- [ ] **Step 2: Hero DOM/CSS.** Remove `.hero-mesh` and `.hero-grid` divs from `index.html` and their JS parallax block ("PARALLAX ON HERO ORBs") from `main.js` (orbs no longer exist). Restyle `.hero-tag` as a HUD readout (mono, bracket corners via `clip-path` or border-image), and `.hero-stats` numbers keep the count-up but gain `text-shadow: 0 0 24px var(--cyan-glow)`. Keep the photo; add a thin cyan ring + soft glow. The HP theme's `.hero-mesh` CSS rules can remain (dead selectors are harmless) but delete is preferred.

- [ ] **Step 3: Verify + commit.** Browser: miniature solar system orbiting behind/right of the hero text, planets actually moving, Saturn ringed, light/HP/lang all fine, guard PASSED.

```bash
git add -A && git commit -m "feat: hero live solar system landmark + HUD hero styling"
```

---

### Task 5: About — asteroid drift + igniting words

**Files:**
- Modify: `assets/js/scene.js`, `assets/css/space.css`

- [ ] **Step 1: Asteroid field builder** (registered as `landmarks.about`): 60 (mobile 25) `THREE.Mesh` with `IcosahedronGeometry(rand 0.5–2.5, 0)` and `MeshStandardMaterial({ color: 0x6a6a72, roughness: 1, flatShading: true })`, randomly placed in a 300×160×400 box centered on the landmark, each with random `rotation` and per-frame tumble `(dt * rand 0.05–0.3)` via a ticker (skipped when `reduced`). Add a dim `DirectionalLight(0x96b4ff, 0.5)` to the group.

- [ ] **Step 2: Word ignition styling.** In `space.css`, `.about-word.lit` gains a brief star-ignition: add `text-shadow: 0 0 18px rgba(0,229,255,0.0)` base and a one-time CSS animation:

```css
.about-word.lit { animation: wordIgnite 0.9s ease-out; }
@keyframes wordIgnite {
  0% { text-shadow: 0 0 0 rgba(0,229,255,0); }
  35% { text-shadow: 0 0 22px rgba(0,229,255,0.65); }
  100% { text-shadow: 0 0 0 rgba(0,229,255,0); }
}
.about-word.highlight.lit { color: var(--cyan); }
```

- [ ] **Step 3: Verify + commit** (asteroids tumble past while reading About; words flare as they light).

```bash
git add -A && git commit -m "feat: asteroid drift landmark + star-ignition word reveal"
```

---

### Task 6: Experience — Mars landmark + mission-log console

**Files:**
- Modify: `assets/js/scene.js`, `assets/css/space.css`

- [ ] **Step 1: Mars** (registered as `landmarks.experience`): sphere radius 26, `MeshStandardMaterial({ color: 0xc1440e, roughness: 0.95 })` with a procedural canvas texture (512×256: base `#c1440e`, ~40 darker `rgba(90,30,10,…)` blotches, polar cap white ellipse at top) applied as `map`; positioned `x: -70, y: 10` (mobile `x: 0, y: 35`), slow self-rotation ticker `0.02 rad/s`. Add `DirectionalLight(0xffe0c0, 1.2)` from camera side.

- [ ] **Step 2: Mission-log console CSS.** Restyle (selectors unchanged): `.exp-nav-item` → mono `exp-period` prefixed with `"LOG ▸ "` via `::before`; `.exp-nav-item.active` gets a scanline overlay (`repeating-linear-gradient(transparent 0 2px, rgba(0,229,255,0.04) 2px 4px)`) and cyan left border (already exists); `.exp-detail-panel` wrapped look: 1px `var(--border-accent)` border, corner ticks via `::before`/`::after` positioned 8×8 borders; `.rh-icon` gets `border-radius: 4px` (console chips, not bubbles).

- [ ] **Step 3: Verify + commit** (Mars looms behind the timeline; sticky crossfade still switches between the two roles; HP mode still overrides cleanly).

```bash
git add -A && git commit -m "feat: Mars landmark + mission-log console styling for experience"
```

---

### Task 7: Wormhole transition (Experience → Projects)

**Files:**
- Modify: `assets/js/scene.js`

- [ ] **Step 1: Build the wormhole** (registered as `landmarks.wormhole`): an open-ended cylinder tunnel the camera flies through.

```js
function buildWormhole() {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(30, 30, 500, 48, 24, true);
  // Procedural swirl texture
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = `hsla(${185 + Math.random() * 80}, 90%, ${55 + Math.random() * 25}%, ${0.25 + Math.random() * 0.5})`;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    const y = Math.random() * 512;
    ctx.moveTo(0, y); ctx.bezierCurveTo(170, y + 40, 340, y - 40, 512, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide,
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const tube = new THREE.Mesh(geo, mat);
  tube.rotation.x = Math.PI / 2;            // axis along Z
  g.add(tube);
  // Entry ring of warped light
  const ring = new THREE.Mesh(new THREE.TorusGeometry(30, 1.2, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending }));
  ring.position.z = 250; g.add(ring);
  tickers.push((dt, t) => {
    // Fade + spin only while the camera is inside ±300 of the wormhole center
    const d = Math.abs(camera.position.z - g.position.z);
    const k = Math.max(0, 1 - d / 300);     // 0 outside, 1 at center — scrubs with scroll
    mat.opacity = k * 0.85; ring.material.opacity = k * 0.9;
    if (!reduced && k > 0) { tex.offset.y -= dt * 1.5 * k; tube.rotation.z += dt * 0.6 * k; }
  });
  landmarks.wormhole = g; scene.add(g);
}
```

Stars get streaked while inside: in the same ticker, set each star layer's `material.size` multiplier is global, so instead scale `camera.fov`: `camera.fov = 60 + k * 28; camera.updateProjectionMatrix();` — FOV stretch sells the tunnel-rush without touching star geometry. When `reduced`, skip the FOV change (instant pass-through).

- [ ] **Step 2: Verify + commit.** Scroll from Experience to Projects: tunnel fades in around you, swirls, FOV stretches, fades out by the black hole; scrolling backwards reverses it; reduced-motion = simple pass.

```bash
git add -A && git commit -m "feat: scroll-scrubbed wormhole transition between experience and projects"
```

---

### Task 8: Projects — black hole flyby + probe cards; Supernova + Skills constellations

**Files:**
- Modify: `assets/js/scene.js`, `assets/css/space.css`, `assets/js/main.js`

- [ ] **Step 1: Black hole** (registered as `landmarks.projects`):

```js
function buildBlackHole() {
  const g = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.SphereGeometry(14, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 }));
  g.add(hole);
  // Photon ring halo (sprite)
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 52, 128, 128, 78);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.45, 'rgba(255,200,120,0.9)');
  grad.addColorStop(0.6, 'rgba(255,150,60,0.5)');
  grad.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(64); g.add(halo);
  // Accretion disk: 2500 particles on a warped annulus
  const N = isMobile ? 900 : 2500;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const angles = new Float32Array(N), radii = new Float32Array(N);
  const c1 = new THREE.Color(0xffe0b0), c2 = new THREE.Color(0xff7733);
  for (let i = 0; i < N; i++) {
    angles[i] = Math.random() * Math.PI * 2;
    radii[i] = 17 + Math.pow(Math.random(), 1.6) * 38;
    const mix = (radii[i] - 17) / 38, cc = c1.clone().lerp(c2, mix);
    col[i*3] = cc.r; col[i*3+1] = cc.g; col[i*3+2] = cc.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const disk = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 1.6, vertexColors: true, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  disk.rotation.x = 1.15; g.add(disk);
  tickers.push((dt) => {
    if (reduced) return;
    const p = disk.geometry.attributes.position;
    for (let i = 0; i < N; i++) {
      angles[i] += dt * (30 / radii[i]);          // Keplerian: inner = faster
      radii[i] -= dt * 0.35;                       // slow infall
      if (radii[i] < 15) radii[i] = 55;            // respawn at rim
      p.setXYZ(i, Math.cos(angles[i]) * radii[i],
        Math.sin(angles[i] * 2) * 1.2,             // slight vertical warp
        Math.sin(angles[i]) * radii[i] * 0.35);    // foreshortened ellipse
    }
    p.needsUpdate = true;
  });
  g.position.x = isMobile ? 0 : -55; g.position.y = 8;
  landmarks.projects = g; scene.add(g);
}
```

- [ ] **Step 2: Probe cards CSS.** `.project-card` → `border-radius: 10px`, 1px `var(--border-accent)` border, corner-tick `::before/::after`, `.pv-label` prefixed `"PROBE // "` (via CSS `content` is not possible on text — change the six `.pv-label` texts in `index.html` to `PROBE // AGENTIC AI` etc., keeping the original phrase after the prefix). `.project-tag` → 4px radius mono chips. Card 3D tilt JS already exists, keep.

- [ ] **Step 3: Supernova + constellations** (registered as `landmarks.skills`). Constellations: for each of the 6 skill categories, a small cluster of 5–8 points (`PointsMaterial size 2.5, color accent`) at hand-placed offsets within a 200×120 plane, pairs connected with `THREE.Line` (`LineBasicMaterial opacity 0.25`). Supernova: one bright star sprite at the cluster-field center; `triggerSupernova()` implementation:

```js
let novaPlayed = false;
window.SpaceScene.triggerSupernova = function () {
  if (novaPlayed || reduced || !ready) { revealConstellations(1); return; }
  novaPlayed = true;
  const N = isMobile ? 500 : 1500;
  // burst particles fly OUTWARD from nova center, then ease toward their
  // assigned constellation-star end positions over ~2.5s (manual tween in a ticker)
  // ... build BufferGeometry with start=center, target=random sphere shell,
  //     final=nearest constellation point; t parameter 0→1 at 0.4/s;
  //     position = center→shell (t<0.5, ease-out) then shell→final (t>0.5, ease-in-out)
  //     star sprite scale: 1 → 14 (flash, 0.3s) → 0 (collapse)
  //     constellation line opacities: 0 → 0.25 as t passes 0.8
};
function revealConstellations(k) { /* set cluster+line opacity to 0.25*k, 1*k */ }
```

Write the full tween code per the comment — the structure is: a `burst` Points object + a per-frame ticker advancing `novaT`; remove the burst object and `splice` the ticker when `novaT >= 1`. Constellation clusters start at opacity 0 and are revealed by the burst (or immediately under reduced-motion/fallback).

In `main.js`, add an IntersectionObserver on `#skills` (`threshold: 0.25`) that calls `window.SpaceScene && window.SpaceScene.triggerSupernova()` once then disconnects.

- [ ] **Step 4: Skills/cert CSS.** `.skill-category` → constellation cards: transparent bg, thin borders, category icon chip → small "star" dot with glow; `.skill-item:hover` glow stays cyan. `.cert-card` → mission patches: circular badge framing (`.cert-badge` gets a 1px amber ring + glow), label `"MISSION PATCH"` micro-text via `::before` on `.cert-info p`.

- [ ] **Step 5: Verify + commit.** Black hole with swirling disk behind the horizontal project scroll; supernova fires once on reaching Skills and debris settles into constellations; reduced-motion shows constellations pre-formed. Guard PASSED.

```bash
git add -A && git commit -m "feat: black hole flyby, probe cards, supernova-forged skill constellations"
```

---

### Task 9: Contact — spiral galaxy; comet cursor; shooting stars

**Files:**
- Modify: `assets/js/scene.js`, `assets/js/main.js`, `assets/css/space.css`

- [ ] **Step 1: Spiral galaxy** (registered as `landmarks.contact`): classic particle spiral —

```js
function buildGalaxy() {
  const g = new THREE.Group();
  const N = isMobile ? 2000 : 6000, ARMS = 3;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const inner = new THREE.Color(0xffd9a0), outer = new THREE.Color(0x7c8cff);
  for (let i = 0; i < N; i++) {
    const r = Math.pow(Math.random(), 0.6) * 90;
    const arm = (i % ARMS) * (Math.PI * 2 / ARMS);
    const spin = r * 0.045;
    const spread = (Math.random() - 0.5) * (1 - r / 110) * 14;
    const a = arm + spin + spread * 0.04;
    pos[i*3] = Math.cos(a) * r + (Math.random()-0.5)*4;
    pos[i*3+1] = (Math.random()-0.5) * (8 - r * 0.06);
    pos[i*3+2] = Math.sin(a) * r + (Math.random()-0.5)*4;
    const cc = inner.clone().lerp(outer, r / 90);
    col[i*3]=cc.r; col[i*3+1]=cc.g; col[i*3+2]=cc.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.4,
    vertexColors: true, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(pts);
  g.rotation.x = 0.9; g.position.y = -10;
  tickers.push((dt) => { if (!reduced) pts.rotation.y += dt * 0.03; });
  landmarks.contact = g; scene.add(g);
}
```

- [ ] **Step 2: Comet cursor.** In `main.js`, extend the existing custom-cursor IIFE: keep `cursor-dot`/`cursor-ring`, add a trail — on `mousemove` (throttled to every 3rd event), spawn a 3px cyan dot div at the cursor with a 500ms fade/shrink Web Animation (same pattern as the HP spark code), max ~20 live trail nodes. Skip entirely when `data-magic` (wand has its own cursor) and on touch.

- [ ] **Step 3: Shooting stars.** In `scene.js`, a ticker that every 6–14 s (random) animates a bright `THREE.Line` streak across the upper viewport area near the camera (800 ms life). Skip when `reduced`.

- [ ] **Step 4: Contact CSS.** `.contact-heading .gradient` already gradient-clips — update gradient to `var(--cyan), var(--magenta), var(--amber)`. `.contact-link` → "TRANSMIT" console buttons: mono font, 6px radius, prefix icons kept. Remove the old `.contact-mesh` orbs from `index.html` (galaxy replaces them).

- [ ] **Step 5: Verify + commit.** Galaxy slowly rotating behind contact; comet trail follows cursor (not in HP mode); occasional shooting stars. Guard PASSED.

```bash
git add -A && git commit -m "feat: spiral galaxy arrival, comet cursor, shooting stars"
```

---

### Task 10: Light theme — "Star Chart / Observatory Blueprint"

**Files:**
- Modify: `assets/css/space.css`, `assets/js/scene.js` (already supports `setTheme('light')`)

- [ ] **Step 1: Rewrite the `[data-theme="light"]` block** top-to-bottom for the star-chart aesthetic — paper `#f4f1e8` background, ink-blue `#1a2a4a` text, accents `--cyan: #0066CC`, hairline borders `rgba(26,42,74,0.18)`; cards look like chart panels (off-white `#fbf9f2`, thin ink borders); delete now-dead orb/mesh light-mode rules; keep every selector that still exists. Scene side (`PALETTES.light`) already flips stars to dark ink dots; additionally in `setTheme`, set landmark group materials to wireframe-ish low opacity in light mode: iterate `themeListeners` — each landmark builder registers a listener that adjusts its materials (e.g., solar system planet materials get `opacity 0.7, transparent: true`; black hole halo opacity 0.5). Renderer clear stays alpha; `body` background carries the paper color.

- [ ] **Step 2: Verify + commit.** Toggle ☀️: page becomes an elegant observatory chart, all sections legible, scene re-tints, toggling back restores deep space; HP mode unaffected in both. Guard PASSED.

```bash
git add -A && git commit -m "feat: star-chart light theme"
```

---

### Task 11: Integration regression sweep + performance pass

**Files:**
- Modify: as needed from findings

- [ ] **Step 1: Full matrix check** (local server):
  - Languages: EN→DE→NL→PL→EN — every `data-i18n` swap renders, about-reveal rebuilds, no console errors.
  - Themes: dark ↔ light ↔ HP magic on/off (flash transitions intact, wand cursor, snitch, candles, map; scene particles gold in magic).
  - Combined: light+magic, PL+magic, etc.
  - `prefers-reduced-motion` emulation (DevTools → Rendering): no orbits/wormhole-FOV/supernova; constellations pre-formed; page fully readable.
  - WebGL blocked (DevTools request blocking on jsdelivr): 2D particle fallback, zero errors.
  - Widths 1440 / 1024 / 900 / 600 / 375: hamburger menu, horizontal projects scroll, solar system centered on mobile, no horizontal overflow.
- [ ] **Step 2: Performance**: Chrome Performance panel — sustained 60fps desktop / no long-frame pileups at DPR 1.5 mobile emulation; if needed, halve particle counts (constants are already isolated at the top of each builder). Run Lighthouse: Performance ≥ 85, Accessibility ≥ 95 (fix any contrast/aria findings).
- [ ] **Step 3: Run guard one final time**: `./scripts/check-content.sh` → PASSED.
- [ ] **Step 4: Commit fixes**

```bash
git add -A && git commit -m "fix: regression and performance findings from integration sweep"
```

---

### Task 12: Ship

- [ ] **Step 1:** Final review of `git log` — confirm each task landed as its own commit.
- [ ] **Step 2:** Push to `main` (GitHub Pages auto-deploys): `git push origin main`.
- [ ] **Step 3:** Verify the live site at the GitHub Pages URL after deploy completes (~1 min), including on a phone.
