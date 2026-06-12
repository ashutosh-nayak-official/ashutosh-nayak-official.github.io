# Scroll-story rebuild — decisions log

## 2026-06-13 — Milestone 2a (branch `scroll-story`)

Scope shipped: Chapters 2–5 between `#chapter-1` and the interlude — Model T
assembly line (2018), sunset grand tourer (2021), night-tunnel turbo wedge
(2023), electric-hypercar studio (2026/NOW). 16 new placeholder layer SVGs
(specs in CREDITS.md), full EN/DE/NL/PL coverage for all new copy.

### Decisions
- Chapter 1's pin/parallax/copy choreography extracted into
  `buildChapterTimeline(sel, odoLabel, opts)` in `story.js`; all five chapters
  share it (era 0–20%, title 10–30%, year 30–60%, caption 50–75%, stamp
  60–75%, +250% pin, parallax halved ≤700px). Per-chapter subject entrances
  and signature moments are appended onto the returned timeline.
- Subject entrances: ch1+ch2 clip-path draw-on; ch3 slide from left
  (xPercent −8→0); ch4 fast slide from right with faked motion-blur (scaleX
  1.06→1, `subjectScale:false` so the shared scale tween doesn't fight it,
  speed-line mid layer translates the opposite way); ch5 fade+rise with
  ribbon mid layer clip-path sweep.
- Signature moments: ch2 brass `.hackathon-plaque` (corner screws via CSS
  radial-gradients) settles in at 70–85%; ch4 three `.hud-chip` callouts
  stagger 60–85%; ch5 five `.dash-stat` EV-cluster counters scrub-count
  55–85% (HTML ships final values so reduced-motion shows them; JS zeroes
  then counts via an object tween + Math.round).
- Gear-shift flash + needle blip fires on every chapter `onEnter` (so between
  every consecutive chapter pair); odometer reads CH 01–CH 05, footer END
  (`onLeaveBack` → CH 05). Speedo needle keeps mapping full-document progress.
- `.layer-subject` clip-path initial state in CSS narrowed to
  `.chapter-1/.chapter-2` only — ch3–5 subjects hide via gsap.set in the
  non-reduced path, keeping reduced-motion fully visible.
- HUD chips hidden ≤900px (spec floor was ≤700px) — below ~900px the left
  copy column can reach the right-anchored chips.
- Interlude copy now reads "the finale is being assembled" (chapters 02–05
  exist); milestone 2b replaces the interlude entirely.

### Known issues
- All 20 layer SVGs remain labeled placeholders pending final art.
- `scripts/check-content.sh` still intentionally fails until the final
  milestone. New: `scripts/check-i18n.js` asserts every `data-i18n` key on
  the page exists in all four dictionaries — passes as of this milestone.

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
