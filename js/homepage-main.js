// Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));

  const heroTitleOval = document.getElementById('hero-title-oval');
  if (heroTitleOval) {
    const gradient = heroTitleOval.querySelector('#hero-title-gradient');
    const glow = heroTitleOval.querySelector('.hero-title-oval-glow');
    const stroke = heroTitleOval.querySelector('.hero-title-oval-stroke');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rootStyles = getComputedStyle(document.documentElement);
    const colorMap = [
      ['--coral', 0],
      ['--mint', 1],
      ['--sky', 2],
    ];
    let rafId = 0;

    const setThemeStops = () => {
      if (!gradient) return;
      colorMap.forEach(([token, index]) => {
        const stop = gradient.children[index];
        const color = rootStyles.getPropertyValue(token).trim();
        if (stop && color) stop.setAttribute('stop-color', color);
      });
    };

    const renderStaticOval = () => {
      if (gradient) gradient.setAttribute('gradientTransform', 'rotate(12 0.5 0.5)');
      if (stroke) {
        stroke.style.strokeWidth = '1.6';
        stroke.style.strokeDashoffset = '0';
      }
      if (glow) {
        glow.style.strokeWidth = '2.2';
        glow.style.strokeDashoffset = '0';
        glow.style.opacity = '0.3';
      }
      heroTitleOval.style.transform = 'scale(1)';
      heroTitleOval.style.opacity = '0.9';
    };

    const animateOval = (time) => {
      const t = time * 0.001;
      const pulse = (Math.sin(t * 1.35) + 1) * 0.5;
      const secondaryPulse = (Math.cos(t * 1.05) + 1) * 0.5;
      const strokeWidth = 1.35 + pulse * 0.35;
      const glowWidth = 2 + secondaryPulse * 0.65;

      if (gradient) gradient.setAttribute('gradientTransform', `rotate(${t * 26} 0.5 0.5)`);
      if (stroke) {
        stroke.style.strokeWidth = strokeWidth.toFixed(2);
        stroke.style.strokeDashoffset = `${(-t * 42).toFixed(2)}`;
        stroke.style.opacity = (0.82 + pulse * 0.14).toFixed(3);
      }
      if (glow) {
        glow.style.strokeWidth = glowWidth.toFixed(2);
        glow.style.strokeDashoffset = `${(-t * 24).toFixed(2)}`;
        glow.style.opacity = (0.24 + secondaryPulse * 0.22).toFixed(3);
      }

      heroTitleOval.style.transform = `scale(${(1 + pulse * 0.03).toFixed(3)})`;
      heroTitleOval.style.opacity = (0.8 + secondaryPulse * 0.16).toFixed(3);
      rafId = window.requestAnimationFrame(animateOval);
    };

    const syncHeroOval = () => {
      window.cancelAnimationFrame(rafId);
      setThemeStops();

      if (reducedMotion.matches) {
        renderStaticOval();
        return;
      }

      rafId = window.requestAnimationFrame(animateOval);
    };

    syncHeroOval();
    reducedMotion.addEventListener('change', syncHeroOval);
    window.addEventListener('beforeunload', () => window.cancelAnimationFrame(rafId), { once: true });
  }

  
