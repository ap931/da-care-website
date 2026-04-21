/*
  Homepage hero sphere:
  - Desktop only
  - Static fallback on mobile / low-power devices
  - Pauses when the hero leaves the viewport or the tab is hidden
*/

const initSphere = () => {
    const section = document.getElementById('hero');
    const bgCanvas = document.getElementById('sphereCanvas');
    const fgCanvas = document.getElementById('orbiterCanvas');
    if (!section || !bgCanvas || !fgCanvas) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isLowPowerDevice = () =>
        reducedMotionQuery.matches ||
        (navigator.deviceMemory && navigator.deviceMemory < 3);

    const setStaticMode = (enabled) => {
        document.body.classList.toggle('homepage-hero--static', enabled);
        document.body.classList.remove('intro-running');
    };

    if (isLowPowerDevice()) {
        setStaticMode(true);
        return;
    }

    setStaticMode(false);

    const bgCtx = bgCanvas.getContext('2d', { alpha: false });
    const fgCtx = fgCanvas.getContext('2d', { alpha: true });

    if (!bgCtx || !fgCtx) {
        setStaticMode(true);
        return;
    }

    let width = 0;
    let height = 0;
    let radius = 0;
    let rotationX = 0;
    let rotationY = 0.22; // Seed with the intro's final rotation so there's no snap
    let frameId = 0;
    let lastFrame = 0;
    let isRunning = false;
    let heroVisible = true;
    let introElapsed = 0;
    let postIntroElapsed = 0;
    const POST_INTRO_FADE = 600; // ms crossfade for orbiter cards after intro

    const INTRO_DURATION = 1600;

    // Play intro only once per session
    if (sessionStorage.getItem('daCareHeroIntroPlayed')) {
        introElapsed = INTRO_DURATION;
        postIntroElapsed = POST_INTRO_FADE;
        document.body.classList.remove('intro-running');
    } else {
        sessionStorage.setItem('daCareHeroIntroPlayed', 'true');
    }
    const PARTICLE_COUNT =
        window.innerWidth >= 1600 ? 2800 :
        window.innerWidth >= 1280 ? 2400 :
        window.innerWidth >= 900  ? 1900 :
        window.innerWidth >= 600  ? 1200 :
        800;
    const phi = Math.PI * (3 - Math.sqrt(5));
    const GRAD_X = 0.574;
    const GRAD_Y = -0.819;

    const orbitSpeed = 0.0036 / 12;
    const orbiterSize = 28;
    const img1 = new Image();
    const img2 = new Image();
    const img3 = new Image();
    img1.src = '/images/Hero/Orbit/Group 285.png';
    img2.src = '/images/Hero/Orbit/Group 286.png';
    img3.src = '/images/Hero/Orbit/Vector.png';

    const orbiters = [
        { angle: 0, speed: orbitSpeed, color: '#F69B75', radius: orbiterSize, img: img3 },
        { angle: (Math.PI * 2) / 3, speed: orbitSpeed, color: '#C1DB8D', radius: orbiterSize, img: img2 },
        { angle: (Math.PI * 4) / 3, speed: orbitSpeed, color: '#A9E2FF', radius: orbiterSize, img: img1 }
    ];

    const gradientColor = (ox, oy) => {
        const t = Math.max(0, Math.min(1, (ox * GRAD_X + oy * GRAD_Y + 1) / 2));
        let r;
        let g;
        let b;

        if (t < 0.5) {
            const u = t * 2;
            r = Math.round(246 + (193 - 246) * u);
            g = Math.round(155 + (219 - 155) * u);
            b = Math.round(117 + (141 - 117) * u);
        } else {
            const u = (t - 0.5) * 2;
            r = Math.round(193 + (169 - 193) * u);
            g = Math.round(219 + (226 - 219) * u);
            b = Math.round(141 + (255 - 141) * u);
        }

        return `rgb(${r},${g},${b})`;
    };

    const cornerFracs = [
        [-0.06, -0.06],
        [1.06, -0.06],
        [-0.06, 1.06],
        [1.06, 1.06]
    ];

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const yi = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
        const ri = Math.sqrt(1 - yi * yi);
        const t = phi * i;
        const ox = Math.cos(t) * ri;
        const oy = yi;
        const oz = Math.sin(t) * ri;

        const corner = i % 4;
        const [cxf, cyf] = cornerFracs[corner];
        const spread = 0.08;

        particles.push({
            ox,
            oy,
            oz,
            color: gradientColor(ox, oy),
            size: Math.random() * 0.8 + 1.4,
            startXFrac: cxf + (Math.random() - 0.5) * spread,
            startYFrac: cyf + (Math.random() - 0.5) * spread,
            spiralAmt: (0.2 + Math.random() * 0.18) * Math.PI,
            delay: Math.random() * 0.16
        });
    }

    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeOut = (t) => 1 - (1 - t) * (1 - t);

    const resize = () => {
        width = section.clientWidth || window.innerWidth;
        height = section.clientHeight || window.innerHeight;
        radius = Math.min(width, height) * 0.33;
        const dprCap = width < 1280 ? 1.1 : 1.25;
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

        [
            [bgCanvas, bgCtx],
            [fgCanvas, fgCtx]
        ].forEach(([canvas, ctx]) => {
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        });
    };

    const drawBloom = (cx, cy, r, alpha) => {
        bgCtx.save();
        const bloomSize = r * 1.7;
        const gradient = bgCtx.createRadialGradient(cx, cy, 0, cx, cy, bloomSize);
        gradient.addColorStop(0, `rgba(246,155,117,${(0.08 * alpha).toFixed(3)})`);
        gradient.addColorStop(0.5, `rgba(193,219,141,${(0.04 * alpha).toFixed(3)})`);
        gradient.addColorStop(1, 'rgba(250,250,250,0)');
        bgCtx.globalCompositeOperation = 'multiply';
        bgCtx.fillStyle = gradient;
        bgCtx.beginPath();
        bgCtx.arc(cx, cy, bloomSize, 0, Math.PI * 2);
        bgCtx.fill();
        bgCtx.restore();
    };

    const drawFrame = (deltaMs) => {
        bgCtx.fillStyle = '#FAFAFA';
        bgCtx.fillRect(0, 0, width, height);
        fgCtx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        if (introElapsed < INTRO_DURATION) {
            introElapsed = Math.min(introElapsed + deltaMs, INTRO_DURATION);
            const rawT = introElapsed / INTRO_DURATION;

            drawBloom(cx, cy, radius, easeOut(rawT));

            const introRotY = rawT * 0.22;
            const cosY = Math.cos(introRotY);
            const sinY = Math.sin(introRotY);

            for (let i = 0; i < particles.length; i += 1) {
                const particle = particles[i];
                const pt = Math.max(0, Math.min((rawT - particle.delay) / (1 - particle.delay), 1));
                if (pt <= 0) continue;

                const eased = easeInOut(pt);
                const rx = particle.ox * cosY - particle.oz * sinY;
                const targetX = cx + rx * radius;
                const targetY = cy + particle.oy * radius;
                const startX = particle.startXFrac * width;
                const startY = particle.startYFrac * height;
                const startAngle = Math.atan2(startY - cy, startX - cx);
                const endAngle = Math.atan2(targetY - cy, targetX - cx);
                const startRadius = Math.hypot(startX - cx, startY - cy);
                const endRadius = Math.hypot(targetX - cx, targetY - cy);
                let angleDelta = endAngle - startAngle;

                if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
                if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

                const spiral = particle.spiralAmt * 3.5 * eased * (1 - eased);
                const angle = startAngle + eased * angleDelta + spiral;
                const distance = startRadius + eased * (endRadius - startRadius);
                const px = cx + Math.cos(angle) * distance;
                const py = cy + Math.sin(angle) * distance;
                const fadeIn = Math.min(pt / 0.12, 1);

                bgCtx.globalAlpha = 1.0 * fadeIn;
                bgCtx.fillStyle = particle.color;
                bgCtx.beginPath();
                bgCtx.arc(px, py, particle.size, 0, Math.PI * 2);
                bgCtx.fill();
            }

            bgCtx.globalAlpha = 1;

            if (rawT >= 1) {
                document.body.classList.remove('intro-running');
            }

            return;
        }

        // Track post-intro elapsed time for crossfade
        postIntroElapsed = Math.min(postIntroElapsed + deltaMs, POST_INTRO_FADE);
        const postFade = postIntroElapsed / POST_INTRO_FADE;
        const orbiterAlpha = postFade * postFade; // ease-in for smooth appearance

        rotationY += deltaMs * 0.00012;
        rotationX += deltaMs * 0.00006;

        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const projected = [];

        drawBloom(cx, cy, radius, 1);

        for (let i = 0; i < particles.length; i += 1) {
            const particle = particles[i];
            const rx = particle.ox * cosY - particle.oz * sinY;
            const rz = particle.ox * sinY + particle.oz * cosY;
            const ry = particle.oy * cosX - rz * sinX;
            const z = particle.oy * sinX + rz * cosX;

            projected.push({
                x: cx + rx * radius,
                y: cy + ry * radius,
                z,
                color: particle.color,
                size: particle.size
            });
        }

        for (let i = 0; i < orbiters.length; i += 1) {
            const orbiter = orbiters[i];
            orbiter.angle += orbiter.speed * deltaMs;

            const nx = Math.cos(orbiter.angle);
            const nz = Math.sin(orbiter.angle);
            const tilt = 35 * (Math.PI / 180);

            projected.push({
                x: cx + nx * Math.cos(tilt) * radius * 1.55,
                y: cy + nx * Math.sin(tilt) * radius * 1.55,
                z: nz,
                color: orbiter.color,
                size: orbiter.radius,
                isOrbiter: true,
                img: orbiter.img,
                orbiterAlpha
            });
        }

        projected.sort((a, b) => a.z - b.z);

        for (let i = 0; i < projected.length; i += 1) {
            const particle = projected[i];
            const scale = particle.isOrbiter ? (1 + particle.z * 0.45) : (1 + particle.z * 0.48);
            const targetCtx = particle.isOrbiter && particle.z > 0 ? fgCtx : bgCtx;

            if (particle.isOrbiter) {
                targetCtx.globalAlpha = particle.orbiterAlpha !== undefined ? particle.orbiterAlpha : 1;
                targetCtx.beginPath();
                targetCtx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2);
                targetCtx.fillStyle = '#ffffff';
                targetCtx.shadowBlur = 28 * scale;
                targetCtx.shadowColor = particle.color;
                targetCtx.fill();
                targetCtx.shadowBlur = 0;

                if (particle.img && particle.img.complete) {
                    const drawSize = particle.size * scale * 1.34;
                    targetCtx.save();
                    targetCtx.beginPath();
                    targetCtx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2);
                    targetCtx.clip();
                    targetCtx.drawImage(
                        particle.img,
                        particle.x - drawSize / 2,
                        particle.y - drawSize / 2,
                        drawSize,
                        drawSize
                    );
                    targetCtx.restore();
                }
            } else {
                targetCtx.globalAlpha = 1.0;
                targetCtx.fillStyle = particle.color;
                targetCtx.beginPath();
                targetCtx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2);

                if (particle.z > 0.82) {
                    targetCtx.shadowBlur = 10 * scale;
                    targetCtx.shadowColor = particle.color;
                } else {
                    targetCtx.shadowBlur = 0;
                    targetCtx.shadowColor = 'transparent';
                }

                targetCtx.fill();
                targetCtx.shadowBlur = 0;
                targetCtx.shadowColor = 'transparent';
            }
        }

        bgCtx.shadowBlur = 0;
        bgCtx.globalAlpha = 1;
        fgCtx.shadowBlur = 0;
        fgCtx.globalAlpha = 1;
    };

    const render = (timestamp) => {
        if (!isRunning) return;
        if (!lastFrame) lastFrame = timestamp;

        const deltaMs = Math.min(timestamp - lastFrame, 32);
        lastFrame = timestamp;
        drawFrame(deltaMs);
        frameId = window.requestAnimationFrame(render);
    };

    const stop = () => {
        isRunning = false;
        lastFrame = 0;
        if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        }
    };

    const start = () => {
        if (isRunning) return;
        isRunning = true;
        lastFrame = 0;
        frameId = window.requestAnimationFrame(render);
    };

    const syncPlayback = () => {
        if (document.hidden || !heroVisible) {
            stop();
            return;
        }

        start();
    };

    resize();
    drawFrame(0);

    const heroObserver = new IntersectionObserver((entries) => {
        heroVisible = entries.some((entry) => entry.isIntersecting);
        syncPlayback();
    }, {
        threshold: 0.05
    });

    heroObserver.observe(section);

    const sectionObserver = new ResizeObserver(() => {
        resize();
        syncPlayback();
    });
    sectionObserver.observe(section);

    window.addEventListener('resize', () => {
        resize();
        syncPlayback();
    }, { passive: true });

    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSphere);
} else {
    initSphere();
}
