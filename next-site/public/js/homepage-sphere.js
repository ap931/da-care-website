const canvas = document.getElementById('sphereCanvas');
const ctx = canvas.getContext('2d');
let useWorker = false;
let sphereWorker = null;
let stickyW = 0;
let stickyH = 0;

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// ── Colors ──
  const COLORS = {
    green:  { r: 193, g: 219, b: 141 },
    blue:   { r: 169, g: 226, b: 255 },
    orange: { r: 246, g: 155, b: 117 },
  };

  function lerpColor(a, b, t) {
    return {
      r: Math.round(lerp(a.r, b.r, t)),
      g: Math.round(lerp(a.g, b.g, t)),
      b: Math.round(lerp(a.b, b.b, t)),
    };
  }

  // ── Flower of Life particle sphere ──
  // Circles are drawn as true flat circles in equirectangular (lon, lat) space,
  // then each sample point is projected onto the unit sphere.
  // FOL rule: radius = spacing, so every circle passes through its 6 neighbours' centres.
  const gradientColors = [COLORS.orange, COLORS.green, COLORS.blue];
  const GRADIENT_TILT = -145 * Math.PI / 180;
  const GRADIENT_AXIS_X = -Math.sin(GRADIENT_TILT);
  const GRADIENT_AXIS_Y = Math.cos(GRADIENT_TILT);

  const N_EQ  = 16;                          // circles per equatorial row
  const R     = (2 * Math.PI) / N_EQ;       // ~22.5° — radius AND column spacing
  const DY    = R * Math.sqrt(3) / 2;       // ~19.5° — row spacing (equilateral hex)
  const isLowEnd = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const PTS   = isLowEnd ? 90 : 180;         // arc sample points per circle

  const COLOR_BUCKETS = 16;
  const baseColorR = new Uint8Array(COLOR_BUCKETS);
  const baseColorG = new Uint8Array(COLOR_BUCKETS);
  const baseColorB = new Uint8Array(COLOR_BUCKETS);
  for (let i = 0; i < COLOR_BUCKETS; i++) {
    const t = i / (COLOR_BUCKETS - 1);
    const c = t < 0.5
      ? lerpColor(gradientColors[0], gradientColors[1], t / 0.5)
      : lerpColor(gradientColors[1], gradientColors[2], (t - 0.5) / 0.5);
    baseColorR[i] = c.r;
    baseColorG[i] = c.g;
    baseColorB[i] = c.b;
  }

  const sxArr = [];
  const syArr = [];
  const szArr = [];
  const sizeArr = [];
  const startXArr = [];
  const startYArr = [];
  const delayArr = [];
  const colorIndexArr = [];

  const N_ROWS = Math.ceil((Math.PI / 2) / DY) + 2;

  for (let row = -N_ROWS; row <= N_ROWS; row++) {
    const cy = row * DY;
    if (Math.abs(cy) > Math.PI / 2 + R) continue;

    const xOff = (Math.abs(row) % 2 === 1) ? R / 2 : 0;

    for (let col = 0; col < N_EQ; col++) {
      const cx = col * R + xOff;

      for (let j = 0; j < PTS; j++) {
        const a   = (j / PTS) * 2 * Math.PI;
        const lon_f = cx + R * Math.cos(a);
        const lat_f = cy + R * Math.sin(a);

        const lat = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lat_f));
        const lon = ((lon_f % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        const sx =  Math.cos(lat) * Math.cos(lon);
        const sy =  Math.sin(lat);
        const sz =  Math.cos(lat) * Math.sin(lon);

        const t = ((sx * GRADIENT_AXIS_X + sy * GRADIENT_AXIS_Y) + 1) / 2;
        const colorIndex = Math.max(0, Math.min(COLOR_BUCKETS - 1, Math.round(t * (COLOR_BUCKETS - 1))));

        const startAngle = Math.random() * Math.PI * 2;
        const startDist  = 15 + Math.random() * 35;

        sxArr.push(sx);
        syArr.push(sy);
        szArr.push(sz);
        sizeArr.push(0.75 + Math.random() * 0.75);
        startXArr.push(Math.cos(startAngle) * startDist);
        startYArr.push(Math.sin(startAngle) * startDist);
        delayArr.push(Math.random() * 0.25);
        colorIndexArr.push(colorIndex);
      }
    }
  }

  const PARTICLE_COUNT = sxArr.length;
  const particleSx = new Float32Array(PARTICLE_COUNT);
  const particleSy = new Float32Array(PARTICLE_COUNT);
  const particleSz = new Float32Array(PARTICLE_COUNT);
  const particleSize = new Float32Array(PARTICLE_COUNT);
  const particleStartX = new Float32Array(PARTICLE_COUNT);
  const particleStartY = new Float32Array(PARTICLE_COUNT);
  const particleDelay = new Float32Array(PARTICLE_COUNT);
  const particleColorIndex = new Uint8Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particleSx[i] = sxArr[i];
    particleSy[i] = syArr[i];
    particleSz[i] = szArr[i];
    particleSize[i] = sizeArr[i];
    particleStartX[i] = startXArr[i];
    particleStartY[i] = startYArr[i];
    particleDelay[i] = delayArr[i];
    particleColorIndex[i] = colorIndexArr[i];
  }
  sxArr.length = 0;
  syArr.length = 0;
  szArr.length = 0;
  sizeArr.length = 0;
  startXArr.length = 0;
  startYArr.length = 0;
  delayArr.length = 0;
  colorIndexArr.length = 0;

  const projX = new Float32Array(PARTICLE_COUNT);
  const projY = new Float32Array(PARTICLE_COUNT);
  const projDepth = new Float32Array(PARTICLE_COUNT);
  const projForm = new Float32Array(PARTICLE_COUNT);

  const ALPHA_BUCKETS = 10;
  const FORM_BINS = COLOR_BUCKETS * ALPHA_BUCKETS;
  const formCounts = new Uint16Array(FORM_BINS);
  const formOffsets = new Uint32Array(FORM_BINS);
  const formWrite = new Uint32Array(FORM_BINS);
  const formIndices = new Uint32Array(PARTICLE_COUNT);
  const colorPalette = new Array(COLOR_BUCKETS);

  let qualityStride = 1;
  let slowFrames = 0;

