# Asset Credits & Procurement List

Status of every external/art asset the scroll-story site needs. Placeholders currently
committed are clearly labeled in-file and must be replaced before launch.

## 3D car models (hero + per-era stages)

The hero currently uses a **placeholder car built from Three.js primitives**
(`assets/js/hero3d.js`) — boxes, cylinders, torus rims, emissive spheres. Replace with
real glTF models.

| Asset | Target file | Spec | Suggested source | License to verify |
|---|---|---|---|---|
| Era 1 — 1886 Benz Patent-Motorwagen | `assets/models/era-1.glb` | low-poly stylized, Draco-compressed, < 2 MB | Sketchfab (search "Benz Patent Motorwagen low poly") | CC-BY (attribute here) |
| Era 2 — Ford Model T | `assets/models/era-2.glb` | same | Sketchfab | CC-BY |
| Era 3 — Classic sports car (60s–80s) | `assets/models/era-3.glb` | same | Sketchfab | CC-BY |
| Era 4 — Modern turbo coupe | `assets/models/era-4.glb` | same | Sketchfab | CC-BY |
| Era 5 — Hypercar / EV | `assets/models/era-5.glb` | same | Sketchfab | CC-BY |

Requirements: Y-up, centered at origin, real-world scale (~4.5 m length), baked or
PBR materials that read well under a single spotlight, Draco compression
(`gltf-pipeline -d`), < 2 MB each.

## Chapter 1 layer art (1886 / blueprint workshop)

Current files in `assets/layers/chapter-1/` are committed **placeholder SVGs**
(labeled in-image). Final art direction: sepia blueprint workshop — aged paper,
cyan-steel blueprint linework, warm sepia silhouettes.

| Layer | File (placeholder) | Final spec | Notes |
|---|---|---|---|
| Background | `bg.svg` | 2400×1350 PNG/WebP, opaque | aged paper texture + blueprint grid + faint compass roses |
| Midground | `mid.svg` | 2400×1350 PNG/WebP, transparent | workshop silhouettes (bench, shelves, hanging lamp), sepia ~25% |
| Subject | `subject.svg` | 2400×1350 transparent PNG/WebP or refined SVG with strokes | 1886 Benz Patent-Motorwagen engineering line drawing, blueprint #2B5D8A. SVG-with-strokes preferred (enables true draw-on animation later) |
| Foreground | `fg.svg` | 2400×1350 PNG/WebP, transparent top ~70% | drafting tools (ruler, compass, pencil), dark sepia ~60% |

## Chapter 2 layer art (1908 / Model T assembly line)

Current files in `assets/layers/chapter-2/` are committed **placeholder SVGs**
(labeled in-image). Final art direction: warm industrial — paper-warm #E8D9BC
walls, brass #C9933F accents, deep brown #3E2F1E linework, shafts of warm light.

| Layer | File (placeholder) | Final spec | Notes |
|---|---|---|---|
| Background | `bg.svg` | 2400×1350 PNG/WebP, opaque | factory wall, tall arched windows, warm light shafts, faint brick courses |
| Midground | `mid.svg` | 2400×1350 PNG/WebP, transparent | assembly-line silhouettes: chassis frames on a conveyor, chain hoists, workers, brown ~25% |
| Subject | `subject.svg` | 2400×1350 transparent PNG/WebP or refined SVG with strokes | Ford Model T side view line drawing — tall boxy cabin, upright windshield, large thin fenders over equal-size spoked wheels, running board, brass radiator + round headlamp. SVG-with-strokes preferred (draw-on animation) |
| Foreground | `fg.svg` | 2400×1350 PNG/WebP, transparent top ~65% | riveted factory beams + large meshing gear silhouettes in the bottom corners, dark brown ~55% |

## Chapter 3 layer art (1965 / sunset grand tourer)

Current files in `assets/layers/chapter-3/` are committed **placeholder SVGs**.
Final art direction: sunset travel poster — sky gradient #2A1A2E → #D63A2F →
#FFD884, big low sun, chrome text on dark vignette.

