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
  var MAX_SPEED = 0.5;   // Maximum particle speed
  var CURSOR_RADIUS = 40; // Distance to trigger message

  // Physics/science messages for particle hover
  var MESSAGES = [
    'E = mc²', '∇×B = μ₀J', 'F = ma', 'ΔS ≥ 0',
    'iℏ∂ψ/∂t = Ĥψ', 'F = q(E + v×B)', '∇·E = ρ/ε₀',
    'd/dt(∂L/∂q̇) = ∂L/∂q', 'S = k_B ln Ω', 'Ĥ|ψ⟩ = E|ψ⟩',
    '∇²φ = -ρ/ε₀', 'λ = h/p', 'pV = nRT', 'F = -kx',
    'Δx·Δp ≥ ℏ/2', 'dS/dt ≥ 0', 'c = 3×10⁸',
  ];
  var hoveredParticle = null;
  var messageAlpha = 0;
  var messageTimer = 0;

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
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 0.3 + 0.1;
      netParticles.push({
        x: Math.random() * pWidth, y: Math.random() * pHeight,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: Math.random() * 1.5 + 0.5,
        message: MESSAGES[i % MESSAGES.length],
        hovered: false,
        hoverAlpha: 0,
      });
    }
  }

  function drawNetParticles() {
    if (!particleCtx) return;
    particleCtx.clearRect(0, 0, pWidth, pHeight);

    // Get cursor position relative to particle canvas
    var rect = particleCanvas.getBoundingClientRect();
    var curX = cursorX - rect.left;
    var curY = cursorY - rect.top;

    // Find closest particle to cursor
    hoveredParticle = null;
    var minDist = CURSOR_RADIUS;

    for (var i = 0; i < netParticles.length; i++) {
      var p = netParticles[i];

      // Update position
      p.x += p.vx; p.y += p.vy;

      // Speed limit
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      // Wrap around
      if (p.x < 0) p.x = pWidth; if (p.x > pWidth) p.x = 0;
      if (p.y < 0) p.y = pHeight; if (p.y > pHeight) p.y = 0;

      // Check cursor proximity
      var dx = curX - p.x;
      var dy = curY - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        hoveredParticle = p;
      }

      // Smooth hover state
      if (p === hoveredParticle) {
        p.hoverAlpha = Math.min(1, p.hoverAlpha + 0.08);
      } else {
        p.hoverAlpha = Math.max(0, p.hoverAlpha - 0.04);
      }
    }

    var isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Draw connections
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
          particleCtx.strokeStyle = isLight ? 'rgba(30, 64, 175, ' + (alpha * 1.8) + ')' : 'rgba(59, 130, 246, ' + alpha + ')';
          particleCtx.lineWidth = 0.6;
          particleCtx.stroke();
        }
      }
    }

    // Draw dots + hover effects
    for (var i = 0; i < netParticles.length; i++) {
      var p = netParticles[i];

      // Glow when hovered
      if (p.hoverAlpha > 0) {
        particleCtx.save();
        particleCtx.globalAlpha = p.hoverAlpha * 0.4;
        particleCtx.shadowColor = isLight ? '#1e40af' : '#3b82f6';
        particleCtx.shadowBlur = 15;
        particleCtx.fillStyle = isLight ? '#1e40af' : '#3b82f6';
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
        particleCtx.fill();
        particleCtx.restore();
      }

      // Normal dot
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particleCtx.fillStyle = isLight ? 'rgba(30, 64, 175, 0.55)' : 'rgba(59, 130, 246, 0.35)';
      particleCtx.fill();

      // Message bubble
      if (p.hoverAlpha > 0.1) {
        particleCtx.save();
        particleCtx.globalAlpha = p.hoverAlpha * 0.9;

        // Background pill
        var msgW = particleCtx.measureText(p.message).width + 12;
        var msgH = 18;
        var msgX = p.x - msgW / 2;
        var msgY = p.y - p.r - msgH - 6;

        particleCtx.fillStyle = isLight ? 'rgba(238, 241, 246, 0.95)' : 'rgba(6, 10, 20, 0.85)';
        particleCtx.shadowColor = isLight ? 'rgba(30, 64, 175, 0.3)' : '#3b82f6';
        particleCtx.shadowBlur = 8;
        particleCtx.beginPath();
        particleCtx.roundRect(msgX, msgY, msgW, msgH, 4);
        particleCtx.fill();

        // Border
        particleCtx.shadowBlur = 0;
        particleCtx.strokeStyle = isLight ? 'rgba(30, 64, 175, 0.4)' : 'rgba(59, 130, 246, 0.4)';
        particleCtx.lineWidth = 0.5;
        particleCtx.stroke();

        // Text
        particleCtx.fillStyle = isLight ? '#1e40af' : '#60a5fa';
        particleCtx.font = '11px "JetBrains Mono", monospace';
        particleCtx.textAlign = 'center';
        particleCtx.textBaseline = 'middle';
        particleCtx.fillText(p.message, p.x, msgY + msgH / 2);

        particleCtx.restore();
      }
    }
  }


  // ============================================
  // 3D Atom — Pure Canvas 2D (Enhanced)
  // ============================================
  (function () {
    var canvas = document.getElementById('atom-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W = 400, H = 400;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var TRAIL_LEN = 30;       // Longer trails
    var CAM_DIST  = 6;
    var FOV       = 3.5;
    var AMBIENT_N = 40;       // Background ambient particles

    // Orbit configs
    var ORBITS = [
      { rx: 1.5, ry: 1.35, rotX: 0.2,            rotZ: 0,            speed: 0.40, color: '#3b82f6' },
      { rx: 1.5, ry: 1.35, rotX: Math.PI / 3,     rotZ: Math.PI / 6,  speed: 0.55, color: '#38bdf8' },
      { rx: 1.5, ry: 1.35, rotX: Math.PI * 2 / 3, rotZ: -Math.PI / 5, speed: 0.35, color: '#60a5fa' },
    ];

    // Ambient floating particles
    var ambientParticles = [];
    for (var i = 0; i < AMBIENT_N; i++) {
      ambientParticles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.3 + 0.05,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Electrons: 3 per orbit
    var electrons = [];
    ORBITS.forEach(function (cfg, oi) {
      for (var e = 0; e < 3; e++) {
        var seed = oi * 100 + e * 37 + 13;
        electrons.push({
          rx: cfg.rx, ry: cfg.ry,
          rotX: cfg.rotX, rotZ: cfg.rotZ,
          baseSpeed: cfg.speed,
          offset: (e / 3) * Math.PI * 2,
          seed: seed, color: cfg.color,
          rPertFreq1: 0.7 + Math.random() * 0.6,
          rPertAmp1:  0.08 + Math.random() * 0.07,
          rPertFreq2: 1.3 + Math.random() * 0.8,
          rPertAmp2:  0.04 + Math.random() * 0.04,
          speedVarFreq: 0.5 + Math.random() * 0.4,
          speedVarAmp:  0.12 + Math.random() * 0.08,
          trailFlicker: 0.8 + Math.random() * 0.4,
          trail: [],
        });
      }
    });

    // Rotation state
    var rotY = 0, rotX = 0;
    var targetRotY = 0, targetRotX = 0;
    var dragActive = false, dragSX = 0, dragSY = 0;
    var mouseX = 0, mouseY = 0;
    var pulseTime = -1, PULSE_DUR = 1.2;

    // ── 3D math helpers ─────────────────────────
    function rotateX(p, a) {
      var c = Math.cos(a), s = Math.sin(a);
      return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
    }
    function rotateY(p, a) {
      var c = Math.cos(a), s = Math.sin(a);
      return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
    }
    function rotateZ(p, a) {
      var c = Math.cos(a), s = Math.sin(a);
      return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
    }
    function project(p) {
      var z = p.z + CAM_DIST;
      if (z < 0.1) z = 0.1;
      var scale = FOV / z;
      return {
        x: W / 2 + p.x * scale * (W / 2),
        y: H / 2 - p.y * scale * (H / 2),
        z: p.z, scale: scale,
      };
    }
    function transformPoint(px, py, pz, oRX, oRZ, sRX, sRY) {
      var p = { x: px, y: py, z: pz };
      p = rotateX(p, oRX);
      p = rotateZ(p, oRZ);
      p = rotateX(p, sRX);
      p = rotateY(p, sRY);
      return p;
    }

    // ── Mouse interaction ───────────────────────
    canvas.addEventListener('mousedown', function (e) {
      dragActive = true; dragSX = e.clientX; dragSY = e.clientY;
    });
    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * -2 + 1;
      if (!dragActive) return;
      targetRotY += (e.clientX - dragSX) * 0.006;
      targetRotX += (e.clientY - dragSY) * 0.006;
      dragSX = e.clientX; dragSY = e.clientY;
    });
    document.addEventListener('mouseup', function () { dragActive = false; });
    canvas.addEventListener('click', function () { if (pulseTime < 0) pulseTime = 0; });

    // ── Draw helpers ────────────────────────────
    function drawGlowCircle(x, y, r, color, glowR, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur = glowR;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── Main render loop ────────────────────────
    function render(time) {
      var dt = 0.016;
      var t = time * 0.001;

      var isLight = document.documentElement.getAttribute('data-theme') === 'light';

      ctx.clearRect(0, 0, W, H);

      // ── Ambient particles ─────────────────────
      ambientParticles.forEach(function (ap) {
        ap.x += ap.vx; ap.y += ap.vy;
        if (ap.x < 0) ap.x = W; if (ap.x > W) ap.x = 0;
        if (ap.y < 0) ap.y = H; if (ap.y > H) ap.y = 0;
        var flicker = 0.5 + 0.5 * Math.sin(t * 1.5 + ap.pulse);
        ctx.save();
        ctx.globalAlpha = ap.alpha * flicker;
        ctx.fillStyle = isLight ? '#1e40af' : '#3b82f6';
        ctx.shadowColor = isLight ? '#1e40af' : '#3b82f6';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ap.x, ap.y, ap.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Pulse
      var pulseScale = 1;
      if (pulseTime >= 0) {
        pulseTime += dt;
        var pp = pulseTime / PULSE_DUR;
        if (pp >= 1) { pulseTime = -1; pp = 0; }
        pulseScale = 1 + 0.25 * Math.sin(pp * Math.PI) * (1 - pp);
      }

      // Smooth rotation
      targetRotY += 0.003;
      if (!dragActive) {
        targetRotX += (mouseY * 0.15 - targetRotX) * 0.02;
        targetRotY += (mouseX * 0.1 - targetRotY) * 0.005;
      }
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      // ── Draw orbit paths ──────────────────────
      ORBITS.forEach(function (orb) {
        var orbColor = orb.color;
        if (isLight) {
          if (orb.color === '#3b82f6') orbColor = '#1d4ed8';
          else if (orb.color === '#38bdf8') orbColor = '#0369a1';
          else if (orb.color === '#60a5fa') orbColor = '#1e3a8a';
        }

        // Glow pass (wider, fainter)
        ctx.save();
        ctx.strokeStyle = orbColor;
        ctx.globalAlpha = isLight ? 0.12 : 0.08;
        ctx.lineWidth = 4;
        ctx.shadowColor = orbColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        for (var i = 0; i <= 120; i++) {
          var a = (i / 120) * Math.PI * 2;
          var px = Math.cos(a) * orb.rx * pulseScale;
          var py = Math.sin(a) * orb.ry * pulseScale;
          var p3 = transformPoint(px, py, 0, orb.rotX, orb.rotZ, rotX, rotY);
          var p2 = project(p3);
          if (i === 0) ctx.moveTo(p2.x, p2.y); else ctx.lineTo(p2.x, p2.y);
        }
        ctx.closePath(); ctx.stroke(); ctx.restore();

        // Crisp pass
        ctx.save();
        ctx.strokeStyle = orbColor;
        ctx.globalAlpha = isLight ? 0.45 : 0.3;
        ctx.lineWidth = 1;
        ctx.shadowColor = orbColor;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        for (var i = 0; i <= 120; i++) {
          var a = (i / 120) * Math.PI * 2;
          var px = Math.cos(a) * orb.rx * pulseScale;
          var py = Math.sin(a) * orb.ry * pulseScale;
          var p3 = transformPoint(px, py, 0, orb.rotX, orb.rotZ, rotX, rotY);
          var p2 = project(p3);
          if (i === 0) ctx.moveTo(p2.x, p2.y); else ctx.lineTo(p2.x, p2.y);
        }
        ctx.closePath(); ctx.stroke(); ctx.restore();
      });

      // ── Electrons + trails ────────────────────
      var drawList = [];

      electrons.forEach(function (e) {
        var speedNoise = Math.sin(t * e.speedVarFreq + e.seed) * e.speedVarAmp;
        var angle = t * e.baseSpeed + speedNoise + e.offset;

        var rPert = Math.sin(t * e.rPertFreq1 + e.seed * 1.3) * e.rPertAmp1
                  + Math.sin(t * e.rPertFreq2 + e.seed * 2.9) * e.rPertAmp2;
        var rxP = (e.rx + rPert) * pulseScale;
        var ryP = (e.ry + rPert * 0.8) * pulseScale;

        var mouseProx = Math.max(0, 1 - Math.sqrt(mouseX * mouseX + mouseY * mouseY) / 1.5);
        var distortX = mouseProx * mouseX * 0.15;
        var distortY = mouseProx * mouseY * 0.12;

        var cx = Math.cos(angle) * rxP + distortX;
        var cy = Math.sin(angle) * ryP + distortY;

        var wobbleX = Math.sin(t * 0.3 + e.seed * 0.01) * 0.04;
        var wobbleZ = Math.cos(t * 0.25 + e.seed * 0.015) * 0.03;

        var p3 = transformPoint(cx, cy, 0, e.rotX + wobbleX, e.rotZ + wobbleZ, rotX, rotY);
        var p2 = project(p3);

        // Resolve electron color based on theme
        var electronColor = e.color;
        if (isLight) {
          if (e.color === '#3b82f6') electronColor = '#1d4ed8';
          else if (e.color === '#38bdf8') electronColor = '#0369a1';
          else if (e.color === '#60a5fa') electronColor = '#1e3a8a';
        }

        // Store trail
        e.trail.unshift({ x: p2.x, y: p2.y, z: p3.z });
        if (e.trail.length > TRAIL_LEN) e.trail.pop();

        // Draw trail with smooth curve + exponential decay
        if (e.trail.length > 2) {
          for (var i = 1; i < e.trail.length; i++) {
            var frac = i / TRAIL_LEN;
            var alpha = Math.exp(-frac * 2.8) * 0.7 * e.trailFlicker;
            if (alpha < 0.005) continue;
            var lw = 2.5 * (1 - frac * 0.6);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = electronColor;
            ctx.lineWidth = lw;
            ctx.shadowColor = electronColor;
            ctx.shadowBlur = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(e.trail[i - 1].x, e.trail[i - 1].y);
            ctx.lineTo(e.trail[i].x, e.trail[i].y);
            ctx.stroke();
            ctx.restore();
          }
        }

        drawList.push({ type: 'electron', x: p2.x, y: p2.y, z: p3.z, scale: p2.scale, color: electronColor });
      });

      // ── Nucleus ───────────────────────────────
      var nucPulse = 1 + Math.sin(t * 2) * 0.04 + Math.sin(t * 5.3) * 0.01;
      var nucScale = nucPulse * pulseScale;
      var nuc3 = rotateY(rotateX({ x: 0, y: 0, z: 0 }, rotX), rotY);
      var nuc2 = project(nuc3);
      drawList.push({ type: 'nucleus', x: nuc2.x, y: nuc2.y, z: nuc3.z, scale: nuc2.scale, r: nucScale });

      // Depth sort (far first)
      drawList.sort(function (a, b) { return (b.z + CAM_DIST) - (a.z + CAM_DIST); });

      // Draw sorted
      drawList.forEach(function (item) {
        if (item.type === 'nucleus') {
          var r = 8 * item.scale * item.r;
          if (isLight) {
            drawGlowCircle(item.x, item.y, r * 5, '#1e3a8a', 60, 0.05);
            drawGlowCircle(item.x, item.y, r * 3.5, '#1e40af', 45, 0.12);
            drawGlowCircle(item.x, item.y, r * 2.2, '#2563eb', 30, 0.25);
            drawGlowCircle(item.x, item.y, r * 1.4, '#3b82f6', 18, 0.5);
            drawGlowCircle(item.x, item.y, r, '#60a5fa', 12, 0.95);
            drawGlowCircle(item.x, item.y, r * 0.5, '#ffffff', 8, 0.8);
          } else {
            drawGlowCircle(item.x, item.y, r * 5, '#1e40af', 60, 0.03);
            drawGlowCircle(item.x, item.y, r * 3.5, '#3b82f6', 45, 0.07);
            drawGlowCircle(item.x, item.y, r * 2.2, '#3b82f6', 30, 0.15);
            drawGlowCircle(item.x, item.y, r * 1.4, '#60a5fa', 18, 0.4);
            drawGlowCircle(item.x, item.y, r, '#93c5fd', 12, 0.95);
            drawGlowCircle(item.x, item.y, r * 0.5, '#ffffff', 8, 0.6);
          }
        } else {
          var er = 3.5 * item.scale;
          if (isLight) {
            drawGlowCircle(item.x, item.y, er * 3, item.color, 16, 0.2);
            drawGlowCircle(item.x, item.y, er * 1.8, item.color, 10, 0.35);
            drawGlowCircle(item.x, item.y, er, '#1e3a8a', 8, 0.95);
          } else {
            drawGlowCircle(item.x, item.y, er * 3, item.color, 16, 0.1);
            drawGlowCircle(item.x, item.y, er * 1.8, item.color, 10, 0.25);
            drawGlowCircle(item.x, item.y, er, '#ffffff', 8, 0.95);
          }
        }
      });

      // ── Labels ────────────────────────────────
      var labelData = [
        { orbit: 0, angle: 0.8 },
        { orbit: 1, angle: 2.5 },
        { orbit: 2, angle: 4.2 },
      ];
      var labelEls = document.querySelectorAll('.atom-label:not(.atom-label--nucleus)');
      labelData.forEach(function (ld, i) {
        if (!labelEls[i]) return;
        var oc = ORBITS[ld.orbit];
        var lx = Math.cos(ld.angle) * oc.rx;
        var ly = Math.sin(ld.angle) * oc.ry;
        var p3 = transformPoint(lx, ly, 0, oc.rotX, oc.rotZ, rotX, rotY);
        var p2 = project(p3);
        var depthAlpha = Math.max(0.2, Math.min(1, 1 - p3.z * 0.25));
        if (!isNaN(p2.x) && !isNaN(p2.y)) {
          labelEls[i].style.left = p2.x + 'px';
          labelEls[i].style.top = p2.y + 'px';
          labelEls[i].style.opacity = depthAlpha.toFixed(2);
        }
      });

      if (atomActive) {
        requestAnimationFrame(render);
      }
    }

    var atomActive = false;
    var atomCanvas = document.getElementById('atom-canvas');
    if (atomCanvas) {
      var atomObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!atomActive) {
              atomActive = true;
              requestAnimationFrame(render);
            }
          } else {
            atomActive = false;
          }
        });
      }, { threshold: 0.05 });
      atomObserver.observe(atomCanvas);
    } else {
      atomActive = true;
      requestAnimationFrame(render);
    }
  })();


  // ============================================
  // Animation Loop (2D canvases)
  // ============================================
  var heroActive = true;

  function animateAll(time) {
    if (heroActive) {
      drawWave(time);
      drawNetParticles();
    }
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

    var heroSection = document.getElementById('hero');
    if (heroSection) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroActive = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    }
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;

      // Parallax in the hero section (depth effect up to 15px)
      var cx = e.clientX - window.innerWidth / 2;
      var cy = e.clientY - window.innerHeight / 2;
      var dx = cx / (window.innerWidth / 2);
      var dy = cy / (window.innerHeight / 2);

      var bgX = -15 * dx;
      var bgY = -15 * dy;
      var textX = -6 * dx;
      var textY = -6 * dy;

      var waveCanvas = document.getElementById('wave-canvas');
      var particleCanvas = document.getElementById('particle-canvas');
      var heroContent = document.querySelector('.hero__content');
      var heroGrid = document.querySelector('.hero__grid');
      var heroAurora = document.querySelector('.hero__aurora-wrap');

      if (waveCanvas) waveCanvas.style.transform = 'translate(' + bgX + 'px, ' + bgY + 'px)';
      if (particleCanvas) particleCanvas.style.transform = 'translate(' + bgX + 'px, ' + bgY + 'px)';
      if (heroGrid) heroGrid.style.transform = 'translate(' + (bgX * 0.5) + 'px, ' + (bgY * 0.5) + 'px)';
      if (heroAurora) heroAurora.style.transform = 'translate(' + (bgX * 0.8) + 'px, ' + (bgY * 0.8) + 'px)';
      if (heroContent) heroContent.style.transform = 'translate(' + textX + 'px, ' + textY + 'px)';
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
  // Navigation Event Handling (Mobile toggle & smooth scroll)
  // ============================================
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.querySelector('.nav__links');
  var nav = document.getElementById('nav');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // Intercept navigation link clicks for uniform smooth scrolling
  var navLinkEls = document.querySelectorAll('.nav__link');
  navLinkEls.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          // Close mobile nav menu
          if (navToggle && navLinks) {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
          }
          // Scroll smoothly to target element minus nav height
          var navHeight = nav ? nav.offsetHeight : 56;
          var targetOffset = targetEl.offsetTop - navHeight;
          window.scrollTo({
            top: targetOffset,
            behavior: 'smooth'
          });
          // Update URL hash without jumping
          history.pushState(null, null, targetId);
        }
      }
    });
  });


  // ============================================
  // Active Nav Highlight & Nav Frosted Glass on Scroll (Optimized)
  // ============================================
  var sections = document.querySelectorAll('.section, .hero');
  var navLinkEls = document.querySelectorAll('.nav__link');
  var nav = document.getElementById('nav');

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

  function updateNavBg() {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }

  // Combined scroll throttling using requestAnimationFrame
  var scrollTicking = false;
  function handleScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateActiveNav();
        updateNavBg();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateActiveNav();
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


  // ============================================
  // Loading Screen (Optimized delay)
  // ============================================
  var loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('hidden');
        // Reveal atom canvas after loader is completely faded out
        setTimeout(function () {
          var atomCanvas = document.getElementById('atom-canvas');
          if (atomCanvas) atomCanvas.classList.add('reveal');
        }, 600);
      }, 500);
    });
    // Fallback: hide after 3s even if load event doesn't fire
    setTimeout(function () {
      loader.classList.add('hidden');
      setTimeout(function () {
        var atomCanvas = document.getElementById('atom-canvas');
        if (atomCanvas) atomCanvas.classList.add('reveal');
      }, 600);
    }, 3000);
  }


  // ============================================
  // Bilingual Toggle (ES/EN - supports HTML content)
  // ============================================
  var langToggle = document.getElementById('lang-toggle');
  var langLabel = document.getElementById('lang-label');
  var currentLang = 'es';

  // Apply Spanish on load
  document.querySelectorAll('[data-en][data-es]').forEach(function (el) {
    el.innerHTML = el.getAttribute('data-es');
  });
  if (langLabel) langLabel.textContent = 'EN';
  document.documentElement.lang = 'es';

  if (langToggle) {
    langToggle.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'es' : 'en';
      if (langLabel) langLabel.textContent = currentLang === 'en' ? 'ES' : 'EN';

      document.querySelectorAll('[data-en][data-es]').forEach(function (el) {
        el.innerHTML = el.getAttribute('data-' + currentLang);
      });

      document.documentElement.lang = currentLang;
    });
  }


  // ============================================
  // Theme Toggle (Dark/Light)
  // ============================================
  var themeToggle = document.getElementById('theme-toggle');
  var iconDark = document.getElementById('theme-icon-dark');
  var iconLight = document.getElementById('theme-icon-light');
  var savedTheme = localStorage.getItem('theme') || 'dark';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (iconDark && iconLight) {
      iconDark.style.display = theme === 'dark' ? 'block' : 'none';
      iconLight.style.display = theme === 'light' ? 'block' : 'none';
    }
    localStorage.setItem('theme', theme);
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }


  // ============================================
  // Mobile Canvas Optimization
  // ============================================
  if (isCoarsePointer) {
    // Hide cursor canvas on touch devices
    if (cursorCanvas) cursorCanvas.style.display = 'none';
    // Reduce particle count for performance
    PARTICLE_COUNT = 20;
  }


  // ============================================
  // CV Download (placeholder alert)
  // ============================================
  var cvBtn = document.getElementById('cv-download');
  if (cvBtn) {
    cvBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Replace with actual CV file URL when ready
      alert('¡CV próximamente! Contáctame en github.com/MiniLux0 por ahora.');
    });
  }


  // ============================================
  // Blog Card Reveal Animation
  // ============================================
  if (!prefersReducedMotion) {
    var blogObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var cards = entry.target.querySelectorAll('.card');
          cards.forEach(function (card, index) {
            setTimeout(function () {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 120);
          });
          blogObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    var blogGrid = document.querySelector('.blog__grid');
    if (blogGrid) {
      blogGrid.querySelectorAll('.card').forEach(function (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s, transform 0.6s';
      });
      blogObserver.observe(blogGrid);
    }
  }

})();
