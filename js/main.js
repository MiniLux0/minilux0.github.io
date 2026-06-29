/* ============================================
   Minilux Portfolio — Main Script v3
   ============================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // ============================================
  // Custom Cursor — Canvas Particle Trail
  // ============================================
  var cursorCanvas = document.getElementById('cursor-canvas');
  var cursorCtx = cursorCanvas ? cursorCanvas.getContext('2d') : null;
  var cWidth, cHeight, cDpr;
  var cursorX = -100, cursorY = -100;
  var cursorHovering = false;
  var cursorDotRadius = 2.5;
  var cursorDotTarget = 2.5;
  var trailParticles = [];
  var TRAIL_MAX = 30;
  var TRAIL_LIFETIME = 600;
  var lastTrailSpawn = 0;
  var TRAIL_SPAWN_INTERVAL = 16;

  function resizeCursorCanvas() {
    if (!cursorCanvas || !cursorCtx) return;
    cDpr = Math.min(window.devicePixelRatio || 1, 2);
    cWidth = window.innerWidth;
    cHeight = window.innerHeight;
    cursorCanvas.width = cWidth * cDpr;
    cursorCanvas.height = cHeight * cDpr;
    cursorCanvas.style.width = cWidth + 'px';
    cursorCanvas.style.height = cHeight + 'px';
    cursorCtx.setTransform(cDpr, 0, 0, cDpr, 0, 0);
  }

  function spawnTrailParticle(x, y) {
    if (trailParticles.length >= TRAIL_MAX) return;
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.2 + Math.random() * 0.6;
    trailParticles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(angle) * speed * 0.5,
      vy: -0.4 - Math.random() * 0.8,
      r: 3 + Math.random() * 3,
      born: performance.now(),
      life: TRAIL_LIFETIME + Math.random() * 100,
    });
  }

  function drawCursor(now) {
    if (!cursorCtx) return;
    cursorCtx.clearRect(0, 0, cWidth, cHeight);

    for (var i = trailParticles.length - 1; i >= 0; i--) {
      var p = trailParticles[i];
      var age = now - p.born;
      if (age > p.life) { trailParticles.splice(i, 1); continue; }

      var t = age / p.life;
      var alpha = (1 - t) * 0.9;
      var r = p.r * (1 - t * 0.4);
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.003;

      var mixR = Math.round(59 + (13 - 59) * t);
      var mixG = Math.round(130 + (148 - 130) * t);
      var mixB = Math.round(246 + (136 - 246) * t);

      cursorCtx.shadowColor = 'rgba(' + mixR + ',' + mixG + ',' + mixB + ',' + (alpha * 0.6) + ')';
      cursorCtx.shadowBlur = 8;
      cursorCtx.beginPath();
      cursorCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      cursorCtx.fillStyle = 'rgba(' + mixR + ',' + mixG + ',' + mixB + ',' + alpha + ')';
      cursorCtx.fill();
      cursorCtx.shadowBlur = 0;
    }

    cursorDotRadius += (cursorDotTarget - cursorDotRadius) * 0.2;
    var dotGlow = cursorHovering ? 18 : 8;
    var dotAlpha = cursorHovering ? 1 : 0.9;

    cursorCtx.shadowColor = 'rgba(59, 130, 246, 0.6)';
    cursorCtx.shadowBlur = dotGlow;
    cursorCtx.beginPath();
    cursorCtx.arc(cursorX, cursorY, cursorDotRadius, 0, Math.PI * 2);
    cursorCtx.fillStyle = 'rgba(59, 130, 246, ' + dotAlpha + ')';
    cursorCtx.fill();
    cursorCtx.shadowBlur = 0;
  }

  if (!prefersReducedMotion && !isCoarsePointer && cursorCanvas && cursorCtx) {
    resizeCursorCanvas();
    window.addEventListener('resize', resizeCursorCanvas);
    document.addEventListener('mousemove', function (e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      var now = performance.now();
      if (now - lastTrailSpawn > TRAIL_SPAWN_INTERVAL) {
        spawnTrailParticle(cursorX, cursorY);
        lastTrailSpawn = now;
      }
    });
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .card, .skill-tag, .contact__link')) {
        cursorHovering = true;
        cursorDotTarget = 4;
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .card, .skill-tag, .contact__link')) {
        cursorHovering = false;
        cursorDotTarget = 2.5;
      }
    });
    window._drawCursor = drawCursor;
  }


  // ============================================
  // Wave Function Canvas
  // ============================================
  var waveCanvas = document.getElementById('wave-canvas');
  var waveCtx = waveCanvas ? waveCanvas.getContext('2d') : null;
  var wWidth, wHeight, wDpr;
  var mouseX = 0.5, mouseY = 0.5;

  function resizeWaveCanvas() {
    if (!waveCanvas || !waveCtx) return;
    wDpr = Math.min(window.devicePixelRatio || 1, 2);
    wWidth = waveCanvas.clientWidth;
    wHeight = waveCanvas.clientHeight;
    waveCanvas.width = wWidth * wDpr;
    waveCanvas.height = wHeight * wDpr;
    waveCtx.scale(wDpr, wDpr);
  }

  function drawWave(time) {
    if (!waveCtx) return;
    waveCtx.clearRect(0, 0, wWidth, wHeight);

    var centerY = wHeight * 0.5;
    var mouseOffset = (mouseX - 0.5) * 50;
    var mouseAmpMod = 1 + (mouseY - 0.5) * 0.4;

    var layers = [
      { amp: 90,  freq: 0.006, speed: 0.0006, alpha: 0.35, width: 2.2, color: '59,130,246' },
      { amp: 65,  freq: 0.01,  speed: 0.001,  alpha: 0.28, width: 1.8, color: '59,130,246' },
      { amp: 45,  freq: 0.015, speed: 0.0018, alpha: 0.22, width: 1.4, color: '20,184,166' },
      { amp: 30,  freq: 0.022, speed: 0.0025, alpha: 0.15, width: 1,   color: '20,184,166' },
      { amp: 110, freq: 0.004, speed: 0.0004, alpha: 0.12, width: 2.5, color: '59,130,246' },
    ];

    layers.forEach(function (layer) {
      waveCtx.beginPath();
      waveCtx.strokeStyle = 'rgba(' + layer.color + ', ' + layer.alpha + ')';
      waveCtx.lineWidth = layer.width;
      waveCtx.shadowColor = 'rgba(' + layer.color + ', 0.3)';
      waveCtx.shadowBlur = 8;
      for (var x = 0; x <= wWidth; x += 2) {
        var y = centerY
          + Math.sin(x * layer.freq + time * layer.speed) * layer.amp * mouseAmpMod
          + Math.sin(x * layer.freq * 0.5 + time * layer.speed * 1.5) * layer.amp * 0.35
          + Math.sin(x * layer.freq * 2.5 + time * layer.speed * 0.7) * layer.amp * 0.12
          + mouseOffset * Math.sin(x * 0.003 + time * 0.0003);
        if (x === 0) waveCtx.moveTo(x, y);
        else waveCtx.lineTo(x, y);
      }
      waveCtx.stroke();
      waveCtx.shadowBlur = 0;
    });

    var particleCount = 28;
    for (var i = 0; i < particleCount; i++) {
      var px = (wWidth / particleCount) * i + (time * 0.04) % (wWidth / particleCount);
      var py = centerY
        + Math.sin(px * 0.008 + time * 0.001) * 70 * mouseAmpMod
        + Math.sin(px * 0.004 + time * 0.0015) * 30
        + mouseOffset * Math.sin(px * 0.003);
      var pulse = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.002 + i * 0.5));
      waveCtx.beginPath();
      waveCtx.arc(px, py, 2.5 * pulse, 0, Math.PI * 2);
      waveCtx.fillStyle = 'rgba(59, 130, 246, ' + (0.5 * pulse) + ')';
      waveCtx.fill();
      waveCtx.beginPath();
      waveCtx.arc(px, py, 6 * pulse, 0, Math.PI * 2);
      waveCtx.strokeStyle = 'rgba(59, 130, 246, ' + (0.12 * pulse) + ')';
      waveCtx.lineWidth = 0.5;
      waveCtx.stroke();
    }
  }


  // ============================================
  // Particle Network Canvas
  // ============================================
  var particleCanvas = document.getElementById('particle-canvas');
  var particleCtx = particleCanvas ? particleCanvas.getContext('2d') : null;
  var pWidth, pHeight, pDpr;
  var netParticles = [];
  var PARTICLE_COUNT = 60;
  var CONNECTION_DIST = 140;

  function resizeParticleCanvas() {
    if (!particleCanvas || !particleCtx) return;
    pDpr = Math.min(window.devicePixelRatio || 1, 2);
    pWidth = particleCanvas.clientWidth;
    pHeight = particleCanvas.clientHeight;
    particleCanvas.width = pWidth * pDpr;
    particleCanvas.height = pHeight * pDpr;
    particleCtx.scale(pDpr, pDpr);
    initNetParticles();
  }

  function initNetParticles() {
    netParticles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      netParticles.push({
        x: Math.random() * pWidth, y: Math.random() * pHeight,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      });
    }
  }

  function drawNetParticles() {
    if (!particleCtx) return;
    particleCtx.clearRect(0, 0, pWidth, pHeight);
    for (var i = 0; i < netParticles.length; i++) {
      var p = netParticles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = pWidth; if (p.x > pWidth) p.x = 0;
      if (p.y < 0) p.y = pHeight; if (p.y > pHeight) p.y = 0;
    }
    for (var i = 0; i < netParticles.length; i++) {
      for (var j = i + 1; j < netParticles.length; j++) {
        var dx = netParticles[i].x - netParticles[j].x;
        var dy = netParticles[i].y - netParticles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          particleCtx.beginPath();
          particleCtx.moveTo(netParticles[i].x, netParticles[i].y);
          particleCtx.lineTo(netParticles[j].x, netParticles[j].y);
          particleCtx.strokeStyle = 'rgba(59, 130, 246, ' + alpha + ')';
          particleCtx.lineWidth = 0.6;
          particleCtx.stroke();
        }
      }
    }
    for (var i = 0; i < netParticles.length; i++) {
      particleCtx.beginPath();
      particleCtx.arc(netParticles[i].x, netParticles[i].y, netParticles[i].r, 0, Math.PI * 2);
      particleCtx.fillStyle = 'rgba(59, 130, 246, 0.35)';
      particleCtx.fill();
    }
  }


  // ============================================
  // 3D Atom — Three.js (Enhanced)
  // ============================================
  var atomCanvas = document.getElementById('atom-canvas');
  var atomRenderer, atomScene, atomCamera;
  var atomElectrons = [];
  var atomOrbitMeshes = [];
  var atomLabelEls = [];
  var atomDrag = { active: false, startX: 0, startY: 0 };
  var atomMouse = { x: 0, y: 0 };       // Normalized mouse for parallax
  var atomTargetRot = { x: 0, y: 0 };   // Smoothed rotation from mouse
  var ATOM_SIZE = 400;
  var TRAIL_LENGTH = 18;                 // Positions stored per electron

  var ATOM_LABELS_DATA = [
    { text: 'Computational Physics', orbit: 0, angle: 0.8 },
    { text: 'Quantum Computing',     orbit: 1, angle: 2.5 },
    { text: 'Machine Learning',      orbit: 2, angle: 4.2 },
  ];

  // Orbit configurations — 3 distinct planes with multi-axis tilt
  var ORBIT_CONFIGS = [
    { rx: 2.0, ry: 1.2, rotX: 0.15,               rotZ: 0,                speed: 0.4,  color: 0x3b82f6 },
    { rx: 1.8, ry: 1.1, rotX: Math.PI / 3,         rotZ: Math.PI / 6,      speed: 0.55, color: 0x38bdf8 },
    { rx: 2.2, ry: 1.3, rotX: Math.PI * 2 / 3,     rotZ: -Math.PI / 5,     speed: 0.35, color: 0x60a5fa },
  ];

  function initAtom() {
    if (!atomCanvas || typeof THREE === 'undefined') return;

    // Renderer with tone mapping for better glow
    atomRenderer = new THREE.WebGLRenderer({ canvas: atomCanvas, alpha: true, antialias: true });
    atomRenderer.setSize(ATOM_SIZE, ATOM_SIZE);
    atomRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    atomRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    atomRenderer.toneMappingExposure = 1.2;

    atomScene = new THREE.Scene();
    atomCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    atomCamera.position.set(0, 0, 6);

    // --- Lighting ---
    // Cool ambient for base fill
    atomScene.add(new THREE.AmbientLight(0x0a1628, 0.6));
    // Key light from above-right
    var keyLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    keyLight.position.set(3, 4, 5);
    atomScene.add(keyLight);
    // Subtle rim light from below
    var rimLight = new THREE.DirectionalLight(0x14b8a6, 0.2);
    rimLight.position.set(-2, -3, 2);
    atomScene.add(rimLight);

    // --- Nucleus (layered glow) ---
    // Core sphere
    var coreGeo = new THREE.SphereGeometry(0.22, 32, 32);
    var coreMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.4,
    });
    var core = new THREE.Mesh(coreGeo, coreMat);
    atomScene.add(core);

    // Inner glow shell (additive blending)
    var glowInnerGeo = new THREE.SphereGeometry(0.35, 32, 32);
    var glowInnerMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    atomScene.add(new THREE.Mesh(glowInnerGeo, glowInnerMat));

    // Outer glow shell
    var glowOuterGeo = new THREE.SphereGeometry(0.55, 32, 32);
    var glowOuterMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    atomScene.add(new THREE.Mesh(glowOuterGeo, glowOuterMat));

    // Point light at nucleus center
    var nucleusLight = new THREE.PointLight(0x3b82f6, 2.5, 6);
    nucleusLight.position.set(0, 0, 0);
    atomScene.add(nucleusLight);

    // --- Orbit rings + Electrons + Trails ---
    ORBIT_CONFIGS.forEach(function (cfg) {
      // Orbit ring — higher segment count for smoothness
      var curve = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, 2 * Math.PI, false, 0);
      var points2D = curve.getPoints(160);
      var path3D = new THREE.CatmullRomCurve3(
        points2D.map(function (p) { return new THREE.Vector3(p.x, p.y, 0); }),
        true
      );
      var tubeGeo = new THREE.TubeGeometry(path3D, 160, 0.008, 6, true);
      var tubeMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      var tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.x = cfg.rotX;
      tube.rotation.z = cfg.rotZ;
      atomScene.add(tube);
      atomOrbitMeshes.push(tube);

      // Electrons — 3 per orbit with trails
      for (var e = 0; e < 3; e++) {
        // Electron sphere
        var eGeo = new THREE.SphereGeometry(0.065, 16, 16);
        var eMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: cfg.color,
          emissiveIntensity: 1.0,
          metalness: 0.1,
          roughness: 0.3,
        });
        var electron = new THREE.Mesh(eGeo, eMat);

        // Per-electron point light (soft, short range)
        var eLight = new THREE.PointLight(cfg.color, 0.6, 1.5);
        electron.add(eLight);
        atomScene.add(electron);

        // Trail line (stores last N positions)
        var trailPositions = new Float32Array(TRAIL_LENGTH * 3);
        var trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        trailGeo.setDrawRange(0, 0);
        var trailMat = new THREE.LineBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          linewidth: 1,
        });
        var trailLine = new THREE.Line(trailGeo, trailMat);
        atomScene.add(trailLine);

        atomElectrons.push({
          mesh: electron,
          trailLine: trailLine,
          trailPositions: trailPositions,
          trailIdx: 0,
          trailCount: 0,
          rx: cfg.rx,
          ry: cfg.ry,
          rotX: cfg.rotX,
          rotZ: cfg.rotZ,
          speed: cfg.speed,
          offset: (e / 3) * Math.PI * 2,
        });
      }
    });

    // Label DOM elements (exclude nucleus label)
    atomLabelEls = document.querySelectorAll('.atom-label:not(.atom-label--nucleus)');

    // --- Mouse drag rotate ---
    atomCanvas.addEventListener('mousedown', function (e) {
      atomDrag.active = true;
      atomDrag.startX = e.clientX;
      atomDrag.startY = e.clientY;
    });
    document.addEventListener('mousemove', function (e) {
      if (!atomDrag.active) return;
      var dx = e.clientX - atomDrag.startX;
      var dy = e.clientY - atomDrag.startY;
      atomTargetRot.y += dx * 0.006;
      atomTargetRot.x += dy * 0.006;
      atomDrag.startX = e.clientX;
      atomDrag.startY = e.clientY;
    });
    document.addEventListener('mouseup', function () {
      atomDrag.active = false;
    });

    // --- Mouse parallax (when not dragging) ---
    document.addEventListener('mousemove', function (e) {
      atomMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      atomMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  function updateAtom(time) {
    if (!atomRenderer || !atomScene || !atomCamera) return;

    var t = time * 0.001;

    // --- Auto-rotate + mouse parallax ---
    // Base auto-rotation
    atomTargetRot.y += 0.003;

    // Add subtle mouse-driven offset when not dragging
    if (!atomDrag.active) {
      atomTargetRot.x += (atomMouse.y * 0.15 - atomTargetRot.x) * 0.02;
      atomTargetRot.y += (atomMouse.x * 0.1 - atomTargetRot.y % (Math.PI * 2)) * 0.005;
    }

    // Smooth scene rotation
    atomScene.rotation.x += (atomTargetRot.x - atomScene.rotation.x) * 0.06;
    atomScene.rotation.y += (atomTargetRot.y - atomScene.rotation.y) * 0.06;

    // Subtle camera parallax
    atomCamera.position.x += (atomMouse.x * 0.3 - atomCamera.position.x) * 0.03;
    atomCamera.position.y += (atomMouse.y * 0.2 - atomCamera.position.y) * 0.03;
    atomCamera.lookAt(0, 0, 0);

    // --- Nucleus pulse ---
    var pulse = 1 + Math.sin(t * 2) * 0.04;
    atomScene.children.forEach(function (child) {
      if (child.geometry && child.geometry.parameters &&
          child.geometry.parameters.radius === 0.22) {
        child.scale.setScalar(pulse);
      }
    });

    // --- Animate electrons + update trails ---
    atomElectrons.forEach(function (e) {
      var angle = t * e.speed + e.offset;

      // Position on the ellipse, then rotate by orbit's rotX and rotZ
      var x = Math.cos(angle) * e.rx;
      var y = Math.sin(angle) * e.ry;
      var z = 0;

      // Apply orbit rotation (rotX around X, rotZ around Z)
      var cosX = Math.cos(e.rotX), sinX = Math.sin(e.rotX);
      var cosZ = Math.cos(e.rotZ), sinZ = Math.sin(e.rotZ);

      // Rotate around X
      var y1 = y * cosX - z * sinX;
      var z1 = y * sinX + z * cosX;
      // Rotate around Z
      var x2 = x * cosZ - y1 * sinZ;
      var y2 = x * sinZ + y1 * cosZ;

      e.mesh.position.set(x2, y2, z1);

      // --- Update trail buffer ---
      var pa = e.trailPositions;
      // Shift old positions forward
      for (var i = pa.length - 3; i >= 3; i -= 3) {
        pa[i]     = pa[i - 3];
        pa[i + 1] = pa[i - 2];
        pa[i + 2] = pa[i - 1];
      }
      // Write new head position
      pa[0] = x2;
      pa[1] = y2;
      pa[2] = z1;

      e.trailCount = Math.min(e.trailCount + 1, TRAIL_LENGTH);
      e.trailLine.geometry.attributes.position.needsUpdate = true;
      e.trailLine.geometry.setDrawRange(0, e.trailCount);

      // Fade trail opacity based on electron speed (faster = more visible)
      e.trailLine.material.opacity = 0.25 + e.speed * 0.25;
    });

    // --- Update label screen positions with depth-based opacity ---
    atomLabelEls.forEach(function (el, idx) {
      var cfg = ATOM_LABELS_DATA[idx];
      if (!cfg) return;
      var oc = ORBIT_CONFIGS[cfg.orbit];
      if (!oc) return;

      var la = cfg.angle;
      var lx = Math.cos(la) * oc.rx;
      var ly = Math.sin(la) * oc.ry;
      var lz = 0;

      // Apply same rotation as orbits
      var cosX = Math.cos(oc.rotX), sinX = Math.sin(oc.rotX);
      var cosZ = Math.cos(oc.rotZ), sinZ = Math.sin(oc.rotZ);
      var ly1 = ly * cosX - lz * sinX;
      var lz1 = ly * sinX + lz * cosX;
      var lx2 = lx * cosZ - ly1 * sinZ;
      var ly2 = lx * sinZ + ly1 * cosZ;

      var vec = new THREE.Vector3(lx2, ly2, lz1);
      vec.applyMatrix4(atomScene.matrixWorld);
      vec.project(atomCamera);

      var x = (vec.x * 0.5 + 0.5) * ATOM_SIZE;
      var y = (-vec.y * 0.5 + 0.5) * ATOM_SIZE;

      // Depth-based opacity (z after projection: closer = smaller z)
      var depthAlpha = THREE.MathUtils.clamp(1.0 - (vec.z * 0.6), 0.15, 1.0);

      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.opacity = depthAlpha.toFixed(2);
    });

    atomRenderer.render(atomScene, atomCamera);
  }


  // ============================================
  // Animation Loop
  // ============================================
  function animateAll(time) {
    drawWave(time);
    drawNetParticles();
    updateAtom(time);
    if (window._drawCursor) window._drawCursor(time);
    requestAnimationFrame(animateAll);
  }

  if (!prefersReducedMotion) {
    resizeWaveCanvas();
    resizeParticleCanvas();
    initAtom();
    window.addEventListener('resize', function () {
      resizeWaveCanvas();
      resizeParticleCanvas();
    });
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });
    animateAll(0);
  } else {
    if (waveCanvas && waveCtx) { resizeWaveCanvas(); drawWave(0); }
    if (particleCanvas && particleCtx) { resizeParticleCanvas(); drawNetParticles(); }
    initAtom();
    updateAtom(0);
  }


  // ============================================
  // Hero Typing Effect
  // ============================================
  var subtitleEl = document.querySelector('.hero__subtitle');
  if (subtitleEl && !prefersReducedMotion) {
    var fullText = subtitleEl.textContent;
    subtitleEl.textContent = '';
    var cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    subtitleEl.appendChild(cursorSpan);

    var charIdx = 0;
    function typeNext() {
      if (charIdx < fullText.length) {
        subtitleEl.insertBefore(
          document.createTextNode(fullText.charAt(charIdx)),
          cursorSpan
        );
        charIdx++;
        setTimeout(typeNext, 50);
      } else {
        // Remove cursor after typing finishes
        setTimeout(function () {
          cursorSpan.style.animation = 'none';
          cursorSpan.style.opacity = '0';
        }, 2000);
      }
    }
    // Start typing after a short delay
    setTimeout(typeNext, 800);
  }


  // ============================================
  // Scroll to Top Button
  // ============================================
  var scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ============================================
  // Mobile Nav Toggle
  // ============================================
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }


  // ============================================
  // Active Nav Highlight on Scroll
  // ============================================
  var sections = document.querySelectorAll('.section, .hero');
  var navLinkEls = document.querySelectorAll('.nav__link');

  function updateActiveNav() {
    var current = '';
    var scrollY = window.scrollY + 120;
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) current = section.id;
    });
    navLinkEls.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();


  // ============================================
  // Nav Frosted Glass on Scroll
  // ============================================
  var nav = document.getElementById('nav');

  function updateNavBg() {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }

  window.addEventListener('scroll', updateNavBg, { passive: true });
  updateNavBg();


  // ============================================
  // Scroll Reveal — Sections
  // ============================================
  if (!prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.section__inner').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.section__inner').forEach(function (el) {
      el.classList.add('visible');
    });
  }


  // ============================================
  // Section Title Underline Animation
  // ============================================
  if (!prefersReducedMotion) {
    var titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('animated');
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.section__title').forEach(function (el) {
      titleObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.section__title').forEach(function (el) {
      el.classList.add('animated');
    });
  }


  // ============================================
  // Skill Tags — Stagger Fade In
  // ============================================
  if (!prefersReducedMotion) {
    var tagObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var tags = entry.target.querySelectorAll('.skill-tag');
          tags.forEach(function (tag, index) {
            setTimeout(function () { tag.classList.add('visible'); }, index * 80);
          });
          tagObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.skills__tags').forEach(function (el) {
      tagObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.skill-tag').forEach(function (el) {
      el.classList.add('visible');
    });
  }

})();
