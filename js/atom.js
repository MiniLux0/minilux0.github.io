/* ============================================
   3D Atom Visualization — Three.js + Bloom
   ============================================
   Renders an interactive 3D atom with:
   - Multi-axis elliptical orbits
   - Glowing layered nucleus
   - Electron trails (buffered line geometry)
   - UnrealBloomPass postprocessing
   - Mouse parallax + drag rotation
   - Depth-based floating labels
   ============================================ */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ── Config ──────────────────────────────────────
const SIZE        = 400;
const TRAIL_LEN   = 20;
const BLOOM_STR   = 0.45;   // Subtle glow strength
const BLOOM_RAD   = 0.4;    // Bloom spread radius
const BLOOM_THR   = 0.2;    // Luminosity threshold

// Three nearly-circular orbits at distinct 3D angles
const ORBITS = [
  { rx: 1.5, ry: 1.35, rotX: 0.2,             rotZ: 0,           speed: 0.40, color: 0x3b82f6 },
  { rx: 1.5, ry: 1.35, rotX: Math.PI / 3,      rotZ: Math.PI / 6, speed: 0.55, color: 0x38bdf8 },
  { rx: 1.5, ry: 1.35, rotX: Math.PI * 2 / 3,  rotZ: -Math.PI / 5, speed: 0.35, color: 0x60a5fa },
];

const LABELS = [
  { orbit: 0, angle: 0.8 },
  { orbit: 1, angle: 2.5 },
  { orbit: 2, angle: 4.2 },
];

// ── State ───────────────────────────────────────
let renderer, scene, camera, composer;
let electrons   = [];
let labelEls    = [];
let nucleusMesh = null;
const drag      = { active: false, sx: 0, sy: 0 };
const targetRot = { x: 0, y: 0 };
const mouse     = { x: 0, y: 0 };

// ── Init ────────────────────────────────────────
export function init() {
  const canvas = document.getElementById('atom-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Scene + Camera — FOV 50, z=5 for less perspective distortion
  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // ── Bloom postprocessing ──────────────────────
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(SIZE, SIZE),
    BLOOM_STR, BLOOM_RAD, BLOOM_THR
  );
  composer.addPass(bloom);

  // ── Lighting ──────────────────────────────────
  scene.add(new THREE.AmbientLight(0x0a1628, 0.6));
  const key = new THREE.DirectionalLight(0x4488ff, 0.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x14b8a6, 0.2);
  rim.position.set(-2, -3, 2);
  scene.add(rim);

  // ── Nucleus — layered glow ────────────────────
  // Core
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 1.2,
    metalness: 0.3, roughness: 0.4,
  });
  nucleusMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), coreMat);
  scene.add(nucleusMesh);

  // Inner glow shell
  const gIn = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x3b82f6, transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  scene.add(gIn);

  // Outer glow shell
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x3b82f6, transparent: true, opacity: 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  ));

  // Point light at center
  const nLight = new THREE.PointLight(0x3b82f6, 2.5, 6);
  scene.add(nLight);

  // ── Orbits + Electrons + Trails ───────────────
  ORBITS.forEach(function (cfg) {
    // Orbit ring
    const curve  = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, Math.PI * 2, false, 0);
    const pts2D  = curve.getPoints(160);
    const path3D = new THREE.CatmullRomCurve3(
      pts2D.map(function (p) { return new THREE.Vector3(p.x, p.y, 0); }), true
    );
    const ring = new THREE.Mesh(
      new THREE.TubeGeometry(path3D, 160, 0.008, 6, true),
      new THREE.MeshBasicMaterial({
        color: cfg.color, transparent: true, opacity: 0.28,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    ring.rotation.x = cfg.rotX;
    ring.rotation.z = cfg.rotZ;
    scene.add(ring);

    // 3 electrons per orbit
    for (let e = 0; e < 3; e++) {
      const eMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: cfg.color, emissiveIntensity: 1.0,
        metalness: 0.1, roughness: 0.3,
      });
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), eMat);
      electron.add(new THREE.PointLight(cfg.color, 0.6, 1.5));
      scene.add(electron);

      // Trail line buffer
      const tPos = new Float32Array(TRAIL_LEN * 3);
      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
      tGeo.setDrawRange(0, 0);
      const trail = new THREE.Line(tGeo, new THREE.LineBasicMaterial({
        color: cfg.color, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      scene.add(trail);

      electrons.push({
        mesh: electron, trail, tPos, tCount: 0,
        rx: cfg.rx, ry: cfg.ry,
        rotX: cfg.rotX, rotZ: cfg.rotZ,
        speed: cfg.speed,
        offset: (e / 3) * Math.PI * 2,
      });
    }
  });

  // ── Label elements ────────────────────────────
  labelEls = document.querySelectorAll('.atom-label:not(.atom-label--nucleus)');

  // ── Mouse interaction ─────────────────────────
  canvas.addEventListener('mousedown', function (e) {
    drag.active = true; drag.sx = e.clientX; drag.sy = e.clientY;
  });
  document.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth)  *  2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * -2 + 1;
    if (!drag.active) return;
    targetRot.y += (e.clientX - drag.sx) * 0.006;
    targetRot.x += (e.clientY - drag.sy) * 0.006;
    drag.sx = e.clientX;
    drag.sy = e.clientY;
  });
  document.addEventListener('mouseup', function () { drag.active = false; });
}

