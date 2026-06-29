/* ============================================
   3D Atom — Organic / Physically-Inspired
   ============================================
   Dynamic, non-mechanical atom visualization.
   - Perturbed elliptical orbits (sinusoidal deformation)
   - Variable angular velocity per electron
   - Orbital plane wobble (slow oscillation)
   - Exponential-decay trails with per-vertex alpha
   - Mouse proximity distortion
   - Click pulse (expand + relax)
   - Smooth noise via layered sine waves
   ============================================ */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass }  from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ── Config ──────────────────────────────────────
const SIZE      = 400;
const TRAIL_LEN = 24;
const BLOOM_STR = 0.45;
const BLOOM_RAD = 0.4;
const BLOOM_THR = 0.2;

// Base orbit definitions — rx/ry are *base* radii (perturbed at runtime)
const ORBITS = [
  { rx: 1.5, ry: 1.35, rotX: 0.2,            rotZ: 0,            baseSpeed: 0.40, color: 0x3b82f6 },
  { rx: 1.5, ry: 1.35, rotX: Math.PI / 3,     rotZ: Math.PI / 6,  baseSpeed: 0.55, color: 0x38bdf8 },
  { rx: 1.5, ry: 1.35, rotX: Math.PI * 2 / 3, rotZ: -Math.PI / 5, baseSpeed: 0.35, color: 0x60a5fa },
];

const LABELS = [
  { orbit: 0, angle: 0.8 },
  { orbit: 1, angle: 2.5 },
  { orbit: 2, angle: 4.2 },
];

// ── Smooth noise (layered sine — cheap, no library) ──
function noise(t, seed) {
  return Math.sin(t * 1.1 + seed) * 0.5
       + Math.sin(t * 2.3 + seed * 2.7) * 0.3
       + Math.sin(t * 0.4 + seed * 5.1) * 0.2;
}

// ── State ───────────────────────────────────────
let renderer, scene, camera, composer;
let electrons   = [];
let orbitRings  = [];
let labelEls    = [];
let nucleusMesh = null;
let glowShells  = [];

const drag      = { active: false, sx: 0, sy: 0 };
const targetRot = { x: 0, y: 0 };
const mouse     = { x: 0, y: 0 };
const mouseNDC  = new THREE.Vector2();   // For raycasting proximity

// Pulse state
let pulseTime  = -1;     // -1 = no pulse active
let pulsePhase = 0;
const PULSE_DUR = 1.2;   // seconds

