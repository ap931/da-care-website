// Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));

  // ── Elements ──
  const outer = document.getElementById('noiseOuter');
  const sticky = document.getElementById('noiseSticky');
  const sphereCanvas = document.getElementById('sphereCanvas');
  const text1 = document.getElementById('noiseText1');
  const text2 = document.getElementById('noiseText2');
  const text3 = document.getElementById('noiseText3');
  const sphere = window.DaCareSphere;
  const sections = [
    document.getElementById('section3'),
    document.getElementById('section1'),
    document.getElementById('section2'),
  ];
  let outerH = 0;
  let winH = 0;
  let outerTop = 0;
  let scrollRange = 1;
  let cachedScrollY = window.scrollY || 0;
  let isCompactMobile = false;
  let isNarrowMobile = false;
  let notifStride = 1;
  const sectionStates = new Array(sections.length).fill('hidden');

  const NOTIF_COUNT = 40;
  const notifs = [];
  for (let i = 0; i < NOTIF_COUNT; i++) notifs.push(document.getElementById('n' + i));
  const notifSizes = new Array(NOTIF_COUNT).fill(0).map(() => ({ w: 0, h: 0 }));
  const notifVisible = new Array(NOTIF_COUNT).fill(false);
  const notifAbsorbing = new Array(NOTIF_COUNT).fill(false);
  notifs.forEach(n => { if (n) n.style.visibility = 'hidden'; });

  // Text safe zone — notifications avoid the center band
  const TEXT_ZONE = { xMin: 15, xMax: 85, yMin: 35, yMax: 65 };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function updateNotifSizes() {
    for (let i = 0; i < NOTIF_COUNT; i++) {
      const n = notifs[i];
      const hideOnMobile = isNarrowMobile && i >= NOTIF_COUNT * 0.8;
      if ((notifStride > 1 && (i % notifStride !== 0)) || hideOnMobile) {
        notifSizes[i].w = 0;
        notifSizes[i].h = 0;
        notifVisible[i] = false;
        notifAbsorbing[i] = false;
        if (n) {
          n.style.visibility = 'hidden';
          n.style.opacity = '0';
          n.style.transform = 'translate3d(0, 0, 0) scale(0)';
          n.classList.remove('absorbing');
        }
        continue;
      }
      if (!n) {
        notifSizes[i].w = 0;
        notifSizes[i].h = 0;
        continue;
      }
      notifSizes[i].w = n.offsetWidth;
      notifSizes[i].h = n.offsetHeight;
    }
  }

  // ── Notification positions — 40, avoiding center text zone ──
  const positions = [
    // Top band (y: 0–30)
    { x: 4, y: 5 },   { x: 28, y: 2 },  { x: 52, y: 4 },  { x: 74, y: 3 },
    { x: 92, y: 8 },  { x: 16, y: 18 }, { x: 40, y: 12 }, { x: 64, y: 16 },
    { x: 88, y: 22 }, { x: 6, y: 26 },  { x: 50, y: 24 }, { x: 78, y: 28 },
    // Left band (y: 30–70, x: 0–12)
    { x: 1, y: 38 },  { x: 3, y: 56 },
    // Right band (y: 30–70, x: 88–100)
    { x: 90, y: 42 }, { x: 92, y: 60 },
    // Bottom band (y: 70–100)
    { x: 4, y: 72 },  { x: 22, y: 78 }, { x: 44, y: 70 }, { x: 66, y: 74 },
    { x: 88, y: 76 }, { x: 12, y: 86 }, { x: 36, y: 90 }, { x: 58, y: 84 },
    { x: 80, y: 88 }, { x: 96, y: 92 }, { x: 26, y: 96 }, { x: 68, y: 94 },
    // Extra 12 for high density mode
    { x: 10, y: 10 }, { x: 35, y: 8 },  { x: 80, y: 14 },
    { x: 5, y: 48 },  { x: 8, y: 65 },  { x: 85, y: 35 },
    { x: 95, y: 50 }, { x: 88, y: 68 }, { x: 15, y: 95 },
    { x: 50, y: 98 }, { x: 75, y: 80 }, { x: 90, y: 98 }
  ];
  // Stagger pop-in across 0.01 to 0.14
  const popStarts = positions.map((_, i) => 0.01 + (i / (NOTIF_COUNT - 1)) * 0.13);
  const popDuration = 0.04;

  // ═══════════════════════════════════════════════
  // TIMELINE (960vh)
  //
  // 0.00–0.14  "Does this feel familiar?" + notifs pop in
  // 0.14–0.22  "We take all the noise" + notifs converge
  // 0.22–0.28  "And give you clarity"
  // 0.28–0.38  Sphere forms from particles, grows, moves to 30%-bottom
  // 0.38–0.50  Coren               — fade in, hold
  // 0.50–0.54  Coren exit           — slide right 3rem, fade out
  // 0.54–0.66  Leda                — fade in, hold
  // 0.66–0.70  Leda exit            — slide right 3rem, fade out
  // 0.70–0.82  Leda Work            — fade in, hold
  // 0.82–0.86  Leda Work exit       — slide right 3rem, fade out
  // 0.86–1.00  Sphere shrinks away, exit
  // ═══════════════════════════════════════════════

  let currentText = 1;
  let prevProgress = 0;
  let lastRenderedProgress = -1;
  let spherePrewarmed = false;

  function getSphereMaxRadius(w, h) {
    let maxR = Math.min(w * 0.38, h * 0.38);
    if (w < 600) maxR = Math.min(w * 0.34, h * 0.34);
    if (w < 480) maxR = Math.min(w * 0.30, h * 0.30);
    return maxR;
  }

  function setActiveText(num) {
    if (currentText === num) return;
    currentText = num;
    text1.className = num === 1 ? 'active' : 'hidden';
    text2.className = num === 2 ? 'active' : 'hidden';
    text3.className = num === 3 ? 'active' : 'hidden';
  }

  function updateDimensions() {
    stickyW = sticky.offsetWidth;
    stickyH = sticky.offsetHeight;
    outerH = outer.offsetHeight;
    winH = window.innerHeight;
    outerTop = outer.offsetTop;
    scrollRange = Math.max(1, outerH - winH) / 0.86;
    isCompactMobile = window.innerWidth < 480;
    isNarrowMobile = window.innerWidth < 600;
    notifStride = 1;
  }

  let resizeTimer = null;
  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateDimensions();
      sphere.resize();
      updateNotifSizes();
    }, 120);
  }
  updateDimensions();
  window.addEventListener('scroll', () => { cachedScrollY = window.scrollY; }, { passive: true });
  sphere.resize();
  updateNotifSizes();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      updateDimensions();
      sphere.resize();
      updateNotifSizes();
    });
  }
  window.addEventListener('resize', handleResize);

  function updateSections(progress) {
    const SECTION_Y_OFFSET = 80;
    const phases = [
      { el: sections[0], fadeIn: 0.38, holdStart: 0.41, holdEnd: 0.50, fadeOut: 0.54 },
      { el: sections[1], fadeIn: 0.54, holdStart: 0.57, holdEnd: 0.66, fadeOut: 0.70 },
      { el: sections[2], fadeIn: 0.70, holdStart: 0.73, holdEnd: 0.82, fadeOut: 0.86 },
    ];

    phases.forEach(({ el, fadeIn, holdStart, holdEnd, fadeOut }, idx) => {
      if (progress < fadeIn || progress > fadeOut) {
        if (sectionStates[idx] !== 'hidden') {
          el.style.opacity = '0';
          el.style.transform = `translate(-50%, calc(-50% + ${SECTION_Y_OFFSET}px))`;
          el.classList.remove('active');
          sectionStates[idx] = 'hidden';
        }
        return;
      }

      if (progress < holdStart) {
        sectionStates[idx] = 'enter';
        // Fade in + scale up (no lateral movement)
        const t = easeInOut(clamp((progress - fadeIn) / (holdStart - fadeIn), 0, 1));
        const scale = lerp(0.96, 1, t);
        el.style.opacity = String(t);
        el.style.transform = `translate(-50%, calc(-50% + ${SECTION_Y_OFFSET}px)) scale(${scale})`;
        el.classList.add('active');
      } else if (progress < holdEnd) {
        // Hold
        if (sectionStates[idx] !== 'hold') {
          el.style.opacity = '1';
          el.style.transform = `translate(-50%, calc(-50% + ${SECTION_Y_OFFSET}px)) scale(1)`;
          el.classList.add('active');
          sectionStates[idx] = 'hold';
        }
      } else {
        sectionStates[idx] = 'exit';
        // Exit: scale down + fade (no lateral movement)
        const t = easeInOut(clamp((progress - holdEnd) / (fadeOut - holdEnd), 0, 1));
        const scale = lerp(1, 0.96, t);
        el.style.opacity = String(1 - t);
        el.style.transform = `translate(-50%, calc(-50% + ${SECTION_Y_OFFSET}px)) scale(${scale})`;
        if (t > 0.5) el.classList.remove('active');
      }
    });
  }


  function computeProgress() {
    const scrolled = cachedScrollY - outerTop;
    return clamp(scrolled / scrollRange, 0, 1);
  }

  let rafId = null;
  let isRunning = false;
  function startNoiseLoop() {
    if (isRunning) return;
    isRunning = true;
    prevProgress = computeProgress();
    sphere.resetRotation();
    rafId = requestAnimationFrame(animateNoise);
  }
  function stopNoiseLoop() {
    isRunning = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function animateNoise() {
    const progress = computeProgress();

    const scrollDelta = progress - prevProgress;
    prevProgress = progress;


    const sphereActive = progress >= 0.28 && progress <= 1.05;
    if (!sphereActive && Math.abs(scrollDelta) < 0.000001 && progress === lastRenderedProgress) {
      if (isRunning) rafId = requestAnimationFrame(animateNoise);
      return;
    }

    const vw = stickyW;
    const vh = stickyH;
    const cx = vw / 2;
    const cy = vh / 2;

    // ── Text transitions ──
    if (progress < 0.14) {
      setActiveText(1);
    } else if (progress < 0.22) {
      setActiveText(2);
    } else if (progress < 0.28) {
      setActiveText(3);
    } else {
      if (currentText !== 0) {
        currentText = 0;
        text1.className = 'hidden';
        text2.className = 'hidden';
        text3.className = 'hidden';
      }
    }

    // ── Sections ──
    updateSections(progress);

    // ── Notifications ──
    const absorbStart = 0.15;
    const absorbEnd = 0.24;
    const blurCutoff = isNarrowMobile ? 0 : 0.10;
    const isAbsorbingPhase = progress >= blurCutoff;
    const text3Start = 0.22;
    const forceHideNotifs = progress >= text3Start;

    notifs.forEach((n, i) => {
      if (!n) return;
      if (forceHideNotifs) {
        if (notifVisible[i]) {
          notifVisible[i] = false;
          notifAbsorbing[i] = false;
          n.classList.remove('absorbing');
          n.style.visibility = 'hidden';
          n.style.opacity = '0';
          n.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }
      const hideOnMobile = isNarrowMobile && i >= NOTIF_COUNT * 0.8;
      if ((notifStride > 1 && (i % notifStride !== 0)) || hideOnMobile) {
        if (notifVisible[i]) {
          notifVisible[i] = false;
          notifAbsorbing[i] = false;
          n.classList.remove('absorbing');
          n.style.visibility = 'hidden';
          n.style.opacity = '0';
          n.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }
      const pos = positions[i];
      const popStart = popStarts[i];
      const popEnd = popStart + popDuration;

      const popP = clamp((progress - popStart) / (popEnd - popStart), 0, 1);
      const popEased = easeOut(popP);

      if (popP <= 0) {
        if (notifVisible[i]) {
          notifVisible[i] = false;
          n.style.visibility = 'hidden';
          if (notifAbsorbing[i]) {
            notifAbsorbing[i] = false;
            n.classList.remove('absorbing');
          }
          n.style.opacity = '0';
          n.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }

      if (!notifVisible[i]) {
        notifVisible[i] = true;
        n.style.visibility = 'visible';
      }
      if (isAbsorbingPhase && !notifAbsorbing[i]) {
        notifAbsorbing[i] = true;
        n.classList.add('absorbing');
      } else if (!isAbsorbingPhase && notifAbsorbing[i]) {
        notifAbsorbing[i] = false;
        n.classList.remove('absorbing');
      }

      const nSize = notifSizes[i];
      const nw = nSize.w;
      const nh = nSize.h;

      let targetX = (pos.x / 100) * vw - nw / 2;
      let targetY = (pos.y / 100) * vh - nh / 2;

      // Ensure notifications do not overlap the central text area
      const textW = Math.min(vw * 0.9, 500);
      const textH = 140;
      const textLeft = cx - textW / 2;
      const textRight = cx + textW / 2;
      const textTop = cy - textH / 2;
      const textBottom = cy + textH / 2;

      if (targetX + nw > textLeft && targetX < textRight && targetY + nh > textTop && targetY < textBottom) {
        if (targetY + nh / 2 < cy) targetY = textTop - nh - ((i % 3) * 4);
        else targetY = textBottom + ((i % 3) * 4);
      }

      const absorbP = clamp((progress - absorbStart) / (absorbEnd - absorbStart), 0, 1);
      const absorbEased = easeInOut(absorbP);

      const centerX = cx - nw / 2;
      const centerY = cy - nh / 2;

      const finalX = lerp(targetX, centerX, absorbEased);
      const finalY = lerp(targetY, centerY, absorbEased);

      const mobileScale = isCompactMobile ? 0.7 : (isNarrowMobile ? 0.75 : 1);
      const popScale = Math.min(popEased * 1.08, 1.08) * mobileScale;
      const absorbScale = lerp(popScale, 0.1, absorbEased);
      const finalScale = absorbP > 0 ? absorbScale : popScale;
      const fadeOut = absorbP > 0.4 ? 1 - (absorbP - 0.4) / 0.6 : 1;

      if (absorbP > 0 && fadeOut <= 0) {
        if (notifVisible[i]) {
          notifVisible[i] = false;
          n.style.visibility = 'hidden';
          if (notifAbsorbing[i]) {
            notifAbsorbing[i] = false;
            n.classList.remove('absorbing');
          }
          n.style.opacity = '0';
          n.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }

      n.style.opacity = String(clamp(popEased * fadeOut, 0, 1));
      n.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) scale(${Math.max(finalScale, 0)})`;
    });

    // ── Sphere ──
    if (sphere.useWorker && sphere.worker) {
      sphere.worker.postMessage({ type: 'frame', progress, scrollDelta });
    } else {
      sphere.draw(progress, scrollDelta, vw, vh);
    }

    lastRenderedProgress = progress;
    if (isRunning) rafId = requestAnimationFrame(animateNoise);
  }
  // Pre-warm the sphere GPU pipeline before the section enters view
  const prewarmObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !spherePrewarmed) {
        spherePrewarmed = true;
        const doWarm = () => {
          if (sphere.useWorker && sphere.worker) {
            sphere.worker.postMessage({ type: 'frame', progress: 0.281, scrollDelta: 0 });
            sphere.worker.postMessage({ type: 'frame', progress: 0, scrollDelta: 0 });
          } else {
            sphere.draw(0.281, 0, stickyW, stickyH);
            sphere.ctx.clearRect(0, 0, stickyW, stickyH);
          }
          prewarmObserver.disconnect();
        };
        window.requestIdleCallback
          ? requestIdleCallback(doWarm, { timeout: 2000 })
          : setTimeout(doWarm, 50);
      }
    });
  }, { rootMargin: '400px 0px', threshold: 0 });
  prewarmObserver.observe(outer);

  const noiseObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) startNoiseLoop();
      else stopNoiseLoop();
    });
  }, { threshold: 0 });
  noiseObserver.observe(outer);