const canUseWorker = !!(canvas.transferControlToOffscreen && window.Worker);
if (canUseWorker) {
  try {
    sphereWorker = new Worker('js/homepage-sphere-worker.js');
    const offscreen = canvas.transferControlToOffscreen();
    sphereWorker.postMessage({
      type: 'init',
      canvas: offscreen,
      dpr: window.devicePixelRatio || 1,
      width: stickyW,
      height: stickyH,
      particleCount: PARTICLE_COUNT,
      buffers: {
        sx: particleSx.buffer,
        sy: particleSy.buffer,
        sz: particleSz.buffer,
        size: particleSize.buffer,
        startX: particleStartX.buffer,
        startY: particleStartY.buffer,
        delay: particleDelay.buffer,
        colorIndex: particleColorIndex.buffer,
        baseColorR: baseColorR.buffer,
        baseColorG: baseColorG.buffer,
        baseColorB: baseColorB.buffer,
      },
    }, [
      offscreen,
      particleSx.buffer,
      particleSy.buffer,
      particleSz.buffer,
      particleSize.buffer,
      particleStartX.buffer,
      particleStartY.buffer,
      particleDelay.buffer,
      particleColorIndex.buffer,
      baseColorR.buffer,
      baseColorG.buffer,
      baseColorB.buffer,
    ]);
    useWorker = true;
  } catch (err) {
    useWorker = false;
    sphereWorker = null;
  }
}

let rotationAngle = 0;
let rotationSpeed = 0;
const BASE_ROTATION_SPEED = 0.0012; // Very slow constant spin
const SCROLL_ROTATION_MULTIPLIER = 3.0;
const ROTATION_DECAY = 0.92; // Smooth deceleration
const ALPHA_MIN = 0.35;
const ALPHA_MAX = 0.95;
const MAX_QUALITY_STRIDE = 4;

function resetRotation() { rotationSpeed = 0; }

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    if (useWorker && sphereWorker) {
      sphereWorker.postMessage({ type: 'resize', width: stickyW, height: stickyH, dpr });
      return;
    }
    canvas.width = stickyW * dpr;
    canvas.height = stickyH * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }


