# The Cosmic Voyage — Space-Themed Portfolio Revamp

**Date:** 2026-06-10
**Status:** Approved pending user spec review
**Scope:** Complete visual revamp of the portfolio site (currently a single `index.html`). All content/data is preserved verbatim; only presentation, interaction, and code structure change.

## 1. Concept

Scrolling the page is a voyage through deep space. The visitor launches from our solar system at the hero, drifts through an asteroid field past the career timeline, dives through a wormhole, slingshots around a black hole at the projects, witnesses a supernova that forges the skill constellations, and arrives at a distant spiral galaxy where the contact section invites a "transmission."

Art direction: **cinematic deep space** — near-black void, realistic starfield, glowing planets with atmosphere rims, nebula haze. Premium and dramatic.

## 2. Content preservation (hard requirement)

The following are kept exactly as-is, only restyled:

- Name, hero tag, role line, all 5 hero stats (5+ years, 99%+ uptime, 15+ workshops, 4 CEO bonuses, 95% success).
- About paragraph with word-by-word reveal (highlight words intact).
- Both experience entries (Technical Manager Lead 2023→present, Full Stack Developer 2021→2023) with all role highlights.
- All 6 project cards (RAG Chatbot, Agentic Scraping + MCP, Track & Trace 3PL, Enterprise Cloud Hosting, n8n Terraform Automation, Smart Drainage System) with descriptions and tags.
- All 6 skill categories and every skill item.
- All 4 AWS cert cards with Credly verify links and badge images.
- Contact links: email (ashutosh.nayak.formal@gmail.com), LinkedIn, phone.
- SEO title/description meta, photo (`assets/photos/Ghibli.png`), footer.
- **Language switcher**: EN/DE/NL/PL dropdown, full translation dictionaries, and all `data-i18n` / `data-i18n-html` wiring.
- **Light/dark toggle** (see §6).
- **Harry Potter easter egg**: wand toggle, full magical theme override, solemnly-swear/mischief-managed transitions — kept functionally identical; it overrides the space theme when active, as it overrides the current theme today.

## 3. The 3D engine

- **Three.js (WebGL)**, pinned version loaded from CDN.
- One fixed full-screen canvas behind all DOM content. DOM sections overlay it (transparent backgrounds, HUD-styled panels).
- Scroll progress drives a camera along a waypoint path through a single continuous scene. Each section maps to a camera segment; easing between waypoints so motion feels like coasting, not stepping.
- Mouse position adds subtle camera tilt (parallax). Disabled on touch devices.
- A persistent 3-layer parallax starfield with twinkling spans the whole journey.

### Scene landmarks by section

| Section | Landmark | Details |
|---|---|---|
| Hero | Live solar system | Sun with corona glow, 8 planets orbiting at stylized speeds, Saturn ringed, thin orbit lines, name/stats as HUD overlay |
| About | Asteroid drift | Sparse tumbling asteroid field; about words "ignite" like stars as they reveal |
| Experience | Mars + mission logs | Mars looms in background; timeline styled as spacecraft mission-log console (HUD frames, scanline accents) |
| Experience → Projects | **Wormhole transition** | Camera dives into a wormhole tunnel — stretched starlight streaks, warped light ring — and emerges in the black-hole region. Triggered by scroll progress through the gap between sections; scrubs with scroll (reversible), never auto-plays |
| Projects | Black hole flyby | Gargantua-style black hole: accretion disk, light-bending halo, in-falling particles; horizontal card scroll preserved, cards styled as deep-space probes |
| Skills entrance | **Supernova moment** | A dying star collapses and detonates once as the section first enters the viewport; debris particles scatter and settle into the skill-constellation positions. Plays once per page load; reduced-motion users see constellations already formed |
| Skills | Constellations + mission patches | Skill categories as constellation clusters (stars joined by thin lines, lighting up on hover); certs as mission patches |
| Contact | Spiral galaxy | Slowly rotating spiral galaxy backdrop; "Let's Build Something Intelligent" heading intact |

## 4. Look & feel

- **Palette:** void black `#030308` base, starlight white text, plasma cyan accent (continuity with current identity), solar amber secondary, nebula violet tertiary.
- **Typography:** Space Grotesk (display), DM Sans (body, kept), JetBrains Mono (HUD labels, kept). Cinzel fonts kept for the HP theme.
- **Cursor:** custom cursor becomes a tiny comet with a fading particle trail (hidden on touch, hidden in HP mode which has the wand cursor).
- **Micro-interactions:** occasional shooting stars; planets/cards glow-pulse on hover; nav underlines sweep like radar; scroll progress bar styled as a flight trajectory.
- **Nav:** same links/structure, restyled as a mission console HUD bar.

## 5. Architecture & file structure

Split the current 3,591-line single file:

```
index.html            — content + DOM structure only (all data-i18n attributes preserved)
assets/css/space.css  — all styling: space theme, light "star chart" theme, HP override theme, responsive rules
assets/js/scene.js    — Three.js scene: starfield, landmarks, camera path, wormhole, supernova, fallback detection
assets/js/main.js     — UI logic: i18n dictionaries + switcher, theme toggle, HP easter egg, scroll wiring, counters, reveals, cursor
```

GitHub Pages serves these with zero configuration change. Each unit is independently understandable: `scene.js` exposes a small API (`initScene(canvas)`, `setScrollProgress(p)`, `setTheme(mode)`, `destroy()`); `main.js` owns all DOM/UI and calls into it. CSS knows nothing about JS internals.

## 6. Themes

- **Dark (default):** the cinematic deep-space scene described above.
- **Light:** "star chart / observatory blueprint" — pale paper background, ink-blue constellation lines and orbit diagrams; 3D scene re-tints to drawn-diagram aesthetic (line-art planets, dark-on-light starfield). Same toggle button, same `localStorage` persistence.
- **Harry Potter (easter egg):** unchanged behavior. When `data-magic="true"`, HP fonts/colors/cursor/candles/snitch override the space theme; the 3D scene re-tints particles to gold (as the current particle canvas does).

## 7. Resilience & performance

- **WebGL/CDN failure:** detect at init; on failure, fall back to the current lightweight 2D canvas particle starfield (code retained), with static CSS gradients standing in for landmarks. Site remains fully usable and styled.
- **`prefers-reduced-motion`:** static scene — no orbits, no wormhole scrub (instant cut), supernova skipped (constellations pre-formed), no comet trail.
- **Mobile (≤900px):** renderer capped at devicePixelRatio 1.5, particle counts halved, asteroid field thinned, camera tilt disabled. Target: no thermal throttling on mid-range phones.
- **Loading:** scene initializes lazily after first paint; content is readable immediately over a CSS-gradient void so there is no blank screen.

## 8. Error handling

- Three.js load wrapped in `onerror` → triggers 2D fallback path.
- Scene init wrapped in try/catch → same fallback.
- All UI features (i18n, themes, HP mode, counters, reveals) function independently of the 3D scene's success.

## 9. Testing

- Manual verification matrix: dark/light × EN/DE/NL/PL × HP on/off; desktop + mobile widths; reduced-motion on/off; WebGL disabled (fallback path).
- Verify every content item from §2 renders and every link resolves.
- Lighthouse pass for performance/accessibility regressions.

## 10. Out of scope

- No content rewrites, no new sections, no backend, no build tooling/bundler, no analytics.
