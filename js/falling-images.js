/**
 * Falling Images Animation
 * Optimized for fewer canvas updates on slower devices.
 */

const fallingIconFiles = [
  "Group 51456.png",
  "Group 51457.png",
  "Group 51458.png",
  "Group 51459.png",
  "Group 51460.png",
  "Group 51461.png",
  "Group 51462.png",
  "Group 51463.png",
  "Group 51464.png",
  "Group 51465.png",
  "Group 51466.png",
  "Group 51467.png",
  "Group 51468.png",
  "Group 51469.png",
  "Group 51470.png",
  "Group 51471.png",
  "Group 51472.png",
  "Group 51473.png",
  "Icon 03.png",
  "Icon 11.png",
  "Icon 17.png",
  "Icon 05.png",
  "Icon 06.png",
  "Icon 07.png",
  "Icon 08.png",
  "Icon 09.png",
  "Icon 10.png",
  "Icon 12.png",
  "Icon 13.png",
  "Icon 14.png",
  "Icon 15.png",
  "Icon 16.png",
  "Icon 29.png"
];

const fallingImagesConfig = {
  imageSize: 84,
  borderRadius: 28,
  gravity: 0.42,
  airResistance: 0.987,
  bounceFactor: 0.54,
  spawnDelay: 105,
  initialRotation: 0.55,
  rotationSpeed: 0.028,
  scrollTrigger: true,
  images: fallingIconFiles.map((fileName) => `images/Falling icons/${fileName.replace('.png', '.webp')}`)
};