| Layer | File (placeholder) | Final spec | Notes |
|---|---|---|---|
| Background | `bg.svg` | 2400×1350 PNG/WebP, opaque | sunset poster sky, big low sun disc, horizontal gradient bands, stylized clouds |
| Midground | `mid.svg` | 2400×1350 PNG/WebP, transparent | sea horizon with 3–4 cargo-vessel silhouettes (Track & Trace nod), distant coastline, sun glitter |
| Subject | `subject.svg` | 2400×1350 transparent PNG/WebP or refined SVG | 60s grand tourer side view — long hood, fastback roofline, wire wheels, chrome bumpers; racing-red #D63A2F fill + chrome #C7D0DA strokes |
| Foreground | `fg.svg` | 2400×1350 PNG/WebP, transparent top ~70% | dark cliff edge + guardrail posts/w-beam silhouette #14101C |

## Chapter 4 layer art (1987 / night-tunnel turbo wedge)

Current files in `assets/layers/chapter-4/` are committed **placeholder SVGs**.
Final art direction: night tunnel — asphalt #0F1014, turbo-steel #5D7290
structure, neon white/volt #2EE6A8 speed lines, chrome text.

| Layer | File (placeholder) | Final spec | Notes |
|---|---|---|---|
| Background | `bg.svg` | 2400×1350 PNG/WebP, opaque | dark tunnel perspective — concentric arches receding to a glowing vanishing point, ceiling light strip, converging lane lines |
| Midground | `mid.svg` | 2400×1350 PNG/WebP, transparent | horizontal speed-line streaks, white + volt, varied lengths/opacities (JS translates this layer opposite the car) |
| Subject | `subject.svg` | 2400×1350 transparent PNG/WebP or refined SVG | 80s turbo wedge side view facing left — low wedge nose, closed pop-up headlights, boxy flares, rear spoiler, side strakes; near-black body, chrome strokes, volt accent line |
| Foreground | `fg.svg` | 2400×1350 PNG/WebP, transparent top ~60% | circuit-board traces rising from the bottom — thin volt lines with right-angle bends, node dots, via rings, low opacity |

## Chapter 5 layer art (now / electric hypercar studio)

Current files in `assets/layers/chapter-5/` are committed **placeholder SVGs**.
Final art direction: clean dark studio — #0F1014 with soft radial floor glow,
volt #2EE6A8 light ribbons, chrome/white text.

| Layer | File (placeholder) | Final spec | Notes |
|---|---|---|---|
| Background | `bg.svg` | 2400×1350 PNG/WebP, opaque | dark studio, soft overhead key light, elliptical volt floor glow + thin floor ring |
| Midground | `mid.svg` | 2400×1350 PNG/WebP, transparent | two sweeping volt light ribbons (smooth beziers), glow via wide low-opacity duplicates (JS reveals via clip-path sweep) |
| Subject | `subject.svg` | 2400×1350 transparent PNG/WebP or refined SVG | electric hypercar side view — cab-forward teardrop, full-width light bars front+rear, aero disc wheels; near-black body with volt edge light tracing the silhouette |
| Foreground | `fg.svg` | 2400×1350 PNG/WebP, mostly transparent | subtle charge-particle dots + tiny spark crosses, volt, low opacity |

## Reference imagery

- 1886 Benz Patent-Motorwagen reference: Wikimedia Commons — public domain
  photographs and the original patent drawing (DRP 37435) are available and safe to
  reference for the final line art.
- 1908 Ford Model T reference: Wikimedia Commons — public domain photographs and
  period Ford sales literature; safe to reference for the final line art.
- Eras 3–5 are deliberately **generic archetypes** (60s grand tourer, 80s turbo
  wedge, current EV hypercar) — final art must stay off-brand/trademark-safe
  (no badges, no model-specific trade dress).

## Fonts (via Google Fonts, OFL)

- Archivo (variable: wdth 62–125, wght 400–900) — display, UI, odometer
- Fraunces (variable: opsz 9–144, wght 300–700) — narrative serif

## Libraries (CDN-pinned)

- GSAP 3.12.5 + ScrollTrigger — jsdelivr (standard "no charge" GSAP license)
- Lenis 1.1.13 — jsdelivr (MIT)
- Three.js 0.160.0 (module) — jsdelivr (MIT)