// ── Init ────────────────────────────────────────
export function init() {
  const canvas = document.getElementById('atom-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Bloom
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(SIZE, SIZE), BLOOM_STR, BLOOM_RAD, BLOOM_THR
  ));

  // Lighting
  scene.add(new THREE.AmbientLight(0x0a1628, 0.6));
  const key = new THREE.DirectionalLight(0x4488ff, 0.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x14b8a6, 0.2);
  rim.position.set(-2, -3, 2);
  scene.add(rim);

  // ── Nucleus ───────────────────────────────────
  nucleusMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 1.2,
      metalness: 0.3, roughness: 0.4,
    })
  );
  scene.add(nucleusMesh);

  // Glow shells
  const shellMat = (r, op) => new THREE.Mesh(
    new THREE.SphereGeometry(r, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x3b82f6, transparent: true, opacity: op,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  glowShells.push(shellMat(0.35, 0.15));
  glowShells.push(shellMat(0.55, 0.06));
  glowShells.forEach(function (m) { scene.add(m); });

  scene.add(new THREE.PointLight(0x3b82f6, 2.5, 6));

  // ── Orbits + Electrons + Trails ───────────────
  ORBITS.forEach(function (cfg, oi) {
    // Orbit ring — updated dynamically for wobble
    const curve  = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, Math.PI * 2, false, 0);
    const pts2D  = curve.getPoints(160);
    const path3D = new THREE.CatmullRomCurve3(
      pts2D.map(function (p) { return new THREE.Vector3(p.x, p.y, 0); }), true
    );
    const ring = new THREE.Mesh(
      new THREE.TubeGeometry(path3D, 160, 0.008, 6, true),
      new THREE.MeshBasicMaterial({
        color: cfg.color, transparent: true, opacity: 0.22,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    ring.rotation.x = cfg.rotX;
    ring.rotation.z = cfg.rotZ;
    scene.add(ring);
    orbitRings.push({ mesh: ring, baseRotX: cfg.rotX, baseRotZ: cfg.rotZ, oi: oi });

    // 3 electrons per orbit — each with unique noise seeds
    for (let e = 0; e < 3; e++) {
      const eMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: cfg.color, emissiveIntensity: 1.0,
        metalness: 0.1, roughness: 0.3,
      });
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), eMat);
      electron.add(new THREE.PointLight(cfg.color, 0.6, 1.5));
      scene.add(electron);

      // Trail — per-vertex color with alpha for exponential decay
      const tPos   = new Float32Array(TRAIL_LEN * 3);
      const tColor = new Float32Array(TRAIL_LEN * 4); // RGBA per vertex
      const tGeo   = new THREE.BufferGeometry();
      tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
      tGeo.setAttribute('color',    new THREE.BufferAttribute(tColor, 4));
      tGeo.setDrawRange(0, 0);
      const trail = new THREE.Line(tGeo, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      scene.add(trail);

      const seed = oi * 100 + e * 37 + 13;
      electrons.push({
        mesh: electron, trail, tPos, tColor, tCount: 0,
        rx: cfg.rx, ry: cfg.ry,
        rotX: cfg.rotX, rotZ: cfg.rotZ,
        baseSpeed: cfg.baseSpeed,
        offset: (e / 3) * Math.PI * 2,
        seed: seed,
        // Per-electron perturbation parameters
        rPertFreq1: 0.7 + Math.random() * 0.6,
        rPertAmp1:  0.08 + Math.random() * 0.07,
        rPertFreq2: 1.3 + Math.random() * 0.8,
        rPertAmp2:  0.04 + Math.random() * 0.04,
        speedVarFreq: 0.5 + Math.random() * 0.4,
        speedVarAmp:  0.12 + Math.random() * 0.08,
        trailFlicker: 0.8 + Math.random() * 0.4,
      });
    }
  });

  // ── Labels ────────────────────────────────────
  labelEls = document.querySelectorAll('.atom-label:not(.atom-label--nucleus)');

  // ── Mouse ─────────────────────────────────────
  canvas.addEventListener('mousedown', function (e) {
    drag.active = true; drag.sx = e.clientX; drag.sy = e.clientY;
  });
  document.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth)  *  2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * -2 + 1;
    mouseNDC.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (!drag.active) return;
    targetRot.y += (e.clientX - drag.sx) * 0.006;
    targetRot.x += (e.clientY - drag.sy) * 0.006;
    drag.sx = e.clientX; drag.sy = e.clientY;
  });
  document.addEventListener('mouseup', function () { drag.active = false; });

  // Click → pulse
  canvas.addEventListener('click', function () {
    if (pulseTime < 0) { pulseTime = 0; }
  });
}

