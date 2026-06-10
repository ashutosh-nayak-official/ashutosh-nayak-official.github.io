// ============================================================
// SPACE SCENE BRIDGE — drives the 3D voyage; falls back to 2D particles
// ============================================================
window.__sceneFallback = false;
document.addEventListener('scene:fallback', () => {
  window.__sceneFallback = true;
  document.body.classList.remove('scene-active');
  if (window.__startParticles) window.__startParticles();
});
(function () {
  function pageProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    return docH > 0 ? window.pageYOffset / docH : 0;
  }
  if (window.SpaceScene) window.SpaceScene.setScrollProgress(pageProgress());
  window.addEventListener('scroll', () => {
    if (window.SpaceScene) window.SpaceScene.setScrollProgress(pageProgress());
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (window.SpaceScene) window.SpaceScene.layout();
  });
})();

// ============================================================
// UTILITIES
// ============================================================
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

// ============================================================
// PARTICLE NETWORK BACKGROUND (2D fallback — started only if WebGL scene unavailable)
// ============================================================
window.__startParticles = function () {
  if (window.__particlesStarted) return;
  window.__particlesStarted = true;
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: -1000, y: -1000 };
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 200;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r = Math.random() * 1.5 + 0.5;
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
        this.vx += dx * force;
        this.vy += dy * force;
      }
      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;
    }
    draw() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, isLight ? this.r * 1.5 : this.r, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim() || '#00F0FF';
      ctx.globalAlpha = isLight ? 0.55 : 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animate() {
    if (document.body.classList.contains('scene-active')) { window.__particlesStarted = false; return; }
    ctx.clearRect(0, 0, w, h);
    const cyan = getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim() || '#00F0FF';
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const lineAlphaMultiplier = isLight ? 0.2 : 0.15;
      const lineWidth = isLight ? 0.8 : 0.5;
      
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = cyan;
          ctx.globalAlpha = (1 - dist / CONNECTION_DIST) * lineAlphaMultiplier;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
};
if (window.__sceneFallback) window.__startParticles();
else setTimeout(() => {
  if (!document.body.classList.contains('scene-active')) window.__startParticles();
}, 2500);

// ============================================================
// THEME TOGGLE (LIGHT / DARK)
// ============================================================
(function() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'light') root.setAttribute('data-theme', 'light');

  btn.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    // Add a quick flash transition
    document.body.style.transition = 'background 0.5s ease';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    if (window.SpaceScene) {
      const magic = document.documentElement.hasAttribute('data-magic');
      window.SpaceScene.setTheme(magic ? 'magic' : (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'));
    }
    setTimeout(() => { document.body.style.transition = ''; }, 600);
  });
})();

// ============================================================
// CUSTOM CURSOR WITH MAGNETIC EFFECT
// ============================================================
(function() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx - 4 + 'px';
    dot.style.top = my - 4 + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx - 20 + 'px';
    ring.style.top = ry - 20 + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Magnetic effect for interactive elements
  const magneticEls = document.querySelectorAll('a, .nav-cta, .project-card, .skill-item, .contact-link, .theme-toggle, .cert-card');
  magneticEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(0,240,255,0.7)';
      ring.style.left = (rx - 28) + 'px';
      ring.style.top = (ry - 28) + 'px';
      dot.style.transform = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = 'rgba(0,240,255,0.4)';
      dot.style.transform = 'scale(1)';
      el.style.transform = '';
    });

    // Magnetic pull toward cursor
    el.addEventListener('mousemove', (e) => {
      if (el.classList.contains('project-card') || el.classList.contains('cert-card')) return; // skip cards (they have tilt)
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.15;
      const dy = (e.clientY - cy) * 0.15;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  });
})();

// ============================================================
// ANIMATED NUMBER COUNTERS
// ============================================================
(function() {
  const stats = document.querySelectorAll('.hero-stat .num');
  let counted = false;

  function animateCount(el) {
    const raw = el.textContent.trim();
    const hasPlus = raw.includes('+');
    const hasPercent = raw.includes('%');
    const hasX = raw.includes('×');
    const numStr = raw.replace(/[^0-9.]/g, '');
    const target = parseFloat(numStr);
    if (isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();
    const isDecimal = numStr.includes('.');

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      let current = eased * target;
      
      let display;
      if (isDecimal) {
        display = current.toFixed(0);
      } else {
        display = Math.floor(current).toString();
      }
      
      let suffix = '';
      if (hasPercent) suffix += '%';
      if (hasPlus) suffix += '+';
      if (hasX) suffix = '×';
      
      el.textContent = display + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = raw; // restore original
      }
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        stats.forEach((s, i) => {
          setTimeout(() => animateCount(s), i * 150);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));
})();

// ============================================================
// 3D TILT EFFECT ON PROJECT CARDS
// ============================================================
(function() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -6;
      const rotateY = (x - centerX) / centerX * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.25,1,0.5,1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
})();

// ============================================================
// SKILL ITEM RIPPLE POSITIONING
// ============================================================
(function() {
  document.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      item.style.setProperty('--ripple-x', x + '%');
      item.style.setProperty('--ripple-y', y + '%');
    });
  });
})();

// ============================================================
// ABOUT — WORD-BY-WORD TEXT REVEAL
// ============================================================
(function() {
  const container = document.getElementById('aboutReveal');
  const text = "I design and develop {intelligent systems} that bridge the gap between {large} {language} {models} and real-world enterprise problems and build the {cloud infrastructure} that powers them. From designing {RAG pipelines} and {Agentic AI} workflows to deploying {scalable infrastructure} with {Terraform}, {CI/CD pipelines}, and {AWS cloud architecture}, I turn complex AI capabilities into products that teams actually ship. On the DevOps side, I've driven {80% faster provisioning} with IaC automation, maintained {99%+ platform uptime}, and led cloud cost optimization initiatives. My work spans {logistics}, {supply chain}, and {finance}, where I've built systems tracking {15,000+ vessels globally} and led innovation teams that consistently deliver with a {95% success rate}.";

  const words = text.split(' ');
  container.innerHTML = words.map((w, i) => {
    const isHighlight = w.startsWith('{') || w.endsWith('}');
    const clean = w.replace(/[{}]/g, '');
    const cls = isHighlight ? 'about-word highlight' : 'about-word';
    return `<span class="${cls}" data-index="${i}">${clean} </span>`;
  }).join('');

  const wordEls = container.querySelectorAll('.about-word');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index);
        setTimeout(() => entry.target.classList.add('lit'), idx * 20);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -15% 0px' });

  wordEls.forEach(w => observer.observe(w));
})();

