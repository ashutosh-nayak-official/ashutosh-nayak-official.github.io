// assets/js/scene.js — The Cosmic Voyage 3D engine
(function () {
  'use strict';
  const PATH = 4000;                 // total camera travel along -Z
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  let THREE, renderer, scene, camera, starLayers = [], landmarks = {};
  let progress = 0, theme = 'dark', mouse = { x: 0, y: 0 }, ready = false;

  const PALETTES = {
    dark:  { star: 0xffffff, accent: 0x00e5ff, warm: 0xffb547 },
    light: { star: 0x1a2a4a, accent: 0x0066cc, warm: 0xb45309 },
    magic: { star: 0xd3a625, accent: 0xd3a625, warm: 0xae0001 },
  };

  function fail() {
    document.dispatchEvent(new CustomEvent('scene:fallback'));
    return false;
  }

  async function init() {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return fail();
    try { THREE = await import(CDN); } catch (e) { return fail(); }
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
    } catch (e) { return fail(); }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.00045);
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 50);
    buildStarfield();
    document.body.classList.add('scene-active');
    window.addEventListener('resize', onResize);
    if (!isMobile) document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / innerHeight - 0.5) * 2;
    });
    ready = true;
    layout();
    requestAnimationFrame(animate);
    return true;
  }

  // 3 parallax star layers that wrap around the camera as it travels
  function buildStarfield() {
    const counts = isMobile ? [400, 250, 120] : [900, 500, 250];
    const sizes = [1.0, 1.8, 2.8];
    counts.forEach((count, li) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 1200;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 800;
        pos[i * 3 + 2] = -Math.random() * (PATH + 600) + 100;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: PALETTES.dark.star, size: sizes[li], sizeAttenuation: false,
        transparent: true, opacity: 0.5 + li * 0.2,
      });
      const pts = new THREE.Points(geo, mat);
      pts.userData = { baseOpacity: mat.opacity, parallax: 0.2 + li * 0.4 };
      starLayers.push(pts);
      scene.add(pts);
    });
  }

  // Map each anchor section's page position to a Z depth. Landmark groups
  // (added by later tasks into `landmarks`) are re-positioned here.
  const ANCHORS = ['hero', 'about', 'experience', 'wormhole', 'projects', 'skills', 'contact'];
  const depths = {};
  function sectionFraction(id) {
    const docH = document.documentElement.scrollHeight - innerHeight;
    if (docH <= 0) return 0;
    if (id === 'hero') return 0;
    if (id === 'wormhole') { // midpoint of the experience→projects gap
      const exp = document.getElementById('expScroll');
      const proj = document.getElementById('projectsScroll');
      if (!exp || !proj) return 0.45;
      return ((exp.offsetTop + exp.offsetHeight + proj.offsetTop) / 2 - innerHeight / 2) / docH;
    }
    const map = { about: 'about', experience: 'expScroll', projects: 'projectsScroll', skills: 'skills', contact: 'contact' };
    const el = document.getElementById(map[id]);
    if (!el) return 0;
    return Math.min(1, Math.max(0, (el.offsetTop + el.offsetHeight / 2 - innerHeight / 2) / docH));
  }
  function layout() {
    if (!ready) return;
    ANCHORS.forEach((id) => {
      const z = -sectionFraction(id) * PATH;
      depths[id] = z;
      if (landmarks[id]) landmarks[id].position.z = z;
    });
  }

  function onResize() {
    if (!ready) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    layout();
  }

  // Landmark per-frame updates, registered by later tasks
  const tickers = [];
  const themeListeners = [];

  let last = 0;
  function animate(t) {
    requestAnimationFrame(animate);
    const dt = Math.min((t - last) / 1000, 0.05); last = t;
    const camZ = 50 - progress * (PATH + 50);
    camera.position.z += (camZ - camera.position.z) * 0.08; // glide easing
    camera.position.x += (mouse.x * 6 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 4 - camera.position.y) * 0.04;
    camera.lookAt(camera.position.x * 0.5, camera.position.y * 0.5, camera.position.z - 100);
    // wrap stars around camera & twinkle
    starLayers.forEach((layer) => {
      const pos = layer.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        if (z > camera.position.z + 50) pos.setZ(i, z - (PATH + 600));
        if (z < camera.position.z - (PATH + 550)) pos.setZ(i, z + (PATH + 600));
      }
      pos.needsUpdate = true;
      if (!reduced) layer.material.opacity =
        layer.userData.baseOpacity * (0.85 + 0.15 * Math.sin(t * 0.001 + layer.userData.parallax * 7));
    });
    tickers.forEach((fn) => fn(dt, t));
    renderer.render(scene, camera);
  }

  function setTheme(mode) {
    theme = PALETTES[mode] ? mode : 'dark';
    if (!ready) return;
    const p = PALETTES[theme];
    starLayers.forEach((l) => l.material.color.setHex(p.star));
    scene.fog.color.setHex(theme === 'light' ? 0xf0f2f8 : 0x030308);
    themeListeners.forEach((fn) => fn(p, theme));
  }

  window.SpaceScene = {
    init,
    setScrollProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    setTheme,
    triggerSupernova() {},            // implemented in Task 8
    layout,
    _internals: {
      get THREE() { return THREE; }, get scene() { return scene; },
      get camera() { return camera; }, landmarks, tickers, themeListeners,
      PALETTES, depths, isMobile, reduced, PATH,
      get ready() { return ready; },
    },
  };
  init();
})();
