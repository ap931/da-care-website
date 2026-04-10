(() => {
  const root = document.querySelector('.leda-landing');
  if (!root) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const allowMotion = () => !prefersReduced.matches;
  const shouldUseLottie = () => allowMotion();
  const shapedScene = root.querySelector('.shaped-img');
  const shapedGradientCanvas = root.querySelector('#shaped-gradient');
  const shapedLottieMount = root.querySelector('#shaped-lottie');
  const shapedPoster = root.querySelector('.shaped-poster');
  let shapedSceneRevealed = false;
  let shapedSceneVisible = false;
  let shapedGradient = null;
  let shapedLottie = null;
  let lottieLoader = null;

  const setShapedFallback = (enabled) => {
    const shapedSceneRoot = shapedGradientCanvas?.closest('.shaped-scene');
    if (!shapedSceneRoot) return;
    shapedSceneRoot.classList.toggle('shaped-scene--fallback', enabled);
    if (shapedPoster) {
      shapedPoster.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    }
  };

  const loadLottieScript = () => {
    if (window.lottie || window.bodymovin) {
      return Promise.resolve(window.lottie || window.bodymovin);
    }

    if (lottieLoader) {
      return lottieLoader;
    }

    lottieLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
      script.async = true;
      script.onload = () => resolve(window.lottie || window.bodymovin);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return lottieLoader;
  };

  const initShapedGradient = () => {
    if (!shapedSceneRevealed || !shapedGradientCanvas || shapedGradient) return;

    const gl = shapedGradientCanvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power'
    }) || shapedGradientCanvas.getContext('experimental-webgl');

    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;

      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;

      varying vec2 v_uv;

      uniform float u_time;
      uniform float u_complexity;
      uniform float u_blend;
      uniform vec3 u_c0;
      uniform vec3 u_c1;
      uniform vec3 u_c2;
      uniform vec3 u_c3;
      uniform vec3 u_c4;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(
          0.211324865405187,
          0.366025403784439,
          -0.577350269189626,
          0.024390243902439
        );

        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;

        i = mod289(i);
        vec3 p = permute(
          permute(i.y + vec3(0.0, i1.y, 1.0)) +
          i.x + vec3(0.0, i1.x, 1.0)
        );

        vec3 m = max(
          0.5 - vec3(
            dot(x0, x0),
            dot(x12.xy, x12.xy),
            dot(x12.zw, x12.zw)
          ),
          0.0
        );

        m *= m;
        m *= m;

        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;

        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;

        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = v_uv;
        float t = u_time;

        float n1 = snoise(uv * u_complexity + vec2(t * 0.12, -t * 0.08));
        float n2 = snoise(uv * u_complexity * 1.22 + vec2(-t * 0.09, t * 0.11) + 8.3);
        float n3 = snoise(uv * u_complexity * 0.58 + vec2(t * 0.05, t * 0.07) + 16.7);

        vec2 warp = vec2(n1, n2) * u_blend * 0.22;
        vec2 wuv = uv + warp;

        float d0 = length(wuv - vec2(0.08 + sin(t * 0.17) * 0.06, 0.78 + cos(t * 0.11) * 0.06));
        float d1 = length(wuv - vec2(0.28 + cos(t * 0.13) * 0.08, 0.22 + sin(t * 0.10) * 0.06));
        float d2 = length(wuv - vec2(0.56 + sin(t * 0.09) * 0.07, 0.34 + cos(t * 0.12) * 0.05));
        float d3 = length(wuv - vec2(0.86 + cos(t * 0.10) * 0.06, 0.20 + sin(t * 0.08) * 0.06));
        float d4 = length(wuv - vec2(0.76 + sin(t * 0.07) * 0.08, 0.78 + cos(t * 0.09) * 0.07));

        float w0 = 1.0 / (d0 * d0 + 0.03);
        float w1 = 1.0 / (d1 * d1 + 0.03);
        float w2 = 1.0 / (d2 * d2 + 0.03);
        float w3 = 1.0 / (d3 * d3 + 0.03);
        float w4 = 1.0 / (d4 * d4 + 0.03);
        float wt = w0 + w1 + w2 + w3 + w4;

        vec3 col = (u_c0 * w0 + u_c1 * w1 + u_c2 * w2 + u_c3 * w3 + u_c4 * w4) / wt;
        float centerLift = smoothstep(0.0, 1.1, 1.0 - length(uv - vec2(0.5)) * 0.7);

        col += n3 * 0.018;
        col = mix(col, vec3(1.0), 0.04);
        col *= 0.95 + centerLift * 0.08;
        col = pow(col, vec3(0.96));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);

    const positionAttribute = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    const timeUniform = gl.getUniformLocation(program, 'u_time');
    const complexityUniform = gl.getUniformLocation(program, 'u_complexity');
    const blendUniform = gl.getUniformLocation(program, 'u_blend');
    const colorUniforms = [0, 1, 2, 3, 4].map(index =>
      gl.getUniformLocation(program, `u_c${index}`)
    );

    const hexToGl = hex => {
      const clean = hex.trim().replace('#', '');
      const full = clean.length === 3
        ? clean.split('').map(char => `${char}${char}`).join('')
        : clean;

      return [
        parseInt(full.slice(0, 2), 16) / 255,
        parseInt(full.slice(2, 4), 16) / 255,
        parseInt(full.slice(4, 6), 16) / 255
      ];
    };

    const styles = getComputedStyle(document.documentElement);
    const surface = styles.getPropertyValue('--surface').trim() || '#ffffff';
    const bgSubtle = styles.getPropertyValue('--bg-subtle').trim() || '#f5f5f7';
    const mintLight = styles.getPropertyValue('--mint-light').trim() || '#D7E8B5';
    const mint = styles.getPropertyValue('--mint').trim() || '#C1DB8D';
    const mintDark = styles.getPropertyValue('--mint-dark').trim() || '#99AE76';
    const palette = [surface, bgSubtle, mintLight, mint, mintDark];

    palette.map(hexToGl).forEach((color, index) => {
      gl.uniform3f(colorUniforms[index], color[0], color[1], color[2]);
    });

    const state = {
      canvas: shapedGradientCanvas,
      gl,
      time: 0,
      speed: 0.28,
      complexity: 3.4,
      blend: 0,
      frameId: 0,
      running: false,
      lastTick: 0,
      lastDraw: 0,
      resize() {
        const rect = state.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));

        if (state.canvas.width !== width || state.canvas.height !== height) {
          state.canvas.width = width;
          state.canvas.height = height;
          gl.viewport(0, 0, width, height);
        }
      },
      draw() {
        state.resize();
        gl.uniform1f(timeUniform, state.time);
        gl.uniform1f(complexityUniform, state.complexity);
        gl.uniform1f(blendUniform, state.blend);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      render(timestamp) {
        if (!state.running) return;

        if (!state.lastTick) state.lastTick = timestamp;
        const delta = Math.min((timestamp - state.lastTick) * 0.001, 0.05);
        state.lastTick = timestamp;

        if (!state.lastDraw || timestamp - state.lastDraw >= 33) {
          state.lastDraw = timestamp;
          state.time += delta * state.speed;
          state.draw();
        }

        state.frameId = window.requestAnimationFrame(state.render);
      },
      start() {
        if (state.running) return;
        state.running = true;
        state.lastTick = 0;
        state.lastDraw = 0;
        state.frameId = window.requestAnimationFrame(state.render);
      },
      stop() {
        state.running = false;
        if (state.frameId) {
          window.cancelAnimationFrame(state.frameId);
          state.frameId = 0;
        }
        state.lastTick = 0;
        state.lastDraw = 0;
      }
    };

    state.render = state.render.bind(state);
    state.draw();

    window.addEventListener('resize', () => {
      if (!shapedGradient) return;
      if (shapedGradient.running) return;
      shapedGradient.draw();
    }, { passive: true });

    shapedGradient = state;
  };

  const initShapedLottie = async () => {
    if (!shapedSceneRevealed || !shapedLottieMount) return;
    if (!shouldUseLottie()) {
      setShapedFallback(true);
      return;
    }
    if (shapedLottie) return;

    try {
      const lottieApi = await loadLottieScript();
      if (!lottieApi || shapedLottie || !shouldUseLottie()) {
        setShapedFallback(true);
        return;
      }

      shapedLottie = lottieApi.loadAnimation({
        container: shapedLottieMount,
        renderer: 'svg',
        loop: allowMotion(),
        autoplay: false,
        path: '/images/Leda/Scene-1.json',
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: true
        }
      });

      setShapedFallback(false);

      shapedLottie.addEventListener('DOMLoaded', () => {
        if (!allowMotion() || !shapedSceneVisible || document.hidden) {
          shapedLottie.goToAndStop(0, true);
        } else {
          shapedLottie.play();
        }
      });
    } catch (error) {
      setShapedFallback(true);
    }
  };

  const activateShapedScene = () => {
    if (!shapedSceneRevealed) return;

    initShapedGradient();
    if (shouldUseLottie()) {
      initShapedLottie();
    } else {
      setShapedFallback(true);
    }

    if (shapedLottie) {
      if (allowMotion() && shapedSceneVisible && !document.hidden && shouldUseLottie()) {
        shapedLottie.play();
      } else {
        shapedLottie.pause();
        shapedLottie.goToAndStop(0, true);
      }
    }

    if (shapedGradient) {
      if (allowMotion() && shapedSceneVisible && !document.hidden) {
        shapedGradient.start();
      } else {
        shapedGradient.stop();
        shapedGradient.draw();
      }
    }
  };

  let startCycle = () => {};
  let stopCycle = () => {};

  // Scroll reveal (general — 10% threshold)
  const revealTargets = root.querySelectorAll('.sr');
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            if (entry.target === shapedScene) {
              shapedSceneRevealed = true;
              window.requestAnimationFrame(activateShapedScene);
            }
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(el => revealObs.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
    if (shapedScene) {
      shapedSceneRevealed = true;
      activateShapedScene();
    }
  }

  if (shapedScene && 'IntersectionObserver' in window) {
    const shapedSceneObserver = new IntersectionObserver((entries) => {
      shapedSceneVisible = entries.some((entry) => entry.isIntersecting);
      if (shapedSceneRevealed) {
        activateShapedScene();
      }
    }, {
      threshold: 0.18
    });

    shapedSceneObserver.observe(shapedScene);
  } else {
    shapedSceneVisible = true;
  }

  window.addEventListener('load', () => {
    if (shapedScene && shapedScene.classList.contains('in')) {
      shapedSceneRevealed = true;
    }
    activateShapedScene();
  }, { once: true });

  const moodSection = root.querySelector('.mood-section');
  if (moodSection) {
    const moodRows = Array.from(root.querySelectorAll('.mood-row'));
    const moodPills = Array.from(root.querySelectorAll('.mood-pill'));
    const titleEl = root.querySelector('#iphone-title');
    const ctaEl = root.querySelector('#iphone-cta');
    const chipEl = root.querySelector('#iphone-chip');

    const moods = [
      { 
        title: 'Make Me\nLaugh', cta: 'Laugh', chip: 'For joy',
        apps: ['Funny Images', 'Funny Videos', 'Meme Generator']
      },
      { 
        title: 'Good\nNews', cta: 'Read', chip: 'For news',
        apps: ['Daily Positive', 'Kudos Wall', 'Kindness Tracker']
      },
      { 
        title: 'Zodiac\nRead', cta: 'Check', chip: 'For cosmic',
        apps: ['Horoscope', 'Birth Chart', 'Moon Phase']
      },
      { 
        title: 'Free the\nStress', cta: 'Relax', chip: 'For peace',
        apps: ['Guided Breath', 'Nature Sounds', 'Quick Stretch']
      },
      { 
        title: 'How does\nit work', cta: 'Learn', chip: 'For info',
        apps: ['Intro Guide', 'Privacy Shield', 'App Tour']
      }
    ];

    let cur = 0;
    let cycleId = null;
    moodSection.dataset.mood = String(cur);

    const applyMood = i => {
      if (i === cur) return;
      cur = i;
      moodSection.dataset.mood = String(i);

      moodRows.forEach((row, idx) => {
        const isActive = idx === i;
        row.classList.toggle('active', isActive);
        row.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      moodPills.forEach((pill, idx) => {
        const isActive = idx === i;
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (moodPills[i]) {
        const container = moodPills[i].parentElement;
        const pill = moodPills[i];
        
        // Calculate internal offset safely relative to the scrolling container
        const internalOffset = pill.offsetLeft - container.offsetLeft;
        const scrollTarget = internalOffset - (container.clientWidth / 2) + (pill.clientWidth / 2);
        
        container.scrollTo({
          left: scrollTarget,
          behavior: allowMotion() ? 'smooth' : 'auto'
        });
      }

      const m = moods[i];
      if (titleEl) {
        const delay = allowMotion() ? 200 : 0;
        titleEl.classList.add('is-fading');
        window.setTimeout(() => {
          titleEl.textContent = m.title;
          titleEl.classList.remove('is-fading');
        }, delay);
      }
      if (ctaEl) ctaEl.textContent = m.cta;
      if (chipEl) chipEl.textContent = m.chip;

      // Toggle App Feed Mockups
      const allFeeds = document.querySelectorAll('.app-feed');
      if (allFeeds.length > 0) {
        allFeeds.forEach(feed => feed.style.display = 'none');
        const activeFeed = document.getElementById(`feed-${i}`);
        if (activeFeed) {
          activeFeed.style.display = 'flex';
        } else {
          // Fallback to the first feed if a specific one isn't built yet
          const fallback = document.getElementById('feed-0');
          if (fallback) fallback.style.display = 'flex';
        }
      }

      // Update Feed Face Icon (fallback for dynamic templates)
      const topIconEl = document.getElementById('feed-top-icon');
      if (topIconEl && moodRows[i]) {
        const iconImg = moodRows[i].querySelector('.mood-ic img');
        if (iconImg) {
          topIconEl.src = iconImg.src;
        }
      }
    };

    stopCycle = () => {
      if (cycleId) {
        window.clearInterval(cycleId);
        cycleId = null;
      }
    };

    startCycle = () => {
      // Temporarily disabled for UI development
      return;
    };

    moodRows.forEach((row, i) => {
      row.addEventListener('pointerdown', () => {
        stopCycle();
        applyMood(i);
      });
      row.addEventListener('click', event => {
        if (event.detail === 0) {
          stopCycle();
          applyMood(i);
        }
      });
      row.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') {
          stopCycle();
          applyMood(i);
        }
      });
    });

    moodPills.forEach((pill, i) => {
      pill.addEventListener('pointerdown', () => {
        stopCycle();
        applyMood(i);
      });
      pill.addEventListener('click', event => {
        if (event.detail === 0) {
          stopCycle();
          applyMood(i);
        }
      });
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCycle();
      if (shapedGradient) shapedGradient.stop();
      if (shapedLottie) {
        shapedLottie.pause();
        shapedLottie.goToAndStop(0, true);
      }
    } else {
      startCycle();
      if (shapedSceneRevealed) activateShapedScene();
      if (shapedLottie && allowMotion() && shapedSceneVisible && shouldUseLottie()) {
        shapedLottie.play();
      }
    }
  });

  const handleMotionChange = () => {
    if (allowMotion()) {
      startCycle();
      if (shapedSceneRevealed) activateShapedScene();
      if (shapedLottie && shouldUseLottie()) {
        shapedLottie.loop = true;
        shapedLottie.play();
      } else if (shouldUseLottie()) {
        initShapedLottie();
      } else {
        setShapedFallback(true);
      }
    } else {
      stopCycle();
      if (shapedGradient) {
        shapedGradient.stop();
        shapedGradient.draw();
      }
      if (shapedLottie) {
        shapedLottie.loop = false;
        shapedLottie.goToAndStop(0, true);
      }
      setShapedFallback(true);
    }
  };

  if (prefersReduced.addEventListener) {
    prefersReduced.addEventListener('change', handleMotionChange);
  } else if (prefersReduced.addListener) {
    prefersReduced.addListener(handleMotionChange);
  }

  window.addEventListener('resize', () => {
    if (shapedSceneRevealed) {
      activateShapedScene();
    }
  }, { passive: true });

  startCycle();
})();