// ============================================================
// EXPERIENCE — STICKY CROSSFADE
// ============================================================
(function() {
  const outer = document.getElementById('expScroll');
  const navItems = document.querySelectorAll('.exp-nav-item');
  const details = document.querySelectorAll('.exp-detail');

  function update() {
    const rect = outer.getBoundingClientRect();
    const scrollable = outer.offsetHeight - window.innerHeight;
    const progress = clamp(-rect.top / scrollable, 0, 0.999);
    const activeIdx = Math.floor(progress * navItems.length);

    navItems.forEach((n, i) => n.classList.toggle('active', i === activeIdx));
    details.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  }

  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
})();

// ============================================================
// PROJECTS — HORIZONTAL SCROLL WITH PROGRESS
// ============================================================
(function() {
  const outer = document.getElementById('projectsScroll');
  const track = document.getElementById('projectsTrack');

  function update() {
    const rect = outer.getBoundingClientRect();
    const scrollable = outer.offsetHeight - window.innerHeight;
    const progress = clamp(-rect.top / scrollable, 0, 1);
    const maxTranslate = track.scrollWidth - window.innerWidth + 80;
    track.style.transform = `translateX(-${progress * maxTranslate}px)`;
    
    // Parallax on individual cards
    const cards = track.querySelectorAll('.project-card');
    cards.forEach((card, i) => {
      const offset = Math.sin((progress * Math.PI) + i * 0.5) * 10;
      card.style.marginTop = offset + 'px';
    });
  }

  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
})();

// ============================================================
// SKILLS — STAGGERED REVEAL
// ============================================================
(function() {
  const cards = document.querySelectorAll('.skill-category');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => observer.observe(c));
})();

// ============================================================
// CERTS — STAGGERED REVEAL
// ============================================================
(function() {
  const cards = document.querySelectorAll('.cert-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 150);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => observer.observe(c));
})();

// ============================================================
// SECTION HEADERS — FADE IN ON SCROLL
// ============================================================
(function() {
  const els = document.querySelectorAll('.section-label, .section-heading, .contact-heading, .contact-sub');
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.25,1,0.5,1), transform 0.8s cubic-bezier(0.25,1,0.5,1)';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  els.forEach(el => observer.observe(el));
})();

// ============================================================
// NAV SCROLL SHADOW
// ============================================================
(function() {
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
})();

// ============================================================
// HERO TAG TYPING EFFECT
// ============================================================
(function() {
  const tag = document.querySelector('.hero-tag');
  if (!tag) return;
  const textSpan = tag.querySelector('[data-i18n="hero_tag"]');
  if (!textSpan) return;
  const fullText = textSpan.textContent.trim();
  if (!fullText) return;

  textSpan.textContent = '';
  let i = 0;

  function type() {
    if (i < fullText.length) {
      textSpan.textContent = fullText.slice(0, i + 1);
      i++;
      setTimeout(type, 50 + Math.random() * 40);
    }
  }
  // Start typing after the fadeUp animation completes
  setTimeout(type, 1200);
})();

// ============================================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================================
document.querySelectorAll('nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============================================================
// MOBILE HAMBURGER MENU
// ============================================================
(function() {
  const toggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggle.classList.remove('active');
    });
  });
})();

// ============================================================
// SCROLL PROGRESS BAR — flight trajectory with craft dot
// ============================================================
(function() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress-bar';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--cyan),var(--amber));z-index:10001;transition:width 0.1s;width:0;pointer-events:none;overflow:visible;';
  document.body.appendChild(bar);

  // "Craft" dot riding the leading edge of the trajectory
  const craft = document.createElement('div');
  craft.className = 'scroll-progress-craft';
  craft.style.cssText = 'position:absolute;right:-3px;top:-2px;width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan), 0 0 16px var(--cyan-glow);';
  bar.appendChild(craft);

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
})();

