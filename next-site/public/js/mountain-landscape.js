/**
 * Interactive Mountain Landscape Animation
 * Adapted from React component for Vanilla JS
 */

const config = {
  lineCount: 30,
  hoverForce: 150,
  smoothing: 0.1,
};

function initMountainLandscape(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with id '${canvasId}' not found.`);
    return;
  }

  const ctx = canvas.getContext('2d');
  let animationId;
  let startTime = Date.now();

  // Set canvas size
  const resizeCanvas = () => {
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
  };

  // Initial resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Use ResizeObserver for better container size detection
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  if (canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement);
  }

  // Generate mountain landscape path
  const generateMountainPath = (lineIndex, time, width, height) => {
    const points = [];
    const segments = 150;
    const progress = lineIndex / config.lineCount;

    // Base elevation - higher lines are further back
    // Add padding to keep lines within bounds
    const padding = 20;
    const baseY = padding + height * 0.25 + progress * height * 0.45;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = t * width;

        // Create multiple mountain peaks with reduced height to fit in bounds
        // Main peak in center
        const peak1 =
            Math.pow(Math.sin(t * Math.PI), 2) *
            height *
            0.25 *
            (1 - progress * 0.3);

        // Secondary peaks
        const peak2 =
            Math.pow(Math.sin((t - 0.2) * Math.PI * 1.5), 3) *
            height *
            0.18 *
            (1 - progress * 0.4);
        const peak3 =
            Math.pow(Math.sin((t - 0.7) * Math.PI * 1.2), 2) *
            height *
            0.2 *
            (1 - progress * 0.5);

        // Add smaller ridges for detail
        const ridge =
            Math.sin(t * Math.PI * 8 + lineIndex * 0.3) *
            height *
            0.02 *
            (1 - progress * 0.5);

        // Continuous flowing animation - each line moves independently
        const wave1 =
            Math.sin(t * Math.PI * 4 + time * 2.5 + lineIndex * 0.4) * 5;
        const wave2 =
            Math.cos(t * Math.PI * 6 + time * 2.2 + lineIndex * 0.6) * 4;
        const wave = wave1 + wave2;

        // Combine all elements
        let y =
            baseY - peak1 - Math.max(0, peak2) - peak3 - ridge + wave;

        points.push({ x, y });
    }

    return points;
  };

  // Animation loop
  const animate = () => {
    const time = (Date.now() - startTime) * 0.001;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw mountain lines from back to front
    for (let i = 0; i < config.lineCount; i++) {
        const points = generateMountainPath(i, time, width, height);
        const opacity = 0.2 + (i / config.lineCount) * 0.6;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(35, 35, 35, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw smooth curve
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y);

            for (let j = 1; j < points.length - 2; j++) {
                const xc = (points[j].x + points[j + 1].x) / 2;
                const yc = (points[j].y + points[j + 1].y) / 2;
                ctx.quadraticCurveTo(points[j].x, points[j].y, xc, yc);
            }

            if (points.length > 2) {
                ctx.quadraticCurveTo(
                    points[points.length - 2].x,
                    points[points.length - 2].y,
                    points[points.length - 1].x,
                    points[points.length - 1].y
                );
            }
        }

        ctx.stroke();
    }

    animationId = requestAnimationFrame(animate);
  };

  // Start animation
  animate();

  // Cleanup function (optional, if we were using a framework component unmount)
  return () => {
    window.removeEventListener('resize', resizeCanvas);
    resizeObserver.disconnect();
    cancelAnimationFrame(animationId);
  };
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMountainLandscape('mountain-canvas');
});
