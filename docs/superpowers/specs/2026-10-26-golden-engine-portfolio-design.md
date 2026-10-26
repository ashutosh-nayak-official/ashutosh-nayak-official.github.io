# The Golden Engine: portfolio redesign

Date: 2026-10-26 · Owner: Ashutosh Nayak · Site: https://ashutosh-nayak-official.github.io/ (repo `ashutosh-nayak-official/ashutosh-nayak-official.github.io`)

Mockups referenced below live in `docs/superpowers/specs/2026-10-26-golden-engine-mockups/` (open them directly in a browser; they are rough 2D canvas sketches, not the final rendering).

## 1. Intent

Ashutosh wants "a very good website, one Steve Jobs would appreciate": a portfolio that makes a senior recruiter or engineering lead want to hire him. Inspiration: the restraint and structure of voicing.ai (numbered chapters, short declarative sentences, metrics that state their scope, a "follow one call, step by step" walkthrough, honesty about limits) combined with a cinematic gold hologram visual (his reference: the gold holographic sphere from a film still), built with React and Three.js.

He positions himself as **an expert in building agentic AI systems and a master of Agentic SDLC and spec-driven development**, who also builds and runs the cloud and DevOps foundations underneath. The site must carry both an "agentic AI / AGI" feel and a "DevOps" feel.

### What should happen in a hiring lead's head
- **5 seconds:** who he is, one sharp promise, one unforgettable visual. A short assembly sequence, then calm.
- **30 seconds:** proof, not adjectives: real numbers with their scope.
- **2 minutes:** depth on demand. They watch one real system work (the multilingual voice bot, in production) and see how he builds software with agents (spec → parallel agents → verified release). This decides the hire.
- **Then:** effortless contact.

### Success
A hiring lead finishes the scroll believing "he ships production AI, he builds with agents in a disciplined way, and he keeps it running", and can reach him in one click.

## 2. Goals, non-goals, anti-goals

**Goals**
- One signature visual idea that recurs with new meaning through the scroll (the Golden Engine, §4).
- Voice bot walkthrough as the centrepiece; Agentic SDLC / spec-driven chapter as the positioning proof.
- Real, verifiable content only. All six existing projects, both roles, education, four AWS credentials and contact links preserved.
- English, German, Dutch, Polish (decided by Ashutosh).
- Fast, accessible, works on phones.

**Non-goals**
- No chatbot or live AI demo on the site, no form backend, no CMS, no analytics requirement.
- No blog.

**Anti-goals (failure even if it "works")**
- Slow first load, a hot phone, janky scroll.
- 3D that exists only to show off, or that hides the content.
- Buzzword soup, invented numbers, fake screenshots, claims a reader can't check.
- Visual noise. Ashutosh explicitly rejected a "too noisy" core; structure and restraint beat density.

## 3. Decided by Ashutosh