// ============================================================
// MULTILINGUAL TRANSLATION SYSTEM
// ============================================================
(function() {
  const translations = {
    en: {
      nav_about: "About", nav_experience: "Experience", nav_projects: "Projects", nav_skills: "Skills", nav_contact: "Let's Talk",
      hero_tag: "EXPLORING WHAT'S NEXT",
      hero_role: '<strong>GenAI Developer</strong> & <strong>Cloud/DevOps Engineer</strong> — building intelligent systems with LLMs, Agentic AI, and RAG pipelines while architecting scalable cloud infrastructure with <strong>Terraform</strong>, CI/CD, and <strong>AWS</strong>.',
      stat_experience: "Years Experience", stat_uptime: "Platform Uptime", stat_workshops: "AI/Cloud Workshops", stat_bonus: "CEO Bonus Awarded", stat_success: "Project Success Rate",
      hero_scroll: "Scroll",
      about_label: "About", about_heading: "The Short Version",
      about_text: "I design and develop {intelligent systems} that bridge the gap between {large} {language} {models} and real-world enterprise problems and build the {cloud infrastructure} that powers them. From designing {RAG pipelines} and {Agentic AI} workflows to deploying {scalable infrastructure} with {Terraform}, {CI/CD pipelines}, and {AWS cloud architecture}, I turn complex AI capabilities into products that teams actually ship. On the DevOps side, I've driven {80% faster provisioning} with IaC automation, maintained {99%+ platform uptime}, and led cloud cost optimization initiatives. My work spans {logistics}, {supply chain}, and {finance}, where I've built systems tracking {15,000+ vessels globally} and led innovation teams that consistently deliver with a {95% success rate}.",
      exp_label: "Experience", exp_heading: "Where I've Built Things",
      exp_title_1: "Technical Manager Lead", exp_title_2: "Full Stack Developer",
      role_title_1: "Technical Manager — Lead Innovation", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Designed and Developed a <strong>RAG chatbot with Agentic AI & AWS Bedrock</strong>, integrating tool calling for dynamic task execution across enterprise workflows.',
      rh_1_2: 'Built a <strong>self-healing Agentic Scraping solution</strong> with MCP server integration — natural language interaction, email/Excel logging, and anomaly detection.',
      rh_1_3: 'Designed <strong>AWS cloud infrastructure</strong> for enterprise apps using EC2, VPC, S3, Lambda, API Gateway, CloudWatch, and DynamoDB with <strong>99%+ uptime</strong>.',
      rh_1_4: 'Designed an <strong>n8n + Terraform automation pipeline</strong> for on-demand IaC provisioning, cutting deployment time by <strong>80%</strong>. Standardized environments with <strong>Terraform & Ansible</strong>.',
      rh_1_5: 'Drove <strong>cloud cost optimization</strong> with AWS Cost Explorer, resource right-sizing, and reserved instances. Established <strong>proactive CloudWatch monitoring</strong> reducing MTTR for critical incidents.',
      rh_1_6: 'Led <strong>15+ cloud & GenAI workshops</strong> for 20+ developers, accelerating organizational adoption of cloud-native AI practices.',
      rh_1_7: 'Awarded <strong>CEO Bonus for 4 consecutive years</strong> for delivering high-impact innovative solutions with a <strong>95% project success rate</strong>.',
      rh_2_1: 'Delivered an <strong>AI-powered vessel tracking system</strong> for 3PL — real-time visibility and predictive ETAs for <strong>15,000+ vessels globally</strong> with 99% uptime.',
      rh_2_2: 'Designed and managed <strong>AWS cloud hosting infrastructure</strong> (EC2, S3, RDS, Lambda, CloudWatch) ensuring <strong>high availability and fault tolerance</strong> for mission-critical supply chain apps.',
      rh_2_3: 'Built and maintained <strong>CI/CD pipelines for 10+ applications</strong>, automating build, test, and deployment. Configured <strong>VPC, security groups, load balancers, and DNS</strong>.',
      rh_2_4: 'Enhanced ETA accuracy with <strong>ML algorithms & LLM-assisted reasoning</strong> analyzing schedules, port congestion, and event data.',
      rh_2_5: 'Integrated <strong>GenAI-powered analytics</strong> (Qlik, ThoughtSpot, RAG dashboards) into 5+ apps, improving data access for <strong>300+ global users</strong>.',
      projects_label: "Projects", projects_heading: "Featured Work",
      proj_1_title: "RAG Chatbot with Agentic AI", proj_1_desc: "Enterprise-grade conversational AI powered by AWS Bedrock with tool calling for dynamic task execution, prompt engineering, and LLM fine-tuning.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Self-healing web scraping with natural language interaction. MCP server integrates email, Excel logging, anomaly detection, and database updates in real-time.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Real-time vessel visibility for 15,000+ ships globally. ML-powered predictive ETAs with AIS feeds, geofencing, and interactive global mapping.",
      proj_4_title: "Enterprise Cloud Hosting Platform", proj_4_desc: "Centralized AWS hosting platform serving as backbone for multiple enterprise apps. End-to-end IaC with Terraform, automated monitoring, self-healing, and alerting for rapid incident response.",
      proj_5_title: "n8n Terraform Automation", proj_5_desc: "Automation pipeline enabling on-demand Terraform script generation, reducing infrastructure provisioning time by 80% across the engineering org.",
      proj_6_title: "Smart Drainage System — Winner", proj_6_desc: "Smart Odisha Hackathon winning project: IoT-based smart drainage system with flood detection and real-time management for the Govt. of Odisha.",
      skills_label: "Skills & Certifications", skills_heading: "The Arsenal",
      skill_genai: "GenAI Stack", skill_aws: "AWS Cloud", skill_devops: "DevOps & Infrastructure", skill_langs: "Languages & Frameworks", skill_aiml: "AI / ML & Analytics", skill_security: "Security & Networking",
      certs_label: "Certifications",
      contact_label: "Contact", contact_heading: 'Let\'s Build<br><span class="gradient">Something Intelligent</span>',
      contact_sub: "Building at the intersection of GenAI architecture, Cloud/DevOps, AI/ML Ops, and collaborative innovation.",
      contact_email: "Email Me",
      footer: "© 2026 Ashutosh Nayak — End of transmission."
    },
    de: {
      nav_about: "Über mich", nav_experience: "Erfahrung", nav_projects: "Projekte", nav_skills: "Fähigkeiten", nav_contact: "Kontakt",
      hero_tag: "DIE ZUKUNFT ERKUNDEN",
      hero_role: '<strong>GenAI-Entwickler</strong> & <strong>Cloud/DevOps-Ingenieur</strong> — Entwicklung intelligenter Systeme mit LLMs, Agentic AI und RAG-Pipelines bei gleichzeitiger Architektur skalierbarer Cloud-Infrastruktur mit <strong>Terraform</strong>, CI/CD und <strong>AWS</strong>.',
      stat_experience: "Jahre Erfahrung", stat_uptime: "Plattform-Verfügbarkeit", stat_workshops: "AI/Cloud-Workshops", stat_bonus: "CEO-Bonus erhalten", stat_success: "Projekterfolgsquote",
      hero_scroll: "Scrollen",
      about_label: "Über mich", about_heading: "Die Kurzfassung",
      about_text: "Ich entwerfe und entwickle {intelligente Systeme}, die die Lücke zwischen {großen} {Sprach-} {modellen} und realen Unternehmensproblemen schließen und die {Cloud-Infrastruktur} aufbauen, die sie antreibt. Vom Design von {RAG-Pipelines} und {Agentic AI}-Workflows bis zum Deployment {skalierbarer Infrastruktur} mit {Terraform}, {CI/CD-Pipelines} und {AWS-Cloud-Architektur} verwandle ich komplexe KI-Fähigkeiten in Produkte, die Teams tatsächlich ausliefern. Auf der DevOps-Seite habe ich {80% schnellere Bereitstellung} durch IaC-Automatisierung erreicht, eine {99%+ Plattform-Verfügbarkeit} aufrechterhalten und Cloud-Kostenoptimierungsinitiativen geleitet. Meine Arbeit erstreckt sich über {Logistik}, {Lieferkette} und {Finanzen}, wo ich Systeme zur Verfolgung von {15.000+ Schiffen weltweit} gebaut und Innovationsteams geleitet habe, die konsequent mit einer {95% Erfolgsquote} liefern.",
      exp_label: "Erfahrung", exp_heading: "Wo ich Dinge gebaut habe",
      exp_title_1: "Technischer Manager", exp_title_2: "Full-Stack-Entwickler",
      role_title_1: "Technischer Manager — Innovationsleitung", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Entwurf und Entwicklung eines <strong>RAG-Chatbots mit Agentic AI & AWS Bedrock</strong>, Integration von Tool-Aufrufen für dynamische Aufgabenausführung über Unternehmens-Workflows.',
      rh_1_2: 'Aufbau einer <strong>selbstheilenden Agentic-Scraping-Lösung</strong> mit MCP-Server-Integration — natürlichsprachige Interaktion, E-Mail-/Excel-Protokollierung und Anomalieerkennung.',
      rh_1_3: 'Entwurf der <strong>AWS-Cloud-Infrastruktur</strong> für Unternehmensanwendungen mit EC2, VPC, S3, Lambda, API Gateway, CloudWatch und DynamoDB mit <strong>99%+ Verfügbarkeit</strong>.',
      rh_1_4: 'Entwurf einer <strong>n8n + Terraform-Automatisierungspipeline</strong> für On-Demand-IaC-Bereitstellung mit <strong>80%</strong> Reduzierung der Deployment-Zeit. Standardisierung der Umgebungen mit <strong>Terraform & Ansible</strong>.',
      rh_1_5: 'Vorantreiben der <strong>Cloud-Kostenoptimierung</strong> mit AWS Cost Explorer, Ressourcen-Rightsizing und reservierten Instanzen. Etablierung von <strong>proaktivem CloudWatch-Monitoring</strong> zur Reduzierung der MTTR bei kritischen Vorfällen.',
      rh_1_6: 'Leitung von <strong>15+ Cloud- & GenAI-Workshops</strong> für 20+ Entwickler, Beschleunigung der organisatorischen Einführung cloud-nativer KI-Praktiken.',
      rh_1_7: 'Auszeichnung mit dem <strong>CEO-Bonus für 4 aufeinanderfolgende Jahre</strong> für die Bereitstellung hochwirksamer innovativer Lösungen mit einer <strong>95% Projekterfolgsquote</strong>.',
      rh_2_1: 'Bereitstellung eines <strong>KI-gestützten Schiffsverfolgungssystems</strong> für 3PL — Echtzeit-Sichtbarkeit und prädiktive ETAs für <strong>15.000+ Schiffe weltweit</strong> mit 99% Verfügbarkeit.',
      rh_2_2: 'Entwurf und Verwaltung der <strong>AWS-Cloud-Hosting-Infrastruktur</strong> (EC2, S3, RDS, Lambda, CloudWatch) mit <strong>hoher Verfügbarkeit und Fehlertoleranz</strong> für geschäftskritische Supply-Chain-Apps.',
      rh_2_3: 'Aufbau und Wartung von <strong>CI/CD-Pipelines für 10+ Anwendungen</strong>, Automatisierung von Build, Test und Deployment. Konfiguration von <strong>VPC, Sicherheitsgruppen, Load Balancern und DNS</strong>.',
      rh_2_4: 'Verbesserung der ETA-Genauigkeit mit <strong>ML-Algorithmen & LLM-gestütztem Reasoning</strong> zur Analyse von Fahrplänen, Hafenüberlastung und Ereignisdaten.',
      rh_2_5: 'Integration von <strong>GenAI-gestützter Analytik</strong> (Qlik, ThoughtSpot, RAG-Dashboards) in 5+ Apps, Verbesserung des Datenzugangs für <strong>300+ globale Nutzer</strong>.',
      projects_label: "Projekte", projects_heading: "Ausgewählte Arbeiten",
      proj_1_title: "RAG-Chatbot mit Agentic AI", proj_1_desc: "Konversations-KI auf Enterprise-Niveau, angetrieben von AWS Bedrock mit Tool-Aufrufen für dynamische Aufgabenausführung, Prompt Engineering und LLM-Fine-Tuning.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Selbstheilendes Web-Scraping mit natürlichsprachiger Interaktion. MCP-Server integriert E-Mail, Excel-Protokollierung, Anomalieerkennung und Datenbank-Updates in Echtzeit.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Echtzeit-Schiffssichtbarkeit für 15.000+ Schiffe weltweit. ML-gestützte prädiktive ETAs mit AIS-Feeds, Geofencing und interaktiver globaler Kartierung.",
      proj_4_title: "Enterprise Cloud-Hosting-Plattform", proj_4_desc: "Zentralisierte AWS-Hosting-Plattform als Backbone für mehrere Unternehmensanwendungen. End-to-End-IaC mit Terraform, automatisiertes Monitoring, Self-Healing und Alerting.",
      proj_5_title: "n8n Terraform-Automatisierung", proj_5_desc: "Automatisierungspipeline für die On-Demand-Generierung von Terraform-Skripten, Reduzierung der Infrastruktur-Bereitstellungszeit um 80%.",
      proj_6_title: "Smart Drainage System — Gewinner", proj_6_desc: "Smart Odisha Hackathon-Gewinnerprojekt: IoT-basiertes intelligentes Entwässerungssystem mit Hochwassererkennung und Echtzeit-Management für die Regierung von Odisha.",
      skills_label: "Fähigkeiten & Zertifizierungen", skills_heading: "Das Arsenal",
      skill_genai: "GenAI-Stack", skill_aws: "AWS Cloud", skill_devops: "DevOps & Infrastruktur", skill_langs: "Sprachen & Frameworks", skill_aiml: "KI / ML & Analytik", skill_security: "Sicherheit & Netzwerk",
      certs_label: "Zertifizierungen",
      contact_label: "Kontakt", contact_heading: 'Lassen Sie uns<br><span class="gradient">etwas Intelligentes bauen</span>',
      contact_sub: "An der Schnittstelle von GenAI-Architektur, Cloud/DevOps, AI/ML Ops und kollaborativer Innovation.",
      contact_email: "E-Mail senden",
      footer: "© 2026 Ashutosh Nayak — Ende der Übertragung."
    },
    nl: {
      nav_about: "Over mij", nav_experience: "Ervaring", nav_projects: "Projecten", nav_skills: "Vaardigheden", nav_contact: "Contact",
      hero_tag: "DE TOEKOMST VERKENNEN",
      hero_role: '<strong>GenAI-ontwikkelaar</strong> & <strong>Cloud/DevOps-engineer</strong> — bouwen van intelligente systemen met LLMs, Agentic AI en RAG-pipelines, terwijl ik schaalbare cloudinfrastructuur ontwerp met <strong>Terraform</strong>, CI/CD en <strong>AWS</strong>.',
      stat_experience: "Jaar Ervaring", stat_uptime: "Platform Uptime", stat_workshops: "AI/Cloud Workshops", stat_bonus: "CEO Bonus Ontvangen", stat_success: "Projectsuccesratio",
      hero_scroll: "Scrollen",
      about_label: "Over mij", about_heading: "De Korte Versie",
      about_text: "Ik ontwerp en ontwikkel {intelligente systemen} die de kloof overbruggen tussen {grote} {taal-} {modellen} en echte bedrijfsproblemen en bouw de {cloudinfrastructuur} die ze aandrijft. Van het ontwerpen van {RAG-pipelines} en {Agentic AI}-workflows tot het implementeren van {schaalbare infrastructuur} met {Terraform}, {CI/CD-pipelines} en {AWS-cloudarchitectuur}, transformeer ik complexe AI-mogelijkheden in producten die teams daadwerkelijk leveren. Aan de DevOps-kant heb ik {80% snellere provisioning} bereikt met IaC-automatisering, een {99%+ platform uptime} onderhouden en cloud-kostenoptimalisatie-initiatieven geleid. Mijn werk bestrijkt {logistiek}, {supply chain} en {financiën}, waar ik systemen heb gebouwd die {15.000+ schepen wereldwijd} volgen en innovatieteams heb geleid die consequent leveren met een {95% succesratio}.",
      exp_label: "Ervaring", exp_heading: "Waar ik dingen heb gebouwd",
      exp_title_1: "Technisch Manager", exp_title_2: "Full Stack-ontwikkelaar",
      role_title_1: "Technisch Manager — Innovatieleider", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Ontwerp en ontwikkeling van een <strong>RAG-chatbot met Agentic AI & AWS Bedrock</strong>, met tool-aanroepen voor dynamische taakuitvoering in bedrijfsworkflows.',
      rh_1_2: 'Bouw van een <strong>zelfherstellende Agentic Scraping-oplossing</strong> met MCP-serverintegratie — natuurlijke taalinteractie, e-mail/Excel-logging en anomaliedetectie.',
      rh_1_3: 'Ontwerp van <strong>AWS-cloudinfrastructuur</strong> voor bedrijfsapplicaties met EC2, VPC, S3, Lambda, API Gateway, CloudWatch en DynamoDB met <strong>99%+ uptime</strong>.',
      rh_1_4: 'Ontwerp van een <strong>n8n + Terraform-automatiseringspipeline</strong> voor on-demand IaC-provisioning, met <strong>80%</strong> reductie van deployment-tijd. Standaardisering van omgevingen met <strong>Terraform & Ansible</strong>.',
      rh_1_5: 'Aansturing van <strong>cloud-kostenoptimalisatie</strong> met AWS Cost Explorer, resource right-sizing en gereserveerde instanties. Opzet van <strong>proactieve CloudWatch-monitoring</strong> ter vermindering van MTTR bij kritieke incidenten.',
      rh_1_6: 'Leiding van <strong>15+ cloud- & GenAI-workshops</strong> voor 20+ ontwikkelaars, versnelling van organisatiebrede adoptie van cloud-native AI-praktijken.',
      rh_1_7: 'Ontvangst van de <strong>CEO Bonus voor 4 opeenvolgende jaren</strong> voor het leveren van impactvolle innovatieve oplossingen met een <strong>95% projectsuccesratio</strong>.',
      rh_2_1: 'Levering van een <strong>AI-aangedreven scheepstrackingsysteem</strong> voor 3PL — realtime zichtbaarheid en voorspellende ETAs voor <strong>15.000+ schepen wereldwijd</strong> met 99% uptime.',
      rh_2_2: 'Ontwerp en beheer van <strong>AWS cloud-hostinginfrastructuur</strong> (EC2, S3, RDS, Lambda, CloudWatch) met <strong>hoge beschikbaarheid en fouttolerantie</strong> voor bedrijfskritische supply chain-apps.',
      rh_2_3: 'Bouw en onderhoud van <strong>CI/CD-pipelines voor 10+ applicaties</strong>, automatisering van build, test en deployment. Configuratie van <strong>VPC, beveiligingsgroepen, load balancers en DNS</strong>.',
      rh_2_4: 'Verbetering van ETA-nauwkeurigheid met <strong>ML-algoritmen & LLM-ondersteunde redenering</strong> voor analyse van roosters, havenoverlasting en gebeurtenisdata.',
      rh_2_5: 'Integratie van <strong>GenAI-aangedreven analytics</strong> (Qlik, ThoughtSpot, RAG-dashboards) in 5+ apps, verbetering van datatoegang voor <strong>300+ wereldwijde gebruikers</strong>.',
      projects_label: "Projecten", projects_heading: "Uitgelicht Werk",
      proj_1_title: "RAG-chatbot met Agentic AI", proj_1_desc: "Enterprise-niveau conversationele AI aangedreven door AWS Bedrock met tool-aanroepen voor dynamische taakuitvoering, prompt engineering en LLM fine-tuning.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Zelfherstellend web scraping met natuurlijke taalinteractie. MCP-server integreert e-mail, Excel-logging, anomaliedetectie en database-updates in realtime.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Realtime scheepszichtbaarheid voor 15.000+ schepen wereldwijd. ML-aangedreven voorspellende ETAs met AIS-feeds, geofencing en interactieve wereldwijde kaarten.",
      proj_4_title: "Enterprise Cloud Hosting Platform", proj_4_desc: "Gecentraliseerd AWS-hostingplatform als backbone voor meerdere bedrijfsapplicaties. End-to-end IaC met Terraform, geautomatiseerde monitoring, self-healing en alerting.",
      proj_5_title: "n8n Terraform Automatisering", proj_5_desc: "Automatiseringspipeline voor on-demand generatie van Terraform-scripts, reductie van infrastructuurprovisioningtijd met 80%.",
      proj_6_title: "Smart Drainage Systeem — Winnaar", proj_6_desc: "Smart Odisha Hackathon winnend project: IoT-gebaseerd slim drainagesysteem met overstromingsdetectie en realtimebeheer voor de overheid van Odisha.",
      skills_label: "Vaardigheden & Certificeringen", skills_heading: "Het Arsenaal",
      skill_genai: "GenAI Stack", skill_aws: "AWS Cloud", skill_devops: "DevOps & Infrastructuur", skill_langs: "Talen & Frameworks", skill_aiml: "AI / ML & Analytics", skill_security: "Beveiliging & Netwerken",
      certs_label: "Certificeringen",
      contact_label: "Contact", contact_heading: 'Laten we<br><span class="gradient">iets intelligents bouwen</span>',
      contact_sub: "Op het kruispunt van GenAI-architectuur, Cloud/DevOps, AI/ML Ops en collaboratieve innovatie.",
      contact_email: "E-mail sturen",
      footer: "© 2026 Ashutosh Nayak — Einde van transmissie."
    },
    pl: {
      nav_about: "O mnie", nav_experience: "Doświadczenie", nav_projects: "Projekty", nav_skills: "Umiejętności", nav_contact: "Kontakt",
      hero_tag: "ODKRYWAM PRZYSZŁOŚĆ",
      hero_role: '<strong>Deweloper GenAI</strong> i <strong>Inżynier Cloud/DevOps</strong> — budowanie inteligentnych systemów z LLM, Agentic AI i pipeline\'ami RAG, jednocześnie projektując skalowalną infrastrukturę chmurową z <strong>Terraform</strong>, CI/CD i <strong>AWS</strong>.',
      stat_experience: "Lat doświadczenia", stat_uptime: "Dostępność platformy", stat_workshops: "Warsztaty AI/Cloud", stat_bonus: "Bonus CEO przyznany", stat_success: "Wskaźnik sukcesu",
      hero_scroll: "Przewiń",
      about_label: "O mnie", about_heading: "Krótka wersja",
      about_text: "Projektuję i rozwijam {inteligentne systemy}, które wypełniają lukę między {dużymi} {modelami} {językowymi} a rzeczywistymi problemami biznesowymi i buduję {infrastrukturę chmurową}, która je zasila. Od projektowania {pipeline'ów RAG} i workflow'ów {Agentic AI} po wdrażanie {skalowalnej infrastruktury} z {Terraform}, {pipeline'ami CI/CD} i {architekturą chmury AWS}, przekształcam złożone możliwości AI w produkty, które zespoły faktycznie dostarczają. Po stronie DevOps osiągnąłem {80% szybsze provisioning} dzięki automatyzacji IaC, utrzymuję {99%+ dostępność platformy} i prowadzę inicjatywy optymalizacji kosztów chmury. Moja praca obejmuje {logistykę}, {łańcuch dostaw} i {finanse}, gdzie budowałem systemy śledzące {15 000+ statków na świecie} i prowadziłem zespoły innowacyjne, które konsekwentnie dostarczają z {95% wskaźnikiem sukcesu}.",
      exp_label: "Doświadczenie", exp_heading: "Gdzie budowałem",
      exp_title_1: "Kierownik Techniczny", exp_title_2: "Deweloper Full Stack",
      role_title_1: "Kierownik Techniczny — Lider Innowacji", role_title_2: "Full Stack & Cloud Platform Engineer",
      rh_1_1: 'Zaprojektowanie i rozwinięcie <strong>chatbota RAG z Agentic AI i AWS Bedrock</strong>, integracja wywołań narzędzi do dynamicznego wykonywania zadań w workflow\'ach korporacyjnych.',
      rh_1_2: 'Budowa <strong>samonaprawiającego się rozwiązania Agentic Scraping</strong> z integracją serwera MCP — interakcja w języku naturalnym, logowanie e-mail/Excel i wykrywanie anomalii.',
      rh_1_3: 'Projektowanie <strong>infrastruktury chmury AWS</strong> dla aplikacji korporacyjnych z EC2, VPC, S3, Lambda, API Gateway, CloudWatch i DynamoDB z <strong>99%+ dostępnością</strong>.',
      rh_1_4: 'Zaprojektowanie <strong>pipeline\'u automatyzacji n8n + Terraform</strong> do provisioningu IaC na żądanie, skrócenie czasu wdrożenia o <strong>80%</strong>. Standaryzacja środowisk z <strong>Terraform i Ansible</strong>.',
      rh_1_5: 'Prowadzenie <strong>optymalizacji kosztów chmury</strong> z AWS Cost Explorer, odpowiednim doborem zasobów i instancjami zarezerwowanymi. Ustanowienie <strong>proaktywnego monitoringu CloudWatch</strong> zmniejszającego MTTR dla krytycznych incydentów.',
      rh_1_6: 'Prowadzenie <strong>15+ warsztatów cloud i GenAI</strong> dla 20+ programistów, przyspieszenie organizacyjnego wdrażania natywnych dla chmury praktyk AI.',
      rh_1_7: 'Otrzymanie <strong>Bonusu CEO przez 4 kolejne lata</strong> za dostarczanie innowacyjnych rozwiązań o dużym wpływie z <strong>95% wskaźnikiem sukcesu projektów</strong>.',
      rh_2_1: 'Dostarczenie <strong>systemu śledzenia statków opartego na AI</strong> dla 3PL — widoczność w czasie rzeczywistym i predykcyjne ETA dla <strong>15 000+ statków na świecie</strong> z 99% dostępnością.',
      rh_2_2: 'Projektowanie i zarządzanie <strong>infrastrukturą hostingu chmury AWS</strong> (EC2, S3, RDS, Lambda, CloudWatch) zapewniając <strong>wysoką dostępność i tolerancję błędów</strong> dla krytycznych aplikacji łańcucha dostaw.',
      rh_2_3: 'Budowa i utrzymanie <strong>pipeline\'ów CI/CD dla 10+ aplikacji</strong>, automatyzacja budowania, testowania i wdrażania. Konfiguracja <strong>VPC, grup bezpieczeństwa, load balancerów i DNS</strong>.',
      rh_2_4: 'Poprawa dokładności ETA za pomocą <strong>algorytmów ML i rozumowania wspomaganego przez LLM</strong> analizujących harmonogramy, zatory portowe i dane o zdarzeniach.',
      rh_2_5: 'Integracja <strong>analityki opartej na GenAI</strong> (Qlik, ThoughtSpot, dashboardy RAG) w 5+ aplikacjach, poprawa dostępu do danych dla <strong>300+ globalnych użytkowników</strong>.',
      projects_label: "Projekty", projects_heading: "Wyróżnione prace",
      proj_1_title: "Chatbot RAG z Agentic AI", proj_1_desc: "Konwersacyjna AI klasy enterprise zasilana przez AWS Bedrock z wywołaniami narzędzi do dynamicznego wykonywania zadań, prompt engineering i fine-tuning LLM.",
      proj_2_title: "Agentic Scraping + MCP", proj_2_desc: "Samonaprawiający się web scraping z interakcją w języku naturalnym. Serwer MCP integruje e-mail, logowanie Excel, wykrywanie anomalii i aktualizacje bazy danych w czasie rzeczywistym.",
      proj_3_title: "Track & Trace — 3PL", proj_3_desc: "Widoczność statków w czasie rzeczywistym dla 15 000+ statków na świecie. Predykcyjne ETA oparte na ML z feedami AIS, geofencingiem i interaktywnym mapowaniem.",
      proj_4_title: "Enterprise Cloud Hosting Platform", proj_4_desc: "Scentralizowana platforma hostingowa AWS jako kręgosłup wielu aplikacji korporacyjnych. End-to-end IaC z Terraform, automatyczny monitoring, self-healing i alerting.",
      proj_5_title: "Automatyzacja n8n Terraform", proj_5_desc: "Pipeline automatyzacji do generowania skryptów Terraform na żądanie, redukcja czasu provisioningu infrastruktury o 80%.",
      proj_6_title: "Smart Drainage System — Zwycięzca", proj_6_desc: "Zwycięski projekt Smart Odisha Hackathon: inteligentny system drenażowy oparty na IoT z detekcją powodzi i zarządzaniem w czasie rzeczywistym dla rządu Odisha.",
      skills_label: "Umiejętności i Certyfikaty", skills_heading: "Arsenał",
      skill_genai: "Stos GenAI", skill_aws: "Chmura AWS", skill_devops: "DevOps i Infrastruktura", skill_langs: "Języki i Frameworki", skill_aiml: "AI / ML i Analityka", skill_security: "Bezpieczeństwo i Sieci",
      certs_label: "Certyfikaty",
      contact_label: "Kontakt", contact_heading: 'Zbudujmy<br><span class="gradient">coś inteligentnego</span>',
      contact_sub: "Na przecięciu architektury GenAI, Cloud/DevOps, AI/ML Ops i współpracy innowacyjnej.",
      contact_email: "Wyślij e-mail",
      footer: "© 2026 Ashutosh Nayak — Koniec transmisji."
    }
  };

  const langMeta = {
    en: { flag: '🇬🇧', code: 'EN' },
    de: { flag: '🇩🇪', code: 'DE' },
    nl: { flag: '🇳🇱', code: 'NL' },
    pl: { flag: '🇵🇱', code: 'PL' }
  };

  let currentLang = localStorage.getItem('lang') || 'en';

  function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    // Update text content for data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    // Update innerHTML for data-i18n-html elements
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    // Update about text reveal
    if (t.about_text) {
      const container = document.getElementById('aboutReveal');
      if (container) {
        const words = t.about_text.split(' ');
        container.innerHTML = words.map((w, i) => {
          const isHighlight = w.startsWith('{') || w.endsWith('}');
          const clean = w.replace(/[{}]/g, '');
          const cls = isHighlight ? 'about-word highlight lit no-ignite' : 'about-word lit no-ignite';
          return '<span class="' + cls + '" data-index="' + i + '">' + clean + ' </span>';
        }).join('');
      }
    }

    // Update hero tag typing text (re-trigger typing effect)
    const heroTagSpan = document.querySelector('.hero-tag [data-i18n="hero_tag"]');
    if (heroTagSpan && t.hero_tag) {
      heroTagSpan.textContent = t.hero_tag;
    }

    // Update lang button display
    const meta = langMeta[lang];
    if (meta) {
      document.getElementById('langFlag').textContent = meta.flag;
      document.getElementById('langCode').textContent = meta.code;
    }

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Update html lang attribute
    document.documentElement.lang = lang;

    currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  // Language switcher toggle
  const switcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    switcher.classList.toggle('open');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      switcher.classList.remove('open');
    }
  });

  // Language option click
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const lang = opt.dataset.lang;
      applyTranslations(lang);
      switcher.classList.remove('open');
    });
  });

  // Apply saved language on load
  if (currentLang !== 'en') {
    applyTranslations(currentLang);
  }
})();

