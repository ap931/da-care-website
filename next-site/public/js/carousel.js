// Carousel Logic
document.addEventListener('DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.usp-carousel-wrapper');

  wrappers.forEach(wrapper => {
      const track = wrapper.querySelector('.usp-carousel');
      
      // Find buttons in the footer (sibling or child of wrapper depending on HTML structure)
      // In the new HTML structure, buttons are likely inside .usp-footer which might be inside or outside wrapper?
      // Based on user provided HTML, there is a .usp-carousel-wrapper.
      // The buttons were not in the provided HTML, but I will place them inside .usp-footer which I'll put after .usp-carousel (inside wrapper or after?)
      // Let's assume I'll structure it: .usp-carousel-wrapper > .usp-carousel ... + .usp-footer (inside wrapper for encapsulation or outside?)
      // The CSS shows .usp-footer separate.
      // Let's look for buttons within the same container or parent section.
      
      // Actually, to be safe and robust, let's look for buttons within the closest section or container
      // OR, since I am rewriting the HTML, I can put them inside the wrapper or just after.
      // Let's look inside the wrapper first.
      let prevBtn = wrapper.querySelector('.usp-nav button:first-child');
      let nextBtn = wrapper.querySelector('.usp-nav button:last-child');

      // If not found in wrapper, check if there is a footer sibling
      if (!prevBtn || !nextBtn) {
          const section = wrapper.closest('section');
          if (section) {
             prevBtn = section.querySelector('.usp-nav button:first-child');
             nextBtn = section.querySelector('.usp-nav button:last-child');
          }
      }

      if (!track || !prevBtn || !nextBtn) return;

      const getScrollItemWidth = () => {
          const card = track.querySelector('.usp-card');
          if (!card) return 0;
          const gap = parseFloat(getComputedStyle(track).gap) || 0;
          return card.offsetWidth + gap;
      };

      const updateButtons = () => {
          const itemWidth = getScrollItemWidth();
          if (!itemWidth) return;
          
          let currentIndex = Math.round(track.scrollLeft / itemWidth);
          const maxScroll = track.scrollWidth - track.clientWidth;
          const maxIndex = Math.ceil(maxScroll / itemWidth);

          // Force state if at explicit boundaries to override index rounding issues
          if (track.scrollLeft <= 5) {
              currentIndex = 0;
          }
          if (Math.abs(track.scrollLeft - maxScroll) <= 5) {
              currentIndex = maxIndex;
          }

          if (prevBtn) prevBtn.disabled = currentIndex <= 0;
          if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
      };

      // Initial check (delay slightly to ensure layout)
      updateButtons();
      setTimeout(updateButtons, 300);
      
      // Ensure specific check after full load
      window.addEventListener('load', updateButtons);

      // Listen for scroll events
      track.addEventListener('scroll', updateButtons, { passive: true });
      
      // Monitor size changes (e.g. images loading, resizing)
      const resizeObserver = new ResizeObserver(() => {
        updateButtons();
      });
      resizeObserver.observe(track);

      const scroll = (direction) => {
          const amount = getScrollItemWidth();
          if (amount === 0) return;
          
          track.scrollBy({
              left: direction * amount,
              behavior: 'smooth' 
          });
      };

      prevBtn.addEventListener('click', () => {
          scroll(-1);
      });
      nextBtn.addEventListener('click', () => {
          scroll(1);
      });
  });
});