function drawSphere(progress, scrollDelta, w, h) {
    const frameStart = performance.now();
    ctx.clearRect(0, 0, w, h);

    const sphereStart = 0.28;
    const sphereFormEnd = 0.38;
    const sphereExitStart = 0.86;
    const sphereExitEnd = 1.05;

    if (progress < sphereStart) return;

    const formProgress = clamp((progress - sphereStart) / (sphereFormEnd - sphereStart), 0, 1);
    const exitProgress = clamp((progress - sphereExitStart) / (sphereExitEnd - sphereExitStart), 0, 1);


    // Formation
    const formP = clamp(formProgress / 0.6, 0, 1);

    // Scale
    const scaleEased = easeInOut(formProgress);
    const minR = Math.min(w, h) * 0.08;
    let maxR = Math.min(w * 0.38, h * 0.38);
    if (w < 600) maxR = Math.min(w * 0.34, h * 0.34);
    if (w < 480) maxR = Math.min(w * 0.30, h * 0.30);
    let radius = lerp(minR, maxR, scaleEased);

    // Exit shrink
    if (exitProgress > 0) {
      const exitEased = easeInOut(exitProgress);
      radius *= (1 - exitEased);
      if (radius < 1) return;
    }

    // Position: 30% bottom visible
    // centerY = -0.4 * radius
    const stickyY = -0.4 * radius;
    const moveP = clamp((formProgress - 0.4) / 0.6, 0, 1);
    const moveEased = easeInOut(moveP);
    const centerX = w / 2;
    const centerY = lerp(h / 2, stickyY, moveEased);

    // Gradient only during formation; solid after formed
    const colorFormP = easeOut(clamp(formProgress / 0.5, 0, 1));
    const isFormed = formProgress >= 1;

    // Scroll-boosted rotation with smooth decay
    const scrollBoost = Math.abs(scrollDelta) * SCROLL_ROTATION_MULTIPLIER;
    rotationSpeed = rotationSpeed * ROTATION_DECAY + scrollBoost;
    const direction = scrollDelta === 0 ? 1 : Math.sign(scrollDelta);
    rotationAngle += (BASE_ROTATION_SPEED + rotationSpeed * 0.1) * direction;

    const cosR = Math.cos(rotationAngle);
    const sinR = Math.sin(rotationAngle);

    formCounts.fill(0);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (qualityStride > 1 && (i % qualityStride !== 0)) {
        projForm[i] = 0;
        continue;
      }
      const sx = particleSx[i];
      const sz = particleSz[i];
      const rx = sx * cosR + sz * sinR;
      const rz = -sx * sinR + sz * cosR;
      const ry = particleSy[i];

      if (isFormed && rz < -0.3) {
        projForm[i] = 0;
        continue;
      }

      const pDelay = particleDelay[i];
      const pFormP = clamp((formP - pDelay) / (1 - pDelay), 0, 1);
      const pFormEased = easeOut(pFormP);

      if (pFormEased < 0.01) {
        projForm[i] = 0;
        continue;
      }

      const sphereX = rx * radius;
      const sphereY = ry * radius;

      const px = centerX + lerp(particleStartX[i], sphereX, pFormEased);
      const py = centerY + lerp(particleStartY[i], sphereY, pFormEased);

      if (py < -60 || py > h + 60 || px < -60 || px > w + 60) {
        projForm[i] = 0;
        continue;
      }

      const depth = (rz + 1) / 2;
      projX[i] = px;
      projY[i] = py;
      projDepth[i] = depth;
      projForm[i] = pFormEased;

      const alpha = (ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * depth) * pFormEased;
      const alphaBucket = Math.min(ALPHA_BUCKETS - 1, (alpha / ALPHA_MAX * (ALPHA_BUCKETS - 1)) | 0);
      const colorIndex = particleColorIndex[i];
      formCounts[colorIndex * ALPHA_BUCKETS + alphaBucket]++;
    }

    for (let ci = 0; ci < COLOR_BUCKETS; ci++) {
      colorPalette[ci] = `rgb(${baseColorR[ci]},${baseColorG[ci]},${baseColorB[ci]})`;
    }

    let offset = 0;
    for (let bin = 0; bin < FORM_BINS; bin++) {
      formOffsets[bin] = offset;
      formWrite[bin] = offset;
      offset += formCounts[bin];
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (projForm[i] <= 0) continue;
      const depth = projDepth[i];
      const alpha = (ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * depth) * projForm[i];
      const alphaBucket = Math.min(ALPHA_BUCKETS - 1, (alpha / ALPHA_MAX * (ALPHA_BUCKETS - 1)) | 0);
      const colorIndex = particleColorIndex[i];
      formIndices[formWrite[colorIndex * ALPHA_BUCKETS + alphaBucket]++] = i;
    }

    for (let ab = 0; ab < ALPHA_BUCKETS; ab++) {
      const alpha = ALPHA_MAX * (ab + 0.5) / ALPHA_BUCKETS;
      ctx.globalAlpha = alpha;
      for (let ci = 0; ci < COLOR_BUCKETS; ci++) {
        const bin = ci * ALPHA_BUCKETS + ab;
        const count = formCounts[bin];
        if (!count) continue;
        ctx.fillStyle = colorPalette[ci];
        ctx.beginPath();
        const start = formOffsets[bin];
        const end = start + count;
        for (let k = start; k < end; k++) {
          const idx = formIndices[k];
          const depth = projDepth[idx];
          const size = particleSize[idx] * lerp(0.6, 1.5, depth);
          const half = size;
          let x = (projX[idx] - half) | 0;
          let y = (projY[idx] - half) | 0;
          let d = (half * 2) | 0;
          if (d < 1) d = 1;
          ctx.rect(x, y, d, d);
        }
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    const frameTime = performance.now() - frameStart;
    if (frameTime > 18) slowFrames++;
    else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 30 && qualityStride < MAX_QUALITY_STRIDE) {
      qualityStride++;
      slowFrames = 0;
    }
  }

window.DaCareSphere = {
  draw: drawSphere,
  resize: resizeCanvas,
  resetRotation: resetRotation,
  get useWorker() { return useWorker; },
  get worker() { return sphereWorker; },
  get ctx() { return ctx; },
};