| Decision | Source / mockup |
|---|---|
| React + Three.js | his request |
| Gold hologram aesthetic from his two reference images | `core-options.html`, `c3-centres.html` |
| Hero visual = the **C3 Armillary engine with a rhombic triacontahedron heart** (chosen over the K2 tesseract after comparing both) | `c3-centres.html` (rings), `site-themes.html` (HEART: Triacontahedron) |
| Visual sequence: A-style living core in the hero, B-style agent chapter (no solar-system/orbit look), C-style "infrastructure comes alive" later in the scroll (C later redrawn as a lighting-up CPU + GPU chip, see §5 chapter 04) | `visual-direction.html` concept, his message "mix A in hero and B (change the solar system thing) C later in scroll" |
| Chapter 03 = **B7: Spec → Orchestrator → parallel Swarm → Review gate → Release**, and the orchestrator is the same engine as the hero | `spec-swarm.html` (orchestrator to be replaced by the Golden Engine) |
| Chapter 02 = the voice bot, "one call, step by step". The bot is **multilingual (Hindi, English and international languages)**: the caller speaks their language and hears it back; translation happens inside the bot. The walkthrough uses one Hindi call as the example | `one-call.html`, `site-mockup.html` |
| A **loading sequence** in which the hero engine assembles itself (the triacontahedron's edges draw in, rings sweep in), then the hero copy appears; on scroll the engine **breaks apart** (rings fly outward, triacontahedron edges detach and spin away, shards streak out) | his message; `site-mockup.html` |
| Voice bot stack: LiveKit, SIP, Asterisk, a deployed (self-hosted) LLM, STT, TTS, RTT (= real-time translation), plus its monitoring. **He built it end to end, and it is running in production**, so first-person copy ("I built…") and "in production" are accurate | his messages |
| The final site is **real 3D (Three.js / React Three Fiber)**; the canvas mockups only show composition and motion | his message |
| He built an Agentic SDLC framework for his team and uses spec-driven development in all his work | his message |
| Source of truth for the framework: his team's `agents/` folder (6 role agents, 17 skills, check scripts), summarised in §5a | he pointed to it |
| Keep EN / DE / NL / PL | his message |
| **Both modes ship: dark and light (white)**, with a sun/moon toggle in the navigation; visuals get their own light rendering (not an inverted dark scene, which Ashutosh rejected as muddy): crisp, saturated spectrum lines on warm paper (`#f7f4ee`), no wide halo strokes or grey glow discs, only a faint tinted bloom at the core. The chip stays a dark product-shot object on the light page. Light-mode gold must be **vivid, not dull** (his feedback): clean near-white page `#fcfbf8`; headline accent as a bright amber-to-gold gradient (`#e08a00` → `#f5b11c`); buttons in sunny gold (`#ffc23a` → `#f2a516`) with near-black text and a soft gold shadow; small gold labels `#b87200` for legibility. Default follows the visitor's system setting; the choice is remembered | his message; `site-themes.html` |
| Palette: **gold text and buttons + Spectrum visuals.** All typography, labels, buttons, pills and links stay in the gold theme. Every 3D/visual element (engine, sound wave, swarm, gates, featured-card glow) uses the Spectrum gradient, except the career timeline: its dots and line stay **gold and glowing** (his feedback): gold → coral → magenta → violet → cyan. In chapter 04 each chip region lights in its own colour (compute coral, schedulers and cache gold, inference magenta, agents violet, CI/CD and observability cyan, network violet, memory teal). Same split in light mode, with deeper versions of each colour | his message; `site-themes.html` (palette "Gold text + Spectrum visuals") |
| Overall story order from the storyboard was accepted ("its awesome", "This is great") | `storyboard.html` |

## 4. The Golden Engine (signature visual)

A single gold object on a deep blue-black background (`#04050a` → `#0d1018` radial), rendered live in Three.js with bloom and subtle depth of field.

- **Armillary rings:** four broken (dashed) gold rings of decreasing radius at different tilts, each slowly spinning and tumbling, with small tick marks. Reads as a precise, engineered system.
- **Rhombic triacontahedron heart:** the golden-ratio solid with 32 vertices (12 five-fold, 20 three-fold), 60 edges and 30 identical planar rhombic faces, turning slowly on two axes; its vertices breathe independently — each drifts toward and away from the centre by about ±10.5% (precisely ±10.56%), so the solid subtly re-forms while it turns (owner request, increased twice). The hero engine glows slightly brighter than its other appearances (owner request). Edges are glowing lines and vertices bright points, depth-faded. Reads as precise, crystalline intelligence. Geometry: icosahedral vertices (0, ±φ, ±1) cyclic; dodecahedral vertices (±1, ±1, ±1) and (0, ±1/φ, ±φ) cyclic; each icosahedral vertex joins its 5 nearest dodecahedral vertices.
- **Electric signals (decided by Ashutosh):** regularly (a new burst every ~1.3–3.2 s; usually one bolt, sometimes two, staggered by a few tens of milliseconds; rate tuned with Ashutosh over several rounds) the heart fires a jagged, electric-strike bolt from one of its vertices to a point on one of the rings. Each bolt crackles (its path re-jitters a few times), may fork once, lives about a quarter of a second, and leaves a brief flash where it hits. Signals run wherever the engine appears: in the hero, in chapter 02 ("One call") until the rings have mostly unwound into the sound wave, as the chapter 03 orchestrator, and at contact. They stop during the loading build and the scroll breakout, and are off for reduced-motion users. In light mode they are drawn as a thicker amber stroke without the glow.
- **Restraint rules:** no random particle dust; few, deliberate elements; front bright and back faint; slow motion (full ring rotation on the order of tens of seconds). Gold palette ~ `#ffe1a0` highlights, `#f3b24a` mid, `#c9963f` dim.
- **Interaction:** gentle parallax tilt toward the cursor on desktop (my call).

The engine changes meaning by chapter (§5): hero centrepiece → unwinds into a sound wave and call path (02) → becomes the orchestrator that dispatches agents (03) → powers up the AN·1 chip (04) → settles dim and still at contact.

## 5. The scroll, chapter by chapter

Numbered chapters with small mono labels (`00 · …`), short declarative headlines ending in periods, generous black space. Copy below is direction; final wording is the builder's within these rules, and every string exists in all four languages.

**Loading.** On first load a short assembly sequence (target ≤ 3 s, tied to real asset loading in the build, never longer than needed): a single point of light → the triacontahedron's edges draw in one by one → the four rings sweep in → hero copy reveals line by line and the navigation fades in. A mono percentage counter and one quiet status line ("Aligning the rings") sit bottom-left. On phones (< 768 px) the build-in is shorter: ~1.5 s, hard cap 2 s (owner decision). Any click or key skips it; reduced-motion users and repeat visits in the same session skip it. Text content is in the HTML from the start so crawlers and screen readers never wait for it.

**00 · Hero.** The hero is pinned while the reader scrolls through its first screen-and-a-bit; scroll progress drives the **breakout**: rings expand, break into wider dashes and fly outward, triacontahedron edges detach and spin away, gold shards streak out, the copy lifts and fades, and the scene clears into chapter 01. Name, one-line promise, one line of context, one call to action ("See one system, end to end ↓"), the Golden Engine to the right (centred behind text on mobile). Proposed promise (my call): *"I build agents that build software. And the systems they run on."* Context: agentic AI and Agentic SDLC engineer, GenAI and Cloud/DevOps, India, 5+ years.

**01 · In production.** A row of real numbers, each with a one-line scope. From `content.md`: 15,000+ vessels tracked (Track & Trace, 3PL); −80% provisioning time (n8n + Terraform); 99%+ platform uptime (enterprise AWS hosting); 4 AWS certifications (incl. GenAI Developer Professional, Early Adopter); 5+ years. The engine recedes.

**02 · One call, step by step.** Headline direction: "A caller speaks their language. The bot answers in it. Live." The walkthrough follows one Hindi call as the example. A small line lists the supported languages: Hindi · English · international languages. Scroll-driven: the engine's rings unwind into a sound wave, then into five stops lit in turn: Ring (phone → SIP → Asterisk → LiveKit) · Hear (streaming STT) · Translate (real-time translation) · Think (deployed LLM) · Speak (TTS back to the caller). A small monitoring panel underneath conveys "and it's observed in production". **No latency, volume or other figures are shown** unless Ashutosh supplies them (none supplied as of this document); stops carry descriptions, not numbers. Include one honest line about what the bot does not do or hands to a human, only if Ashutosh supplies it.

**03 · How I build with agents.** Headline direction: "One spec. A swarm of agents. One verified release." Scroll drives the steps (pill indicator SPEC · PLAN · BUILD · VERIFY · SHIP, with the three gates marked between them): a spec writes itself → the Golden Engine (orchestrator) reads it and the spec breaks into task tiles → the engine dispatches many agents in parallel, a few tiles fail red and are retried → finished tiles stream through review → a release ships. Copy states plainly that he built an Agentic SDLC framework for his team and works spec-first on everything. **The visual must stay true to the framework (§5a):** agents run in parallel (confirmed by Ashutosh), but work passes through specialist roles and **three human gates** (Gate 1 spec, Gate 2 plan, Gate 3 merge). So the B7 sequence shows the parallel swarm inside a gated flow: the spec passes an independent review and Gate 1, the orchestrator plans and passes Gate 2, agents build test-first in parallel and a code reviewer checks them, then a human approves Gate 3 and it ships. The gates are drawn as distinct glowing thresholds that only a human "approve" opens, and the copy carries the line that agents never approve, merge or deploy. Task-tile labels are generic engineering nouns (api, schema, tests, infra, docs, security…); **no invented counts** ("40 tasks", "12 running" from the sketch are not used).

**03a · What the framework actually is (facts for chapter 03 and its project card).** A two-phase, spec-first workflow run by specialist role agents, with humans approving every gate:
- *Phase 1, Design:* a **design agent** takes a user story, interviews the developer, and writes a short design-level `spec.md` (requirements, tests, open questions, decisions, impact), with a line budget tied to story size. It sizes the story when needed. A **spec-reviewer agent**, run in a fresh session so it is independent, checks coverage of every acceptance criterion, testability and design level, and scores a 40-practice quality scorecard (must reach ≥ 80 %). A script check runs first. → **Gate 1:** spec pull request, approved by a human.
- *Phase 2, Development:* a **developer agent** writes `plan.md` (every requirement mapped to a task; script-checked) → **Gate 2:** human approves the plan. It then implements task by task, test-first, each task in a fresh session. It verifies locally (build, tests, coverage, mutation testing, static analysis). A **code-reviewer agent**, in a fresh session, checks spec drift, requirement-to-code traceability and an AI review checklist (no invented APIs or libraries, real tests seen failing first, personal data masked in logs, no duplicated logic). → **Gate 3:** human approves and merges, and the pipeline deploys.
- Alongside: a **DB expert agent** for schema and migrations, and a **board agent** that keeps the work-tracking board (states, tasks, estimates, time, links) in sync.
- **What the agents never do:** approve a gate, merge or deploy. Humans own every gate. This is the honest-limits line for chapter 03.
- **The mail-service platform is the worked example, not a project** (decided by Ashutosh): it does not get a project card. Chapter 03 shows the framework in action on it, for example one user story going spec → gates → merged code. Wording stays generic ("a mail-service platform"); no internal project codes, client names or internal standard IDs (my call).

**04 · Infrastructure, awakened.** Headline direction: "Intelligence needs a place to run." Visual (decided by Ashutosh, replacing the earlier light grid): a **CPU + GPU system-on-chip in the style of Apple silicon** that lights up block by block as the reader scrolls. Power traces → Compute (CPU cores) → Schedulers → Cache → Inference (GPU cores) → Agents (neural-engine blocks) → Unified memory · Data (memory packages beside the die, with pulsing bus lines) → CI/CD · Observability · Network (I/O blocks), then a slow sheen across the fully lit die. Each region carries a small label mapping it to his infrastructure work. The chip is an original design marked "AN·1": no Apple logo, product name or trademark. A small terminal types matching status lines as regions light. Content: Terraform + n8n on-demand IaC (−80% provisioning), enterprise AWS hosting platform (99%+ uptime, self-healing, alerting), CloudWatch monitoring reducing MTTR, CI/CD for 10+ applications, cost optimisation. DevOps signals appear as quiet terminal/trace details.

**05 · Selected work, path, credentials, about.** Quiet and readable, minimal 3D. Project cards: the six existing projects (`content.md`) plus the Voice Bot and the Agentic SDLC framework, each opening to problem → approach → stack → outcome using only known facts. Path: B.Tech CSE 2017–2021 → Full Stack & Cloud Platform Engineer (Jun 2021 – Mar 2023) → Technical Manager, DevOps & Innovation Lead (Jun 2023 – Jun 2025) → **Senior Technical Manager, DevOps & Innovation Lead (Jun 2025 – present)** at Cozentus (promotion confirmed by Ashutosh; he still leads DevOps and innovation); Smart Odisha Hackathon 2018 winner; 15+ workshops, 20+ developers mentored; CEO Bonus 4 consecutive years. Four Credly-verified AWS badges (`assets/badges/`). Portrait `assets/photos/Ghibli.png` optional.

**06 · Contact.** "Let's build the next one." Email, LinkedIn, GitHub; the engine settles dim and still.

## 6. Content truth rules
- `content.md` plus the facts in §3 are the only sources. Nothing invented: no numbers, clients, screenshots, repos or quotes.
- Labels inside visuals are illustrative and must not read as claims (no fake counts, no fake latency).
- Contact: `ashutosh.nayak.formal@gmail.com`, `https://www.linkedin.com/in/ashutosh-nayak-81an`, `https://github.com/ashutosh-nayak-official`.

## 7. Technical direction (my calls unless noted)
- **Stack:** React (requested) + React Three Fiber, with drei and postprocessing (bloom, depth of field), built with Vite. Scroll-driven choreography with a smooth-scroll + scroll-trigger approach; library choice is the builder's.
- **Hosting:** stays on GitHub Pages at the same URL, built and deployed by a GitHub Actions workflow (Pages source switches from "deploy from branch" to "GitHub Actions"; the repo owner must approve that settings change).
- **Readable without the 3D:** all text is real HTML, present at first paint, crawlable, and pre-rendered into the built HTML so link previews and search work. 3D loads after the text and never blocks reading or navigation.
- **Fallbacks:** reduced-motion users, WebGL failure and low-power phones get a still image of the engine per chapter (rendered from the real scene) and a normal-scrolling page. Capable phones get a lighter scene (no depth of field, fewer elements).
- **i18n:** EN/DE/NL/PL with a visible language switcher; locale remembered defensively; new copy translated for all four. Existing translations may be reused where the content matches: the scroll-story dictionaries on `main` and `assets/js/translations.js` on `archive/workspace-redesign`.
- **SEO/meta:** keep canonical, Open Graph image (a still of the engine), `sitemap.xml`, `robots.txt`, favicon.
- **Repo:** work starts from `main` (the live scroll-story site plus the `story-v2/` prototype). The never-shipped workspace redesign is archived on branch `archive/workspace-redesign` (decided by Ashutosh). Source moves to a Vite structure; the scroll-story files (`index.html`, `assets/css/story.css`, `assets/js/story.js`, `assets/js/hero3d.js`, `assets/story/`, `assets/layers/`) and `story-v2/` are removed (they remain in git history). Badges and portrait are kept. `.DS_Store` files and the unrelated `test.json` in the working tree are not part of the site.

## 8. Quality bar
- Performance: text and hero headline visible quickly on a mid-range phone; the 3D bundle loads after first paint; 60 fps target on desktop and graceful degradation elsewhere.
- Accessibility: keyboard reachable, visible focus, sufficient contrast, reduced motion respected, decorative canvases hidden from assistive tech, semantic headings.
- Verification: adapt `scripts/check-content.*` and `scripts/check-i18n.js` to the new structure (facts, contacts, four complete dictionaries); Playwright screenshots at desktop, tablet and phone widths across the scroll, reduced-motion and WebGL-off runs, console-error check; a Lighthouse-style performance and accessibility pass.

## 9. Calls settled after the builder check (my calls)
- **Facts not placed above:** chapter 05 includes a compact skills section (the six groups in `content.md`); the 95% project-success rate and CEO Bonus sit in the path; "GenAI analytics in 5+ apps for 300+ users" goes on the Track & Trace / analytics card. The phone number is **not** shown (privacy); email, LinkedIn and GitHub are the contact methods.
- **Locales:** each language is its own pre-rendered page (`/`, `/de/`, `/nl/`, `/pl/`) with hreflang links and a four-entry sitemap; the switcher navigates between them and remembers the choice. Open Graph image can be shared across locales.
- **Branching and cutover:** all work happens on a feature branch, never directly on `main`. The new deploy workflow is verified on the branch (local production build plus Playwright). Switching GitHub Pages to "GitHub Actions" and merging is a single launch step done only when Ashutosh says go; until then the current live site is untouched.

## 10. Left to the builder
Exact copy within §5 and §6, typography (a refined grotesk plus a mono for labels is expected), spacing and breakpoints, animation timings, library choices within §7, component structure, how the engine morphs between chapter states, the still-image generation method, and the exact visual design of chapter 04 and the project cards, consistent with the mockups and restraint rules.
