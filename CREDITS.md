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

## Reference imagery

- 1886 Benz Patent-Motorwagen reference: Wikimedia Commons — public domain
  photographs and the original patent drawing (DRP 37435) are available and safe to
  reference for the final line art.

## Fonts (via Google Fonts, OFL)

- Archivo (variable: wdth 62–125, wght 400–900) — display, UI, odometer
- Fraunces (variable: opsz 9–144, wght 300–700) — narrative serif

## Libraries (CDN-pinned)

- GSAP 3.12.5 + ScrollTrigger — jsdelivr (standard "no charge" GSAP license)
- Lenis 1.1.13 — jsdelivr (MIT)
- Three.js 0.160.0 (module) — jsdelivr (MIT)
