/**
 * Falling Images Animation
 * Adapted from React component for Vanilla JS
 */

const fallingImagesConfig = {
  imageSize: 100,
  borderRadius: 8,
  gravity: 0.6,
  airResistance: 0.985,
  bounceFactor: 0.6,
  spawnDelay: 100,
  initialRotation: 0.7,
  rotationSpeed: 0.04,
  scrollTrigger: true,
  images: [
    "images/Falling icons/image_44_img_da57c9e8.webp",
    "images/Falling icons/image_45_img_221e2c67.webp",
    "images/Falling icons/image_46_img_1a04e59c.webp",
    "images/Falling icons/image_47_img_c0ac5fac.webp",
    "images/Falling icons/image_48_img_673baf71.webp",
    "images/Falling icons/image_49_img_8737b659.webp",
    "images/Falling icons/image_50_img_d886271b.webp",
    "images/Falling icons/image_51_img_2fc82fca.webp",
    "images/Falling icons/image_52_img_2d909b11.webp",
    "images/Falling icons/image_53_img_884ac643.webp",
    "images/Falling icons/image_54_img_6e7e94f3.webp",
    "images/Falling icons/image_55_img_7084f892.webp",
    "images/Falling icons/image_56_img_2c4c3fd7.webp",
    "images/Falling icons/image_57_img_545d81d4.webp",
    "images/Falling icons/image_58_img_edcf950a.webp",
    "images/Falling icons/image_59_img_a2e8f6af.webp"
  ]
};

