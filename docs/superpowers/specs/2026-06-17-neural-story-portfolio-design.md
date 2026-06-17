# Design — "Layers of a Living Network" storytelling portfolio

Date: 2026-06-17
Owner: Ashutosh Nayak (@Ashutosh-BDP)
Status: Draft for review

## 1. Goal

A brand-new, EverSwap-grade scroll-storytelling portfolio for Ashutosh Nayak —
GenAI Developer & Cloud/DevOps Engineer. Cinematic, dark-mode, premium. The
career is told as a journey **through the layers of a living neural network**,
each chapter a distinct mood of the same world.

This replaces the previous "Shift" car-evolution concept (kept in git history).
All content comes from `content.md`. The 4-language switcher (EN/DE/NL/PL) is
carried over.

## 2. Narrative metaphor

A neural network / data-flow universe. The visitor scrolls *forward through the
network*; glowing nodes and particle data-streams carry the story. Each career
stage is a "layer" with its own palette mood, but the same visual language
(deep navy→black base, electric cyan + warm amber accents).

| Section | Real content (from content.md) | Mood / scene |
|---|---|---|
| Hero | Name reveal: "Ashutosh Nayak" + role line | Neural data-flow, negative space |
| Ch 1 — Origins | B.Tech CSE, Silicon Institute · 2017 | Dawn sepia/amber, campus + laptop silhouette |
| Ch 2 — First Win | Smart Odisha Hackathon winner · 2018 | Trophy + IoT water-sensor grid, amber sparks |
| Ch 3 — Cloud at Scale | Full-Stack & Cloud Engineer 2021–23; Track & Trace 15,000+ vessels | Glowing globe + vessel route arcs, steel-blue |
| Ch 4 — The GenAI Shift | RAG, Agentic AI, AWS Bedrock · 2023→ | LLM core, token streams, cyan synapses |
| Ch 5 — Leading at Full Speed | Technical Manager, Lead Innovation; 4× CEO Bonus | Converging summit of systems, neon + gold |
| Finale — Showroom | 6 projects, skills, 4× AWS certs, contact | Calm gallery of light |

Headline stats (5+ yrs, 99%+ uptime, 15+ workshops, 4 CEO Bonus, 95% success)
surface as animated counters in the hero / transition into Ch 1.

## 3. Visual assets (already generated)

14 concept visuals generated with `gpt-image-2` (gen pipeline + key live only in
the session folder, never committed). Optimized to web JPEGs in `assets/story/`:

- `hero-landscape.jpg`, `hero-portrait.jpg`
- `ch1-college … ch5-leadership.jpg`, `final-showroom.jpg`
- `p1-rag-chatbot … p6-smart-drainage.jpg` (one per real project)

AI art is **abstract backgrounds/illustrations only** — no baked-in text. Real
assets used as-is: `assets/photos/Ghibli.png` (portrait) and the 4 AWS badge
PNGs in `assets/badges/`.

## 4. Architecture

Static site (GitHub Pages). No build step required.

- `index.html` — semantic sections, all real copy, `data-i18n` keys.
- `assets/css/neural.css` — design system (tokens, type scale, layout, motion).
- `assets/js/neural.js` — scroll engine, scene transitions, counters, i18n,
  language switcher, reduced-motion + no-WebGL/no-JS fallbacks.
- Optional `assets/js/neural-bg.js` — Canvas/WebGL particle network behind
  content (progressive enhancement; site fully works without it).
- i18n dictionaries reused/extended from the existing `assets/js/story.js`.

### Scroll engine
- Lenis (smooth scroll) + GSAP ScrollTrigger via CDN, pinned to a static
  fallback if a CDN global is missing (same guard pattern as the current site).
- Each chapter is a full-viewport `<section>` with a fixed background image that
  cross-fades; foreground text + cards animate in on scroll.
- A vertical progress rail + chapter dots (anchored to **his** years).

### Background particle layer (progressive enhancement)
- Lightweight Canvas2D particle-network first (cheap, universal). Optional
  WebGL upgrade later. DPR clamped; pauses when tab hidden; disabled under
  `prefers-reduced-motion`.

## 5. Components (each independently testable)

1. **Hero** — name reveal, role line, stat counters, scroll cue.
2. **Chapter scene** — reusable: bg image, year stamp, title, body, optional metric.
3. **Project card** — image, title, blurb, tag chips (6 real projects).
4. **Skills board** — grouped chips from content.md (6 groups).
5. **Cert shelf** — 4 AWS badges with Credly verify links.
6. **Contact / footer** — email, LinkedIn, phone; social CTAs.
7. **Language switcher** — EN/DE/NL/PL, persists choice (localStorage).
8. **Background field** — particle network (enhancement).

## 6. Accessibility & robustness (improving on EverSwap)

- Full `prefers-reduced-motion` support (EverSwap lacked this).
- Works with JS disabled: content is real HTML, natively scrollable; animations
  are enhancement only.
- Semantic headings, alt text, keyboard-navigable switcher and links.
- Lighthouse target: 95+ perf/SEO/a11y. Images lazy-loaded, sized JPEGs.

## 7. Internationalization

- All narrative copy (chapter titles, year captions, section labels) authored in
  EN/DE/NL/PL. Shared strings reuse existing translations from `story.js`.
- `data-i18n` / `data-i18n-html` keys validated by `scripts/check-i18n.js`.

## 8. Testing / verification

- `scripts/check-i18n.js` — every key present in all 4 languages.
- `scripts/check-content.sh` — content preservation (names, stats, links).
- Headless harness (Playwright, `~/.cache/space-verify`): scroll 16 stops,
  screenshot, assert no console errors; language switch; CDN-blocked fallback.

## 9. Out of scope (YAGNI)

- Real-time 3D model loading / Sketchfab glTF (no longer needed; neural metaphor
  uses generated art + particle field).
- CMS / backend. Light/dark toggle (era moods replace it). HP easter egg.

## 10. Open questions for review

1. Keep the abstract AI scenes as full-bleed backgrounds, or frame them as
   inset "windows" with solid panels for text legibility? (Prototype uses
   full-bleed with gradient scrim.)
2. Weave the Ghibli portrait into the hero or into Ch 5 / About?
3. Particle background: ship Canvas2D version now, or design-only for v1?
