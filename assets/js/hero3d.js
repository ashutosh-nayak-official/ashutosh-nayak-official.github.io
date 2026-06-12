/* ============================================================
   Hero 3D stage — placeholder primitive car under a spotlight.
   ES module, dynamically imported by story.js only when WebGL
   is viable and motion is allowed. Reads window.__heroProgress
   (0..1, written by the hero scroll timeline) for camera orbit.
   The car is a primitives placeholder — see CREDITS.md for the
   real glTF models to supply per era.
   ============================================================ */

const heroStage = document.querySelector('.hero-stage');
const canvas = document.getElementById('heroCanvas');

function fallback() {
  if (heroStage) heroStage.classList.add('hero-fallback');
}

let THREE;
try {
  THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
} catch (err) {
  fallback();
}

if (THREE && canvas) {
  init();
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.innerWidth > 700,
      alpha: false
    });
  } catch (err) {
    fallback();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1014);
  scene.fog = new THREE.Fog(0x0f1014, 9, 22);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60);

  // ---- Stage: ground plane under a single soft spotlight ----
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x0c0d11, roughness: 0.9, metalness: 0.1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ambient = new THREE.AmbientLight(0x2a2d36, 0.55);
  scene.add(ambient);

  const spot = new THREE.SpotLight(0xfff2dc, 750, 30, Math.PI / 5, 0.55, 1.6);
  spot.position.set(0, 9, 0.5);
  spot.target.position.set(0, 0.8, 0); // aim at car center
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  scene.add(spot, spot.target);

  // Soft sky/ground fill so body panels never go full black
  const hemi = new THREE.HemisphereLight(0x8a96ad, 0x0c0d11, 0.35);
  scene.add(hemi);

  // Volt rim light: low and behind — kisses edges, doesn't paint the roof
  const rim = new THREE.PointLight(0x2ee6a8, 5.5, 16, 2);
  rim.position.set(-3.6, 0.7, -4.2);
  scene.add(rim);

  // ---- Placeholder car (primitives; real glTF per CREDITS.md) ----
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd63a2f, metalness: 0.6, roughness: 0.35
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x15161a, metalness: 0.3, roughness: 0.7
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xc7d0da, metalness: 0.95, roughness: 0.15
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1c2733, metalness: 0.9, roughness: 0.08
  });

  // Low wide body (sits with its underside at y=0.3, top at y=1.2)
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 1.9), bodyMat);
  body.position.y = 0.75;
  body.castShadow = true;
  car.add(body);

  // Cabin: lower and longer, set back + angled windshield slab
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 1.62), bodyMat);
  cabin.position.set(-0.45, 1.47, 0);
  cabin.castShadow = true;
  car.add(cabin);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.66, 1.5), glassMat);
  windshield.position.set(0.78, 1.42, 0);
  windshield.rotation.z = -0.5; // raked back
  car.add(windshield);

  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 1.5), glassMat);
  rearGlass.position.set(-1.62, 1.4, 0);
  rearGlass.rotation.z = 0.42;
  car.add(rearGlass);

  // Wheels + chrome rims
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 28);
  const rimGeo = new THREE.TorusGeometry(0.24, 0.05, 10, 24);
  const wheelPositions = [
    [1.45, 0.42, 1.0], [1.45, 0.42, -1.0],
    [-1.45, 0.42, 1.0], [-1.45, 0.42, -1.0]
  ];
  wheelPositions.forEach(function (p) {
    const wheel = new THREE.Mesh(wheelGeo, darkMat);
    wheel.rotation.x = Math.PI / 2; // roll axis along Z
    wheel.position.set(p[0], p[1], p[2]);
    wheel.castShadow = true;
    car.add(wheel);

    const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
    rimMesh.position.set(p[0], p[1], p[2] + (p[2] > 0 ? 0.16 : -0.16));
    car.add(rimMesh);
  });

  // Headlights (emissive)
  const headGeo = new THREE.SphereGeometry(0.12, 14, 14);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffd884, emissive: 0xffd884, emissiveIntensity: 2.2
  });
  [0.62, -0.62].forEach(function (z) {
    const lamp = new THREE.Mesh(headGeo, headMat);
    lamp.position.set(2.21, 0.85, z);
    car.add(lamp);
  });

  // Taillight strip (emissive racing red)
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.12, 1.5),
    new THREE.MeshStandardMaterial({
      color: 0xd63a2f, emissive: 0xd63a2f, emissiveIntensity: 1.8
    })
  );
  tail.position.set(-2.21, 0.95, 0);
  car.add(tail);

  scene.add(car);

  const lookTarget = new THREE.Vector3(0, 0.9, 0);

  // ---- Camera orbit driven by window.__heroProgress ----
  const DEG = Math.PI / 180;
  function updateCamera(time) {
    const p = Math.min(1, Math.max(0, Number(window.__heroProgress) || 0));
    const azimuth = (-40 + 270 * p) * DEG;        // -40deg -> 230deg
    const height = 1.4 + 1.0 * p;                 // 1.4 -> 2.4
    const radius = 8.6 - 1.8 * p;                 // 8.6 -> 6.8
    const bob = Math.sin(time * 0.0011) * 0.05;   // subtle idle bob
    camera.position.set(
      Math.cos(azimuth) * radius,
      height + bob,
      Math.sin(azimuth) * radius
    );
    camera.lookAt(lookTarget);
  }

  // ---- Resize ----
  function onResize() {
    const w = heroStage ? heroStage.clientWidth : window.innerWidth;
    const h = heroStage ? heroStage.clientHeight : window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);
  onResize();

  // ---- Render loop, paused while hero is off-screen ----
  function loop(time) {
    updateCamera(time || 0);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(loop);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        renderer.setAnimationLoop(entry.isIntersecting ? loop : null);
      });
    }, { threshold: 0 });
    io.observe(canvas);
  }
}