// ============================================================
// 🪄 HARRY POTTER MAGIC TOGGLE SYSTEM
// ============================================================
(function() {
  const root = document.documentElement;
  const wandBtn = document.getElementById('wandToggle');
  const tooltip = document.getElementById('wandTooltip');
  if (!wandBtn) return;

  let magicActive = localStorage.getItem('magic') === 'true';
  let wandCursorSetup = false;

  // --- Marauder's Map generator ---
  function generateMap() {
    const container = document.getElementById('mapPaths');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 30; i++) {
      const path = document.createElement('div');
      path.className = 'map-path';
      const isH = Math.random() > 0.5;
      path.style.top = Math.random() * 100 + '%';
      path.style.left = Math.random() * 100 + '%';
      path.style.width = isH ? (80 + Math.random() * 300) + 'px' : '1px';
      path.style.height = isH ? '1px' : (60 + Math.random() * 200) + 'px';
      path.style.opacity = 0.1 + Math.random() * 0.3;
      container.appendChild(path);
    }
    for (let i = 0; i < 8; i++) {
      const step = document.createElement('div');
      step.className = 'map-footstep';
      step.textContent = '👣';
      step.style.top = (10 + Math.random() * 80) + '%';
      step.style.left = (5 + Math.random() * 60) + '%';
      step.style.animationDuration = (10 + Math.random() * 15) + 's';
      step.style.animationDelay = (-Math.random() * 20) + 's';
      step.style.fontSize = (8 + Math.random() * 6) + 'px';
      container.appendChild(step);
    }
  }

  // --- Elder Wand Cursor ---
  function setupWandCursor() {
    if (wandCursorSetup) return;
    wandCursorSetup = true;
    const wand = document.getElementById('cursorWand');
    const lumos = document.getElementById('cursorLumos');
    if (!wand || !lumos) return;
    let mx = 0, my = 0, lx = 0, ly = 0;

    document.addEventListener('mousemove', function wandMove(e) {
      if (!root.hasAttribute('data-magic')) return;
      mx = e.clientX; my = e.clientY;
      // Position wand so TIP (SVG point ~10,3 in the 48x48 div) aligns with mouse
      wand.style.left = (mx - 10) + 'px';
      wand.style.top = (my - 3) + 'px';
    });
    function animateLumos() {
      if (root.hasAttribute('data-magic')) {
        lx += (mx - lx) * 0.1; ly += (my - ly) * 0.1;
        // Lumos glow centered on the wand tip
        lumos.style.left = (lx - 25) + 'px';
        lumos.style.top = (ly - 25) + 'px';
      }
      requestAnimationFrame(animateLumos);
    }
    animateLumos();

    // Expand glow on interactive elements
    const els = document.querySelectorAll('a, button, .project-card, .skill-item, .contact-link, .cert-card');
    els.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (!root.hasAttribute('data-magic')) return;
        lumos.style.width = '80px'; lumos.style.height = '80px';
        lumos.style.marginLeft = '-15px'; lumos.style.marginTop = '-15px';
        wand.style.filter = 'brightness(1.4)';
      });
      el.addEventListener('mouseleave', () => {
        if (!root.hasAttribute('data-magic')) return;
        lumos.style.width = '50px'; lumos.style.height = '50px';
        lumos.style.marginLeft = '0'; lumos.style.marginTop = '0';
        wand.style.filter = '';
      });
    });

    // Golden sparks on click — emit from wand TIP position
    document.addEventListener('click', (e) => {
      if (!root.hasAttribute('data-magic')) return;
      const tipX = e.clientX, tipY = e.clientY;
      for (let i = 0; i < 10; i++) {
        const spark = document.createElement('div');
        const size = 2 + Math.random() * 3;
        spark.style.cssText = 'position:fixed;width:'+size+'px;height:'+size+'px;background:#EEBA30;border-radius:50%;pointer-events:none;z-index:99999;left:'+tipX+'px;top:'+tipY+'px;box-shadow:0 0 8px #D3A625, 0 0 16px rgba(211,166,37,0.4);';
        document.body.appendChild(spark);
        const angle = (Math.PI * 2 / 10) * i + (Math.random() - 0.5) * 0.5;
        const speed = 50 + Math.random() * 60;
        const dx = Math.cos(angle) * speed, dy = Math.sin(angle) * speed;
        spark.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate('+dx+'px,'+dy+'px) scale(0)', opacity: 0 }
        ], { duration: 400 + Math.random() * 400, easing: 'cubic-bezier(0.25,1,0.5,1)' })
        .onfinish = () => spark.remove();
      }
    });
  }

  // --- Change particle colors ---
  // The original particle system draws with --cyan. When magic is on,
  // --cyan becomes gold, so particles auto-switch colors. Nice!

  // --- Transition flash with Deathly Hallows ---
  function showFlash(text, isNox) {
    const flash = document.createElement('div');
    flash.className = 'solemnly-flash' + (isNox ? ' nox-flash' : '');
    // Both transitions use gold — it's always a magical HP moment
    const hallowsColor = '#D3A625';
    flash.innerHTML = '<div class="sf-hallows"><svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="50,8 12,88 88,88" stroke="' + hallowsColor + '" stroke-width="1.8" fill="none"/>' +
      '<circle cx="50" cy="52" r="18" stroke="' + hallowsColor + '" stroke-width="1.8"/>' +
      '<line x1="50" y1="8" x2="50" y2="88" stroke="' + hallowsColor + '" stroke-width="1.8"/>' +
      '</svg></div>' +
      '<div class="sf-text">' + text + '</div>';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 3100);
  }

  // --- Activate magic ---
  function activateMagic(withFlash) {
    if (withFlash) showFlash('I solemnly swear that I am up to no good', false);
    setTimeout(() => {
      root.setAttribute('data-magic', 'true');
      generateMap();
      setupWandCursor();
      tooltip.textContent = 'Mischief Managed';
      localStorage.setItem('magic', 'true');
      if (window.SpaceScene) window.SpaceScene.setTheme('magic');
    }, withFlash ? 1000 : 0);
  }

  // --- Deactivate magic ---
  function deactivateMagic(withFlash) {
    if (withFlash) showFlash('Mischief Managed', true);
    setTimeout(() => {
      root.removeAttribute('data-magic');
      document.body.style.cursor = '';
      tooltip.textContent = 'Cast a spell';
      localStorage.setItem('magic', 'false');
      if (window.SpaceScene) window.SpaceScene.setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    }, withFlash ? 1000 : 0);
  }

  // --- Button click ---
  wandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (root.hasAttribute('data-magic')) {
      deactivateMagic(true);
    } else {
      activateMagic(true);
    }
  });

  // --- Restore on load ---
  if (magicActive) {
    activateMagic(false);
  }
})();

// ============================================================
// SPACE SCENE — one-time theme + layout sync once the 3D scene is ready
// ============================================================
(function () {
  const syncTheme = () => {
    if (window.__sceneFallback) return;
    if (!window.SpaceScene) return;
    const magic = document.documentElement.hasAttribute('data-magic');
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    window.SpaceScene.setTheme(magic ? 'magic' : light ? 'light' : 'dark');
    window.SpaceScene.layout();
    if (window.SpaceScene._internals && window.SpaceScene._internals.ready) return; // applied
    setTimeout(syncTheme, 500); // retry until scene ready, then it sticks
  };
  setTimeout(syncTheme, 300);
})();

