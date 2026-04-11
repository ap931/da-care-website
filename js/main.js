// ── Mobile Navigation ──
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  const setOpenState = (isOpen) => {
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    mobileNav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('mobile-nav-open', isOpen);
  };

  setOpenState(false);

  toggle.addEventListener('click', () => {
    setOpenState(!toggle.classList.contains('is-open'));
  });

  mobileNav.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(link => {
    link.addEventListener('click', () => setOpenState(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.classList.contains('is-open')) setOpenState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && toggle.classList.contains('is-open')) {
      setOpenState(false);
    }
  }, { passive: true });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileNav);
} else {
  initMobileNav();
}

// ── Scroll-driven Perspective Reveal (Leda Business hero) ──
const heroImage = document.querySelector('.lb-hero__image');
if (heroImage) {
  const maxTilt = 25;   // starting tilt in degrees
  const wrapper = heroImage.closest('.lb-hero__image-wrapper');

  const updatePerspective = () => {
    const rect = wrapper.getBoundingClientRect();
    const windowH = window.innerHeight;

    // progress: 0 when top of wrapper hits bottom of viewport, 1 when top hits top
    const progress = Math.min(Math.max(1 - rect.top / windowH, 0), 1);

    const tilt = maxTilt * (1 - progress);
    const translateY = 60 * (1 - progress);
    const scale = 0.85 + 0.15 * progress;

    heroImage.style.transform = `rotateX(${tilt}deg) translateY(${translateY}px) scale(${scale})`;
  };

  // Set initial state via CSS override
  heroImage.style.transform = `rotateX(${maxTilt}deg) translateY(60px) scale(0.85)`;
  heroImage.style.transition = 'none';

  let perspRaf = 0;
  window.addEventListener('scroll', () => {
    if (!perspRaf) perspRaf = requestAnimationFrame(() => { perspRaf = 0; updatePerspective(); });
  }, { passive: true });

  // Run once on load
  updatePerspective();
}

// ── Scroll-driven Perspective Reveal (Vision preview) ──
const visionImage = document.querySelector('.lb-vision__preview-image');
if (visionImage) {
  const maxTilt = 25;
  const wrapper = visionImage.closest('.lb-vision__preview');

  const updateVisionPerspective = () => {
    const rect = wrapper.getBoundingClientRect();
    const windowH = window.innerHeight;

    const progress = Math.min(Math.max(1 - rect.top / windowH, 0), 1);

    const tilt = maxTilt * (1 - progress);
    const translateY = 60 * (1 - progress);
    const scale = 0.85 + 0.15 * progress;

    visionImage.style.transform = `rotateX(${tilt}deg) translateY(${translateY}px) scale(${scale})`;
  };

  visionImage.style.transform = `rotateX(${maxTilt}deg) translateY(60px) scale(0.85)`;
  visionImage.style.transition = 'none';

  let visionRaf = 0;
  window.addEventListener('scroll', () => {
    if (!visionRaf) visionRaf = requestAnimationFrame(() => { visionRaf = 0; updateVisionPerspective(); });
  }, { passive: true });

  updateVisionPerspective();
}

// ── Hero Sticky Parallax (Home) ──
const heroSection = document.querySelector('.hero');
const heroSticky = document.querySelector('.hero-sticky');
if (heroSection && heroSticky) {
  const heroContent = heroSticky.querySelector('.hero-content');

  const updateHeroParallax = () => {
    const rect = heroSection.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));

    heroSticky.style.opacity = `${1 - progress * 1.5}`;
    if (heroContent) {
      heroContent.style.transform = `translateY(${progress * -60}px) scale(${1 - progress * 0.08})`;
    }
  };

  let parallaxRaf = 0;
  window.addEventListener('scroll', () => {
    if (!parallaxRaf) parallaxRaf = requestAnimationFrame(() => { parallaxRaf = 0; updateHeroParallax(); });
  }, { passive: true });

  updateHeroParallax();
}

