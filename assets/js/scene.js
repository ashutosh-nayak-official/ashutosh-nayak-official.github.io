// assets/js/scene.js — The Cosmic Voyage 3D engine
(function () {
  'use strict';
  const PATH = 4000;                 // total camera travel along -Z
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  let THREE, renderer, scene, camera, starLayers = [], landmarks = {};
  let progress = 0, theme = 'dark', mouse = { x: 0, y: 0 }, ready = false;
  var placeSolarHook = null;

  const PALETTES = {
    dark:  { star: 0xffffff, accent: 0x00e5ff, warm: 0xffb547 },
    light: { star: 0x1a2a4a, accent: 0x0066cc, warm: 0xb45309 },
    magic: { star: 0xd3a625, accent: 0xd3a625, warm: 0xae0001 },
  };

  function fail() {
    setTimeout(function () { document.dispatchEvent(new CustomEvent('scene:fallback')); }, 0);
    return false;
  }

  async function init() {
    const canvas = document.getElementById('spaceCanvas');
    if (!canvas) return fail();
    try { THREE = await import(CDN); } catch (e) { return fail(); }
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
    } catch (e) { return fail(); }
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); fail(); });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.00045);
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 50);
    buildStarfield();
    buildSolarSystem();
    buildAsteroidField();
    buildMars();
    buildWormhole();
    buildBlackHole();
    buildConstellations();
    buildGalaxy();
    buildShootingStars();
    document.body.classList.add('scene-active');
    window.addEventListener('resize', onResize);
    if (!isMobile) document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / innerHeight - 0.5) * 2;
    });
    ready = true;
    layout();
    camera.position.z = 50 - progress * (PATH + 50);
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

  // Hero landmark: miniature live solar system
  function buildSolarSystem() {
    const g = new THREE.Group();
    // Sun: core sphere + 2 additive glow sprites
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(8, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffb547 }));
    g.add(sun);
    const glows = [];
    [22, 40].forEach((size, i) => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, i ? 'rgba(255,181,71,0.35)' : 'rgba(255,220,150,0.9)');
      grad.addColorStop(1, 'rgba(255,181,71,0)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      spr.scale.setScalar(size); g.add(spr); glows.push(spr);
    });
    // Planets: [radius, orbitR, speed, color, hasRing]
    const DEFS = [
      [1.0, 16, 1.6, 0x9c9c9c, 0], [1.6, 22, 1.17, 0xd8a05a, 0],
      [1.7, 29, 1.0, 0x3a7bd5, 0], [1.3, 37, 0.8, 0xc1440e, 0],
      [4.2, 52, 0.43, 0xc9a06c, 0], [3.6, 68, 0.32, 0xe0c47c, 1],
      [2.4, 82, 0.23, 0x7fd4d4, 0], [2.3, 94, 0.18, 0x3f54ba, 0],
    ];
    const planets = [];
    DEFS.forEach(function (def) {
      const r = def[0], oR = def[1], sp = def[2], col = def[3], ring = def[4];
      const pivot = new THREE.Object3D();
      pivot.rotation.y = Math.random() * Math.PI * 2;
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 }));
      m.position.x = oR; pivot.add(m); g.add(pivot);
      if (ring) {
        const rg = new THREE.Mesh(new THREE.RingGeometry(r * 1.5, r * 2.4, 48),
          new THREE.MeshBasicMaterial({ color: 0xd9c79a, side: THREE.DoubleSide,
            transparent: true, opacity: 0.55 }));
        rg.rotation.x = Math.PI / 2.4; m.add(rg);
      }
      const orbit = new THREE.Mesh(new THREE.RingGeometry(oR - 0.06, oR + 0.06, 96),
        new THREE.MeshBasicMaterial({ color: 0x96b4ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      orbit.rotation.x = Math.PI / 2; g.add(orbit);
      planets.push({ pivot: pivot, speed: sp });
    });
    // r160 defaults useLegacyLights=false (since r155), so PointLight intensity is
    // physical (candela) with inverse-square decay: 600 cd gives ~2.3 lux at the
    // innermost orbit (r=16) fading naturally to the outer planets.
    const sunLight = new THREE.PointLight(0xffd9a0, 600, 400, 2);
    g.add(sunLight);
    g.add(new THREE.AmbientLight(0x404060, 0.6));
    g.rotation.x = 0.42;                       // tilt the orbital plane toward viewer
    // Offset right of hero text on desktop, clamped to the visible frustum width
    function placeSolar() {
      const halfW = 50 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      g.position.x = isMobile ? 0 : Math.min(38, halfW * 0.72);
      g.position.y = -6;
    }
    placeSolar();
    placeSolarHook = placeSolar;
    tickers.push(function (dt) {
      if (!reduced) planets.forEach(function (p) { p.pivot.rotation.y += p.speed * dt * 0.25; });
    });
    themeListeners.push(function (p, name) {
      sun.material.color.setHex(name === 'magic' ? 0xd3a625 : 0xffb547);
      sunLight.color.setHex(name === 'magic' ? 0xd3a625 : 0xffd9a0);
      glows.forEach(function (s) { s.material.opacity = name === 'light' ? 0.35 : 1; });
    });
    landmarks.hero = g; scene.add(g);
  }

  // About landmark: sparse drifting asteroid field
  function buildAsteroidField() {
    const g = new THREE.Group();
    const COUNT = isMobile ? 25 : 60;
    const rocks = [];
    for (let i = 0; i < COUNT; i++) {
      const size = 0.5 + Math.random() * 2;
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(size, 0),
        new THREE.MeshStandardMaterial({ color: 0x6a6a72, roughness: 1, flatShading: true }));
      rock.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 400);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rocks.push({ mesh: rock, spin: 0.05 + Math.random() * 0.25, axis: Math.floor(Math.random() * 3) });
      g.add(rock);
    }
    const dir = new THREE.DirectionalLight(0x96b4ff, 1.4);
    dir.position.set(0.5, 1, 0.8);
    g.add(dir);
    g.add(dir.target);
    tickers.push(function (dt) {
      if (reduced) return;
      for (let i = 0; i < rocks.length; i++) {
        const r = rocks[i];
        if (r.axis === 0) r.mesh.rotation.x += r.spin * dt;
        else if (r.axis === 1) r.mesh.rotation.y += r.spin * dt;
        else r.mesh.rotation.z += r.spin * dt;
      }
    });
    landmarks.about = g; scene.add(g);
  }

  // Experience landmark: Mars with procedural surface
  function buildMars() {
    const g = new THREE.Group();
    // Procedural canvas texture: rusty base, darker blotches, polar cap
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c1440e'; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512, y = 30 + Math.random() * 200;
      const rx = 15 + Math.random() * 60, ry = 8 + Math.random() * 30;
      ctx.fillStyle = 'rgba(' + (70 + Math.random() * 40) + ',' + (25 + Math.random() * 15) + ',10,' + (0.15 + Math.random() * 0.25) + ')';
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    // Polar cap (texture top = north pole)
    const cap = ctx.createLinearGradient(0, 0, 0, 40);
    cap.addColorStop(0, 'rgba(245,240,235,0.95)');
    cap.addColorStop(1, 'rgba(235,228,220,0)');
    ctx.fillStyle = cap; ctx.fillRect(0, 0, 512, 40);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mars = new THREE.Mesh(
      new THREE.SphereGeometry(26, 48, 48),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    g.add(mars);
    const sun = new THREE.DirectionalLight(0xffe0c0, 2.6);
    sun.position.set(0.8, 0.4, 1);
    g.add(sun); g.add(sun.target);
    g.position.x = isMobile ? 0 : -70;
    g.position.y = isMobile ? 35 : 10;
    tickers.push(function (dt) {
      if (!reduced) mars.rotation.y += 0.02 * dt * Math.PI;
    });
    landmarks.experience = g; scene.add(g);
  }

  // Transition landmark: scroll-scrubbed wormhole tunnel (experience → projects)
  function buildWormhole() {
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(30, 30, 500, 48, 24, true);
    // Procedural swirl texture
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = 'hsla(' + (185 + Math.random() * 80) + ', 90%, ' + (55 + Math.random() * 25) + '%, ' + (0.25 + Math.random() * 0.5) + ')';
      ctx.lineWidth = 1 + Math.random() * 2.5;
      ctx.beginPath();
      const y = Math.random() * 512;
      ctx.moveTo(0, y); ctx.bezierCurveTo(170, y + 40, 340, y - 40, 512, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide,
      transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const tube = new THREE.Mesh(geo, mat);
    tube.rotation.x = Math.PI / 2;            // cylinder axis along Z
    g.add(tube);
    // Entry ring of warped light
    const ring = new THREE.Mesh(new THREE.TorusGeometry(30, 1.2, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    ring.position.z = 250; g.add(ring);
    tickers.push(function (dt) {
      // Fade + swirl only while the camera is within ±300 of the wormhole center.
      // k scrubs with scroll (reversible); FOV stretch sells the tunnel rush.
      const d = Math.abs(camera.position.z - g.position.z);
      const k = Math.max(0, 1 - d / 300);
      mat.opacity = k * 0.85;
      ring.material.opacity = k * 0.9;
      if (!reduced) {
        // Texture-space motion: offset.y = rush along the tube axis,
        // offset.x = swirl around it (rotating the mesh would wobble it
        // since rotation.x = π/2 moved the cylinder axis off local Z).
        if (k > 0) { tex.offset.y -= dt * 1.5 * k; tex.offset.x += dt * 0.25 * k; }
        const targetFov = 60 + k * 28;
        if (Math.abs(camera.fov - targetFov) > 0.01) {
          camera.fov = targetFov;
          camera.updateProjectionMatrix();
        }
      }
    });
    themeListeners.push(function (p, name) {
      ring.material.color.setHex(name === 'magic' ? 0xd3a625 : (name === 'light' ? 0x0066cc : 0x00e5ff));
    });
    landmarks.wormhole = g; scene.add(g);
  }

  // Projects landmark: black hole with accretion disk
  function buildBlackHole() {
    const g = new THREE.Group();
    const hole = new THREE.Mesh(new THREE.SphereGeometry(14, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000 }));
    g.add(hole);
    // Photon-ring halo sprite
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 52, 128, 128, 78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.45, 'rgba(255,200,120,0.9)');
    grad.addColorStop(0.6, 'rgba(255,150,60,0.5)');
    grad.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    halo.scale.setScalar(64); g.add(halo);
    // Accretion disk particles on a warped annulus
    const N = isMobile ? 900 : 2500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const angles = new Float32Array(N), radii = new Float32Array(N);
    const c1 = new THREE.Color(0xffe0b0), c2 = new THREE.Color(0xff7733);
    for (let i = 0; i < N; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 17 + Math.pow(Math.random(), 1.6) * 38;
      const mix = (radii[i] - 17) / 38, cc = c1.clone().lerp(c2, mix);
      col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
      // Seed initial ring positions so the disk is visible even when the
      // reduced-motion ticker never runs (same formula as the ticker).
      pos[i * 3] = Math.cos(angles[i]) * radii[i];
      pos[i * 3 + 1] = Math.sin(angles[i] * 2) * 1.2;
      pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i] * 0.35;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const disk = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 1.6, vertexColors: true, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false }));
    disk.rotation.x = 1.15; g.add(disk);
    // Light mode: ink-print restraint — additive glows tone down on paper
    themeListeners.push(function (p, name) {
      halo.material.opacity = name === 'light' ? 0.5 : 1;
      disk.material.opacity = name === 'light' ? 0.65 : 0.9;
    });
    tickers.push(function (dt) {
      if (reduced) return;
      const p = disk.geometry.attributes.position;
      for (let i = 0; i < N; i++) {
        angles[i] += dt * (30 / radii[i]);          // Keplerian: inner = faster
        radii[i] -= dt * 0.35;                       // slow infall
        if (radii[i] < 15) radii[i] = 55;            // respawn at rim
        p.setXYZ(i, Math.cos(angles[i]) * radii[i],
          Math.sin(angles[i] * 2) * 1.2,             // slight vertical warp
          Math.sin(angles[i]) * radii[i] * 0.35);    // foreshortened ellipse
      }
      p.needsUpdate = true;
    });
    g.position.x = isMobile ? 0 : -55; g.position.y = 8;
    landmarks.projects = g; scene.add(g);
  }

  // Skills landmark: constellations forged by a supernova
  var novaPlayed = false;
  var constellationGroups = [];   // {pointsMat, lineMat} material refs for reveal
  var novaAPI = null;             // set by buildConstellations

  function buildConstellations() {
    const g = new THREE.Group();
    // Hand-placed cluster centers on a 200×120 plane
    const centers = [[-80, 35], [0, 42], [80, 32], [-70, -28], [5, -38], [78, -25]];
    const accent = new THREE.Color(0x00e5ff);
    constellationGroups = [];
    const starTargets = [];     // world-local positions for nova debris to fly to
    centers.forEach(function (ctr) {
      const n = 5 + Math.floor(Math.random() * 4);
      const pts = [];
      for (let i = 0; i < n; i++) {
        pts.push(new THREE.Vector3(
          ctr[0] + (Math.random() - 0.5) * 34,
          ctr[1] + (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 10));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.PointsMaterial({ color: accent, size: 2.5,
        transparent: true, opacity: 0, sizeAttenuation: true });
      const cloud = new THREE.Points(geo, mat);
      g.add(cloud);
      // connect successive stars with lines
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0 });
      const line = new THREE.Line(lineGeo, lineMat);
      g.add(line);
      constellationGroups.push({ pointsMat: mat, lineMat: lineMat });
      pts.forEach(function (v) { starTargets.push(v); });
    });
    landmarks.skills = g; scene.add(g);

    themeListeners.push(function (p, name) {
      const hex = name === 'magic' ? 0xd3a625 : (name === 'light' ? 0x0066cc : 0x00e5ff);
      constellationGroups.forEach(function (cg) {
        cg.pointsMat.color.setHex(hex); cg.lineMat.color.setHex(hex);
      });
    });

    // ---- supernova ----
    novaAPI = function () {
      if (novaPlayed) return;
      novaPlayed = true;
      if (reduced) { revealConstellations(1); return; }
      const NB = isMobile ? 500 : 1200;
      const bGeo = new THREE.BufferGeometry();
      const bPos = new Float32Array(NB * 3);             // all start at center
      bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
      const bMat = new THREE.PointsMaterial({ color: 0xfff2cc, size: 2.2,
        transparent: true, opacity: 1, blending: THREE.AdditiveBlending,
        depthWrite: false, sizeAttenuation: true, fog: false });
      const burst = new THREE.Points(bGeo, bMat);
      g.add(burst);
      // assign each debris particle a shell direction + a final constellation target
      const shells = [], finals = [];
      for (let i = 0; i < NB; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        const R = 60 + Math.random() * 30;
        shells.push(new THREE.Vector3(
          R * Math.sin(ph) * Math.cos(th), R * Math.sin(ph) * Math.sin(th), R * Math.cos(ph) * 0.4));
        finals.push(starTargets[i % starTargets.length]);
      }
      // flash sprite
      const fc = document.createElement('canvas'); fc.width = fc.height = 128;
      const fctx = fc.getContext('2d');
      const fg = fctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      fg.addColorStop(0, 'rgba(255,255,240,1)'); fg.addColorStop(1, 'rgba(255,220,150,0)');
      fctx.fillStyle = fg; fctx.fillRect(0, 0, 128, 128);
      const flash = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(fc), transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      flash.scale.setScalar(1); g.add(flash);
      let novaT = 0;
      function novaTick(dt) {
        novaT += dt * 0.4;                              // ~2.5s total
        const t = Math.min(novaT, 1);
        // flash: rapid expand then collapse in first 30%
        const ft = Math.min(t / 0.3, 1);
        flash.scale.setScalar(1 + Math.sin(ft * Math.PI) * 16);
        flash.material.opacity = 1 - ft;
        const p = bGeo.attributes.position;
        for (let i = 0; i < NB; i++) {
          let x, y, z;
          if (t < 0.5) {                                // center → shell, ease-out
            const k = 1 - Math.pow(1 - t / 0.5, 2);
            x = shells[i].x * k; y = shells[i].y * k; z = shells[i].z * k;
          } else {                                      // shell → constellation, ease-in-out
            const k0 = (t - 0.5) / 0.5;
            const k = k0 < 0.5 ? 2 * k0 * k0 : 1 - Math.pow(-2 * k0 + 2, 2) / 2;
            x = shells[i].x + (finals[i].x - shells[i].x) * k;
            y = shells[i].y + (finals[i].y - shells[i].y) * k;
            z = shells[i].z + (finals[i].z - shells[i].z) * k;
          }
          p.setXYZ(i, x, y, z);
        }
        p.needsUpdate = true;
        bMat.opacity = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
        revealConstellations(Math.max(0, (t - 0.8) / 0.2));
        if (t >= 1) {
          g.remove(burst); bGeo.dispose(); bMat.dispose();
          g.remove(flash); flash.material.map.dispose(); flash.material.dispose();
          const idx = tickers.indexOf(novaTick);
          if (idx !== -1) tickers.splice(idx, 1);
          revealConstellations(1);
        }
      }
      tickers.push(novaTick);
    };
  }
  function revealConstellations(k) {
    constellationGroups.forEach(function (cg) {
      cg.pointsMat.opacity = k;
      cg.lineMat.opacity = 0.25 * k;
    });
  }

  // Contact landmark: slowly rotating spiral galaxy
  function buildGalaxy() {
    const g = new THREE.Group();
    const N = isMobile ? 2000 : 6000, ARMS = 3;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const inner = new THREE.Color(0xffd9a0), outer = new THREE.Color(0x7c8cff);
    for (let i = 0; i < N; i++) {
      const r = Math.pow(Math.random(), 0.6) * 90;
      const arm = (i % ARMS) * (Math.PI * 2 / ARMS);
      const spin = r * 0.045;
      const spread = (Math.random() - 0.5) * (1 - r / 110) * 14;
      const a = arm + spin + spread * 0.04;
      pos[i * 3] = Math.cos(a) * r + (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * (8 - r * 0.06);
      pos[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * 4;
      const cc = inner.clone().lerp(outer, r / 90);
      col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.4,
      vertexColors: true, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const inner2 = new THREE.Group();
    inner2.add(pts);                      // pts spins about its own Y (disk normal)
    inner2.rotation.x = 0.9;              // tilt applied outside the spin
    inner2.position.z = -300;             // straight back from the camera path
    g.add(inner2);
    g.position.y = -10;
    tickers.push(function (dt) { if (!reduced) pts.rotation.y += dt * 0.03; });
    // Light mode: galaxy prints as faint ink swirl on chart paper
    themeListeners.push(function (p, name) {
      pts.material.opacity = name === 'light' ? 0.55 : 0.95;
    });
    landmarks.contact = g; scene.add(g);
  }

  // Occasional shooting stars near the camera
  function buildShootingStars() {
    if (reduced) return;
    let cooldown = 4 + Math.random() * 8;
    let active = null;  // { line, vel, life }
    tickers.push(function (dt) {
      if (active) {
        active.life -= dt;
        active.line.position.x += active.vel.x * dt;
        active.line.position.y += active.vel.y * dt;
        active.line.material.opacity = Math.max(0, active.life / 0.8);
        if (active.life <= 0) {
          scene.remove(active.line);
          active.line.geometry.dispose(); active.line.material.dispose();
          active = null;
          cooldown = 6 + Math.random() * 8;
        }
        return;
      }
      cooldown -= dt;
      if (cooldown > 0) return;
      const z = camera.position.z - 150 - Math.random() * 100;
      const x0 = (Math.random() - 0.5) * 160;
      const y0 = 30 + Math.random() * 50;
      const dir = new THREE.Vector3(-(0.5 + Math.random()), -(0.3 + Math.random() * 0.4), 0).normalize();
      const len = 14 + Math.random() * 10;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x0, y0, z),
        new THREE.Vector3(x0 + dir.x * len, y0 + dir.y * len, z)]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      active = { line: line, vel: dir.clone().multiplyScalar(140), life: 0.8 };
    });
  }

  // Map each anchor section's page position to a Z depth. Landmark groups
  // (added by later tasks into `landmarks`) are re-positioned here.
  const ANCHORS = ['hero', 'about', 'experience', 'wormhole', 'projects', 'skills', 'contact'];
  const depths = {};
  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function sectionFraction(id) {
    const docH = document.documentElement.scrollHeight - innerHeight;
    if (docH <= 0) return 0;
    if (id === 'hero') return 0;
    if (id === 'wormhole') { // midpoint of the experience→projects gap
      const exp = document.getElementById('expScroll');
      const proj = document.getElementById('projectsScroll');
      if (!exp || !proj) return 0.45;
      return ((docTop(exp) + exp.offsetHeight + docTop(proj)) / 2 - innerHeight / 2) / docH;
    }
    const map = { about: 'about', experience: 'expScroll', projects: 'projectsScroll', skills: 'skills', contact: 'contact' };
    const el = document.getElementById(map[id]);
    if (!el) return 0;
    return Math.min(1, Math.max(0, (docTop(el) + el.offsetHeight / 2 - innerHeight / 2) / docH));
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
    if (placeSolarHook) placeSolarHook();
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
    scene.fog.color.setHex(theme === 'light' ? 0xf4f1e8 : 0x030308); // chart-paper haze in light
    themeListeners.forEach((fn) => fn(p, theme));
  }

  window.SpaceScene = {
    init,
    setScrollProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    setTheme,
    triggerSupernova() { if (novaAPI) novaAPI(); else revealConstellations(1); },
    layout,
    _internals: {
      get THREE() { return THREE; }, get scene() { return scene; },
      get camera() { return camera; }, landmarks, tickers, themeListeners,
      PALETTES, depths, isMobile, reduced, PATH,
      get ready() { return ready; },
      get theme() { return theme; },
    },
  };
  init();
})();
