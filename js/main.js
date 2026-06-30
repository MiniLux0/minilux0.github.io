/* ============================================
   Minilux Portfolio — Main Script v3
   ============================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  var typingTimer = null;
  var heroMouseX = 0, heroMouseY = 0;
  var heroTargetX = 0, heroTargetY = 0;
  var isMobile = (window.innerWidth < 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var heroTime = 0;
  var lastHeroTime = null;

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

      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var trailRGB = isLight ? '0, 0, 0' : '255, 255, 255';
      cursorCtx.shadowColor = 'rgba(' + trailRGB + ', ' + (alpha * 0.4) + ')';
      cursorCtx.shadowBlur = 8;
      cursorCtx.beginPath();
      cursorCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
      cursorCtx.fillStyle = 'rgba(' + trailRGB + ', ' + (alpha * 0.6) + ')';
      cursorCtx.fill();
      cursorCtx.shadowBlur = 0;
    }

    cursorDotRadius += (cursorDotTarget - cursorDotRadius) * 0.2;
    var dotGlow = cursorHovering ? 18 : 8;
    var dotAlpha = cursorHovering ? 1 : 0.9;

    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var glowRGB = isLight ? '26, 26, 26' : '192, 192, 192';
    var cursorColor = isLight ? 'rgba(26, 26, 26, ' + dotAlpha + ')' : 'rgba(255, 255, 255, ' + dotAlpha + ')';
    cursorCtx.shadowColor = 'rgba(' + glowRGB + ', 0.6)';
    cursorCtx.shadowBlur = dotGlow;
    cursorCtx.beginPath();
    cursorCtx.arc(cursorX, cursorY, cursorDotRadius, 0, Math.PI * 2);
    cursorCtx.fillStyle = cursorColor;
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
  if (isMobile && waveCanvas) {
    waveCanvas.style.display = 'none';
  }
  var wWidth, wHeight, wDpr;
  var mouseX = 0.5, mouseY = 0.5;

  function resizeWaveCanvas() {
    if (!waveCanvas || !waveCtx || isMobile) return;
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

    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var waveRGB = isLight ? '0, 0, 0' : '255, 255, 255';
    var layers = [
      { amp: wHeight * 0.60, freq: 0.006, speed: 0.0006, alpha: 0.22, width: 2.2, phase: 0, color: waveRGB },
      { amp: wHeight * 0.42, freq: 0.01,  speed: 0.001,  alpha: 0.22, width: 2.2, phase: Math.PI * 0.3, color: waveRGB },
      { amp: wHeight * 0.32, freq: 0.008, speed: 0.00035, alpha: 0.22, width: 2.2, phase: Math.PI * 0.7, color: waveRGB },
    ];

    layers.forEach(function (layer) {
      waveCtx.beginPath();
      waveCtx.strokeStyle = 'rgba(' + layer.color + ', ' + layer.alpha + ')';
      waveCtx.lineWidth = layer.width;
      waveCtx.shadowColor = 'rgba(' + layer.color + ', 0.3)';
      waveCtx.shadowBlur = 8;
      for (var x = 0; x <= wWidth; x += 2) {
        var phase = layer.phase || 0;
        var y = centerY
          + Math.sin(x * layer.freq + time * layer.speed + phase) * layer.amp * mouseAmpMod
          + Math.sin(x * layer.freq * 0.5 + time * layer.speed * 1.5 + phase) * layer.amp * 0.35
          + Math.sin(x * layer.freq * 2.5 + time * layer.speed * 0.7 + phase) * layer.amp * 0.12
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
      waveCtx.fillStyle = 'rgba(' + waveRGB + ', ' + (0.05 * pulse) + ')';
      waveCtx.fill();
      waveCtx.beginPath();
      waveCtx.arc(px, py, 6 * pulse, 0, Math.PI * 2);
      waveCtx.strokeStyle = 'rgba(' + waveRGB + ', ' + (0.02 * pulse) + ')';
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
  var PARTICLE_COUNT = isMobile ? 24 : 60;
  var CONNECTION_DIST = 112;
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
        r: Math.random() * 1.6 + 2.0, // average 2.8px
        message: MESSAGES[i % MESSAGES.length],
        hovered: false,
        hoverAlpha: 0,
        offset: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawNetParticles(t) {
    if (!particleCtx) return;
    particleCtx.clearRect(0, 0, pWidth, pHeight);

    // Get cursor position relative to particle canvas
    var rect = particleCanvas.getBoundingClientRect();
    var curX = cursorX - rect.left;
    var curY = cursorY - rect.top;

    // Find closest particle to cursor
    hoveredParticle = null;
    var minDist = CURSOR_RADIUS;

    var speedMult = 1 + heroMouseX * 0.3;

    for (var i = 0; i < netParticles.length; i++) {
      var p = netParticles[i];

      // Update position with speed modifier and sinusoidal vertical wave
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult + Math.sin(t + p.offset) * 0.3;

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

    // Draw connections (with 0.28 connection line opacity)
    for (var i = 0; i < netParticles.length; i++) {
      for (var j = i + 1; j < netParticles.length; j++) {
        var dx = netParticles[i].x - netParticles[j].x;
        var dy = netParticles[i].y - netParticles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var alpha = (1 - dist / CONNECTION_DIST) * 0.28;
          particleCtx.beginPath();
          particleCtx.moveTo(netParticles[i].x, netParticles[i].y);
          particleCtx.lineTo(netParticles[j].x, netParticles[j].y);
          particleCtx.strokeStyle = isLight ? 'rgba(26, 26, 26, ' + (alpha * 1.8) + ')' : 'rgba(255, 255, 255, ' + alpha + ')';
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
        particleCtx.shadowColor = isLight ? '#1a1a1a' : '#c0c0c0';
        particleCtx.shadowBlur = 15;
        particleCtx.fillStyle = isLight ? '#1a1a1a' : '#c0c0c0';
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
        particleCtx.fill();
        particleCtx.restore();
      }

      // Normal dot
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particleCtx.fillStyle = isLight ? 'rgba(26, 26, 26, 0.85)' : 'rgba(255, 255, 255, 0.7)';
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
        particleCtx.shadowColor = isLight ? 'rgba(26, 26, 26, 0.3)' : '#c0c0c0';
        particleCtx.shadowBlur = 8;
        particleCtx.beginPath();
        particleCtx.roundRect(msgX, msgY, msgW, msgH, 4);
        particleCtx.fill();

        // Border
        particleCtx.shadowBlur = 0;
        particleCtx.strokeStyle = isLight ? 'rgba(26, 26, 26, 0.4)' : 'rgba(192, 192, 192, 0.4)';
        particleCtx.lineWidth = 0.5;
        particleCtx.stroke();
        // Text
        particleCtx.fillStyle = isLight ? '#1a1a1a' : '#ffffff';
        particleCtx.font = '11px "JetBrains Mono", monospace';
        particleCtx.textAlign = 'center';
        particleCtx.textBaseline = 'middle';
        particleCtx.fillText(p.message, p.x, msgY + msgH / 2);

        particleCtx.restore();
      }
    }
  }

  // ============================================
  // 3D Atom — Pure Canvas 2D
  // ============================================
  (function () {
    var canvas = document.getElementById('atom-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 400, height = 400; // logical dimensions (CSS pixels)

    // ResizeObserver to always occupy 100% of container
    var parent = canvas.parentElement || canvas;
    var resizeObserver = new ResizeObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        width = entry.contentRect.width || entry.target.clientWidth || 400;
        height = entry.contentRect.height || entry.target.clientHeight || 400;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    });
    resizeObserver.observe(parent);

    var CAM_DIST  = 3.5;
    var FOV       = 3.5;

    // Orbit configs: 3 orbits with angles of inclination (rotX, rotZ)
    var ORBITS = [
      { rotX: 0.0,            rotZ: 0.0,           speed: 0.60 }, // Orbit 1
      { rotX: Math.PI / 3,    rotZ: Math.PI / 6,   speed: 0.45 }, // Orbit 2
      { rotX: Math.PI / 6,    rotZ: Math.PI / 2,   speed: 0.55 }, // Orbit 3
    ];

    // Electrons: 1 electron per orbit
    var electrons = [];
    ORBITS.forEach(function (cfg, oi) {
      var seed = oi * 100 + 13;
      electrons.push({
        rotX: cfg.rotX, rotZ: cfg.rotZ,
        baseSpeed: cfg.speed,
        offset: seed * 0.5, // unique initial phase offset
        seed: seed,
        trail: [], // last 18 positions
      });
    });

    // Rotation state
    var rotY = 0; // global Y automatic rotation
    var extraRotX = 0, extraRotY = 0;
    var targetExtraRotX = 0, targetExtraRotY = 0;

    // Expanding shockwaves
    var shockwaves = [];
    var shockwaveTimer = 0;

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
    function project(p, cx, cy, rBase) {
      var z = p.z + CAM_DIST;
      if (z < 0.1) z = 0.1;
      var scale = FOV / z;
      return {
        x: cx + p.x * scale * rBase,
        y: cy - p.y * scale * rBase,
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

    // ── Mouse interaction for hover tilt lerp ───
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) - rect.width / 2;
      var my = (e.clientY - rect.top) - rect.height / 2;
      var ndx = mx / (rect.width / 2);
      var ndy = my / (rect.height / 2);
      targetExtraRotY = ndx * 0.3;  // max ±0.3 rad
      targetExtraRotX = -ndy * 0.3; // max ±0.3 rad
    });
    canvas.addEventListener('mouseleave', function () {
      targetExtraRotX = 0;
      targetExtraRotY = 0;
    });

    var lastTime = null;

    function scheduleNextFrame() {
      if (isMobile) {
        setTimeout(function () {
          requestAnimationFrame(render);
        }, 1000 / 30);
      } else {
        requestAnimationFrame(render);
      }
    }

    // ── Main render loop ────────────────────────
    function render(time) {
      if (lastTime === null) {
        lastTime = time;
        if (atomActive) {
          scheduleNextFrame();
        }
        return;
      }
      var delta = time - lastTime;
      lastTime = time;

      // Delta time clipping: max 32ms to prevent huge jumps when returning
      delta = Math.min(delta, 32);
      var dt = delta * 0.001;
      var t = time * 0.001;

      var cx = width / 2;
      var cy = height / 2;
      var rBase = Math.min(width, height) * 0.38;

      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var atomRGB = isLight ? '0, 0, 0' : '255, 255, 255';
      var coreColor = isLight ? '#000000' : '#ffffff';
      var orbitColor = isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.15)';
      var outerElectronColor = isLight ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.3)';
      var trailColorRGB = isLight ? '0, 0, 0' : '255, 255, 255';
      var maxTrailOpacity = isLight ? 0.4 : 0.5;

      ctx.clearRect(0, 0, width, height);

      // Auto rotation in Y
      rotY += 0.003;

      // Lerp mouse tilt at 4%
      extraRotX += (targetExtraRotX - extraRotX) * 0.04;
      extraRotY += (targetExtraRotY - extraRotY) * 0.04;

      var currentRotX = extraRotX;
      var currentRotY = rotY + extraRotY;

      // ── Update Shockwaves ─────────────────────
      shockwaveTimer += dt;
      if (shockwaveTimer >= 4.0) {
        // Pushes 2 shockwaves with 0.5s offset (using logic time delay)
        shockwaves.push({ age: 0 });
        shockwaves.push({ age: -0.5 });
        shockwaveTimer = 0;
      }
      shockwaves.forEach(function (wave) {
        wave.age += dt;
      });
      shockwaves = shockwaves.filter(function (wave) {
        return wave.age <= 1.6; // max duration 1.6s
      });

      // ── Draw orbit paths ──────────────────────
      ORBITS.forEach(function (orb) {
        ctx.save();
        ctx.strokeStyle = orbitColor;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        for (var i = 0; i <= 100; i++) {
          var a = (i / 100) * Math.PI * 2;
          // Elliptical orbits: rx = 1.0, ry = 0.85 in normalized space
          var px = Math.cos(a);
          var py = Math.sin(a) * 0.85;
          var p3 = transformPoint(px, py, 0, orb.rotX, orb.rotZ, currentRotX, currentRotY);
          var p2 = project(p3, cx, cy, rBase);
          if (i === 0) ctx.moveTo(p2.x, p2.y); else ctx.lineTo(p2.x, p2.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // ── Draw List for depth sorting ───────────
      var drawList = [];

      electrons.forEach(function (e) {
        // stable speed: angle = t * baseSpeed + speedNoise + offset
        var speedNoise = Math.sin(t * 2 + e.seed) * 0.15;
        var angle = t * e.baseSpeed + speedNoise + e.offset;

        // Normalized coordinate space
        var cxE = Math.cos(angle);
        var cyE = Math.sin(angle) * 0.85;

        var p3 = transformPoint(cxE, cyE, 0, e.rotX, e.rotZ, currentRotX, currentRotY);
        var p2 = project(p3, cx, cy, rBase);

        // Store trail
        e.trail.unshift({ x: p2.x, y: p2.y });
        if (e.trail.length > 18) e.trail.pop();

        // Draw trail lines
        if (e.trail.length > 1) {
          for (var i = 1; i < e.trail.length; i++) {
            var frac = i / (e.trail.length - 1);
            var opacity = maxTrailOpacity * (1 - frac);
            var w = 2.0 - 1.7 * frac; // goes from 2.0 to 0.3
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(e.trail[i - 1].x, e.trail[i - 1].y);
            ctx.lineTo(e.trail[i].x, e.trail[i].y);
            ctx.strokeStyle = 'rgba(' + trailColorRGB + ', ' + opacity + ')';
            ctx.lineWidth = w;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
          }
        }

        drawList.push({ type: 'electron', x: p2.x, y: p2.y, z: p3.z, scale: p2.scale });
      });

      // Nucleus item
      drawList.push({ type: 'nucleus', z: 0, scale: FOV / CAM_DIST });

      // Depth sorting
      drawList.sort(function (a, b) {
        return b.z - a.z;
      });

      // Draw items
      drawList.forEach(function (item) {
        if (item.type === 'nucleus') {
          // Halos
          var rOuter = 20 + 5 * Math.sin(t * 1.5);
          var rMid = 12 + 3 * Math.sin(t * 2 + 1);
          
          ctx.beginPath();
          ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx, cy, rMid, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.13)' : 'rgba(255, 255, 255, 0.13)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fillStyle = coreColor;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(cx + 2, cy - 2, 2, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';
          ctx.fill();

          // Shockwaves
          shockwaves.forEach(function (wave) {
            if (wave.age < 0) return;
            var progress = wave.age / 1.6;
            if (progress > 1) return;
            var rWave = progress * (Math.min(width, height) * 0.46);
            var waveOpacity = 0.45 * (1 - progress);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, rWave, 0, Math.PI * 2);
            ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, ' + waveOpacity + ')' : 'rgba(255, 255, 255, ' + waveOpacity + ')';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          });

        } else if (item.type === 'electron') {
          // Clipping check
          if (item.x < 0 || item.x > width || item.y < 0 || item.y > height) return;

          // Outer circle
          ctx.save();
          ctx.fillStyle = outerElectronColor;
          ctx.beginPath();
          ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Inner solid circle
          ctx.save();
          ctx.fillStyle = coreColor;
          ctx.beginPath();
          ctx.arc(item.x, item.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // ── Labels positions ──────────────────────
      var labelEls = document.querySelectorAll('.atom-label:not(.atom-label--nucleus)');
      var labelCoords = [
        { dx: -width * 0.3, dy: -height * 0.25 },
        { dx: width * 0.28, dy: -height * 0.22 },
        { dx: 0,            dy: height * 0.3 }
      ];
      labelCoords.forEach(function (coord, i) {
        if (!labelEls[i]) return;
        labelEls[i].style.left = (cx + coord.dx) + 'px';
        labelEls[i].style.top = (cy + coord.dy) + 'px';
        labelEls[i].style.opacity = '1';
      });

      if (atomActive) {
        scheduleNextFrame();
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
              lastTime = null;
              scheduleNextFrame();
            }
          } else {
            atomActive = false;
          }
        });
      }, { threshold: 0.05 });
      atomObserver.observe(atomCanvas);
    } else {
      atomActive = true;
      scheduleNextFrame();
    }

    // Tab visibility change reset handler
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        atomActive = false;
      } else {
        lastTime = null; // reset logic timeline on return
        if (atomCanvas) {
          var rect = atomCanvas.getBoundingClientRect();
          var isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
          if (isVisible && !atomActive) {
            atomActive = true;
            scheduleNextFrame();
          }
        } else if (!atomActive) {
          atomActive = true;
          scheduleNextFrame();
        }
      }
    });
  })();

  // ============================================
  var heroActive = true;

  function animateAll(time) {
    if (lastHeroTime === null) {
      lastHeroTime = time;
    }
    var dt = (time - lastHeroTime) * 0.001;
    lastHeroTime = time;
    dt = Math.min(dt, 0.032);
    heroTime += dt;

    if (heroActive) {
      // Lerp hero parallax at 6%
      heroMouseX += (heroTargetX - heroMouseX) * 0.06;
      heroMouseY += (heroTargetY - heroMouseY) * 0.06;

      var heroName = document.querySelector('.hero__name');
      var heroSubtitle = document.querySelector('.hero__subtitle');
      var waveCanvasEl = document.getElementById('wave-canvas');

      if (heroName) {
        heroName.style.transform = 'translate(' + (heroMouseX * -15) + 'px, ' + (heroMouseY * -10) + 'px)';
      }
      if (heroSubtitle) {
        heroSubtitle.style.transform = 'translate(' + (heroMouseX * -8) + 'px, ' + (heroMouseY * -6) + 'px)';
      }
      if (waveCanvasEl && !isMobile) {
        waveCanvasEl.style.transform = 'translate(' + (heroMouseX * 20) + 'px, ' + (heroMouseY * 12) + 'px)';
      }

      if (!isMobile) {
        drawWave(heroTime * 1000);
      }
      drawNetParticles(heroTime);
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

      heroSection.addEventListener('mousemove', function (e) {
        heroTargetX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        heroTargetY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      });

      heroSection.addEventListener('mouseleave', function () {
        heroTargetX = 0;
        heroTargetY = 0;
      });
    }

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
  navLinkEls = document.querySelectorAll('.nav__link');
  nav = document.getElementById('nav');

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
      if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
      }
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
  if (isCoarsePointer || isMobile) {
    // Hide cursor canvas on touch devices
    if (cursorCanvas) cursorCanvas.style.display = 'none';
  }


  // ============================================
  // CV Download (placeholder alert)
  // ============================================
  var cvBtn = document.getElementById('cv-download');
  if (cvBtn) {
    cvBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Replace with actual CV file URL when ready
      if (currentLang === 'en') {
        alert('CV coming soon! Contact me at github.com/MiniLux0 for now.');
      } else {
        alert('¡CV próximamente! Contáctame en github.com/MiniLux0 por ahora.');
      }
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
        if (cursorSpan && cursorSpan.parentNode === subtitleEl) {
          subtitleEl.insertBefore(
            document.createTextNode(fullText.charAt(charIdx)),
            cursorSpan
          );
        } else {
          subtitleEl.appendChild(document.createTextNode(fullText.charAt(charIdx)));
        }
        charIdx++;
        typingTimer = setTimeout(typeNext, 50);
      } else {
        // Remove cursor after typing finishes
        typingTimer = setTimeout(function () {
          if (cursorSpan && cursorSpan.parentNode === subtitleEl) {
            cursorSpan.style.animation = 'none';
            cursorSpan.style.opacity = '0';
          }
        }, 2000);
      }
    }
    // Start typing after a short delay
    typingTimer = setTimeout(typeNext, 800);
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      lastHeroTime = null;
    }
  });

})();