// ── Per-frame update ────────────────────────────
export function update(time) {
  if (!renderer) return;

  const t = time * 0.001;

  // Auto-rotate + mouse parallax
  targetRot.y += 0.003;
  if (!drag.active) {
    targetRot.x += (mouse.y * 0.15 - targetRot.x) * 0.02;
    targetRot.y += (mouse.x * 0.1  - targetRot.y) * 0.005;
  }
  scene.rotation.x += (targetRot.x - scene.rotation.x) * 0.06;
  scene.rotation.y += (targetRot.y - scene.rotation.y) * 0.06;

  // Camera parallax
  camera.position.x += (mouse.x * 0.25 - camera.position.x) * 0.03;
  camera.position.y += (mouse.y * 0.15 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  // Nucleus pulse
  if (nucleusMesh) {
    nucleusMesh.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
  }

  // Electrons + trails
  electrons.forEach(function (e) {
    const a  = t * e.speed + e.offset;
    const cx = Math.cos(a) * e.rx;
    const cy = Math.sin(a) * e.ry;
    const cX = Math.cos(e.rotX), sX = Math.sin(e.rotX);
    const cZ = Math.cos(e.rotZ), sZ = Math.sin(e.rotZ);

    // Rotate ellipse into 3D
    const y1 = cy * cX;
    const z1 = cy * sX;
    const x2 = cx * cZ - y1 * sZ;
    const y2 = cx * sZ + y1 * cZ;

    e.mesh.position.set(x2, y2, z1);

    // Shift trail buffer, insert new head
    const p = e.tPos;
    for (let i = p.length - 3; i >= 3; i -= 3) {
      p[i] = p[i - 3]; p[i + 1] = p[i - 2]; p[i + 2] = p[i - 1];
    }
    p[0] = x2; p[1] = y2; p[2] = z1;
    e.tCount = Math.min(e.tCount + 1, TRAIL_LEN);
    e.trail.geometry.attributes.position.needsUpdate = true;
    e.trail.geometry.setDrawRange(0, e.tCount);
  });

  // Labels — project to screen, fade by depth
  labelEls.forEach(function (el, i) {
    const cfg = LABELS[i];
    if (!cfg) return;
    const oc = ORBITS[cfg.orbit];
    const la = cfg.angle;
    const lx = Math.cos(la) * oc.rx;
    const ly = Math.sin(la) * oc.ry;
    const cX = Math.cos(oc.rotX), sX = Math.sin(oc.rotX);
    const cZ = Math.cos(oc.rotZ), sZ = Math.sin(oc.rotZ);
    const y1 = ly * cX;
    const z1 = ly * sX;
    const x2 = lx * cZ - y1 * sZ;
    const y2 = lx * sZ + y1 * cZ;

    const v = new THREE.Vector3(x2, y2, z1);
    v.applyMatrix4(scene.matrixWorld);
    v.project(camera);

    el.style.left    = ((v.x * 0.5 + 0.5) * SIZE) + 'px';
    el.style.top     = ((-v.y * 0.5 + 0.5) * SIZE) + 'px';
    el.style.opacity = THREE.MathUtils.clamp(1.0 - v.z * 0.6, 0.15, 1).toFixed(2);
  });

  // Render with bloom
  composer.render();
}
