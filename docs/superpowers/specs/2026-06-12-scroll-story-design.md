# "Shift" — Scroll-Story Portfolio Design (approved 2026-06-12)

Dual-timeline scroll narrative: Ashutosh's journey (college 2017 → AI/ML + DevOps today) told in parallel with the evolution of the automobile (1886 Benz → hypercar/EV). Content source: `content.md` (approved). Reuse content only — no old layout/styling.

## Approved decisions
- **Palette:** asphalt #0F1014, paper #EFE5D0, sepia #5A4632, blueprint #2B5D8A, brass #C9933F, racing-red #D63A2F, chrome #C7D0DA, turbo-steel #5D7290, volt #2EE6A8, headlight #FFD884. Ambient palette cross-fades per chapter.
- **Type:** Archivo (variable, Expanded for display/UI/odometer) + Fraunces (variable serif, narrative captions). Google Fonts.
- **Tech:** vanilla HTML/CSS/JS + GSAP ScrollTrigger + Lenis + Three.js (dynamic import, never blocks first paint). No framework. GitHub Pages, zero build.
- **Chapters:** hero 3D car stage → Ch1 1886 Benz blueprint/college → Ch2 Model T/learning+hackathon 2018 → Ch3 classic sports/first role 2021–23 → Ch4 turbo/GenAI 2023→ → Ch5 hypercar-EV/today → finale garage (projects podiums, skills tool-wall, certs trophy shelf, ignition contact CTA).
- **Connecting tissue:** persistent speedometer/odometer progress dial; gear-shift transitions between chapters; all animation scroll-scrubbed and reversible.
- **Kept from old site:** language switcher EN/DE/NL/PL (new narrative copy translated ×4). Dropped: HP easter egg, light/dark toggle.
- **Education (confirmed):** B.Tech CSE, Silicon Institute of Technology, Bhubaneswar, 2017–2021. Smart Odisha Hackathon win: 2018.
- **A11y/perf:** prefers-reduced-motion = static layouts/no pinning/static hero; mobile reduced parallax; Lighthouse 90+ target; lazy chapter assets; placeholders + CREDITS.md for art/models the user will supply.
- **Process:** build hero + Chapter 1 first on branch `scroll-story`, local preview + scrubbed screenshots for pacing approval, then iterate chapter-by-chapter (NOTES.md for decisions). Live space site untouched until ship approval.
