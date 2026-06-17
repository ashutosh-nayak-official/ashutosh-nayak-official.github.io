(() => {
  'use strict';
  const doc = document;
  doc.body.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- set scene backgrounds from data-bg ----
  doc.querySelectorAll('.scene[data-bg]').forEach(s => {
    const bg = s.querySelector('.scene-bg');
    if (bg) bg.style.backgroundImage = `url("${s.dataset.bg}")`;
  });

  // ---- reveal on scroll ----
  const reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18 });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('in'));
  }

  // ---- animated stat counters ----
  const stats = doc.querySelectorAll('.stat b[data-count]');
  let counted = false;
  function runCounters() {
    if (counted) return; counted = true;
    stats.forEach(el => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = target + suffix; return; }
      const dur = 1400, t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  const heroStats = doc.getElementById('stats');
  if (heroStats && 'IntersectionObserver' in window) {
    new IntersectionObserver((e, o) => {
      if (e[0].isIntersecting) { runCounters(); o.disconnect(); }
    }, { threshold: 0.4 }).observe(heroStats);
  } else { runCounters(); }

  // ---- progress bar + active nav dot + bg parallax ----
  const bar = doc.querySelector('#progress span');
  const dots = [...doc.querySelectorAll('#navDots a')];
  const sections = dots.map(d => doc.querySelector(d.getAttribute('href')));
  const parallaxBgs = [...doc.querySelectorAll('.scene-bg')];

  let ticking = false;
  function onScroll() {
    const st = window.scrollY;
    const h = doc.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';

    // active dot
    let idx = 0;
    sections.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= innerHeight * 0.5) idx = i; });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));

    // parallax
    if (!reduce) {
      parallaxBgs.forEach(bg => {
        const r = bg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const offset = (r.top / innerHeight) * 28;
          bg.style.transform = `scale(1.12) translateY(${offset}px)`;
        }
      });
    }
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---- particle network background ----
  const canvas = doc.getElementById('bg-field');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, pts = [], raf, running = true;
    const COUNT = () => Math.min(90, Math.floor(innerWidth / 16));
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }
    function seed() {
      pts = Array.from({ length: COUNT() }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr,
        r: (Math.random() * 1.6 + .6) * dpr
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(34,211,238,.7)'; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          const max = 150 * dpr;
          if (d < max) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            const a = (1 - d / max) * .22;
            ctx.strokeStyle = `rgba(120,180,255,${a})`;
            ctx.lineWidth = .6 * dpr; ctx.stroke();
          }
        }
      }
      if (running) raf = requestAnimationFrame(draw);
    }
    resize(); seed(); draw();
    addEventListener('resize', () => { resize(); seed(); });
    doc.addEventListener('visibilitychange', () => {
      running = !doc.hidden;
      if (running) draw(); else cancelAnimationFrame(raf);
    });
  }

  // ---- smooth anchor scroll for nav dots / cues (native fallback ok) ----
  doc.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = doc.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    });
  });
})();
