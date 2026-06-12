/* ============================================================
   "Shift" — scroll-story engine (milestone 1)
   Hero pin + Chapter 1 (1886 Benz blueprint) + speedometer.
   Classic script. Depends on: gsap, ScrollTrigger, Lenis (CDN).
   ============================================================ */

(function () {
  'use strict';

  // ----------------------------------------------------------
  // i18n
  // ----------------------------------------------------------
  var STORY_I18N = {
    en: {
      nav_contact: 'Contact',
      hero_kicker: 'THE DRIVE SO FAR',
      hero_role: 'GenAI Developer & Cloud/DevOps Engineer',
      hero_hint: 'Scroll to start the engine',
      ch1_era: '1886 — THE FIRST IGNITION',
      ch1_title: 'Chapter 01 · College Beginnings',
      ch1_caption: 'Every machine has a first spark. Mine lit at Silicon Institute of Technology, Bhubaneswar — a B.Tech in Computer Science and the first lines of code, drafted like Benz drafting the Patent-Motorwagen.',
      interlude_more: 'Chapters 02–05 are being assembled in the workshop…',
      footer_heading: 'Pull over and say hello'
    },
    de: {
      nav_contact: 'Kontakt',
      hero_kicker: 'DIE FAHRT BIS HIERHER',
      hero_role: 'GenAI-Entwickler & Cloud/DevOps-Ingenieur',
      hero_hint: 'Scrollen, um den Motor zu starten',
      ch1_era: '1886 — DIE ERSTE ZÜNDUNG',
      ch1_title: 'Kapitel 01 · Anfänge im Studium',
      ch1_caption: 'Jede Maschine hat ihren ersten Funken. Meiner zündete am Silicon Institute of Technology in Bhubaneswar — ein B.Tech in Informatik und die ersten Zeilen Code, entworfen wie Benz einst den Patent-Motorwagen.',
      interlude_more: 'Die Kapitel 02–05 werden gerade in der Werkstatt montiert…',
      footer_heading: 'Fahren Sie rechts ran und sagen Sie Hallo'
    },
    nl: {
      nav_contact: 'Contact',
      hero_kicker: 'DE RIT TOT NU TOE',
      hero_role: 'GenAI-ontwikkelaar & Cloud/DevOps-engineer',
      hero_hint: 'Scroll om de motor te starten',
      ch1_era: '1886 — DE EERSTE ONTSTEKING',
      ch1_title: 'Hoofdstuk 01 · Studententijd',
      ch1_caption: 'Elke machine heeft een eerste vonk. De mijne ontstak aan het Silicon Institute of Technology in Bhubaneswar — een B.Tech in informatica en de eerste regels code, geschetst zoals Benz de Patent-Motorwagen schetste.',
      interlude_more: 'Hoofdstukken 02–05 worden nog in de werkplaats in elkaar gezet…',
      footer_heading: 'Zet de auto even stil en zeg hallo'
    },
    pl: {
      nav_contact: 'Kontakt',
      hero_kicker: 'DOTYCHCZASOWA JAZDA',
      hero_role: 'Programista GenAI i inżynier Cloud/DevOps',
      hero_hint: 'Przewiń, aby uruchomić silnik',
      ch1_era: '1886 — PIERWSZY ZAPŁON',
      ch1_title: 'Rozdział 01 · Początki na studiach',
      ch1_caption: 'Każda maszyna ma swoją pierwszą iskrę. Moja zapłonęła w Silicon Institute of Technology w Bhubaneswarze — studia B.Tech z informatyki i pierwsze linijki kodu, kreślone tak, jak Benz kreślił Patent-Motorwagen.',
      interlude_more: 'Rozdziały 02–05 powstają właśnie w warsztacie…',
      footer_heading: 'Zjedź na pobocze i przywitaj się'
    }
  };

  var LANG_CODES = { en: 'EN', de: 'DE', nl: 'NL', pl: 'PL' };

  var currentLang = localStorage.getItem('lang') || 'en';
  if (!STORY_I18N[currentLang]) currentLang = 'en';

  function applyTranslations(lang) {
    var t = STORY_I18N[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    var code = document.getElementById('langCode');
    if (code) code.textContent = LANG_CODES[lang] || lang.toUpperCase();

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  function wireLangSwitcher() {
    var switcher = document.getElementById('langSwitcher');
    var btn = document.getElementById('langBtn');
    if (!switcher || !btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = switcher.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        applyTranslations(opt.dataset.lang);
        switcher.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----------------------------------------------------------
  // Nav (solid after scroll + smooth anchor links)
  // ----------------------------------------------------------
  function wireNav(lenis) {
    var nav = document.getElementById('storyNav');

    function onScroll() {
      var y = lenis ? lenis.scroll : (window.scrollY || 0);
      nav.classList.toggle('is-solid', y > 50);
    }
    if (lenis) {
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    onScroll();

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: 0 });
        } else {
          target.scrollIntoView();
        }
      });
    });
  }

  // ----------------------------------------------------------
  // Speedometer ticks (built once, used in both modes)
  // ----------------------------------------------------------
  function buildSpeedoTicks() {
    var g = document.getElementById('speedoTicks');
    if (!g) return;
    var CX = 48, CY = 48, R_OUT = 43.2, R_IN = 37.5;
    for (var i = 0; i < 8; i++) {
      var deg = -120 + (240 / 7) * i;
      // angle measured from 12 o'clock, converted to standard math coords
      var a = (deg - 90) * Math.PI / 180;
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (CX + R_IN * Math.cos(a)).toFixed(2));
      line.setAttribute('y1', (CY + R_IN * Math.sin(a)).toFixed(2));
      line.setAttribute('x2', (CX + R_OUT * Math.cos(a)).toFixed(2));
      line.setAttribute('y2', (CY + R_OUT * Math.sin(a)).toFixed(2));
      g.appendChild(line);
    }
  }

  // ----------------------------------------------------------
  // Boot
  // ----------------------------------------------------------
  function boot() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    applyTranslations(currentLang);
    wireLangSwitcher();

    if (reducedMotion) {
      // Static site: no Lenis, no GSAP, no 3D. Everything visible via CSS.
      wireNav(null);
      return;
    }

    buildSpeedoTicks();

    // --- Lenis + GSAP integration ---
    var lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);

    wireNav(lenis);

    // --- Speedometer needle + odometer ---
    var needle = document.getElementById('speedoNeedle');
    var odometer = document.getElementById('speedoOdometer');
    var needleBase = -120;
    var needleBlip = { v: 0 };

    function setNeedle() {
      if (!needle) return;
      var deg = Math.max(-120, Math.min(120, needleBase + needleBlip.v));
      needle.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 48 48)');
    }

    ScrollTrigger.create({
      start: 0,
      end: function () { return ScrollTrigger.maxScroll(window); },
      onUpdate: function (self) {
        needleBase = -120 + 240 * self.progress;
        setNeedle();
      }
    });

    function setOdometer(label) {
      if (odometer) odometer.textContent = label;
    }

    // --- Gear-shift flash (speed lines + needle blip) ---
    var speedLines = document.getElementById('speedLines');
    function gearShift() {
      if (speedLines) {
        gsap.timeline()
          .to(speedLines, { opacity: 0.85, duration: 0.12, ease: 'power2.in' })
          .to(speedLines, { opacity: 0, duration: 0.45, ease: 'power2.out' });
      }
      gsap.timeline()
        .to(needleBlip, { v: 15, duration: 0.15, ease: 'power2.out', onUpdate: setNeedle })
        .to(needleBlip, { v: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', onUpdate: setNeedle });
    }

    // --- HERO: split name into letters ---
    var heroStage = document.querySelector('.hero-stage');
    var letters = [];
    document.querySelectorAll('.hero-name > span').forEach(function (word) {
      var text = word.textContent;
      word.textContent = '';
      text.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.className = 'hero-letter';
        s.textContent = ch;
        word.appendChild(s);
        letters.push(s);
      });
    });

    // --- HERO pin: 200% scrub ---
    window.__heroProgress = 0;
    var heroProgress = { p: 0 };

    var heroTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.hero-stage',
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: true,
        onEnter: function () { setOdometer('IGN'); },
        onEnterBack: function () { setOdometer('IGN'); }
      }
    });

    // (a) name letters reveal in first 25%
    heroTl.to(letters, {
      opacity: 1,
      y: 0,
      stagger: { each: 0.25 / Math.max(letters.length, 1) },
      duration: 0.12,
      ease: 'power2.out'
    }, 0);

    // (b) camera orbit progress 0..1 across the whole pin
    heroTl.to(heroProgress, {
      p: 1,
      duration: 1,
      onUpdate: function () { window.__heroProgress = heroProgress.p; }
    }, 0);

    // (c) overlay fades up & out near the end of the pin
    heroTl.to('.hero-overlay', { opacity: 0, y: -60, duration: 0.15, ease: 'power1.in' }, 0.85);
    heroTl.to('.hero-hint', { opacity: 0, duration: 0.1 }, 0.3);

    // --- CHAPTER 1 pin: 250% scrub ---
    var isMobile = function () { return window.innerWidth <= 700; };
    var pf = function () { return isMobile() ? 0.5 : 1; }; // parallax intensity factor

    var yearObj = { y: 1886 };
    var yearEl = document.getElementById('ch1Year');
    if (yearEl) yearEl.textContent = '1886';

    gsap.set('.chapter-1 .chapter-era', { x: -48, opacity: 0 });
    gsap.set('.chapter-1 .chapter-title', { x: -48, opacity: 0 });
    gsap.set('.chapter-1 .chapter-caption', { opacity: 0, y: 24 });

    var ch1Tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.chapter-1',
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: function () { setOdometer('CH 01'); gearShift(); },
        onEnterBack: function () { setOdometer('CH 01'); }
      }
    });

    // Parallax across the full pin (halved on mobile)
    ch1Tl.to('.chapter-1 .layer-bg', { yPercent: function () { return -4 * pf(); }, duration: 1 }, 0);
    ch1Tl.to('.chapter-1 .layer-mid', { yPercent: function () { return -10 * pf(); }, duration: 1 }, 0);
    ch1Tl.to('.chapter-1 .layer-subject', {
      yPercent: function () { return -18 * pf(); },
      scale: 1.04,
      duration: 1
    }, 0);
    ch1Tl.to('.chapter-1 .layer-fg', { yPercent: function () { return -30 * pf(); }, duration: 1 }, 0);

    // Copy choreography (timeline is normalized: duration 1 == full pin)
    ch1Tl.to('.chapter-1 .chapter-era', { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0);
    ch1Tl.to('.chapter-1 .chapter-title', { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.1);

    // Year odometer roll: 1886 -> 2017 between 30% and 60%
    ch1Tl.to(yearObj, {
      y: 2017,
      duration: 0.3,
      snap: { y: 1 },
      onUpdate: function () {
        if (yearEl) yearEl.textContent = String(Math.round(yearObj.y));
      }
    }, 0.3);

    // Caption fades 50-75%
    ch1Tl.to('.chapter-1 .chapter-caption', { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, 0.5);

    // Subject sketch "draws on" via clip-path 20-70%
    ch1Tl.fromTo('.chapter-1 .layer-subject',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' },
      0.2);

    // --- Interlude + footer odometer states ---
    ScrollTrigger.create({
      trigger: '.story-footer',
      start: 'top 80%',
      onEnter: function () { setOdometer('END'); },
      onLeaveBack: function () { setOdometer('CH 01'); }
    });

    // --- Hero 3D: dynamic import only when WebGL is viable ---
    var webglOK = false;
    try {
      if (window.WebGLRenderingContext) {
        var testCanvas = document.createElement('canvas');
        webglOK = !!(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'));
      }
    } catch (err) {
      webglOK = false;
    }

    if (webglOK) {
      import('./hero3d.js').catch(function () {
        if (heroStage) heroStage.classList.add('hero-fallback');
      });
    } else if (heroStage) {
      heroStage.classList.add('hero-fallback');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