function initFallingImages(containerId, canvasId) {
  const container = document.getElementById(containerId);
  const canvas = document.getElementById(canvasId);
  
  if (!container || !canvas) return;

  const ctx = canvas.getContext("2d");
  let animationId;
  let images = [];
  let spawnIndex = 0;
  let hasStarted = !fallingImagesConfig.scrollTrigger;
  let responsiveImageSize = fallingImagesConfig.imageSize;

  // Calculate responsive image size
  const calculateResponsiveSize = () => {
    const viewportWidth = window.innerWidth;
    // Scale proportionally: (current width / 1200) * 85 (original formula from React code)
    // But user set imageSize to 135. Let's adjust ratio: (135 / 85) ~ 1.58
    // React code: (viewportWidth / 1200) * 85
    // Adjusted: (viewportWidth / 1200) * 135
    responsiveImageSize = (viewportWidth / 1200) * fallingImagesConfig.imageSize;
  };

  calculateResponsiveSize();
  window.addEventListener("resize", calculateResponsiveSize);

  // Set canvas size
  const updateSize = () => {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  };
  
  updateSize();
  window.addEventListener("resize", updateSize);
  
  // Use ResizeObserver for better container size detection
  const resizeObserver = new ResizeObserver(() => {
    updateSize();
  });
  resizeObserver.observe(container);

  // Physics Class
  // Pre-calculate border color for use in draw()
  let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-default').trim();
  if (!borderColor) borderColor = '#e5e7eb'; // Fallback

  class FallingImage {
    constructor(imgSrc, x, zIndex) {
      this.img = new Image();
      this.img.src = imgSrc;
      this.width = responsiveImageSize;
      this.height = responsiveImageSize; // Assuming square icons based on component
      this.x = x;
      this.y = -this.height - Math.random() * 100;
      this.velocityY = 0;
      this.velocityX = (Math.random() - 0.5) * 3;
      this.rotation = (Math.random() - 0.5) * fallingImagesConfig.initialRotation;
      this.rotationSpeed = (Math.random() - 0.5) * fallingImagesConfig.rotationSpeed;
      this.loaded = false;
      this.zIndex = zIndex;
      this.isSettled = false;

      this.img.onload = () => {
        this.loaded = true;
      };
    }

    checkCollision(other) {
      // Logic from React component
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
      // Update dynamic size
      this.width = responsiveImageSize;
      this.height = responsiveImageSize;

      if (this.isSettled) return;

      this.velocityY += fallingImagesConfig.gravity;
      this.velocityY *= fallingImagesConfig.airResistance;
      this.velocityX *= fallingImagesConfig.airResistance;

      this.y += this.velocityY;
      this.x += this.velocityX;

      this.rotation += this.rotationSpeed;
      
      // Air resistance damping on rotation was 0.98 in React code hardcoded
      // but configured rotationDamping variable there.
      // Re-using 0.98 as per original code logic inside update loop, 
      // or using airResistance if intended to be coupled?
      // React code: rotationSpeed *= rotationDamping (0.98)
      this.rotationSpeed *= 0.98; 

      images.forEach((other) => {
        if (other !== this && other.loaded) {
          if (this.checkCollision(other)) {
            this.resolveCollision(other);
          }
        }
      });

      // Floor collision
      if (this.y + this.height > canvas.height) {
        this.y = canvas.height - this.height;
        this.velocityY *= -fallingImagesConfig.bounceFactor;
        this.velocityX *= 0.85; // Friction
        this.rotationSpeed *= 0.7;

        if (Math.abs(this.velocityY) < 0.2 && Math.abs(this.velocityX) < 0.2) {
          this.velocityY = 0;
          this.velocityX = 0;
          this.rotationSpeed = 0;
          this.isSettled = true;
        }
      }

      // Wall collisions
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
      if (!this.loaded) return;

      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);

      const radius = fallingImagesConfig.borderRadius;
      const x = -this.width / 2;
      const y = -this.height / 2;
      const w = this.width;
      const h = this.height;

      // Define path helper
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

      // 1. Draw Image with Clip
      ctx.save();
      definePath();
      ctx.clip();
      ctx.drawImage(this.img, x, y, w, h);
      ctx.restore();

      // 2. Draw Border - Removed by user request
      // definePath();
      // ctx.lineWidth = 1;
      // ctx.strokeStyle = borderColor;
      // ctx.stroke();

      ctx.restore();
    }
  }

  const spawnNextImage = () => {
    if (spawnIndex >= fallingImagesConfig.images.length) return;

    // Spawn logic:
    // 25% Left (0 - 25%)
    // 50% Center (25% - 75%)
    // 25% Right (75% - 100%)
    const width = canvas.width;
    const maxX = width - responsiveImageSize;
    let randomX;

    const r = Math.random();

    if (r < 0.25) {
      // Left (0% to 25%)
      // Ensure we don't spawn past the max width even in left zone if screen is weird, 
      // but generally 0.25*width should be safe.
      const leftZoneMax = Math.min(width * 0.25, maxX);
      randomX = Math.random() * leftZoneMax;
    } else if (r < 0.75) {
      // Center (25% to 75%)
      const centerZoneStart = width * 0.25;
      const centerZoneLimit = Math.min(width * 0.75, maxX);
      // If limit < start (shouldn't happen with normal sizing), handle it
      const safeLimit = Math.max(centerZoneStart, centerZoneLimit);
      randomX = centerZoneStart + Math.random() * (safeLimit - centerZoneStart);
    } else {
      // Right (75% to 100%)
      const rightZoneStart = width * 0.75;
      // Start must not be beyond maxX
      const safeStart = Math.min(rightZoneStart, maxX);
      randomX = safeStart + Math.random() * (maxX - safeStart);
    }
    
    // Final safety check
    if (randomX < 0) randomX = 0;
    if (randomX > maxX) randomX = maxX;

    const newImage = new FallingImage(
      fallingImagesConfig.images[spawnIndex],
      randomX,
      spawnIndex
    );
    images.push(newImage);
    spawnIndex++;

    if (spawnIndex < fallingImagesConfig.images.length) {
      setTimeout(spawnNextImage, fallingImagesConfig.spawnDelay);
    }
  };

  // Observe logic
  if (fallingImagesConfig.scrollTrigger) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true;
          spawnNextImage();
        }
      });
    }, { threshold: 0.1 }); 
    observer.observe(container);
  } else {
    hasStarted = true;
    spawnNextImage();
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

    sortedImages.forEach(img => {
      img.update();
      img.draw();
    });

    animationId = requestAnimationFrame(animate);
  };

  animate();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFallingImages('falling-images-container', 'falling-images-canvas');
});