// ── Per-frame ───────────────────────────────────
export function update(time) {
  if (!renderer) return;

  const dt = 0.016; // ~60fps timestep for consistency
  const t  = time * 0.001;

  // ── Pulse ─────────────────────────────────────
  let pulseScale = 1;
  if (pulseTime >= 0) {
    pulseTime += dt;
    pulsePhase = pulseTime / PULSE_DUR;
    if (pulsePhase >= 1) { pulseTime = -1; pulsePhase = 0; }
    // Ease-out: fast expand, slow settle
    const p = pulsePhase;
    pulseScale = 1 + 0.25 * Math.sin(p * Math.PI) * (1 - p);
  }

  // ── Scene rotation ────────────────────────────
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

  // ── Nucleus organic pulse ─────────────────────
  if (nucleusMesh) {
    const nPulse = 1 + Math.sin(t * 2) * 0.04 + Math.sin(t * 5.3) * 0.01;
    nucleusMesh.scale.setScalar(nPulse * pulseScale);
  }
  // Glow shells follow pulse
  glowShells.forEach(function (shell, i) {
    const s = (1 + i * 0.3) * pulseScale;
    shell.scale.setScalar(s);
  });

  // ── Orbit ring wobble ─────────────────────────
  orbitRings.forEach(function (o) {
    const wobbleX = Math.sin(t * 0.3 + o.oi * 2.1) * 0.04;
    const wobbleZ = Math.cos(t * 0.25 + o.oi * 3.7) * 0.03;
    o.mesh.rotation.x = o.baseRotX + wobbleX;
    o.mesh.rotation.z = o.baseRotZ + wobbleZ;
  });

  // ── Mouse proximity factor (0 = far, 1 = close) ──
  // Project atom center to screen, measure distance to mouse
  const centerProj = new THREE.Vector3(0, 0, 0);
  centerProj.applyMatrix4(scene.matrixWorld);
  centerProj.project(camera);
  const dxm = mouseNDC.x - centerProj.x;
  const dym = mouseNDC.y - centerProj.y;
  const distMouse = Math.sqrt(dxm * dxm + dym * dym);
  const mouseProx = Math.max(0, 1 - distMouse / 1.5); // 1.5 = influence radius in NDC

  // ── Electrons ─────────────────────────────────
  electrons.forEach(function (e) {
    // Perturbed angle: base + speed variation
    const speedNoise = Math.sin(t * e.speedVarFreq + e.seed) * e.speedVarAmp;
    const angle = t * (e.baseSpeed + speedNoise) + e.offset;

    // Perturbed radius
    const rPert = Math.sin(t * e.rPertFreq1 + e.seed * 1.3) * e.rPertAmp1
                + Math.sin(t * e.rPertFreq2 + e.seed * 2.9) * e.rPertAmp2;
    const rxP = (e.rx + rPert) * pulseScale;
    const ryP = (e.ry + rPert * 0.8) * pulseScale;

    // Mouse distortion: pull orbit slightly toward mouse
    const distortX = mouseProx * mouse.x * 0.15;
    const distortY = mouseProx * mouse.y * 0.12;

    // Parametric position on perturbed ellipse
    const cx = Math.cos(angle) * rxP + distortX;
    const cy = Math.sin(angle) * ryP + distortY;

    // Apply dynamic orbit rotation (wobble synced with ring)
    const orbCfg = ORBITS[Math.floor(e.seed / 100)] || ORBITS[0];
    const wobbleX = Math.sin(t * 0.3 + e.seed * 0.01) * 0.04;
    const wobbleZ = Math.cos(t * 0.25 + e.seed * 0.015) * 0.03;
    const rX = e.rotX + wobbleX;
    const rZ = e.rotZ + wobbleZ;

    const cX = Math.cos(rX), sX = Math.sin(rX);
    const cZ = Math.cos(rZ), sZ = Math.sin(rZ);
    const y1 = cy * cX;
    const z1 = cy * sX;
    const x2 = cx * cZ - y1 * sZ;
    const y2 = cx * sZ + y1 * cZ;

    e.mesh.position.set(x2, y2, z1);

    // ── Trail: exponential decay with flicker ───
    const p = e.tPos;
    const c = e.tColor;
    const col = new THREE.Color(orbCfg.color || 0x3b82f6);

    // Shift buffer
    for (let i = p.length - 3; i >= 3; i -= 3) {
      p[i] = p[i - 3]; p[i + 1] = p[i - 2]; p[i + 2] = p[i - 1];
    }
    // Shift colors
    for (let i = c.length - 4; i >= 4; i -= 4) {
      c[i] = c[i - 4]; c[i + 1] = c[i - 3]; c[i + 2] = c[i - 2]; c[i + 3] = c[i - 1];
    }

    // Head position
    p[0] = x2; p[1] = y2; p[2] = z1;

    // Recompute all vertex alphas with exponential decay + flicker
    e.tCount = Math.min(e.tCount + 1, TRAIL_LEN);
    const flicker = e.trailFlicker + Math.sin(t * 8 + e.seed) * 0.15;
    for (let i = 0; i < e.tCount; i++) {
      const frac = i / TRAIL_LEN;                // 0 = newest, 1 = oldest
      const expDecay = Math.exp(-frac * 3.5);    // exponential falloff
      const alpha = expDecay * 0.7 * flicker;
      c[i * 4]     = col.r;
      c[i * 4 + 1] = col.g;
      c[i * 4 + 2] = col.b;
      c[i * 4 + 3] = Math.max(0, alpha);
    }

    e.trail.geometry.attributes.position.needsUpdate = true;
    e.trail.geometry.attributes.color.needsUpdate    = true;
    e.trail.geometry.setDrawRange(0, e.tCount);
  });

  // ── Labels (depth fade) ───────────────────────
  labelEls.forEach(function (el, i) {
    const cfg = LABELS[i];
    if (!cfg) return;
    const oc = ORBITS[cfg.orbit];
    const la = cfg.angle;
    const lx = Math.cos(la) * oc.rx;
    const ly = Math.sin(la) * oc.ry;
    const cX = Math.cos(oc.rotX), sX = Math.sin(oc.rotX);
    const cZ = Math.cos(oc.rotZ), sZ = Math.sin(oc.rotZ);
    const y1 = ly * cX; const z1 = ly * sX;
    const x2 = lx * cZ - y1 * sZ;
    const y2 = lx * sZ + y1 * cZ;

    const v = new THREE.Vector3(x2, y2, z1);
    v.applyMatrix4(scene.matrixWorld);
    v.project(camera);

    el.style.left    = ((v.x * 0.5 + 0.5) * SIZE) + 'px';
    el.style.top     = ((-v.y * 0.5 + 0.5) * SIZE) + 'px';
    el.style.opacity = THREE.MathUtils.clamp(1.0 - v.z * 0.6, 0.15, 1).toFixed(2);
  });

  composer.render();
}
