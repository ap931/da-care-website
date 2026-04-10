let canvas, ctx;
let particleSx, particleSy, particleSz, particleSize, particleStartX, particleStartY, particleDelay, particleColorIndex;
let baseColorR, baseColorG, baseColorB;
let PARTICLE_COUNT = 0;
let projX, projY, projDepth, projForm;
const DEPTH_BUCKETS = 64;
const ALPHA_BUCKETS = 10;
const COLOR_BUCKETS = 16;
const ALPHA_MIN = 0.35;
const ALPHA_MAX = 0.95;
const BASE_ROTATION_SPEED = 0.0012;
const SCROLL_ROTATION_MULTIPLIER = 3.0;
const ROTATION_DECAY = 0.92;
const MAX_QUALITY_STRIDE = 4;
let rotationAngle = 0;
let rotationSpeed = 0;
let qualityStride = 1;
let slowFrames = 0;
let w = 0, h = 0, dpr = 1;
let depthCounts, depthOffsets, depthWrite, depthIndices;
let formCounts, formOffsets, formWrite, formIndices;
let colorPalette;
function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,mn,mx){return Math.max(mn, Math.min(mx, v));}
function easeOut(t){return 1 - Math.pow(1 - t, 3);}
function easeInOut(t){return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;}
function getSphereColor(progress){
  const fade = 0.06;
  const c1End = 0.54;
  const c2End = 0.70;
  const greenR = 186, greenG = 203, greenB = 153;
  const blueR = 169, blueG = 226, blueB = 255;
  const orangeR = 246, orangeG = 155, orangeB = 117;
  if (progress < c1End - fade) {
    return { r: orangeR, g: orangeG, b: orangeB };
  } else if (progress < c1End + fade) {
    const t = easeInOut(clamp((progress - (c1End - fade)) / (fade * 2), 0, 1));
    return { r: Math.round(lerp(orangeR, greenR, t)), g: Math.round(lerp(orangeG, greenG, t)), b: Math.round(lerp(orangeB, greenB, t)) };
  } else if (progress < c2End - fade) {
    return { r: greenR, g: greenG, b: greenB };
  } else if (progress < c2End + fade) {
    const t = easeInOut(clamp((progress - (c2End - fade)) / (fade * 2), 0, 1));
    return { r: Math.round(lerp(greenR, blueR, t)), g: Math.round(lerp(greenG, blueG, t)), b: Math.round(lerp(greenB, blueB, t)) };
  }
  return { r: blueR, g: blueG, b: blueB };
}
function resizeCanvas(){
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
function drawSphere(progress, scrollDelta){
  const frameStart = performance.now();
  ctx.clearRect(0, 0, w, h);
  const sphereStart = 0.28;
  const sphereFormEnd = 0.38;
  const sphereExitStart = 0.86;
  const sphereExitEnd = 1.05;
  if (progress < sphereStart) return;
  const formProgress = clamp((progress - sphereStart) / (sphereFormEnd - sphereStart), 0, 1);
  const exitProgress = clamp((progress - sphereExitStart) / (sphereExitEnd - sphereExitStart), 0, 1);
  const targetColor = getSphereColor(progress);
  const formP = clamp(formProgress / 0.6, 0, 1);
  const scaleEased = easeInOut(formProgress);
  const minR = Math.min(w, h) * 0.08;
  let maxR = Math.min(w * 0.38, h * 0.38);
  if (w < 600) maxR = Math.min(w * 0.34, h * 0.34);
  if (w < 480) maxR = Math.min(w * 0.30, h * 0.30);
  let radius = lerp(minR, maxR, scaleEased);
  if (exitProgress > 0) {
    const exitEased = easeInOut(exitProgress);
    radius *= (1 - exitEased);
    if (radius < 1) return;
  }
  const stickyY = -0.4 * radius;
  const moveP = clamp((formProgress - 0.4) / 0.6, 0, 1);
  const moveEased = easeInOut(moveP);
  const centerX = w / 2;
  const centerY = lerp(h / 2, stickyY, moveEased);
  const colorFormP = easeOut(clamp(formProgress / 0.5, 0, 1));
  const isFormed = formProgress >= 1;
  const scrollBoost = Math.abs(scrollDelta) * SCROLL_ROTATION_MULTIPLIER;
  rotationSpeed = rotationSpeed * ROTATION_DECAY + scrollBoost;
  const direction = scrollDelta === 0 ? 1 : Math.sign(scrollDelta);
  rotationAngle += (BASE_ROTATION_SPEED + rotationSpeed * 0.1) * direction;
  const cosR = Math.cos(rotationAngle);
  const sinR = Math.sin(rotationAngle);
  if (isFormed) depthCounts.fill(0); else formCounts.fill(0);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    if (qualityStride > 1 && (i % qualityStride !== 0)) { projForm[i] = 0; continue; }
    const sx = particleSx[i];
    const sz = particleSz[i];
    const rx = sx * cosR + sz * sinR;
    const rz = -sx * sinR + sz * cosR;
    const ry = particleSy[i];
    if (isFormed && rz < -0.3) { projForm[i] = 0; continue; }
    const pDelay = particleDelay[i];
    const pFormP = clamp((formP - pDelay) / (1 - pDelay), 0, 1);
    const pFormEased = easeOut(pFormP);
    if (pFormEased < 0.01) { projForm[i] = 0; continue; }
    const sphereX = rx * radius;
    const sphereY = ry * radius;
    const px = centerX + lerp(particleStartX[i], sphereX, pFormEased);
    const py = centerY + lerp(particleStartY[i], sphereY, pFormEased);
    if (py < -60 || py > h + 60 || px < -60 || px > w + 60) { projForm[i] = 0; continue; }
    const depth = (rz + 1) / 2;
    projX[i] = px;
    projY[i] = py;
    projDepth[i] = depth;
    projForm[i] = pFormEased;
    if (isFormed) {
      const b = Math.min(DEPTH_BUCKETS - 1, (depth * (DEPTH_BUCKETS - 1)) | 0);
      depthCounts[b]++;
    } else {
      const alpha = (ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * depth) * pFormEased;
      const alphaBucket = Math.min(ALPHA_BUCKETS - 1, (alpha / ALPHA_MAX * (ALPHA_BUCKETS - 1)) | 0);
      const colorIndex = particleColorIndex[i];
      formCounts[colorIndex * ALPHA_BUCKETS + alphaBucket]++;
    }
  }
  if (isFormed) {
    let offset = 0;
    for (let b = 0; b < DEPTH_BUCKETS; b++) {
      depthOffsets[b] = offset;
      depthWrite[b] = offset;
      offset += depthCounts[b];
    }
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (projForm[i] <= 0) continue;
      const depth = projDepth[i];
      const b = Math.min(DEPTH_BUCKETS - 1, (depth * (DEPTH_BUCKETS - 1)) | 0);
      depthIndices[depthWrite[b]++] = i;
    }
    ctx.fillStyle = "rgb(" + targetColor.r + "," + targetColor.g + "," + targetColor.b + ")";
    for (let b = 0; b < DEPTH_BUCKETS; b++) {
      const count = depthCounts[b];
      if (!count) continue;
      const alpha = ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * ((b + 0.5) / DEPTH_BUCKETS);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const start = depthOffsets[b];
      const end = start + count;
      for (let k = start; k < end; k++) {
        const idx = depthIndices[k];
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
  } else {
    for (let ci = 0; ci < COLOR_BUCKETS; ci++) {
      const r = baseColorR[ci];
      const g = baseColorG[ci];
      const b = baseColorB[ci];
      colorPalette[ci] = "rgb(" + r + "," + g + "," + b + ")";
    }
    let offset = 0;
    for (let bin = 0; bin < (COLOR_BUCKETS * ALPHA_BUCKETS); bin++) {
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
      const bin = colorIndex * ALPHA_BUCKETS + alphaBucket;
      formIndices[formWrite[bin]++] = i;
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
self.onmessage = function(e){
  const data = e.data;
  if (data.type === "init") {
    canvas = data.canvas;
    ctx = canvas.getContext("2d");
    w = data.width;
    h = data.height;
    dpr = data.dpr || 1;
    PARTICLE_COUNT = data.particleCount;
    particleSx = new Float32Array(data.buffers.sx);
    particleSy = new Float32Array(data.buffers.sy);
    particleSz = new Float32Array(data.buffers.sz);
    particleSize = new Float32Array(data.buffers.size);
    particleStartX = new Float32Array(data.buffers.startX);
    particleStartY = new Float32Array(data.buffers.startY);
    particleDelay = new Float32Array(data.buffers.delay);
    particleColorIndex = new Uint8Array(data.buffers.colorIndex);
    baseColorR = new Uint8Array(data.buffers.baseColorR);
    baseColorG = new Uint8Array(data.buffers.baseColorG);
    baseColorB = new Uint8Array(data.buffers.baseColorB);
    projX = new Float32Array(PARTICLE_COUNT);
    projY = new Float32Array(PARTICLE_COUNT);
    projDepth = new Float32Array(PARTICLE_COUNT);
    projForm = new Float32Array(PARTICLE_COUNT);
    depthCounts = new Uint16Array(DEPTH_BUCKETS);
    depthOffsets = new Uint32Array(DEPTH_BUCKETS);
    depthWrite = new Uint32Array(DEPTH_BUCKETS);
    depthIndices = new Uint32Array(PARTICLE_COUNT);
    formCounts = new Uint16Array(COLOR_BUCKETS * ALPHA_BUCKETS);
    formOffsets = new Uint32Array(COLOR_BUCKETS * ALPHA_BUCKETS);
    formWrite = new Uint32Array(COLOR_BUCKETS * ALPHA_BUCKETS);
    formIndices = new Uint32Array(PARTICLE_COUNT);
    colorPalette = new Array(COLOR_BUCKETS);
    resizeCanvas();
  } else if (data.type === "resize") {
    w = data.width;
    h = data.height;
    dpr = data.dpr || dpr;
    resizeCanvas();
  } else if (data.type === "frame") {
    drawSphere(data.progress, data.scrollDelta);
  }
};