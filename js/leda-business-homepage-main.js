(() => {
  const revealItems = document.querySelectorAll('.rv');
  if (revealItems.length) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('vis'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis');
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  const outer = document.getElementById('noiseOuter');
  const sticky = document.getElementById('noiseSticky');
  const text1 = document.getElementById('noiseText1');
  const text2 = document.getElementById('noiseText2');
  const text3 = document.getElementById('noiseText3');

  if (!outer || !sticky || !text1 || !text2 || !text3) {
    return;
  }

  let stickyW = 0;
  let stickyH = 0;
  let outerH = 0;
  let winH = 0;
  let outerTop = 0;
  let scrollRange = 1;
  let cachedScrollY = window.scrollY || 0;
  let isCompactMobile = false;
  let isNarrowMobile = false;
  let currentText = 1;
  let lastRenderedProgress = -1;
  let rafId = null;
  let isVisible = false;
  let resizeTimer = null;

  const NOTIF_COUNT = 48;
  const notifs = [];
  for (let index = 0; index < NOTIF_COUNT; index += 1) {
    notifs.push(document.getElementById(`n${index}`));
  }

  const notifSizes = new Array(NOTIF_COUNT).fill(0).map(() => ({ w: 0, h: 0 }));
  const notifVisible = new Array(NOTIF_COUNT).fill(false);
  const notifAbsorbing = new Array(NOTIF_COUNT).fill(false);
  notifs.forEach((notif) => {
    if (notif) {
      notif.style.visibility = 'hidden';
    }
  });

  const positions = [
    // ── Top band row 1 (y ≈ 4-8%, full width) ──
    { x: 6,  y: 5  }, { x: 17, y: 3  }, { x: 28, y: 6  }, { x: 39, y: 4  },
    { x: 51, y: 5  }, { x: 62, y: 3  }, { x: 73, y: 6  }, { x: 84, y: 4  },
    // ── Top band row 2 (y ≈ 14-20%, full width) ──
    { x: 11, y: 16 }, { x: 23, y: 13 }, { x: 35, y: 19 }, { x: 47, y: 14 },
    { x: 59, y: 18 }, { x: 71, y: 15 }, { x: 82, y: 20 }, { x: 90, y: 13 },
    // ── Top band row 3 (y ≈ 27-33%, sides only — avoids center text) ──
    { x: 8,  y: 28 }, { x: 20, y: 32 }, { x: 78, y: 27 }, { x: 89, y: 31 },
    // ── Left lane (x ≈ 6-14%, y ≈ 38-66%) ──
    { x: 7,  y: 38 }, { x: 11, y: 46 }, { x: 6,  y: 54 }, { x: 13, y: 62 }, { x: 9,  y: 42 },
    // ── Right lane (x ≈ 85-93%, y ≈ 38-66%) ──
    { x: 88, y: 39 }, { x: 85, y: 48 }, { x: 91, y: 57 }, { x: 87, y: 65 }, { x: 90, y: 43 },
    // ── Bottom band row 1 (y ≈ 71-76%, full width) ──
    { x: 7,  y: 72 }, { x: 19, y: 74 }, { x: 31, y: 71 }, { x: 44, y: 75 },
    { x: 57, y: 72 }, { x: 69, y: 74 }, { x: 81, y: 71 }, { x: 91, y: 74 },
    // ── Bottom band row 2 (y ≈ 82-89%, full width) ──
    { x: 13, y: 83 }, { x: 26, y: 88 }, { x: 40, y: 82 }, { x: 54, y: 87 },
    { x: 66, y: 83 }, { x: 78, y: 89 }, { x: 87, y: 84 }, { x: 20, y: 86 },
    // ── Bottom band row 3 (y ≈ 93-96%, sparse) ──
    { x: 33, y: 94 }, { x: 60, y: 93 },
  ];
  const popStarts = positions.map((_, index) => 0.01 + (index / (NOTIF_COUNT - 1)) * 0.37);
  const popDuration = 0.04;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function setActiveText(target) {
    if (currentText === target) {
      return;
    }

    currentText = target;
    text1.className = target === 1 ? 'active' : 'hidden';
    text2.className = target === 2 ? 'active' : 'hidden';
    text3.className = target === 3 ? 'active' : 'hidden';
  }

  function updateNotifSizes() {
    for (let index = 0; index < NOTIF_COUNT; index += 1) {
      const notif = notifs[index];

      if (!notif) {
        notifSizes[index].w = 0;
        notifSizes[index].h = 0;
        continue;
      }

      notifSizes[index].w = notif.offsetWidth;
      notifSizes[index].h = notif.offsetHeight;
    }
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
  }

  function handleResize() {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() => {
      updateDimensions();
      updateNotifSizes();
      requestNoiseUpdate();
    }, 120);
  }

  function computeProgress() {
    const scrolled = cachedScrollY - outerTop;
    return clamp(scrolled / scrollRange, 0, 1);
  }

  function cancelNoiseUpdate() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
    rafId = null;
  }

  function requestNoiseUpdate() {
    if (!isVisible || rafId !== null) {
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      renderNoise();
    });
  }

  function renderNoise() {
    const progress = computeProgress();
    if (progress === lastRenderedProgress) {
      return;
    }

    const vw = stickyW;
    const vh = stickyH;
    const cx = vw / 2;
    const cy = vh / 2;

    if (progress < 0.42) {
      setActiveText(1);
    } else if (progress < 0.65) {
      setActiveText(2);
    } else {
      setActiveText(3);
    }

    const absorbStart = 0.46;
    const absorbEnd = 0.64;
    const blurCutoff = isNarrowMobile ? 0 : 0.28;
    const isAbsorbingPhase = progress >= blurCutoff;
    const forceHideNotifs = progress >= 0.65;

    notifs.forEach((notif, index) => {
      if (!notif) {
        return;
      }

      if (forceHideNotifs) {
        if (notifVisible[index]) {
          notifVisible[index] = false;
          notifAbsorbing[index] = false;
          notif.classList.remove('absorbing');
          notif.style.visibility = 'hidden';
          notif.style.opacity = '0';
          notif.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }

      const popStart = popStarts[index];
      const popEnd = popStart + popDuration;
      const popP = clamp((progress - popStart) / (popEnd - popStart), 0, 1);
      const popEased = easeOut(popP);

      if (popP <= 0) {
        if (notifVisible[index]) {
          notifVisible[index] = false;
          notif.style.visibility = 'hidden';
          if (notifAbsorbing[index]) {
            notifAbsorbing[index] = false;
            notif.classList.remove('absorbing');
          }
          notif.style.opacity = '0';
          notif.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }

      if (!notifVisible[index]) {
        notifVisible[index] = true;
        notif.style.visibility = 'visible';
      }

      if (isAbsorbingPhase && !notifAbsorbing[index]) {
        notifAbsorbing[index] = true;
        notif.classList.add('absorbing');
      } else if (!isAbsorbingPhase && notifAbsorbing[index]) {
        notifAbsorbing[index] = false;
        notif.classList.remove('absorbing');
      }

      const size = notifSizes[index];
      const width = size.w;
      const height = size.h;
      let targetX = (positions[index].x / 100) * vw - width / 2;
      let targetY = (positions[index].y / 100) * vh - height / 2;

      const textWidth = Math.min(vw * 0.9, 500);
      const textHeight = 140;
      const textLeft = cx - textWidth / 2;
      const textRight = cx + textWidth / 2;
      const textTop = cy - textHeight / 2;
      const textBottom = cy + textHeight / 2;

      if (
        targetX + width > textLeft &&
        targetX < textRight &&
        targetY + height > textTop &&
        targetY < textBottom
      ) {
        if (targetY + height / 2 < cy) {
          targetY = textTop - height - ((index % 3) * 4);
        } else {
          targetY = textBottom + ((index % 3) * 4);
        }
      }

      // Clamp within container bounds so overflow:hidden doesn't clip notifications
      const pad = 4;
      targetX = Math.max(pad, Math.min(vw - width - pad, targetX));
      targetY = Math.max(pad, Math.min(vh - height - pad, targetY));

      const absorbP = clamp((progress - absorbStart) / (absorbEnd - absorbStart), 0, 1);
      const absorbEased = easeInOut(absorbP);
      const centerX = cx - width / 2;
      const centerY = cy - height / 2;
      const finalX = lerp(targetX, centerX, absorbEased);
      const finalY = lerp(targetY, centerY, absorbEased);
      const mobileScale = isCompactMobile ? 0.7 : (isNarrowMobile ? 0.75 : 1);
      const popScale = Math.min(popEased * 1.08, 1.08) * mobileScale;
      const absorbScale = lerp(popScale, 0.1, absorbEased);
      const finalScale = absorbP > 0 ? absorbScale : popScale;
      const fadeOut = absorbP > 0.4 ? 1 - (absorbP - 0.4) / 0.6 : 1;

      if (absorbP > 0 && fadeOut <= 0) {
        if (notifVisible[index]) {
          notifVisible[index] = false;
          notif.style.visibility = 'hidden';
          if (notifAbsorbing[index]) {
            notifAbsorbing[index] = false;
            notif.classList.remove('absorbing');
          }
          notif.style.opacity = '0';
          notif.style.transform = 'translate3d(0, 0, 0) scale(0)';
        }
        return;
      }

      notif.style.opacity = String(clamp(popEased * fadeOut, 0, 1));
      notif.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) scale(${Math.max(finalScale, 0)})`;
    });

    lastRenderedProgress = progress;
  }

  updateDimensions();
  window.addEventListener('scroll', () => {
    cachedScrollY = window.scrollY;
    requestNoiseUpdate();
  }, { passive: true });
  updateNotifSizes();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      updateDimensions();
      updateNotifSizes();
      requestNoiseUpdate();
    });
  }

  window.addEventListener('resize', handleResize);

  if ('IntersectionObserver' in window) {
    const noiseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          requestNoiseUpdate();
        } else {
          cancelNoiseUpdate();
        }
      });
    }, { threshold: 0 });

    noiseObserver.observe(outer);
  } else {
    isVisible = true;
    requestNoiseUpdate();
  }
})();
