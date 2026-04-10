(() => {
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("hero-strand");
  if (!hero || !canvas) return;

  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) return;

  let rect = hero.getBoundingClientRect();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resize() {
    rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  let raw = { x: 0.5, y: 0.5 };
  let mid = { x: 0.5, y: 0.5 };
  let slow = { x: 0.5, y: 0.5 };
  let vel = { x: 0.0, y: 0.0 };
  let mouseActive = false;

  function updateRawFromEvent(e) {
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    raw.x = clamp01(x);
    raw.y = clamp01(y);
    mouseActive = true;
  }

  hero.addEventListener("pointerenter", updateRawFromEvent, { passive: true });
  hero.addEventListener("pointermove", updateRawFromEvent, { passive: true });
  hero.addEventListener("pointerleave", () => {
    mouseActive = false;
  }, { passive: true });

  function updateMouse(dt) {
    if (!mouseActive) return;

    const springK = 2.2;
    const damping = 0.88;

    vel.x = vel.x * damping + (raw.x - mid.x) * springK * dt;
    vel.y = vel.y * damping + (raw.y - mid.y) * springK * dt;
    mid.x += vel.x;
    mid.y += vel.y;

    const lazyK = 0.6 * dt;
    slow.x += (mid.x - slow.x) * lazyK;
    slow.y += (mid.y - slow.y) * lazyK;
  }

  const vsSource = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

  const fsSource = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_mouseMid;
uniform float u_mouseActive;

vec3 palette(float t, float offset) {
  t = fract(t + offset);
  vec3 c1 = vec3(0.663, 0.886, 1.000);
  vec3 c2 = vec3(0.729, 0.796, 0.600);
  vec3 c3 = vec3(0.965, 0.608, 0.459);
  float s = t * 3.0;
  float f = fract(s);
  int i = int(floor(s));
  if (i == 0) return mix(c1, c2, f);
  if (i == 1) return mix(c2, c3, f);
  return mix(c3, c1, f);
}

vec2 bezier(float s, vec2 p0, vec2 p1, vec2 p2, vec2 p3) {
  float t1 = 1.0 - s;
  return t1*t1*t1*p0 + 3.0*t1*t1*s*p1 + 3.0*t1*s*s*p2 + s*s*s*p3;
}

void main() {
  vec2  uv     = vec2(gl_FragCoord.x / u_res.x, gl_FragCoord.y / u_res.y);
  float aspect = u_res.x / u_res.y;
  float anim   = u_time * 0.18;

  vec2 mo = (u_mouse - 0.5) * 0.13 * u_mouseActive;

  vec2 P0 = vec2(-0.08, 0.18) + mo * 0.12;
  vec2 P1 = vec2( 0.25, 0.34) + mo * 0.45;
  vec2 P2 = vec2( 0.62, 0.10) + mo * 0.70;
  vec2 P3 = vec2( 1.05, 0.94) + mo * 0.35;

  float minDist = 1e9;
  float bestS   = 0.0;
  vec2  bestPt  = P0;

  for (int i = 0; i <= 150; i++) {
    float s  = float(i) / 150.0;
    vec2  sp = bezier(s, P0, P1, P2, P3);
    vec2  dv = (uv - sp) * vec2(aspect, 1.0);
    float dd = dot(dv, dv);
    if (dd < minDist) { minDist = dd; bestS = s; bestPt = sp; }
  }

  float eps = 0.004;
  vec2 tA = bezier(clamp(bestS - eps, 0.0, 1.0), P0, P1, P2, P3);
  vec2 tB = bezier(clamp(bestS + eps, 0.0, 1.0), P0, P1, P2, P3);
  vec2 tangent = normalize((tB - tA) * vec2(aspect, 1.0));
  vec2 normal  = vec2(-tangent.y, tangent.x);

  float along  = bestS;
  vec2  toPixel = (uv - bestPt) * vec2(aspect, 1.0);
  float d       = dot(toPixel, normal);

  float ripple = sin(along * 6.0  - anim * 1.1) * 0.006
               + sin(along * 11.0 - anim * 2.0) * 0.003;
  d -= ripple;

  vec2  spineUV    = bestPt;
  float mouseDist  = length((u_mouseMid - spineUV) * vec2(aspect, 1.0));
  float breathe    = 1.0 + 0.35 * u_mouseActive * smoothstep(0.5, 0.0, mouseDist);

  float widthVar = 1.0 + 0.12 * sin(along * 4.5 - anim * 0.9);
  float ribbonW  = 0.135 * widthVar * breathe;

  float hueShift  = 0.18 * u_mouseActive * smoothstep(0.4, 0.0, mouseDist);

  float ribbonMask = 1.0 - smoothstep(ribbonW * 0.25, ribbonW, abs(d));
  float glowMask   = (1.0 - smoothstep(ribbonW * 0.6, ribbonW * 2.8, abs(d))) * 0.32;

  float crossPos   = clamp(d / ribbonW, -1.0, 1.0);
  float twistPhase = along * 2.8 - anim * 1.2;

  float colorT  = along * 0.40 + crossPos * 0.5 * cos(twistPhase) - anim * 0.38 + hueShift;
  float colorT2 = colorT + 0.5 + sin(twistPhase) * 0.12;
  float twistBlend = sin(twistPhase) * 0.5 + 0.5;

  vec3 ribbonColor = mix(palette(colorT, 0.00), palette(colorT2, 0.33), twistBlend);

  ribbonColor *= 1.0 - 0.28 * (1.0 - abs(sin(twistPhase)))
                     * smoothstep(0.5, 0.0, abs(crossPos));

  float cursorGlow = 0.30 * u_mouseActive * smoothstep(0.3, 0.0, mouseDist) * ribbonMask;
  ribbonColor = mix(ribbonColor, vec3(1.0), cursorGlow * 0.35);

  ribbonColor += exp(-abs(d) * 90.0) * 0.22
               * (0.5 + 0.5 * sin(along * 5.0 - anim * 2.2));

  vec3 bg       = vec3(1.0, 1.0, 1.0);
  vec3 glowCol  = palette(colorT, 0.1) * 0.55 + 0.45;
  vec3 withGlow = mix(bg, glowCol, glowMask * (1.0 - ribbonMask));
  vec3 final    = mix(withGlow, ribbonColor, ribbonMask);

  final *= 1.0 - 0.10 * length((uv - 0.5) * vec2(1.0, 1.2));

  gl_FragColor = vec4(clamp(final, 0.0, 1.0), 1.0);
}
`;

  function compile(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader error:", gl.getShaderInfoLog(s));
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(vsSource, gl.VERTEX_SHADER));
  gl.attachShader(prog, compile(fsSource, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Link error:", gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ["u_res", "u_time", "u_mouse", "u_mouseMid", "u_mouseActive"].forEach((n) => {
    U[n] = gl.getUniformLocation(prog, n);
  });

  const t0 = performance.now();
  let last = t0;
  const shouldAnimate = !prefersReducedMotion.matches;

  function draw(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    updateMouse(dt);

    gl.uniform2f(U.u_res, canvas.width, canvas.height);
    gl.uniform1f(U.u_time, (now - t0) / 1000);
    gl.uniform2f(U.u_mouse, slow.x, slow.y);
    gl.uniform2f(U.u_mouseMid, mid.x, mid.y);
    gl.uniform1f(U.u_mouseActive, mouseActive ? 1.0 : 0.0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function frame(now) {
    draw(now);
    if (shouldAnimate) requestAnimationFrame(frame);
  }

  frame(t0);

  if (!shouldAnimate) {
    window.addEventListener("resize", () => draw(performance.now()));
  }
})();
