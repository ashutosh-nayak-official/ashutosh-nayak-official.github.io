(() => {
  'use strict';
  const doc = document;
  doc.body.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sceneEls = [...doc.querySelectorAll('.scene[data-bg]')];

  // ---- build the fixed cinematic stage (one layer per scene) ----
  const stage = doc.getElementById('stage');
  const layers = sceneEls.map((s, i) => {
    const l = doc.createElement('div');
    l.className = 'stage-layer';
    l.style.backgroundImage = `url("${s.dataset.bg}")`;
    if (i === 0) l.style.opacity = '1';
    stage.appendChild(l);
    return l;
  });

  // optional video layer for the hero (motion background)
  if (stage.dataset.heroVideo && !reduce) {
    const v = doc.createElement('video');
    v.src = stage.dataset.heroVideo;
    v.poster = sceneEls[0] ? sceneEls[0].dataset.bg : '';
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.preload = 'auto';
    v.className = 'stage-video';
    v.setAttribute('aria-hidden', 'true');
    layers[0].appendChild(v);
    v.play && v.play().catch(() => {});
  }

  // per-chapter particle accent (r,g,b)
  const THEMES = [
    [34, 211, 238], [245, 200, 140], [245, 165, 36], [90, 170, 255],
    [34, 211, 238], [120, 230, 210], [210, 180, 120],
  ];
  let theme = THEMES[0].slice();
  let themeTarget = THEMES[0];

  // ---- reveal on scroll ----
  const reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(r => io.observe(r));
  } else { reveals.forEach(r => r.classList.add('in')); }

  // ---- stat counters ----
  const stats = doc.querySelectorAll('.stat b[data-count]');
  let counted = false;
  function runCounters() {
    if (counted) return; counted = true;
    stats.forEach(el => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = target + suffix; return; }
      const dur = 1500, t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  const heroStats = doc.getElementById('stats');
  if (heroStats && 'IntersectionObserver' in window) {
    new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { runCounters(); o.disconnect(); } }, { threshold: 0.4 }).observe(heroStats);
  } else runCounters();

  // ---- scroll-driven cinema: crossfade + ken-burns + parallax ----
  const bar = doc.querySelector('#progress span');
  const dots = [...doc.querySelectorAll('#navDots a')];
  const dotTargets = dots.map(d => doc.querySelector(d.getAttribute('href')));

  function render() {
    const vh = innerHeight, mid = vh / 2;
    const st = window.scrollY || doc.documentElement.scrollTop;
    const h = doc.documentElement.scrollHeight - vh;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';

    let active = 0, bestDist = Infinity;
    sceneEls.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - mid);
      let op = 1 - dist / (vh * 0.85);
      op = Math.max(0, Math.min(1, op));
      op = op * op * (3 - 2 * op); // smoothstep
      const l = layers[i];
      l.style.opacity = op.toFixed(3);
      if (!reduce && op > 0.001) {
        const prog = Math.max(0, Math.min(1, (mid - r.top) / r.height));
        const scale = 1.04 + prog * 0.14;
        const ty = (prog - 0.5) * 6;
        l.style.transform = `scale(${scale.toFixed(4)}) translateY(${ty.toFixed(2)}%)`;
        l.style.zIndex = String(Math.round(op * 10));
      }
      if (!reduce) {
        const inner = s.querySelector('.hero-inner,.chapter-inner,.contact-inner');
        if (inner) {
          const rel = (center - mid) / vh;
          inner.style.transform = `translateY(${(rel * -26).toFixed(1)}px)`;
          inner.style.opacity = String(Math.max(0.15, 1 - Math.abs(rel) * 0.9));
        }
      }
      if (dist < bestDist) { bestDist = dist; active = i; }
    });

    themeTarget = THEMES[active] || THEMES[0];
    dots.forEach((d, i) => {
      const sec = dotTargets[i];
      let on = false;
      if (sec) { const rr = sec.getBoundingClientRect(); on = rr.top <= mid && rr.bottom >= mid; }
      d.classList.toggle('is-active', on);
    });
  }

  // ---- particle network (continuous, theme-reactive) ----
  const canvas = doc.getElementById('bg-field');
  let raf;
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, pts = [];
    const COUNT = () => Math.min(100, Math.floor(innerWidth / 14));
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
    }
    function seed() {
      pts = Array.from({ length: COUNT() }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .3 * dpr, vy: (Math.random() - .5) * .3 * dpr,
        r: (Math.random() * 1.6 + .6) * dpr
      }));
    }
    function frame() {
      for (let k = 0; k < 3; k++) theme[k] += (themeTarget[k] - theme[k]) * 0.04;
      const cr = Math.round(theme[0]), cg = Math.round(theme[1]), cb = Math.round(theme[2]);
      ctx.clearRect(0, 0, w, h);
      const max = 150 * dpr;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},.75)`; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < max) {
            const a = (1 - d / max) * .2;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
            ctx.lineWidth = .6 * dpr; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    resize(); seed(); frame();
    addEventListener('resize', () => { resize(); seed(); });
    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) cancelAnimationFrame(raf); else frame();
    });
  }

  // ---- smooth inertia scroll via Lenis (graceful fallback to native) ----
  let lenis = null;
  function startRAF(loop) { const tick = (t) => { loop(t); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
  function initScroll() {
    if (reduce || !window.Lenis) {
      let ticking = false;
      addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { render(); ticking = false; }); ticking = true; } }, { passive: true });
      render();
      if (!reduce) startRAF(render);
      return;
    }
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, lerp: 0.09 });
    lenis.on('scroll', render);
    startRAF((t) => { lenis.raf(t); });
    render();
  }

  doc.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = doc.querySelector(id); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { duration: 1.2 });
      else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  if (!reduce) {
    const sc = doc.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    sc.onload = initScroll;
    sc.onerror = initScroll;
    doc.head.appendChild(sc);
    setTimeout(() => { if (!lenis) initScroll(); }, 2500);
  } else {
    initScroll();
  }
})();
