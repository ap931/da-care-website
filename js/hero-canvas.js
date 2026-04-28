// ── Hero canvas background ────────────────────────────────
// Light-themed atmospheric particles + noise waves.
// Content (heading, CTAs, etc.) is regular HTML above this canvas.
(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const section = document.getElementById('hero') || canvas.parentElement;
  let ctx, W, H, dpr;
  let particles = [];
  let rafId = 0;
  let startTime = 0;
  let prevTime  = 0;

  // ── Brand palette ─────────────────────────────────────────
  const C = [
    [246, 155, 117], // coral  #F69B75
    [193, 219, 141], // mint   #C1DB8D
    [169, 226, 255], // sky    #A9E2FF
  ];

  // ── Wave defs (one per color + 1 extra coral for variety) ─
  const WAVES = [
    { yFrac: 0.25, ph: 0.0, spd: 0.50, freq: 0.011, amp: 30, ci: 0, op: 0.42 },
    { yFrac: 0.42, ph: 1.4, spd: 0.38, freq: 0.008, amp: 40, ci: 1, op: 0.36 },
    { yFrac: 0.58, ph: 2.8, spd: 0.65, freq: 0.013, amp: 25, ci: 2, op: 0.32 },
    { yFrac: 0.75, ph: 0.9, spd: 0.42, freq: 0.010, amp: 34, ci: 0, op: 0.28 },
  ];

  function col(ci, a) {
    const [r, g, b] = C[ci];
    return `rgba(${r},${g},${b},${Math.max(0, a).toFixed(4)})`;
  }

  function mkParticle(scatter) {
    return {
      x:  Math.random() * W,
      y:  scatter ? Math.random() * H : H + 8,
      r:  1 + Math.random() * 2.5,
      vy: 18 + Math.random() * 36,
      wf: 0.4 + Math.random() * 1.4,
      wa: 8   + Math.random() * 20,
      wp: Math.random() * Math.PI * 2,
      ci: Math.floor(Math.random() * 3),
      ob: 0.35 + Math.random() * 0.25,
    };
  }

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W   = section.clientWidth  || window.innerWidth;
    H   = section.clientHeight || window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cnt = Math.min(120, Math.max(35, Math.floor((W * H) / 10000)));
    particles = Array.from({ length: cnt }, () => mkParticle(true));
  }

  function draw(ts) {
    if (!startTime) { startTime = ts; prevTime = ts; }
    const dt = Math.min((ts - prevTime) * 0.001, 0.05);
    prevTime = ts;
    const t  = (ts - startTime) * 0.001;

    // Breathe: 0.4 → 1.0
    const breathe = 0.4 + 0.6 * (Math.sin(t * 0.4) * 0.5 + 0.5);

    // ── Background ─────────────────────────────────────────
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, W, H);

    // ── Noise lines ────────────────────────────────────────
    ctx.lineWidth = 1;
    for (const w of WAVES) {
      const y0    = H * w.yFrac;
      const amp   = w.amp * breathe;
      const phase = t * w.spd + w.ph;
      ctx.beginPath();
      ctx.moveTo(0, y0 + Math.sin(phase) * amp);
      for (let x = 2; x <= W; x += 2) {
        ctx.lineTo(x, y0 + Math.sin(w.freq * x + phase) * amp);
      }
      ctx.strokeStyle = col(w.ci, w.op * breathe);
      ctx.stroke();
    }

    // ── Particles ──────────────────────────────────────────
    for (const p of particles) {
      p.y  -= p.vy * dt;
      p.wp += p.wf * dt;
      p.x  += Math.sin(p.wp) * p.wa * dt;
      if (p.x < -30)    p.x = W + 20;
      if (p.x > W + 30) p.x = -20;
      if (p.y < -p.r * 2) {
        p.x  = Math.random() * W;
        p.y  = H + p.r;
        p.wp = Math.random() * Math.PI * 2;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = col(p.ci, p.ob * breathe);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(rafId);
    startTime = 0;
    prevTime  = 0;
    rafId = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else start();
  });

  let resizeTimer = 0;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      setup();
      start();
    }, 80);
  });
  ro.observe(section);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setup();
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, W, H);
    return;
  }

  setup();
  start();
}());

