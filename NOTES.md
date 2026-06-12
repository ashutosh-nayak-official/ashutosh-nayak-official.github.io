# Scroll-story rebuild — decisions log

## 2026-06-12 — Milestone 1 (branch `scroll-story`)

Scope shipped: 3D hero stage + Chapter 1 (1886 Benz blueprint ↔ college beginnings,
2017), interlude stub, contact footer, speedometer progress dial, i18n EN/DE/NL/PL.

### Pins chosen (all verified 200 via curl on 2026-06-12)
- gsap@3.12.5 + ScrollTrigger — cdn.jsdelivr.net
- lenis@1.1.13 — cdn.jsdelivr.net (UMD; exposes `window.Lenis` — verified in bundle)
- three@0.160.0 module build — cdn.jsdelivr.net (dynamically imported inside
  `assets/js/hero3d.js`, which is itself dynamically imported by `story.js` only when
  WebGL is available and `prefers-reduced-motion` is not set)
- Google Fonts: Archivo variable-axes URL
  (`Archivo:wdth,wght@62..125,400..900`) verified working — returns
  `font-stretch: 62% 125%` @font-face rules; no fallback needed.

### Decisions
- Hero car is a **primitives placeholder** (box body, cylinder wheels, torus rims,
  emissive headlights/taillight). Real per-era glTF models tracked in CREDITS.md.
- Chapter-1 subject "draw-on" implemented as `clip-path: inset()` reveal on the
  `<img>` (works regardless of whether final art is SVG or PNG). If final subject art
  ships as inline SVG with strokes, can upgrade to true stroke-dashoffset drawing.
- Camera orbit decoupled from GSAP via `window.__heroProgress` (0..1) so hero3d.js
  has zero dependency on GSAP load order.
- Reduced motion: story.js returns early after i18n + nav wiring; CSS makes all
  content visible/static; speedometer hidden; Three.js never loaded.
- Mobile (≤700px): parallax distances halved via function-based GSAP values with
  `invalidateOnRefresh`; copy bottom-anchored.
- Old site files (`assets/css/space.css`, `assets/js/main.js`, `assets/js/scene.js`)
  intentionally left untouched in the repo for reference/i18n reuse; removed from the
  page. Delete in a later milestone.

### Known issues
- `scripts/check-content.sh` **intentionally fails** on this milestone: it guards the
  full site content (experience, projects, skills, certs), which returns in the final
  milestone. Do not use it as a gate until then.
- Chapter-1 layer SVGs and the hero car are labeled placeholders pending final art
  (see CREDITS.md).
- Interlude section is a stub ("to be continued") until Chapters 02–05 land.