function initFallingImages(containerId, canvasId) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowPowerDevice = prefersReducedMotion || window.innerWidth < 768 || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  if (isLowPowerDevice) return;

  const container = document.getElementById(containerId);
  const canvas = document.getElementById(canvasId);
  
  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let animationId = 0;
  let images = [];
  let spawnTimer = 0;
  let hasStarted = !fallingImagesConfig.scrollTrigger;
  let isVisible = false;
  let isRunning = false;
  let allSettled = false;
  
  const activeImages = [...fallingImagesConfig.images]
    .sort(() => Math.random() - 0.5);

  let spawnIndex = 0;
  let responsiveImageSize = fallingImagesConfig.imageSize;
  const imageCache = new Map();

  activeImages.forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    imageCache.set(src, img);
  });

  const calculateResponsiveSize = () => {
    const layoutWidth = container.clientWidth || window.innerWidth;
    responsiveImageSize = Math.round(
      Math.max(58, Math.min(92, (layoutWidth / 1280) * fallingImagesConfig.imageSize))
    );
  };

  calculateResponsiveSize();
  window.addEventListener('resize', calculateResponsiveSize, { passive: true });

  const updateSize = () => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  
  updateSize();
  window.addEventListener('resize', () => {
    updateSize();
    if (allSettled) drawFrame();
    syncPlayback();
  }, { passive: true });
  
  const resizeObserver = new ResizeObserver(() => {
    updateSize();
    if (allSettled) drawFrame();
  });
  resizeObserver.observe(container);

  let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-default').trim();
  if (!borderColor) borderColor = '#e5e7eb'; // Fallback

  class FallingImage {
    constructor(imgSrc, x, zIndex) {
      this.img = imageCache.get(imgSrc);
      this.width = responsiveImageSize;
      this.height = responsiveImageSize;
      this.x = x;
      this.y = -this.height - Math.random() * 100;
      this.velocityY = 0;
      this.velocityX = (Math.random() - 0.5) * 2.2;
      this.rotation = (Math.random() - 0.5) * fallingImagesConfig.initialRotation;
      this.rotationSpeed = (Math.random() - 0.5) * fallingImagesConfig.rotationSpeed;
      this.zIndex = zIndex;
      this.isSettled = false;
    }

    checkCollision(other) {
      const dx = this.x + this.width / 2 - (other.x + other.width / 2);
      const dy = this.y + this.height / 2 - (other.y + other.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (this.width + other.width) / 2;

      return distance < minDistance;
    }

    resolveCollision(other) {
      const dx = this.x + this.width / 2 - (other.x + other.width / 2);
      const dy = this.y + this.height / 2 - (other.y + other.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (this.width + other.width) / 2;

      if (distance < minDistance && distance > 0) {
        const angle = Math.atan2(dy, dx);
        const overlap = minDistance - distance;

        const pushX = Math.cos(angle) * overlap * 0.5;
        const pushY = Math.sin(angle) * overlap * 0.5;

        this.x += pushX;
        this.y += pushY;

        if (!other.isSettled) {
          other.x -= pushX;
          other.y -= pushY;
        }

        const dampingFactor = 0.5;
        this.velocityY *= dampingFactor;
        this.velocityX *= dampingFactor;
      }
    }

    update() {
      this.width = responsiveImageSize;
      this.height = responsiveImageSize;

      if (this.isSettled) return;

      this.velocityY += fallingImagesConfig.gravity;
      this.velocityY *= fallingImagesConfig.airResistance;
      this.velocityX *= fallingImagesConfig.airResistance;

      this.y += this.velocityY;
      this.x += this.velocityX;

      this.rotation += this.rotationSpeed;
      this.rotationSpeed *= 0.98;

      images.forEach((other) => {
        if (other !== this && other.img?.complete) {
          if (this.checkCollision(other)) {
            this.resolveCollision(other);
          }
        }
      });

      if (this.y + this.height > canvas.height) {
        this.y = canvas.height - this.height;
        this.velocityY *= -fallingImagesConfig.bounceFactor;
        this.velocityX *= 0.85;
        this.rotationSpeed *= 0.7;

        if (Math.abs(this.velocityY) < 0.2 && Math.abs(this.velocityX) < 0.2) {
          this.velocityY = 0;
          this.velocityX = 0;
          this.rotationSpeed = 0;
          this.isSettled = true;
        }
      }

      if (this.x < 0) {
        this.x = 0;
        this.velocityX *= -fallingImagesConfig.bounceFactor;
        this.rotationSpeed *= 0.7;
      } else if (this.x + this.width > canvas.width) {
        this.x = canvas.width - this.width;
        this.velocityX *= -fallingImagesConfig.bounceFactor;
        this.rotationSpeed *= 0.7;
      }
    }

    draw() {
      if (!this.img?.complete) return;

      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);

      const radius = Math.min(fallingImagesConfig.borderRadius, this.width * 0.36);
      const x = -this.width / 2;
      const y = -this.height / 2;
      const w = this.width;
      const h = this.height;

      const definePath = () => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = 'white';
      definePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      definePath();
      ctx.clip();
      ctx.drawImage(this.img, x, y, w, h);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      definePath();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }
  }

  const spawnNextImage = () => {
    if (spawnIndex >= activeImages.length) return;

    const width = canvas.width;
    const maxX = width - responsiveImageSize;
    let randomX;

    if (Math.random() < 0.5) {
      const leftZoneMax = Math.min(width * 0.20, maxX);
      randomX = Math.random() * leftZoneMax;
    } else {
      const rightZoneStart = width * 0.80;
      const safeStart = Math.min(rightZoneStart, maxX);
      randomX = safeStart + Math.random() * (maxX - safeStart);
    }

    if (randomX < 0) randomX = 0;
    if (randomX > maxX) randomX = maxX;

    const newImage = new FallingImage(activeImages[spawnIndex], randomX, spawnIndex);
    images.push(newImage);
    spawnIndex++;
    allSettled = false;

    if (spawnIndex < activeImages.length) {
      spawnTimer = window.setTimeout(spawnNextImage, fallingImagesConfig.spawnDelay);
    }

    syncPlayback();
  };

  const drawFrame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    images.forEach((img) => img.draw());
  };

  const stop = () => {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }
  };

  const animate = () => {
    if (!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let unsettled = false;

    images.forEach((img) => {
      img.update();
      img.draw();
      if (!img.isSettled) unsettled = true;
    });

    if (spawnIndex >= activeImages.length && images.length && !unsettled) {
      allSettled = true;
      stop();
      drawFrame();
      return;
    }

    animationId = requestAnimationFrame(animate);
  };

  const start = () => {
    if (isRunning || allSettled || !isVisible || document.hidden) return;
    isRunning = true;
    animationId = requestAnimationFrame(animate);
  };

  const syncPlayback = () => {
    if (!isVisible || document.hidden || allSettled) {
      stop();
      return;
    }

    start();
  };

  if (fallingImagesConfig.scrollTrigger) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true;
          spawnNextImage();
        }
        syncPlayback();
      });
    }, { threshold: 0.1 }); 
    observer.observe(container);
  } else {
    hasStarted = true;
    isVisible = true;
    spawnNextImage();
  }

  document.addEventListener('visibilitychange', syncPlayback);
  drawFrame();
  syncPlayback();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFallingImages('falling-images-container', 'falling-images-canvas');
});
