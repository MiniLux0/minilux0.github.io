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
  // 3D Atom — Three.js (Global, No Modules)
  // ============================================
  (function initAtom() {
    var canvas = document.getElementById('atom-canvas');
    if (!canvas || typeof THREE === 'undefined') {
      console.warn('[Atom] THREE not loaded or canvas missing');
      return;
    }
    console.log('[Atom] THREE loaded, initializing...');

    var SIZE = 400;
    var TRAIL_LEN = 24;

    // Orbit definitions
    var ORBITS = [
      { rx: 1.5, ry: 1.35, rotX: 0.2,            rotZ: 0,            baseSpeed: 0.40, color: 0x3b82f6 },
      { rx: 1.5, ry: 1.35, rotX: Math.PI / 3,     rotZ: Math.PI / 6,  baseSpeed: 0.55, color: 0x38bdf8 },
      { rx: 1.5, ry: 1.35, rotX: Math.PI * 2 / 3, rotZ: -Math.PI / 5, baseSpeed: 0.35, color: 0x60a5fa },
    ];

    var LABELS = [
      { orbit: 0, angle: 0.8 },
      { orbit: 1, angle: 2.5 },
      { orbit: 2, angle: 4.2 },
    ];

    // State
    var renderer, scene, camera;
    var electrons = [], orbitRings = [], labelEls = [], nucleusMesh = null, glowShells = [];
    var drag = { active: false, sx: 0, sy: 0 };
    var targetRot = { x: 0, y: 0 };
    var mouse = { x: 0, y: 0 };
    var pulseTime = -1, pulsePhase = 0;
    var PULSE_DUR = 1.2;

    // ── Create renderer ─────────────────────────
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(SIZE, SIZE);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    // ── Lighting ────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0a1628, 0.6));
    var keyLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0x14b8a6, 0.2);
    rimLight.position.set(-2, -3, 2);
    scene.add(rimLight);

    // ── Nucleus (layered glow) ──────────────────
    nucleusMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 1.2,
        metalness: 0.3, roughness: 0.4,
      })
    );
    scene.add(nucleusMesh);

    // Glow shells (additive blending for bloom-like effect)
    function addShell(r, op) {
      var m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x3b82f6, transparent: true, opacity: op,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      scene.add(m);
      glowShells.push(m);
    }
    addShell(0.35, 0.15);
    addShell(0.55, 0.06);

    scene.add(new THREE.PointLight(0x3b82f6, 2.5, 6));

    // ── Orbits + Electrons + Trails ─────────────
    ORBITS.forEach(function (cfg, oi) {
      // Orbit ring
      var curve  = new THREE.EllipseCurve(0, 0, cfg.rx, cfg.ry, 0, Math.PI * 2, false, 0);
      var pts2D  = curve.getPoints(160);
      var path3D = new THREE.CatmullRomCurve3(
        pts2D.map(function (p) { return new THREE.Vector3(p.x, p.y, 0); }), true
      );
      var ring = new THREE.Mesh(
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

      // 3 electrons per orbit
      for (var e = 0; e < 3; e++) {
        var eMat = new THREE.MeshStandardMaterial({
          color: 0xffffff, emissive: cfg.color, emissiveIntensity: 1.0,
          metalness: 0.1, roughness: 0.3,
        });
        var electron = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), eMat);
        electron.add(new THREE.PointLight(cfg.color, 0.6, 1.5));
        scene.add(electron);

        // Trail buffer (per-vertex color with alpha)
        var tPos   = new Float32Array(TRAIL_LEN * 3);
        var tColor = new Float32Array(TRAIL_LEN * 4);
        var tGeo   = new THREE.BufferGeometry();
        tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
        tGeo.setAttribute('color',    new THREE.BufferAttribute(tColor, 4));
        tGeo.setDrawRange(0, 0);
        var trail = new THREE.Line(tGeo, new THREE.LineBasicMaterial({
          vertexColors: true, transparent: true,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        scene.add(trail);

        var seed = oi * 100 + e * 37 + 13;
        electrons.push({
          mesh: electron, trail: trail, tPos: tPos, tColor: tColor, tCount: 0,
          rx: cfg.rx, ry: cfg.ry,
          rotX: cfg.rotX, rotZ: cfg.rotZ,
          baseSpeed: cfg.baseSpeed,
          offset: (e / 3) * Math.PI * 2,
          seed: seed,
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

    // ── Labels ──────────────────────────────────
    labelEls = document.querySelectorAll('.atom-label:not(.atom-label--nucleus)');

    // ── Mouse interaction ───────────────────────
    canvas.addEventListener('mousedown', function (e) {
      drag.active = true; drag.sx = e.clientX; drag.sy = e.clientY;
    });
    document.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth)  *  2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * -2 + 1;
      if (!drag.active) return;
      targetRot.y += (e.clientX - drag.sx) * 0.006;
      targetRot.x += (e.clientY - drag.sy) * 0.006;
      drag.sx = e.clientX; drag.sy = e.clientY;
    });
    document.addEventListener('mouseup', function () { drag.active = false; });
    canvas.addEventListener('click', function () { if (pulseTime < 0) pulseTime = 0; });

    console.log('[Atom] Initialized successfully');

    // ── Animation loop ──────────────────────────
    function animateAtom(time) {
      var dt = 0.016;
      var t  = time * 0.001;

      // Pulse
      var pulseScale = 1;
      if (pulseTime >= 0) {
        pulseTime += dt;
        pulsePhase = pulseTime / PULSE_DUR;
        if (pulsePhase >= 1) { pulseTime = -1; pulsePhase = 0; }
        pulseScale = 1 + 0.25 * Math.sin(pulsePhase * Math.PI) * (1 - pulsePhase);
      }

      // Scene rotation
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
        nucleusMesh.scale.setScalar((1 + Math.sin(t * 2) * 0.04 + Math.sin(t * 5.3) * 0.01) * pulseScale);
      }
      glowShells.forEach(function (shell, i) {
        shell.scale.setScalar((1 + i * 0.3) * pulseScale);
      });

      // Orbit ring wobble
      orbitRings.forEach(function (o) {
        o.mesh.rotation.x = o.baseRotX + Math.sin(t * 0.3 + o.oi * 2.1) * 0.04;
        o.mesh.rotation.z = o.baseRotZ + Math.cos(t * 0.25 + o.oi * 3.7) * 0.03;
      });

      // Mouse proximity
      var mouseProx = Math.max(0, 1 - Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y) / 1.5);

      // Electrons + trails
      electrons.forEach(function (e) {
        var speedNoise = Math.sin(t * e.speedVarFreq + e.seed) * e.speedVarAmp;
        var angle = t * (e.baseSpeed + speedNoise) + e.offset;

        var rPert = Math.sin(t * e.rPertFreq1 + e.seed * 1.3) * e.rPertAmp1
                  + Math.sin(t * e.rPertFreq2 + e.seed * 2.9) * e.rPertAmp2;
        var rxP = (e.rx + rPert) * pulseScale;
        var ryP = (e.ry + rPert * 0.8) * pulseScale;

        var distortX = mouseProx * mouse.x * 0.15;
        var distortY = mouseProx * mouse.y * 0.12;

        var cx = Math.cos(angle) * rxP + distortX;
        var cy = Math.sin(angle) * ryP + distortY;

        var wobbleX = Math.sin(t * 0.3 + e.seed * 0.01) * 0.04;
        var wobbleZ = Math.cos(t * 0.25 + e.seed * 0.015) * 0.03;
        var rX = e.rotX + wobbleX;
        var rZ = e.rotZ + wobbleZ;

        var cX = Math.cos(rX), sX = Math.sin(rX);
        var cZ = Math.cos(rZ), sZ = Math.sin(rZ);
        var y1 = cy * cX;
        var z1 = cy * sX;
        var x2 = cx * cZ - y1 * sZ;
        var y2 = cx * sZ + y1 * cZ;

        // Clamp to prevent NaN
        if (isNaN(x2)) x2 = 0;
        if (isNaN(y2)) y2 = 0;
        if (isNaN(z1)) z1 = 0;

        e.mesh.position.set(x2, y2, z1);

        // Trail: exponential decay with flicker
        var p = e.tPos;
        var c = e.tColor;
        var orbCfg = ORBITS[Math.floor(e.seed / 100)] || ORBITS[0];
        var col = new THREE.Color(orbCfg.color);

        for (var i = p.length - 3; i >= 3; i -= 3) {
          p[i] = p[i - 3]; p[i + 1] = p[i - 2]; p[i + 2] = p[i - 1];
        }
        for (var i = c.length - 4; i >= 4; i -= 4) {
          c[i] = c[i - 4]; c[i + 1] = c[i - 3]; c[i + 2] = c[i - 2]; c[i + 3] = c[i - 1];
        }
        p[0] = x2; p[1] = y2; p[2] = z1;

        e.tCount = Math.min(e.tCount + 1, TRAIL_LEN);
        var flicker = e.trailFlicker + Math.sin(t * 8 + e.seed) * 0.15;
        for (var i = 0; i < e.tCount; i++) {
          var frac = i / TRAIL_LEN;
          var expDecay = Math.exp(-frac * 3.5);
          c[i * 4]     = col.r;
          c[i * 4 + 1] = col.g;
          c[i * 4 + 2] = col.b;
          c[i * 4 + 3] = Math.max(0, expDecay * 0.7 * flicker);
        }
        e.trail.geometry.attributes.position.needsUpdate = true;
        e.trail.geometry.attributes.color.needsUpdate = true;
        e.trail.geometry.setDrawRange(0, e.tCount);
      });

      // Labels — project to screen
      labelEls.forEach(function (el, i) {
        var cfg = LABELS[i];
        if (!cfg) return;
        var oc = ORBITS[cfg.orbit];
        var la = cfg.angle;
        var lx = Math.cos(la) * oc.rx;
        var ly = Math.sin(la) * oc.ry;
        var cX = Math.cos(oc.rotX), sX = Math.sin(oc.rotX);
        var cZ = Math.cos(oc.rotZ), sZ = Math.sin(oc.rotZ);
        var y1 = ly * cX; var z1 = ly * sX;
        var x2 = lx * cZ - y1 * sZ;
        var y2 = lx * sZ + y1 * cZ;

        var v = new THREE.Vector3(x2, y2, z1);
        v.applyMatrix4(scene.matrixWorld);
        v.project(camera);

        var screenX = (v.x * 0.5 + 0.5) * SIZE;
        var screenY = (-v.y * 0.5 + 0.5) * SIZE;
        var depthAlpha = Math.max(0.15, Math.min(1, 1.0 - v.z * 0.6));

        if (!isNaN(screenX) && !isNaN(screenY)) {
          el.style.left    = screenX + 'px';
          el.style.top     = screenY + 'px';
          el.style.opacity = depthAlpha.toFixed(2);
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animateAtom);
    }

    // Start animation
    requestAnimationFrame(animateAtom);
  })();


  // ============================================
  // Animation Loop (2D canvases)
  // ============================================
  function animateAll(time) {
    drawWave(time);
    drawNetParticles();
    if (window._drawCursor) window._drawCursor(time);
    requestAnimationFrame(animateAll);
  }

  if (!prefersReducedMotion) {
    resizeWaveCanvas();
    resizeParticleCanvas();
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
