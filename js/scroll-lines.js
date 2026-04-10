document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) return; // Respect accessibility

  const paths = Array.from(document.querySelectorAll('.motion-scroll-line path'));
  
  if (!paths.length) return;
  const activePaths = new Set(paths);
  let rafId = 0;

  // Initialize stroke dash properties
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.setAttribute('stroke-dasharray', length);
    path.setAttribute('stroke-dashoffset', length); // Start fully hidden
    path.dataset.length = length;
    path.container = path.closest('section') || document.body;
  });

  const updateScroll = () => {
    rafId = 0;
    const windowHeight = window.innerHeight;
    const targets = activePaths.size ? Array.from(activePaths) : paths;

    targets.forEach(path => {
      const length = parseFloat(path.dataset.length);
      const rect = path.container.getBoundingClientRect();
      
      // Calculate progress: 0 when top enters bottom, 1 when bottom leaves top
      const totalDistance = windowHeight + rect.height;
      let scrolledPast = windowHeight - rect.top;
      
      // Specifically for Safe by Design and FAQ, start animating 20% earlier
      if (path.container.id === 'safe' || path.container.id === 'faq-section') {
        scrolledPast += windowHeight * 0.2;
      }

      let progress;
      // Hero at top of page: progress from 0 (on load) to 1 (section scrolled out)
      if (path.container.id === 'lb-hero') {
        progress = -rect.top / rect.height;
      } else {
        progress = scrolledPast / totalDistance;
      }
      progress = Math.max(0, Math.min(1, progress));
      
      // Smoothing with a simple sine ease for better flow through the center
      const easePercent = (1 - Math.cos(progress * Math.PI)) / 2;
      
      // We want a segment (snake) that is roughly 40% of the total path
      const segmentLength = length * 0.4;
      
      // Total travel distance: length + segmentLength (to fully enter and fully exit)
      const totalTravel = length + segmentLength;
      
      path.setAttribute('stroke-dasharray', `${segmentLength}, ${length}`);
      path.setAttribute('stroke-dashoffset', length - (easePercent * totalTravel));
    });
  };

  const requestUpdate = () => {
    if (!rafId) {
      rafId = window.requestAnimationFrame(updateScroll);
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        paths
          .filter(path => path.container === entry.target)
          .forEach(scopedPath => {
            if (entry.isIntersecting) {
              activePaths.add(scopedPath);
            } else {
              activePaths.delete(scopedPath);
            }
          });
      });

      requestUpdate();
    }, {
      root: null,
      rootMargin: '20% 0px',
      threshold: 0
    });

    const observedContainers = new Set();
    paths.forEach(path => {
      if (!observedContainers.has(path.container)) {
        observedContainers.add(path.container);
        observer.observe(path.container);
      }
    });
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
});
