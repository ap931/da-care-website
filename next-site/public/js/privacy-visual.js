/**
 * Privacy Visual — Canvas Particle Stream Engine
 * Draws flowing particle streams between DOM station nodes.
 * Uses IntersectionObserver for scroll-bound activation.
 */
(() => {
  const canvas = document.getElementById('privacy-canvas');
  const diagram = document.getElementById('privacy-diagram');
  const dataCardEl = document.getElementById('privacy-data-card');
  if (!canvas || !diagram) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Brand colors
  const COLORS = {
    mint:  { r: 182, g: 204, b: 176 },
    sky:   { r: 183, g: 220, b: 255 },
    coral: { r: 246, g: 165, b: 127 }
  };

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpColor = (c1, c2, t) => ({
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t))
  });

  let width = 0, height = 0;
  let running = false;
  let raf = 0;
  let visibility = 0; // 0–1, how much of section is visible

  // Stations positions (updated on resize)
  let stations = []; // [{x, y}] for user, security, ai

  // Particles along paths
  const STREAM_COUNT = 35;
  let streamParticles = [];

  // Glowing data packets
  const PACKET_COUNT = 4;
  let dataPackets = [];

  // Ambient particles
  const AMBIENT_COUNT = 20;
  let ambientParticles = [];

  // Data card state
  const cardState = {
    t: 0,          // 0→1 across both paths combined
    speed: 0.003,
    stage: 0       // 0=original, 1=encrypted, 2=hidden
  };

  const CARD_STAGES = [
    { name: 'John Doe', id: 'User #1234', context: 'Anxiety', nameClass: '', idClass: '', ctxClass: '' },
    { name: 'x7k9mP2q', id: 'Usr_a8f2', context: 'Anxiety', nameClass: 'is-encrypted', idClass: 'is-encrypted', ctxClass: '' },
    { name: 'hidden', id: 'hidden', context: 'hidden', nameClass: 'is-hidden', idClass: 'is-redacted', ctxClass: 'is-redacted' }
  ];

  const getStationCenters = () => {
    const stationEls = diagram.querySelectorAll('.privacy-station');
    const rect = diagram.getBoundingClientRect();
    return Array.from(stationEls).map(el => {
      const circle = el.querySelector('.station-circle');
      if (!circle) return { x: 0, y: 0, r: 0 };
      const cr = circle.getBoundingClientRect();
      return {
        x: (cr.left + cr.width / 2 - rect.left) * dpr,
        y: (cr.top + cr.height / 2 - rect.top) * dpr,
        r: (cr.width / 2) * dpr
      };
    });
  };

  const cubicBezier = (p0, cp1, cp2, p1, t) => {
    const u = 1 - t;
    return {
      x: u*u*u*p0.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p1.x,
      y: u*u*u*p0.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p1.y
    };
  };

  const getControlPoints = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const isVertical = Math.abs(dy) > Math.abs(dx);

    if (isVertical) {
      return [
        { x: a.x + dx * 0.1, y: a.y + dy * 0.4 },
        { x: b.x - dx * 0.1, y: b.y - dy * 0.4 }
      ];
    }
    return [
      { x: a.x + dx * 0.35, y: a.y - Math.abs(dy) * 0.3 },
      { x: b.x - dx * 0.35, y: b.y - Math.abs(dy) * 0.3 }
    ];
  };

  const initStreamParticles = () => {
    streamParticles = Array.from({ length: STREAM_COUNT }, () => ({
      pathIdx: Math.random() < 0.5 ? 0 : 1, // path 0 = user→security, 1 = security→ai
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
      size: 1.5 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.5
    }));
  };

  const initDataPackets = () => {
    dataPackets = Array.from({ length: PACKET_COUNT }, (_, i) => ({
      pathIdx: i % 2,
      t: (i / PACKET_COUNT),
      speed: 0.003 + Math.random() * 0.002,
      size: 4 + Math.random() * 3,
      trail: []
    }));
  };

  const initAmbientParticles = () => {
    ambientParticles = Array.from({ length: AMBIENT_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 1.5,
      opacity: 0.05 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const resize = () => {
    const rect = diagram.getBoundingClientRect();
    width = rect.width * dpr;
    height = rect.height * dpr;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    stations = getStationCenters();
  };

  const getPathPoints = (pathIdx) => {
    if (stations.length < 3) return null;
    const a = pathIdx === 0 ? stations[0] : stations[1];
    const b = pathIdx === 0 ? stations[1] : stations[2];
    const [cp1, cp2] = getControlPoints(a, b);
    return { a, b, cp1, cp2 };
  };

  const getColorForT = (pathIdx, t) => {
    if (pathIdx === 0) return lerpColor(COLORS.mint, COLORS.sky, t);
    return lerpColor(COLORS.sky, COLORS.coral, t);
  };

  const drawPath = (path, pathIdx, time) => {
    if (!path) return;
    const steps = 80;

    // Draw soft glowing bezier curve
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = cubicBezier(path.a, path.cp1, path.cp2, path.b, t);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    const c = getColorForT(pathIdx, 0.5);
    ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.12 * visibility})`;
    ctx.lineWidth = 3 * dpr;
    ctx.stroke();

    // Glow
    ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.05 * visibility})`;
    ctx.lineWidth = 12 * dpr;
    ctx.stroke();
  };

  const drawStreamParticles = (time) => {
    streamParticles.forEach(p => {
      const path = getPathPoints(p.pathIdx);
      if (!path) return;
      p.t += p.speed * visibility;
      if (p.t > 1) { p.t -= 1; }

      const pt = cubicBezier(path.a, path.cp1, path.cp2, path.b, p.t);
      const c = getColorForT(p.pathIdx, p.t);

      const flicker = 0.7 + 0.3 * Math.sin(time * 3 + p.t * 10);
      const alpha = p.opacity * visibility * flicker;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.size * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      ctx.fill();
    });
  };

  const drawDataPackets = (time) => {
    dataPackets.forEach(p => {
      const path = getPathPoints(p.pathIdx);
      if (!path) return;

      p.t += p.speed * visibility;
      if (p.t > 1) {
        p.t -= 1;
        p.trail = [];
      }

      const pt = cubicBezier(path.a, path.cp1, path.cp2, path.b, p.t);
      const c = getColorForT(p.pathIdx, p.t);

      // Store trail
      p.trail.push({ x: pt.x, y: pt.y, c: { ...c } });
      if (p.trail.length > 15) p.trail.shift();

      // Draw trail
      p.trail.forEach((tp, i) => {
        const trailAlpha = (i / p.trail.length) * 0.4 * visibility;
        const trailSize = (i / p.trail.length) * p.size * dpr * 0.8;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${tp.c.r}, ${tp.c.g}, ${tp.c.b}, ${trailAlpha})`;
        ctx.fill();
      });

      // Draw packet glow
      const glowRadius = p.size * dpr * 2.5;
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowRadius);
      grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.6 * visibility})`);
      grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.15 * visibility})`);
      grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw core
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.size * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * visibility})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.size * dpr + 1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.5 * visibility})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const drawAmbientParticles = (time) => {
    ambientParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const pulse = 0.6 + 0.4 * Math.sin(time * 1.5 + p.phase);
      const alpha = p.opacity * visibility * pulse;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 220, ${alpha})`;
      ctx.fill();
    });
  };

  const drawStationGlow = (time) => {
    if (stations.length < 3) return;
    const colors = [COLORS.mint, COLORS.sky, COLORS.coral];

    stations.forEach((s, i) => {
      const pulse = 0.4 + 0.3 * Math.sin(time * 1.2 + i * 2.1);
      const c = colors[i];
      const glowRadius = s.r * 1.8;

      const grad = ctx.createRadialGradient(s.x, s.y, s.r * 0.8, s.x, s.y, glowRadius);
      grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.08 * visibility * pulse})`);
      grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  };

  const render = (timestamp) => {
    if (!running) return;
    raf = requestAnimationFrame(render);

    const time = timestamp * 0.001;
    ctx.clearRect(0, 0, width, height);

    if (visibility < 0.01) return;

    // Draw paths
    [0, 1].forEach(i => drawPath(getPathPoints(i), i, time));

    // Draw ambient
    drawAmbientParticles(time);

    // Draw station glows
    drawStationGlow(time);

    // Draw stream
    drawStreamParticles(time);

    // Animate data card
    animateDataCard();

    // Draw data packets
    drawDataPackets(time);
  };

  const animateDataCard = () => {
    if (!dataCardEl || stations.length < 3) return;

    // Advance t (0→1 covers path0, 1→2 covers path1)
    cardState.t += cardState.speed * visibility;
    if (cardState.t > 2) cardState.t -= 2;

    // Determine which path segment and local t
    let pathIdx, localT;
    if (cardState.t < 1) {
      pathIdx = 0;
      localT = cardState.t;
    } else {
      pathIdx = 1;
      localT = cardState.t - 1;
    }

    // Determine stage based on position
    let newStage;
    if (cardState.t < 0.45) newStage = 0;       // Near "You" — original
    else if (cardState.t < 1.4) newStage = 1;    // Near "Security" — encrypted
    else newStage = 2;                           // Near "AI" — hidden

    if (newStage !== cardState.stage) {
      cardState.stage = newStage;
      const s = CARD_STAGES[newStage];
      const nameEl = dataCardEl.querySelector('[data-field="name"]');
      const idEl = dataCardEl.querySelector('[data-field="id"]');
      const ctxEl = dataCardEl.querySelector('[data-field="context"]');
      if (nameEl) {
        nameEl.textContent = s.name;
        nameEl.className = 'privacy-data-card__value ' + s.nameClass;
      }
      if (idEl) {
        idEl.textContent = s.id;
        idEl.className = 'privacy-data-card__value ' + s.idClass;
      }
      if (ctxEl) {
        ctxEl.textContent = s.context;
        ctxEl.className = 'privacy-data-card__value ' + s.ctxClass;
      }
    }

    // Position the card along the bezier path: Symmetrically centered below the path point
    const path = getPathPoints(pathIdx);
    if (!path) return;
    const pt = cubicBezier(path.a, path.cp1, path.cp2, path.b, localT);

    // Convert from canvas coords (dpr-scaled) to CSS coords
    const cssX = pt.x / dpr;
    const cssY = pt.y / dpr;

    dataCardEl.style.transform = `translate(${cssX}px, ${cssY + 60}px) translate(-50%, 0)`;

    if (visibility > 0.05) {
      dataCardEl.classList.add('is-visible');
    } else {
      dataCardEl.classList.remove('is-visible');
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    resize();
    initStreamParticles();
    initDataPackets();
    initAmbientParticles();
    raf = requestAnimationFrame(render);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Scroll-bound activation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      visibility = Math.max(0, Math.min(1, entry.intersectionRatio * 2));
      if (entry.isIntersecting) {
        if (!running) start();
      } else {
        stop();
      }
    });
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });

  observer.observe(diagram);

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      initAmbientParticles();
    }, 150);
  });

  // Handle reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    // Just draw static paths, no animation
    resize();
    stations = getStationCenters();
    [0, 1].forEach(i => {
      visibility = 1;
      drawPath(getPathPoints(i), i, 0);
    });
  }
})();
