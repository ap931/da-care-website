(() => {
  const canvas = document.querySelector('.hero-triangle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  const hero = document.querySelector('.hero');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  const parseColor = (value, fallback) => {
    if (!value) return fallback;
    const trimmed = value.trim();
    if (trimmed.startsWith('#')) {
      const hex = trimmed.replace('#', '');
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b };
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
      }
    }
    const rgbMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((part) => parseFloat(part.trim()));
      if (parts.length >= 3) {
        return { r: parts[0], g: parts[1], b: parts[2] };
      }
    }
    return fallback;
  };

  const readVar = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return parseColor(value, fallback);
  };

  const palette = [
    readVar('--mint', { r: 186, g: 203, b: 153 }),
    readVar('--sky', { r: 169, g: 226, b: 255 }),
    readVar('--coral', { r: 246, g: 155, b: 117 })
  ];

  const productBubbles = [
    { label: 'Coren', color: readVar('--coral-dark', { r: 212, g: 163, b: 115 }), anchor: 0 },
    { label: 'Leda Work', color: readVar('--sky-dark', { r: 133, g: 183, b: 235 }), anchor: 1 },
    { label: 'Leda', color: readVar('--mint-dark', { r: 116, g: 180, b: 155 }), anchor: 2 }
  ];

  const lightStroke = readVar('--sky-light', { r: 219, g: 243, b: 255 });
  const fontSans = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-sans')
    .trim() || 'Arial, sans-serif';

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    cx: 0,
    cy: 0,
    radius: 0,
    radiusX: 0,
    radiusY: 0,
    base: [],
    particles: [],
    sparks: [],
    noise: null,
    running: false,
    raf: 0,
    visible: true,
    rotation: { ax: 0.35, ay: -0.6, az: 0 },
    outerRotation: { ax: 0.1, ay: -0.1, az: 0 },
    pointer: { x: 0, y: 0, tx: 0, ty: 0 },
    shapeCurrent: null,
    shapeTarget: null,
    currentScale: 0
  };

  const toRgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpPoint = (a, b, t) => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t)
  });

  const buildBase = () => {
    const isPortrait = state.height > state.width;
    
    if (isPortrait) {
      state.shapeTarget = [
        { x: 0.05, y: -3.4 },
        { x: 2.1, y: 2.2 },
        { x: -2.3, y: 1.5 }
      ];
    } else {
      state.shapeTarget = [
        { x: 0.15, y: -2.0 },
        { x: 2.35, y: 0.9 },
        { x: -2.55, y: 1.45 }
      ];
    }

    if (!state.shapeCurrent) {
      state.shapeCurrent = state.shapeTarget.map(p => ({...p}));
    }
  };

  const buildParticles = () => {
    const density = Math.max(40, Math.min(120, Math.round((state.width * state.height) / 3500)));
    state.particles = Array.from({ length: density }, () => {
      let r1 = Math.random();
      let r2 = Math.random();
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      return {
        u: r1,
        v: r2,
        w: 1 - r1 - r2,
        size: 0.8 + Math.random() * 1.8,
        speed: 0.35 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random()
      };
    });

    const sparkCount = Math.max(10, Math.min(20, Math.round(state.width / 28)));
    state.sparks = Array.from({ length: sparkCount }, (_, i) => ({
      edge: i % 3,
      offset: Math.random(),
      speed: 0.05 + Math.random() * 0.12,
      size: 1 + Math.random() * 2.4
    }));
  };

  const buildNoise = () => {
    const noiseCanvas = document.createElement('canvas');
    const size = 128;
    noiseCanvas.width = size;
    noiseCanvas.height = size;
    const nctx = noiseCanvas.getContext('2d');
    if (!nctx) return;

    const imageData = nctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.floor(Math.random() * 255);
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = Math.random() * 40;
    }
    nctx.putImageData(imageData, 0, 0);
    state.noise = noiseCanvas;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect) return;

    state.width = Math.max(1, rect.width);
    state.height = Math.max(1, rect.height);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    state.cx = state.width / 2;
    state.cy = state.height / 2;
    const baseSize = Math.min(state.width, state.height);
    const bubbleMargin = Math.min(60, Math.max(28, baseSize * 0.05));
    state.radiusX = Math.max(90, state.width / 2 - bubbleMargin);
    state.radiusY = Math.max(90, state.height / 2 - bubbleMargin);
    state.radius = Math.min(state.radiusX, state.radiusY);
    buildBase();
    buildParticles();
    buildNoise();
    render(0);
  };

  const rotatePoint = (p, ax, ay, az) => {
    const cosX = Math.cos(ax);
    const sinX = Math.sin(ax);
    const cosY = Math.cos(ay);
    const sinY = Math.sin(ay);
    const cosZ = Math.cos(az);
    const sinZ = Math.sin(az);

    const y1 = p.y * cosX - p.z * sinX;
    const z1 = p.y * sinX + p.z * cosX;
    const x2 = p.x * cosY + z1 * sinY;
    const z2 = -p.x * sinY + z1 * cosY;
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;

    return { x: x3, y: y3, z: z2 };
  };

  const projectPoint = (p) => {
    const depth = 820;
    const z = Math.min(p.z, depth - 60);
    const scale = depth / (depth - z);
    return {
      x: p.x * scale + state.cx,
      y: p.y * scale + state.cy,
      scale
    };
  };

  const computeLayer = (scale, depth, ax, ay, az) => {
    const rotated = state.base.map((point) =>
      rotatePoint({
        x: point.x * scale,
        y: point.y * scale,
        z: depth
      }, ax, ay, az)
    );

    const projected = rotated.map(projectPoint);
    return { rotated, projected };
  };


  const getCornerRadius = (points, factor = 0.45) => {
    let minEdge = Number.POSITIVE_INFINITY;
    for (let i = 0; i < points.length; i += 1) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      minEdge = Math.min(minEdge, Math.hypot(p2.x - p1.x, p2.y - p1.y));
    }
    return Math.max(1, minEdge * factor);
  };

  const getRoundedCorners = (points, radius) => {
    return points.map((point, index) => {
      const prev = points[(index - 1 + points.length) % points.length];
      const next = points[(index + 1) % points.length];
      const v0x = prev.x - point.x;
      const v0y = prev.y - point.y;
      const v1x = next.x - point.x;
      const v1y = next.y - point.y;
      const len0 = Math.hypot(v0x, v0y) || 1;
      const len1 = Math.hypot(v1x, v1y) || 1;
      const maxR = Math.min(len0, len1) * 0.48;
      const r = Math.min(radius, maxR);
      const inPoint = {
        x: point.x + (v0x / len0) * r,
        y: point.y + (v0y / len0) * r
      };
      const outPoint = {
        x: point.x + (v1x / len1) * r,
        y: point.y + (v1y / len1) * r
      };
      return { vertex: point, inPoint, outPoint };
    });
  };

  const buildRoundedPath = (points, radius) => {
    const rounded = getRoundedCorners(points, radius);
    if (!rounded.length) return;
    ctx.beginPath();
    ctx.moveTo(rounded[0].inPoint.x, rounded[0].inPoint.y);
    for (let i = 0; i < rounded.length; i += 1) {
      const curr = rounded[i];
      const next = rounded[(i + 1) % rounded.length];
      ctx.quadraticCurveTo(curr.vertex.x, curr.vertex.y, curr.outPoint.x, curr.outPoint.y);
      ctx.lineTo(next.inPoint.x, next.inPoint.y);
    }
    ctx.closePath();
  };

  const drawTriangle = (points, alpha, width, glow, t, phaseOffset = 0) => {
    const radius = getCornerRadius(points);
    const rounded = getRoundedCorners(points, radius);

    for (let i = 0; i < rounded.length; i += 1) {
      const nextIndex = (i + 1) % rounded.length;
      const p1 = rounded[i].outPoint;
      const p2 = rounded[nextIndex].inPoint;
      const c1 = palette[i % palette.length];
      const c2 = palette[nextIndex % palette.length];
      const shimmer = 0.18 + 0.18 * Math.sin(t * 1.15 + i * 1.7 + phaseOffset);
      const glint = 0.5 + 0.4 * Math.sin(t * 0.7 + i * 1.3 + phaseOffset);
      const mix = {
        r: Math.round(c1.r + (c2.r - c1.r) * glint),
        g: Math.round(c1.g + (c2.g - c1.g) * glint),
        b: Math.round(c1.b + (c2.b - c1.b) * glint)
      };
      const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      gradient.addColorStop(0, toRgba(c1, alpha + shimmer * 0.75));
      gradient.addColorStop(0.52, toRgba(mix, alpha + shimmer * 0.9));
      gradient.addColorStop(1, toRgba(c2, alpha + shimmer * 0.75));

      ctx.strokeStyle = gradient;
      ctx.lineWidth = width * (1 + shimmer * 0.2);
      ctx.shadowBlur = glow * (1 + shimmer * 0.5);
      ctx.shadowColor = toRgba(c1, (alpha + shimmer) * 0.8);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let i = 0; i < rounded.length; i += 1) {
      const corner = rounded[i];
      const c1 = palette[i % palette.length];
      const shimmer = 0.18 + 0.18 * Math.sin(t * 1.15 + i * 1.7 + phaseOffset + 0.4);
      ctx.strokeStyle = toRgba(c1, alpha + shimmer * 0.85);
      ctx.lineWidth = width * (1 + shimmer * 0.2);
      ctx.shadowBlur = glow * (1 + shimmer * 0.5);
      ctx.shadowColor = toRgba(c1, (alpha + shimmer) * 0.8);
      ctx.beginPath();
      ctx.moveTo(corner.inPoint.x, corner.inPoint.y);
      ctx.quadraticCurveTo(corner.vertex.x, corner.vertex.y, corner.outPoint.x, corner.outPoint.y);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  };

  const drawInnerMesh = (outer) => {
    const [p0, p1, p2] = outer;
    const mid01 = lerpPoint(p0, p1, 0.5);
    const mid12 = lerpPoint(p1, p2, 0.5);
    const mid20 = lerpPoint(p2, p0, 0.5);

    ctx.strokeStyle = toRgba(palette[1], 0.18);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(mid01.x, mid01.y);
    ctx.lineTo(mid12.x, mid12.y);
    ctx.lineTo(mid20.x, mid20.y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = toRgba(palette[2], 0.12);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(mid12.x, mid12.y);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(mid20.x, mid20.y);
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(mid01.x, mid01.y);
    ctx.stroke();
  };

  const drawSweep = (outer, t) => {
    const sweep = (Math.sin(t * 0.55) + 1) * 0.5;
    const a = lerpPoint(outer[0], outer[1], sweep);
    const b = lerpPoint(outer[0], outer[2], sweep);

    ctx.strokeStyle = toRgba(palette[0], 0.2);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const drawDashed = (outer, t) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.setLineDash([10, 16]);
    ctx.lineDashOffset = -t * 60;
    ctx.strokeStyle = `rgba(${lightStroke.r}, ${lightStroke.g}, ${lightStroke.b}, 0.35)`;
    ctx.lineWidth = 2.2;
    buildRoundedPath(outer, getCornerRadius(outer, 0.42));
    ctx.stroke();
    ctx.restore();
  };

  const drawVertices = (outer, t) => {
    const pulse = 0.7 + 0.3 * Math.sin(t * 1.1);
    outer.forEach((point, index) => {
      const color = palette[index % palette.length];
      ctx.fillStyle = toRgba(color, 0.5 + pulse * 0.2);
      ctx.shadowBlur = 14;
      ctx.shadowColor = toRgba(color, 0.35);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.2 + pulse * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const drawProductBubbles = (outer, t) => {
    const center = { x: state.cx, y: state.cy };

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    productBubbles.forEach((bubble, index) => {
      const anchor = outer[bubble.anchor % outer.length];
      const vx = anchor.x - center.x;
      const vy = anchor.y - center.y;
      const len = Math.hypot(vx, vy) || 1;
      const nx = vx / len;
      const ny = vy / len;
      const bob = Math.sin(t * 1.4 + index * 2.1) * 6;
      const offset = (20 + bob) * 0.85;
      const x = anchor.x + nx * offset;
      const y = anchor.y + ny * offset;
      const isDouble = bubble.label.includes(' ');
      const radius = isDouble ? 30 : 24;

      ctx.shadowBlur = 18;
      ctx.shadowColor = toRgba(bubble.color, 0.35);
      ctx.fillStyle = toRgba(bubble.color, 0.12);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = toRgba(bubble.color, 0.65);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = toRgba(bubble.color, 0.95);
      if (isDouble) {
        ctx.font = `600 10px ${fontSans}`;
        const parts = bubble.label.split(' ');
        ctx.fillText(parts[0], x, y - 5);
        ctx.fillText(parts[1], x, y + 7);
      } else {
        ctx.font = `600 11px ${fontSans}`;
        ctx.fillText(bubble.label, x, y + 1);
      }
    });

    ctx.restore();
  };

  const drawParticles = (t, ax, ay, az, pulse) => {
    const baseA = {
      x: state.base[0].x * pulse,
      y: state.base[0].y * pulse
    };
    const baseB = {
      x: state.base[1].x * pulse,
      y: state.base[1].y * pulse
    };
    const baseC = {
      x: state.base[2].x * pulse,
      y: state.base[2].y * pulse
    };

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    state.particles.forEach((particle) => {
      const wobble = Math.sin(t * particle.speed + particle.phase) * 30;
      const depth = Math.cos(t * 0.35 + particle.phase) * 14;
      const x = baseA.x * particle.u + baseB.x * particle.v + baseC.x * particle.w;
      const y = baseA.y * particle.u + baseB.y * particle.v + baseC.y * particle.w;

      const rotated = rotatePoint({ x, y, z: wobble + depth }, ax, ay, az);
      const projected = projectPoint(rotated);

      const color = palette[Math.floor(particle.hue * palette.length)];
      const sparkle = 0.4 + 0.6 * Math.sin(t * particle.speed + particle.phase);
      ctx.fillStyle = toRgba(color, 0.15 + sparkle * 0.25);
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, particle.size * projected.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  const drawSparks = (t, outer) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    state.sparks.forEach((spark) => {
      const start = outer[spark.edge];
      const end = outer[(spark.edge + 1) % 3];
      const progress = (t * spark.speed + spark.offset) % 1;
      const position = lerpPoint(start, end, progress);
      const tail = lerpPoint(start, end, Math.max(0, progress - 0.05));
      const glow = 0.5 + 0.5 * Math.sin(t * 2.4 + spark.offset * 6);

      ctx.strokeStyle = `rgba(${lightStroke.r}, ${lightStroke.g}, ${lightStroke.b}, ${0.4 * glow})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(${lightStroke.r}, ${lightStroke.g}, ${lightStroke.b}, ${0.25 + glow * 0.5})`;
      ctx.beginPath();
      ctx.arc(position.x, position.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  const drawNoise = () => {
    if (!state.noise) return;
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(state.noise, 0, 0, state.width, state.height);
    ctx.restore();
  };

  const getBounds = (points) => {
    const bounds = points.reduce((acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y)
    }), {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    });

    return {
      ...bounds,
      width: Math.max(1, bounds.maxX - bounds.minX),
      height: Math.max(1, bounds.maxY - bounds.minY)
    };
  };

  const mergeBounds = (a, b) => ({
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minY: Math.min(a.minY, b.minY),
    maxY: Math.max(a.maxY, b.maxY)
  });

  const getBubbleBounds = (outer, t) => {
    const center = { x: state.cx, y: state.cy };
    const bounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };

    productBubbles.forEach((bubble, index) => {
      const anchor = outer[bubble.anchor % outer.length];
      const vx = anchor.x - center.x;
      const vy = anchor.y - center.y;
      const len = Math.hypot(vx, vy) || 1;
      const nx = vx / len;
      const ny = vy / len;
      const bob = Math.sin(t * 1.4 + index * 2.1) * 6;
      const offset = (20 + bob) * 0.85;
      const x = anchor.x + nx * offset;
      const y = anchor.y + ny * offset;
      const radius = bubble.label.includes(' ') ? 30 : 24;

      bounds.minX = Math.min(bounds.minX, x - radius);
      bounds.maxX = Math.max(bounds.maxX, x + radius);
      bounds.minY = Math.min(bounds.minY, y - radius);
      bounds.maxY = Math.max(bounds.maxY, y + radius);
    });

    return bounds;
  };

  const render = (time) => {
    if (!state.width || !state.height) return;

    ctx.clearRect(0, 0, state.width, state.height);

    state.pointer.x += (state.pointer.tx - state.pointer.x) * 0.06;
    state.pointer.y += (state.pointer.ty - state.pointer.y) * 0.06;

    if (prefersReducedMotion.matches) {
      canvas.style.transform = 'none';
    } else {
      const tiltX = state.pointer.y * -1.2;
      const tiltY = state.pointer.x * 1.4;
      const floatZ = Math.sin(time * 0.25) * 1.6;
      canvas.style.transform = `translateZ(${floatZ}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    if (state.shapeTarget && state.shapeCurrent) {
      for (let i = 0; i < 3; i++) {
        state.shapeCurrent[i].x = lerp(state.shapeCurrent[i].x, state.shapeTarget[i].x, 0.08);
        state.shapeCurrent[i].y = lerp(state.shapeCurrent[i].y, state.shapeTarget[i].y, 0.08);
      }
      
      const centroid = state.shapeCurrent.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      centroid.x /= 3;
      centroid.y /= 3;

      const normalized = state.shapeCurrent.map(p => ({ x: p.x - centroid.x, y: p.y - centroid.y }));
      const maxAbs = normalized.reduce((acc, p) => ({ x: Math.max(acc.x, Math.abs(p.x)), y: Math.max(acc.y, Math.abs(p.y)) }), { x: 0, y: 0 });

      const scaleX = maxAbs.x > 0 ? state.radiusX / maxAbs.x : state.radiusX;
      const scaleY = maxAbs.y > 0 ? state.radiusY / maxAbs.y : state.radiusY;
      const targetScale = Math.min(scaleX, scaleY);
      
      state.currentScale = lerp(state.currentScale || targetScale, targetScale, 0.08);
      state.base = normalized.map(p => ({ x: p.x * state.currentScale, y: p.y * state.currentScale, z: 0 }));
    }

    const innerPulse = 1 + Math.sin(time * 0.45) * 0.012;
    const innerTargetAx = 0.06 + state.pointer.y * 0.05 + Math.sin(time * 0.18) * 0.02;
    const innerTargetAy = -0.08 + state.pointer.x * 0.06 + Math.cos(time * 0.16) * 0.02;
    const innerTargetAz = time * 0.015;

    state.rotation.ax = lerp(state.rotation.ax, innerTargetAx, 0.04);
    state.rotation.ay = lerp(state.rotation.ay, innerTargetAy, 0.04);
    state.rotation.az = lerp(state.rotation.az, innerTargetAz, 0.04);

    const outerTargetAx = 0.015 + state.pointer.y * 0.01 + Math.sin(time * 0.08) * 0.004;
    const outerTargetAy = -0.02 + state.pointer.x * 0.01 + Math.cos(time * 0.08) * 0.004;
    const outerTargetAz = (0.2 + 1.2 * Math.sin(time * 0.05)) * (Math.PI / 180);

    state.outerRotation.ax = lerp(state.outerRotation.ax, outerTargetAx, 0.02);
    state.outerRotation.ay = lerp(state.outerRotation.ay, outerTargetAy, 0.02);
    state.outerRotation.az = lerp(state.outerRotation.az, outerTargetAz, 0.02);

    const innerAx = state.rotation.ax;
    const innerAy = state.rotation.ay;
    const innerAz = state.rotation.az;

    const outerAx = state.outerRotation.ax;
    const outerAy = state.outerRotation.ay;
    const outerAz = state.outerRotation.az;

    const innerDepthWave = Math.sin(time * 0.35) * 8;

    const outerLayer = computeLayer(1.0, 28, outerAx, outerAy, outerAz);
    const innerLayer = computeLayer(
      0.78 * innerPulse,
      -10 + innerDepthWave * 0.4 + Math.sin(time * 0.9 + 1) * 16,
      innerAx,
      innerAy,
      innerAz
    );
    const innerLayerDeep = computeLayer(
      0.6 * innerPulse,
      -55 - innerDepthWave * 0.3 + Math.sin(time * 0.9 + 2) * 16,
      innerAx,
      innerAy,
      innerAz
    );

    const baseBounds = getBounds(outerLayer.projected);
    const bubbleBounds = getBubbleBounds(outerLayer.projected, time);
    const mergedBounds = mergeBounds(baseBounds, bubbleBounds);
    const boundsCenterX = (mergedBounds.minX + mergedBounds.maxX) / 2;
    const boundsCenterY = (mergedBounds.minY + mergedBounds.maxY) / 2;

    const dx = state.cx - boundsCenterX;
    const dy = state.cy - boundsCenterY;

    ctx.save();
    ctx.translate(dx, dy);

    const fitPadding = Math.min(state.width, state.height) * 0.06;
    const boundsWidth = Math.max(1, mergedBounds.maxX - mergedBounds.minX);
    const boundsHeight = Math.max(1, mergedBounds.maxY - mergedBounds.minY);
    const fitScale = Math.min(
      (state.width - fitPadding * 2) / boundsWidth,
      (state.height - fitPadding * 2) / boundsHeight,
      1
    );

    if (fitScale < 1) {
      ctx.translate(state.cx, state.cy);
      ctx.scale(fitScale, fitScale);
      ctx.translate(-state.cx, -state.cy);
    }

    drawTriangle(innerLayerDeep.projected, 0.18, 2, 12, time, 0.2);
    drawTriangle(innerLayer.projected, 0.28, 2.6, 18, time, 1.1);
    drawTriangle(outerLayer.projected, 0.5, 3.2, 24, time, 2.2);

    drawInnerMesh(outerLayer.projected);
    drawSweep(outerLayer.projected, time);
    drawDashed(outerLayer.projected, time);
    drawParticles(time, innerAx, innerAy, innerAz, innerPulse);
    drawSparks(time, outerLayer.projected);
    drawVertices(outerLayer.projected, time);
    drawProductBubbles(outerLayer.projected, time);

    ctx.restore();
    drawNoise();
  };

  const loop = (timestamp) => {
    render(timestamp * 0.001);
    state.raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (state.running || !state.visible || prefersReducedMotion.matches) return;
    state.running = true;
    state.raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!state.running) return;
    cancelAnimationFrame(state.raf);
    state.running = false;
  };

  const handleVisibility = () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };

  if (supportsHover && hero) {
    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      state.pointer.tx = Math.max(-1, Math.min(1, x));
      state.pointer.ty = Math.max(-1, Math.min(1, y));
    });

    hero.addEventListener('mouseleave', () => {
      state.pointer.tx = 0;
      state.pointer.ty = 0;
    });
  }

  const intersection = new IntersectionObserver((entries) => {
    state.visible = entries[0]?.isIntersecting ?? true;
    if (state.visible) {
      start();
    } else {
      stop();
    }
  }, { threshold: 0.1 });

  intersection.observe(canvas);

  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
      stop();
      render(0);
    } else {
      start();
    }
  });

  document.addEventListener('visibilitychange', handleVisibility);

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });

  resize();
  if (!prefersReducedMotion.matches) {
    start();
  }
})();