// ── Scroll-driven Perspective Reveal (Task Screen) ──
const taskScreenImg = document.querySelector('.task-screen-img');
if (taskScreenImg) {
  const taskSection = taskScreenImg.closest('.task-screen-section');

  if (!taskSection) {
    // Fallback: no wrapper found — show image flat
    taskScreenImg.style.transform = 'none';
    taskScreenImg.style.opacity = '1';
  } else {
    const updateTaskScreen = () => {
      const rect = taskSection.getBoundingClientRect();
      const viewH = window.innerHeight;
      // entry: fraction of section that has entered the viewport from the bottom
      // 0 = top edge at viewport bottom, 1 = top edge at viewport top
      const entry = Math.max(0, viewH - rect.top) / rect.height;
      // progress: 0 at 50% entry (trigger), 1 at 100% entry (fully in)
      const progress = Math.min(Math.max((entry - 0.5) * 2, 0), 1);

      const tilt = 30 * (1 - progress);
      taskScreenImg.style.transform = `perspective(1200px) rotateX(${tilt.toFixed(2)}deg)`;
      taskScreenImg.style.opacity = String((0.5 + 0.5 * progress).toFixed(3));
    };

    // Hard initial state (matches CSS fallback)
    taskScreenImg.style.transform = 'perspective(1200px) rotateX(30deg)';
    taskScreenImg.style.opacity = '0.5';
    taskScreenImg.style.transition = 'none';

    let taskRaf = 0;
    window.addEventListener('scroll', () => {
      if (!taskRaf) taskRaf = requestAnimationFrame(() => { taskRaf = 0; updateTaskScreen(); });
    }, { passive: true });

    updateTaskScreen();
  }
}

// Navbar Scroll Blur Effect + Homepage Hide-On-Scroll
const navbar = document.querySelector('.navbar');
if (navbar) {
    let lastScrollY = window.scrollY;
    let heroHeight = window.innerHeight;
    let ticking = false;
    const firstSection = document.querySelector('section');

    const updateHeroHeight = () => {
        heroHeight = firstSection ? firstSection.offsetHeight : window.innerHeight;
    };

    const handleScroll = () => {
        const triggerPoint = heroHeight * 0.30;
        const currentY = window.scrollY;

        if (currentY > triggerPoint) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }

        const delta = currentY - lastScrollY;
        if (currentY <= 0) {
            navbar.classList.remove('navbar--hidden');
        } else if (delta > 2) {
            navbar.classList.add('navbar--hidden');
        } else if (delta < -2) {
            navbar.classList.remove('navbar--hidden');
        }
        lastScrollY = currentY;
        ticking = false;
    };

    const requestScrollUpdate = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(handleScroll);
        }
    };

    updateHeroHeight();
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', () => {
        updateHeroHeight();
        requestScrollUpdate();
    }, { passive: true });
    handleScroll();
}

// ── Generic Smooth Scroll (in-page anchors) ──
const initSmoothScroll = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    if (reducedMotion.matches) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', href);
  });
};

initSmoothScroll();

