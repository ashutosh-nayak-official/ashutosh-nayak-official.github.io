/* ============================================================
   "Shift" — scroll-story engine (milestone 2a)
   Hero pin + Chapters 1-5 (Benz blueprint → Model T → grand
   tourer → turbo wedge → electric hypercar) + speedometer.
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
      ch1_era: 'THE FIRST IGNITION',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Chapter 01 · College Beginnings',
      ch1_caption: 'Every machine has a first spark. Mine lit at Silicon Institute of Technology, Bhubaneswar — a B.Tech in Computer Science and the first lines of code, drafted like Benz drafting the Patent-Motorwagen.',
      ch2_era: 'THE ASSEMBLY LINE',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Chapter 02 · Learning the Craft',
      ch2_caption: 'Fundamentals, frameworks, and late-night builds — shipping code the way Ford shipped cars: one reliable piece at a time. In 2018 the first trophy arrived — the Smart Odisha Hackathon, won with an IoT smart drainage system built for the Govt. of Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · WINNER 2018',
      ch3_era: 'THE OPEN ROAD',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Chapter 03 · First Professional Years',
      ch3_caption: 'Joining Cozentus Technologies as a Full Stack & Cloud Platform Engineer — delivering an AI-powered vessel tracking system with predictive ETAs for 15,000+ ships, on AWS infrastructure engineered for 99% uptime and CI/CD pipelines serving 10+ applications.',
      ch4_era: 'FORCED INDUCTION',
      ch4_stamp: 'TURBO ERA · 1987',
      ch4_title: 'Chapter 04 · The GenAI Shift',
      ch4_caption: 'The turbo spools: RAG chatbots with Agentic AI on AWS Bedrock, a self-healing scraper that speaks natural language through MCP, and an n8n + Terraform pipeline that cut infrastructure provisioning time by 80%.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% PROVISIONING',
      ch5_era: 'FULL CHARGE',
      ch5_stamp: 'ELECTRIC HYPERCAR · NOW',
      ch5_title: 'Chapter 05 · Lead Innovation',
      ch5_now: 'NOW',
      ch5_caption: 'Today: Technical Manager — Lead Innovation at Cozentus, architecting intelligent systems and the cloud beneath them, mentoring 20+ developers through 15+ workshops — with a CEO Bonus four years running.',
      stat_experience: 'Years Experience',
      stat_uptime: 'Platform Uptime',
      stat_workshops: 'AI/Cloud Workshops',
      stat_bonus: 'CEO Bonus Awarded',
      stat_success: 'Project Success Rate',
      interlude_more: 'The finale is being assembled in the workshop…',
      footer_heading: 'Pull over and say hello'
    },
    de: {
      nav_contact: 'Kontakt',
      hero_kicker: 'DIE FAHRT BIS HIERHER',
      hero_role: 'GenAI-Entwickler & Cloud/DevOps-Ingenieur',
      hero_hint: 'Scrollen, um den Motor zu starten',
      ch1_era: 'DIE ERSTE ZÜNDUNG',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Kapitel 01 · Anfänge im Studium',
      ch1_caption: 'Jede Maschine hat ihren ersten Funken. Meiner zündete am Silicon Institute of Technology in Bhubaneswar — ein B.Tech in Informatik und die ersten Zeilen Code, entworfen wie Benz einst den Patent-Motorwagen.',
      ch2_era: 'DAS FLIESSBAND',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Kapitel 02 · Das Handwerk lernen',
      ch2_caption: 'Grundlagen, Frameworks und nächtliche Builds — Code ausliefern, wie Ford Autos auslieferte: ein zuverlässiges Teil nach dem anderen. 2018 kam die erste Trophäe — der Smart Odisha Hackathon, gewonnen mit einem IoT-basierten intelligenten Entwässerungssystem für die Regierung von Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · GEWINNER 2018',
      ch3_era: 'DIE OFFENE STRASSE',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Kapitel 03 · Erste Berufsjahre',
      ch3_caption: 'Einstieg bei Cozentus Technologies als Full Stack & Cloud Platform Engineer — Bereitstellung eines KI-gestützten Schiffsverfolgungssystems mit prädiktiven ETAs für 15.000+ Schiffe, auf AWS-Infrastruktur mit 99% Verfügbarkeit und CI/CD-Pipelines für 10+ Anwendungen.',
      ch4_era: 'AUFLADUNG',
      ch4_stamp: 'TURBO-ÄRA · 1987',
      ch4_title: 'Kapitel 04 · Der GenAI-Wandel',
      ch4_caption: 'Der Turbo dreht hoch: RAG-Chatbots mit Agentic AI auf AWS Bedrock, ein selbstheilender Scraper, der über MCP natürliche Sprache spricht, und eine n8n + Terraform-Pipeline, die die Bereitstellungszeit der Infrastruktur um 80% verkürzte.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% BEREITSTELLUNGSZEIT',
      ch5_era: 'VOLLE LADUNG',
      ch5_stamp: 'ELEKTRO-HYPERCAR · JETZT',
      ch5_title: 'Kapitel 05 · Innovationsleitung',
      ch5_now: 'JETZT',
      ch5_caption: 'Heute: Technischer Manager — Innovationsleitung bei Cozentus, Architektur intelligenter Systeme und der Cloud darunter, Mentoring von 20+ Entwicklern in 15+ Workshops — mit dem CEO-Bonus vier Jahre in Folge.',
      stat_experience: 'Jahre Erfahrung',
      stat_uptime: 'Plattform-Verfügbarkeit',
      stat_workshops: 'AI/Cloud-Workshops',
      stat_bonus: 'CEO-Bonus erhalten',
      stat_success: 'Projekterfolgsquote',
      interlude_more: 'Das Finale wird gerade in der Werkstatt montiert…',
      footer_heading: 'Fahren Sie rechts ran und sagen Sie Hallo'
    },
    nl: {
      nav_contact: 'Contact',
      hero_kicker: 'DE RIT TOT NU TOE',
      hero_role: 'GenAI-ontwikkelaar & Cloud/DevOps-engineer',
      hero_hint: 'Scroll om de motor te starten',
      ch1_era: 'DE EERSTE ONTSTEKING',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Hoofdstuk 01 · Studententijd',
      ch1_caption: 'Elke machine heeft een eerste vonk. De mijne ontstak aan het Silicon Institute of Technology in Bhubaneswar — een B.Tech in informatica en de eerste regels code, geschetst zoals Benz de Patent-Motorwagen schetste.',
      ch2_era: 'DE LOPENDE BAND',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Hoofdstuk 02 · Het vak leren',
      ch2_caption: 'Fundamenten, frameworks en nachtelijke builds — code leveren zoals Ford auto’s leverde: één betrouwbaar onderdeel tegelijk. In 2018 kwam de eerste trofee — de Smart Odisha Hackathon, gewonnen met een IoT-gebaseerd slim drainagesysteem voor de overheid van Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · WINNAAR 2018',
      ch3_era: 'DE OPEN WEG',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Hoofdstuk 03 · Eerste professionele jaren',
      ch3_caption: 'Aan de slag bij Cozentus Technologies als Full Stack & Cloud Platform Engineer — levering van een AI-aangedreven scheepstrackingsysteem met voorspellende ETA’s voor 15.000+ schepen, op AWS-infrastructuur gebouwd voor 99% uptime en CI/CD-pipelines voor 10+ applicaties.',
      ch4_era: 'DRUKVULLING',
      ch4_stamp: 'TURBOTIJDPERK · 1987',
      ch4_title: 'Hoofdstuk 04 · De GenAI-omslag',
      ch4_caption: 'De turbo komt op druk: RAG-chatbots met Agentic AI op AWS Bedrock, een zelfherstellende scraper die via MCP natuurlijke taal spreekt, en een n8n + Terraform-pipeline die de provisioningtijd van infrastructuur met 80% verkortte.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% PROVISIONINGTIJD',
      ch5_era: 'VOLLE LADING',
      ch5_stamp: 'ELEKTRISCHE HYPERCAR · NU',
      ch5_title: 'Hoofdstuk 05 · Innovatieleider',
      ch5_now: 'NU',
      ch5_caption: 'Vandaag: Technisch Manager — Innovatieleider bij Cozentus, architect van intelligente systemen en de cloud eronder, mentor van 20+ ontwikkelaars via 15+ workshops — met de CEO Bonus vier jaar op rij.',
      stat_experience: 'Jaar Ervaring',
      stat_uptime: 'Platform Uptime',
      stat_workshops: 'AI/Cloud Workshops',
      stat_bonus: 'CEO Bonus Ontvangen',
      stat_success: 'Projectsuccesratio',
      interlude_more: 'De finale wordt nog in de werkplaats in elkaar gezet…',
      footer_heading: 'Zet de auto even stil en zeg hallo'
    },
    pl: {
      nav_contact: 'Kontakt',
      hero_kicker: 'DOTYCHCZASOWA JAZDA',
      hero_role: 'Programista GenAI i inżynier Cloud/DevOps',
      hero_hint: 'Przewiń, aby uruchomić silnik',
      ch1_era: 'PIERWSZY ZAPŁON',
      ch1_stamp: 'BENZ PATENT-MOTORWAGEN · 1886',
      ch1_title: 'Rozdział 01 · Początki na studiach',
      ch1_caption: 'Każda maszyna ma swoją pierwszą iskrę. Moja zapłonęła w Silicon Institute of Technology w Bhubaneswarze — studia B.Tech z informatyki i pierwsze linijki kodu, kreślone tak, jak Benz kreślił Patent-Motorwagen.',
      ch2_era: 'LINIA MONTAŻOWA',
      ch2_stamp: 'FORD MODEL T · 1908',
      ch2_title: 'Rozdział 02 · Nauka rzemiosła',
      ch2_caption: 'Podstawy, frameworki i nocne buildy — dostarczanie kodu tak, jak Ford dostarczał samochody: jedna niezawodna część na raz. W 2018 roku pojawiło się pierwsze trofeum — Smart Odisha Hackathon, wygrany dzięki opartemu na IoT inteligentnemu systemowi odwadniania dla rządu stanu Odisha.',
      ch2_plaque: 'SMART ODISHA HACKATHON · ZWYCIĘZCA 2018',
      ch3_era: 'OTWARTA DROGA',
      ch3_stamp: 'GRAND TOURER · 1965',
      ch3_title: 'Rozdział 03 · Pierwsze lata zawodowe',
      ch3_caption: 'Dołączenie do Cozentus Technologies jako Full Stack & Cloud Platform Engineer — dostarczenie opartego na AI systemu śledzenia statków z predykcyjnymi ETA dla 15 000+ statków, na infrastrukturze AWS zaprojektowanej na 99% dostępności, z pipeline’ami CI/CD obsługującymi 10+ aplikacji.',
      ch4_era: 'DOŁADOWANIE',
      ch4_stamp: 'ERA TURBO · 1987',
      ch4_title: 'Rozdział 04 · Zwrot ku GenAI',
      ch4_caption: 'Turbo nabiera obrotów: chatboty RAG z Agentic AI na AWS Bedrock, samonaprawiający się scraper rozmawiający w języku naturalnym przez MCP oraz pipeline n8n + Terraform, który skrócił czas provisioningu infrastruktury o 80%.',
      ch4_chip1: 'RAG + AGENTIC AI',
      ch4_chip2: 'AWS BEDROCK',
      ch4_chip3: 'MCP · n8n · TERRAFORM −80% CZASU PROVISIONINGU',
      ch5_era: 'PEŁNE NAŁADOWANIE',
      ch5_stamp: 'ELEKTRYCZNY HIPERSAMOCHÓD · TERAZ',
      ch5_title: 'Rozdział 05 · Lider Innowacji',
      ch5_now: 'TERAZ',
      ch5_caption: 'Dziś: Kierownik Techniczny — Lider Innowacji w Cozentus, projektujący inteligentne systemy i chmurę pod nimi, mentor 20+ programistów w ramach 15+ warsztatów — z Bonusem CEO przez cztery kolejne lata.',
      stat_experience: 'Lat doświadczenia',
      stat_uptime: 'Dostępność platformy',
      stat_workshops: 'Warsztaty AI/Cloud',
      stat_bonus: 'Bonus CEO przyznany',
      stat_success: 'Wskaźnik sukcesu',
      interlude_more: 'Finał powstaje właśnie w warsztacie…',
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

    // --- CHAPTER pins: 250% scrub, shared choreography ---
    var isMobile = function () { return window.innerWidth <= 700; };
    var pf = function () { return isMobile() ? 0.5 : 1; }; // parallax intensity factor

    // Shared per-chapter skeleton: pin + parallax + copy reveal windows
    // (era 0-20%, title 10-30%, year 30-60%, caption 50-75%, stamp 60-75%).
    // All initial hidden states are set HERE (non-reduced path only) so the
    // reduced-motion early return leaves everything visible.
    // opts.subjectScale=false skips the slow subject zoom (chapter 4 animates
    // scaleX itself and the two would fight over the same property).
    function buildChapterTimeline(sel, odoLabel, opts) {
      opts = opts || {};

      gsap.set(sel + ' .chapter-era', { x: -48, opacity: 0 });
      gsap.set(sel + ' .chapter-title', { x: -48, opacity: 0 });
      gsap.set(sel + ' .chapter-caption', { opacity: 0, y: 24 });
      gsap.set(sel + ' .chapter-year', { opacity: 0, y: 40, skewY: 4 });
      gsap.set(sel + ' .era-stamp', { opacity: 0 });

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sel,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: function () { setOdometer(odoLabel); gearShift(); },
          onEnterBack: function () { setOdometer(odoLabel); }
        }
      });

      // Parallax across the full pin (halved on mobile)
      tl.to(sel + ' .layer-bg', { yPercent: function () { return -4 * pf(); }, duration: 1 }, 0);
      tl.to(sel + ' .layer-mid', { yPercent: function () { return -10 * pf(); }, duration: 1 }, 0);
      tl.to(sel + ' .layer-subject',
        opts.subjectScale === false
          ? { yPercent: function () { return -18 * pf(); }, duration: 1 }
          : { yPercent: function () { return -18 * pf(); }, scale: 1.04, duration: 1 },
        0);
      tl.to(sel + ' .layer-fg', { yPercent: function () { return -30 * pf(); }, duration: 1 }, 0);

      // Copy choreography (timeline is normalized: duration 1 == full pin)
      tl.to(sel + ' .chapter-era', { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0);
      tl.to(sel + ' .chapter-title', { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.1);
      tl.fromTo(sel + ' .chapter-year',
        { opacity: 0, y: 40, skewY: 4 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.3, ease: 'power2.out' },
        0.3);
      tl.to(sel + ' .chapter-caption', { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }, 0.5);
      tl.to(sel + ' .era-stamp', { opacity: 1, duration: 0.15, ease: 'power1.out' }, 0.6);

      return tl;
    }

    // --- CHAPTER 1 — 1886 blueprint: subject draws on via clip-path ---
    var ch1Tl = buildChapterTimeline('.chapter-1', 'CH 01');
    ch1Tl.fromTo('.chapter-1 .layer-subject',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' },
      0.2);

    // --- CHAPTER 2 — 1908 Model T: draw-on + brass hackathon plaque ---
    var ch2Tl = buildChapterTimeline('.chapter-2', 'CH 02');
    ch2Tl.fromTo('.chapter-2 .layer-subject',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'none' },
      0.2);
    // plaque stamps in with a slight rotate/settle at 70-85%
    gsap.set('.hackathon-plaque', { opacity: 0, rotation: -8, y: 26, transformOrigin: '50% 50%' });
    ch2Tl.to('.hackathon-plaque',
      { opacity: 1, rotation: -1.5, y: 0, duration: 0.15, ease: 'back.out(2.2)' },
      0.7);

    // --- CHAPTER 3 — 1965 grand tourer: slides in from the left + settles ---
    var ch3Tl = buildChapterTimeline('.chapter-3', 'CH 03');
    gsap.set('.chapter-3 .layer-subject', { xPercent: -8, opacity: 0 });
    ch3Tl.to('.chapter-3 .layer-subject',
      { xPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
      0.15);

    // --- CHAPTER 4 — 1987 turbo wedge: fast entry from the right with a
    //     faked motion-blur stretch; speed lines streak the opposite way ---
    var ch4Tl = buildChapterTimeline('.chapter-4', 'CH 04', { subjectScale: false });
    gsap.set('.chapter-4 .layer-subject', { xPercent: 9, opacity: 0, scaleX: 1.06, transformOrigin: '50% 50%' });
    ch4Tl.to('.chapter-4 .layer-subject',
      { xPercent: 0, opacity: 1, scaleX: 1, duration: 0.22, ease: 'power3.out' },
      0.12);
    ch4Tl.to('.chapter-4 .layer-mid', { xPercent: -10, duration: 1 }, 0);
    // HUD chips stagger in 60-85%
    gsap.set('.chapter-4 .hud-chip', { opacity: 0, x: 28 });
    ch4Tl.to('.chapter-4 .hud-chip',
      { opacity: 1, x: 0, duration: 0.09, ease: 'power2.out', stagger: 0.08 },
      0.6);

    // --- CHAPTER 5 — electric hypercar: fade + rise, ribbons sweep on,
    //     dash-cluster stats count up 55-85% ---
    var ch5Tl = buildChapterTimeline('.chapter-5', 'CH 05');
    gsap.set('.chapter-5 .layer-subject', { opacity: 0, y: 60 });
    // ribbons start hidden (nested fromTo doesn't immediate-render)
    gsap.set('.chapter-5 .layer-mid', { clipPath: 'inset(0% 100% 0% 0%)' });
    ch5Tl.to('.chapter-5 .layer-subject',
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      0.1);
    ch5Tl.fromTo('.chapter-5 .layer-mid',
      { clipPath: 'inset(0% 100% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, ease: 'none' },
      0.15);

    document.querySelectorAll('.chapter-5 .dash-stat').forEach(function (stat, i) {
      var valEl = stat.querySelector('.dash-value');
      var target = parseFloat(valEl.getAttribute('data-value')) || 0;
      var suffix = valEl.getAttribute('data-suffix') || '';
      var counter = { v: 0 };
      // HTML ships the final value (visible under reduced motion);
      // zero it out here and let the scrubbed tween count it back up.
      valEl.textContent = '0' + suffix;
      gsap.set(stat, { opacity: 0, y: 18 });
      var at = 0.55 + i * 0.05;
      ch5Tl.to(stat, { opacity: 1, y: 0, duration: 0.06, ease: 'power1.out' }, at);
      ch5Tl.to(counter, {
        v: target,
        duration: 0.1,
        ease: 'power1.out',
        onUpdate: function () { valEl.textContent = Math.round(counter.v) + suffix; }
      }, at);
    });

    // --- Interlude + footer odometer states ---
    ScrollTrigger.create({
      trigger: '.story-footer',
      start: 'top 80%',
      onEnter: function () { setOdometer('END'); },
      onLeaveBack: function () { setOdometer('CH 05'); }
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