// ══════════════════════════════════════════════════════════
// Hero Intro — icon fills viewport → contracts to the navbar
// logo mark, with the eyebrow as the visual fallback target.
// ══════════════════════════════════════════════════════════
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ov = document.getElementById('heroIntroOverlay');
    if (ov) ov.style.display = 'none';
    return;
  }

  const hero    = document.getElementById('hero');
  const overlay = document.getElementById('heroIntroOverlay');
  if (!hero) return;

  const heading = hero.querySelector('.hero-heading');
  const subline = hero.querySelector('.hero-subline');
  const navbar  = document.querySelector('.navbar');
  const navLogo = navbar ? navbar.querySelector('.navbar__logo-image') : null;

  // Always play intro on every page load

  function set(el, styles) {
    if (!el) return;
    el.style.transition = 'none';
    Object.assign(el.style, styles);
  }

  function makeIntroIcon(srcMono, srcColor) {
    const shell = document.createElement('div');
    Object.assign(shell.style, {
      position:      'fixed',
      width:         '150vmax',
      height:        '150vmax',
      top:           '50%',
      left:          '50%',
      transform:     'translate(-50%, -50%) rotate(135deg)',
      opacity:       '1',
      zIndex:        '9999',
      borderRadius:  '50%',
      pointerEvents: 'none',
      transition:    'none',
      willChange:    'transform, opacity',
    });

    const mono = document.createElement('img');
    const color = document.createElement('img');

    [mono, color].forEach((img) => {
      img.setAttribute('aria-hidden', 'true');
      Object.assign(img.style, {
        position:      'absolute',
        inset:         '0',
        width:         '100%',
        height:        '100%',
        borderRadius:  '50%',
        objectFit:     'cover',
        pointerEvents: 'none',
        transition:    'none',
        willChange:    'opacity',
      });
    });

    mono.src = srcMono;
    mono.style.opacity = '1';

    color.src = srcColor;
    color.style.opacity = '0';

    shell.append(mono, color);
    return { shell, mono, color };
  }

  // Hide text + navbar until their cued reveal
  set(heading, { opacity: '0', transform: 'translateY(14px)' });
  set(subline, { opacity: '0', transform: 'translateY(14px)' });
  set(navbar,  { opacity: '0' });

  // ── Full-size overlay img — renders SVG at native resolution ──
  // 100vmax = max(vw, vh) → always a true 1:1 circle on the larger axis
  // sz = actual pixel diameter of the fixed shell (150vmax)
  const vmax = Math.max(window.innerWidth, window.innerHeight);
  const sz = vmax * 1.5;

  const introIcon = makeIntroIcon('/images/icon/dc-monochrome.svg', '/images/icon/dc.svg');
  document.body.appendChild(introIcon.shell);

  // Force style flush so initial state is committed before transition
  introIcon.shell.getBoundingClientRect();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    setTimeout(() => {

      // Always aim for the navbar logo mark
      const logoRect = navLogo ? navLogo.getBoundingClientRect() : null;
      const hasLogo  = Boolean(logoRect && logoRect.width > 0 && logoRect.height > 0);
      const targetCenterX = hasLogo ? logoRect.left + Math.min(logoRect.width, logoRect.height) * 0.5 : window.innerWidth * 0.5;
      const targetCenterY = hasLogo ? logoRect.top  + logoRect.height * 0.5                           : 80;
      const dx = targetCenterX - window.innerWidth * 0.5;
      const dy = targetCenterY - window.innerHeight * 0.5;
      const targetSize  = hasLogo ? Math.min(logoRect.width, logoRect.height) : 64;
      const targetScale = (targetSize / sz).toFixed(5);

      // Canvas fades in through overlay
      if (overlay) {
        overlay.style.transition = 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.style.opacity    = '0';
      }

      // Launch in monochrome, then fade back into the original colors mid-flight.
      introIcon.shell.style.transition = 'transform 1.7s cubic-bezier(0.16, 1, 0.3, 1)';
      introIcon.shell.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(0deg) scale(${targetScale})`;
      introIcon.mono.style.transition  = 'opacity 1.08s cubic-bezier(0.16, 1, 0.3, 1) 0.18s';
      introIcon.color.style.transition = 'opacity 1.08s cubic-bezier(0.16, 1, 0.3, 1) 0.18s';
      introIcon.mono.style.opacity     = '0';
      introIcon.color.style.opacity    = '1';

      // Dissolve into the navbar logo at landing
      setTimeout(() => {
        introIcon.shell.style.transition = 'opacity 0.12s ease';
        introIcon.shell.style.opacity    = '0';
        setTimeout(() => { try { introIcon.shell.remove(); } catch (_) {} }, 150);
      }, 1700);

      // Text + navbar stagger
      [
        { el: heading, ms: 1000 },
        { el: subline, ms: 1200 },
        { el: navbar,  ms: 1450 },
      ].filter(Boolean).forEach(({ el, ms }) => {
        if (!el) return;
        setTimeout(() => {
          if (el === navbar) {
            el.style.transition = 'opacity 0.72s ease';
            el.style.opacity    = '1';
          } else {
            el.style.transition = [
              'opacity   0.72s ease',
              'transform 0.72s cubic-bezier(0.16, 1, 0.3, 1)',
            ].join(', ');
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
          }
        }, ms);
      });

    }, 650);
  }));
}());