// ── Smooth Scroll Animations (.fade-up) ──
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => hero.classList.add('is-ready'));
  }

  const storySections = document.querySelectorAll(
    '.home-showcase, .home-problem, .home-manifesto'
  );

  if (storySections.length) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const activeSections = new Set();
    let rafId = 0;

    const clamp01 = (value) => Math.max(0, Math.min(1, value));
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const setVars = (el, vars) => {
      if (!el) return;
      Object.entries(vars).forEach(([key, value]) => {
        el.style.setProperty(key, value);
      });
    };

    const resetStory = (section) => {
      section.style.setProperty('--story-progress', '1');
      section.style.setProperty('--story-shift', '0px');
      if (section.classList.contains('home-showcase')) {
        section.style.setProperty('--mesh-intensity', '1');
        setVars(section.querySelector('.home-showcase__card'), {
          '--story-offset': '0px',
          '--story-scale': '1',
          '--story-opacity': '1',
          '--story-tilt-x': '0deg',
          '--story-tilt-z': '0deg'
        });
        setVars(section.querySelector('.home-showcase__info'), {
          '--story-offset': '0px',
          '--story-offset-x': '0px',
          '--story-opacity': '1'
        });
        setVars(section.querySelector('.home-showcase__preview'), {
          '--story-offset': '0px',
          '--story-offset-x': '0px',
          '--story-opacity': '1',
          '--story-scale': '1',
          '--story-tilt-y': '0deg',
          '--story-tilt-z': '0deg'
        });
        section.querySelectorAll(
          '.home-showcase__badge, .home-showcase__name, .home-showcase__desc, .home-showcase__ctas'
        ).forEach((el) => {
          setVars(el, { '--story-item-offset': '0px', '--story-item-opacity': '1' });
        });
      }

      if (section.classList.contains('home-problem')) {
        setVars(section.querySelector('.home-problem__inner'), {
          '--story-offset': '0px',
          '--story-opacity': '1'
        });
        setVars(section.querySelector('.home-problem__watermark'), {
          '--story-watermark-offset': '0px',
          '--story-watermark-rotate': '0deg'
        });
      }

      if (section.classList.contains('home-manifesto')) {
        setVars(section.querySelector('.home-manifesto__content'), {
          '--story-offset': '0px',
          '--story-opacity': '1'
        });
      }
    };

    const collapseStory = (section) => {
      section.style.setProperty('--story-progress', '0');
      section.style.setProperty('--story-shift', '28px');
      if (section.classList.contains('home-showcase')) {
        section.style.setProperty('--mesh-intensity', '0');
        const card = section.querySelector('.home-showcase__card');
        const isReversed = card?.classList.contains('home-showcase__card--reversed');
        const sideDir = isReversed ? 1 : -1;
        setVars(section.querySelector('.home-showcase__card'), {
          '--story-offset': '64px',
          '--story-scale': '0.92',
          '--story-opacity': '0.55',
          '--story-tilt-x': '8deg',
          '--story-tilt-z': `${-4 * sideDir}deg`
        });
        setVars(section.querySelector('.home-showcase__info'), {
          '--story-offset': '54px',
          '--story-offset-x': `${72 * sideDir}px`,
          '--story-opacity': '0.35'
        });
        setVars(section.querySelector('.home-showcase__preview'), {
          '--story-offset': '-48px',
          '--story-offset-x': `${-72 * sideDir}px`,
          '--story-opacity': '0.35',
          '--story-scale': '0.9',
          '--story-tilt-y': `${14 * sideDir}deg`,
          '--story-tilt-z': `${6 * sideDir}deg`
        });
        section.querySelectorAll(
          '.home-showcase__badge, .home-showcase__name, .home-showcase__desc, .home-showcase__ctas'
        ).forEach((el) => {
          setVars(el, { '--story-item-offset': '36px', '--story-item-opacity': '0.3' });
        });
      }

      if (section.classList.contains('home-problem')) {
        setVars(section.querySelector('.home-problem__inner'), {
          '--story-offset': '56px',
          '--story-opacity': '0.4'
        });
        setVars(section.querySelector('.home-problem__watermark'), {
          '--story-watermark-offset': '40px',
          '--story-watermark-rotate': '-12deg'
        });
      }

      if (section.classList.contains('home-manifesto')) {
        setVars(section.querySelector('.home-manifesto__content'), {
          '--story-offset': '56px',
          '--story-opacity': '0.4'
        });
      }
    };

    const updateStory = () => {
      rafId = 0;
      if (reducedMotion.matches) {
        storySections.forEach((section) => resetStory(section));
        return;
      }

      const viewH = window.innerHeight || 1;
      const sections = activeSections.size ? Array.from(activeSections) : storySections;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const maxDist = viewH / 2 + rect.height / 2;
        const dist = Math.min(Math.abs(center - viewH / 2), maxDist);
        const progress = clamp01(1 - dist / maxDist);
        const eased = easeOutCubic(progress);

        section.style.setProperty('--story-progress', eased.toFixed(3));
        section.style.setProperty('--story-shift', `${(1 - eased) * 56}px`);

        if (section.classList.contains('home-showcase')) {
          section.style.setProperty('--mesh-intensity', eased.toFixed(3));

          const card = section.querySelector('.home-showcase__card');
          const isReversed = card?.classList.contains('home-showcase__card--reversed');
          const sideDir = isReversed ? 1 : -1;

          setVars(card, {
            '--story-offset': `${(1 - eased) * 64}px`,
            '--story-scale': (0.92 + eased * 0.08).toFixed(3),
            '--story-opacity': (0.55 + eased * 0.45).toFixed(3),
            '--story-tilt-x': `${(1 - eased) * 8}deg`,
            '--story-tilt-z': `${(1 - eased) * -4 * sideDir}deg`
          });

          setVars(section.querySelector('.home-showcase__info'), {
            '--story-offset': `${(1 - eased) * 54}px`,
            '--story-offset-x': `${(1 - eased) * 72 * sideDir}px`,
            '--story-opacity': (0.35 + eased * 0.65).toFixed(3)
          });

          setVars(section.querySelector('.home-showcase__preview'), {
            '--story-offset': `${(1 - eased) * -48}px`,
            '--story-offset-x': `${(1 - eased) * -72 * sideDir}px`,
            '--story-opacity': (0.35 + eased * 0.65).toFixed(3),
            '--story-scale': (0.9 + eased * 0.1).toFixed(3),
            '--story-tilt-y': `${(1 - eased) * 14 * sideDir}deg`,
            '--story-tilt-z': `${(1 - eased) * 6 * sideDir}deg`
          });

          const info = section.querySelector('.home-showcase__info');
          const items = [
            info?.querySelector('.home-showcase__badge'),
            info?.querySelector('.home-showcase__name'),
            info?.querySelector('.home-showcase__desc'),
            info?.querySelector('.home-showcase__ctas')
          ].filter(Boolean);

          items.forEach((item, index) => {
            const lag = index * 0.12;
            const local = clamp01((eased - lag) / (1 - lag));
            setVars(item, {
              '--story-item-offset': `${(1 - local) * 36}px`,
              '--story-item-opacity': (0.3 + local * 0.7).toFixed(3)
            });
          });
        }

        if (section.classList.contains('home-problem')) {
          setVars(section.querySelector('.home-problem__inner'), {
            '--story-offset': `${(1 - eased) * 56}px`,
            '--story-opacity': (0.4 + eased * 0.6).toFixed(3)
          });

          setVars(section.querySelector('.home-problem__watermark'), {
            '--story-watermark-offset': `${(1 - eased) * 40}px`,
            '--story-watermark-rotate': `${(1 - eased) * -12}deg`
          });
        }

        if (section.classList.contains('home-manifesto')) {
          setVars(section.querySelector('.home-manifesto__content'), {
            '--story-offset': `${(1 - eased) * 56}px`,
            '--story-opacity': (0.4 + eased * 0.6).toFixed(3)
          });
        }
      });
    };

    const requestUpdate = () => {
      if (!rafId) rafId = requestAnimationFrame(updateStory);
    };

    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSections.add(entry.target);
        } else {
          activeSections.delete(entry.target);
          collapseStory(entry.target);
        }
      });
      requestUpdate();
    }, {
      root: null,
      rootMargin: '15% 0px',
      threshold: 0
    });

    storySections.forEach((section) => storyObserver.observe(section));

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reducedMotion.addEventListener('change', requestUpdate);
    requestUpdate();
  }

  const fadeElements = document.querySelectorAll('.fade-up');
  
  if (fadeElements.length === 0) return;

  // Stagger queue for elements appearing simultaneously
  let delayQueue = [];
  let isProcessingQueue = false;

  const processQueue = () => {
    if (delayQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    
    isProcessingQueue = true;
    const el = delayQueue.shift();
    
    // Slight stagger delay
    setTimeout(() => {
      el.classList.add('is-visible');
      processQueue();
    }, 100);
  };

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger slightly before it comes fully into view
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Only animate once
        observer.unobserve(entry.target);
        
        delayQueue.push(entry.target);
        if (!isProcessingQueue) {
          processQueue();
        }
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));
});

// ── Editorial Reveal System (.reveal) ──
const initEditorialReveals = () => {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach((el) => observer.observe(el));
};

document.addEventListener('DOMContentLoaded', () => {
  initEditorialReveals();
});
