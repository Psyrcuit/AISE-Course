// Opening reveal + onboarding shell. Shown on first launch (when
// aise26:settings.onboarding_seen is false).
//
// Flow:
//   1. A full-screen overlay mounts immediately so the dashboard never
//      flashes through. (The inline <head> bootstate guard in index.html
//      hides .app until this overlay covers it.)
//   2. The constellation canvas animates infinitely until user input.
//   3. The foreground starts as a Welcome card ("Enter" button).
//   4. On Enter, the welcome card swaps for the onboarding wizard,
//      mounted inline so the same animation stays behind it.
//   5. On wizard finish (or skip), the overlay fades out and the app
//      becomes visible.

import { getSettings, setSettings } from './runtime.js';
import { mountOnboarding } from './views/onboarding.js';

export function maybeShowReveal() {
  const s = getSettings();
  if (s.onboarding_seen) {
    // Returning user: skip the entire flow. Clear bootstate (in case it
    // somehow got set) and let the app render normally.
    document.documentElement.removeAttribute('data-bootstate');
    return false;
  }
  showReveal();
  return true;
}

function showReveal() {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = document.createElement('div');
  overlay.id = 'reveal-overlay';
  overlay.setAttribute('role', 'presentation');
  overlay.innerHTML = `
    ${reduceMotion ? '' : '<canvas id="reveal-canvas" aria-hidden="true"></canvas>'}
    <div id="reveal-foreground">
      <div id="reveal-content">
        <img class="reveal-logo" src="favicon.svg" alt="" width="72" height="72">
        <div class="reveal-eyebrow"><span class="reveal-eyebrow-line">AI Solutions Engineer</span> <span class="reveal-eyebrow-line">/ Architect 2026</span></div>
        <h1 class="reveal-title">514 concepts.<br>16 modules.<br>One map.</h1>
        <p class="reveal-tagline">Built for the engineers shipping AI in 2026. Browse on a map. Learn on demand. Leave with a playbook.</p>
        <button id="reveal-skip" type="button" class="btn btn-primary btn-lg">Enter</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // The overlay is now in the DOM and visually covers everything. Drop
  // the bootstate guard so .app can render underneath; when the overlay
  // fades out at the end of onboarding, the dashboard will be ready.
  document.documentElement.removeAttribute('data-bootstate');

  // Reduced-motion: static gradient background, no canvas, no animation.
  if (reduceMotion) {
    overlay.style.background = 'radial-gradient(circle at center, rgba(20, 16, 36, 1) 0%, rgba(8, 8, 10, 1) 80%)';
  } else {
    startCanvas(overlay);
  }

  wireEnter(overlay);
}

// ----- Canvas: layered parallax starfield with transient constellations -----
//
// Three depth layers of stars (back / mid / front). Each star has its own
// twinkle phase + amplitude so the field breathes softly rather than
// pulsing in unison. A small camera drift (gentle, ~minute-long period)
// gives each layer parallax movement.
//
// Constellation lines: only spawn between front-layer stars within range.
// Each edge has a finite lifespan with fade-in/fade-out so they form
// briefly, dissolve, and never accumulate. Dashed stroke + low alpha so
// they read as impermanent rather than a connected graph.

function startCanvas(overlay) {
  const canvas = overlay.querySelector('#reveal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  function resize() {
    // Cap DPR at 2 so 4K + retina screens don't render at 4K×2 = 8K wide.
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  // ---- Star field ----
  const LAYERS = [
    { count: 110, parallax: 0.25, sizeRange: [0.35, 0.95], alphaRange: [0.18, 0.42], pulseAmp: 0.06 },
    { count: 130, parallax: 0.55, sizeRange: [0.65, 1.55], alphaRange: [0.32, 0.65], pulseAmp: 0.11 },
    { count: 70,  parallax: 1.0,  sizeRange: [1.10, 2.60], alphaRange: [0.55, 0.95], pulseAmp: 0.20 }
  ];

  // World-space coords extend slightly past the viewport so camera drift
  // never reveals an empty margin.
  const MARGIN = 80;
  const stars = [];
  for (let li = 0; li < LAYERS.length; li++) {
    const L = LAYERS[li];
    for (let i = 0; i < L.count; i++) {
      const [smin, smax] = L.sizeRange;
      const [amin, amax] = L.alphaRange;
      stars.push({
        x: -MARGIN + Math.random() * (W + MARGIN * 2),
        y: -MARGIN + Math.random() * (H + MARGIN * 2),
        size: smin + Math.random() * (smax - smin),
        baseAlpha: amin + Math.random() * (amax - amin),
        pulseSpeed: 0.0004 + Math.random() * 0.0014,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseAmp: L.pulseAmp * (0.55 + Math.random() * 0.5),
        layerIdx: li,
        // Brightest front stars get a soft halo + occasional rare flicker.
        glow: li === 2 && Math.random() < 0.32,
        flickerHz: 0.0001 + Math.random() * 0.0003,
        flickerPhase: Math.random() * Math.PI * 2
      });
    }
  }
  // Indices of front-layer stars (used as constellation endpoints).
  const frontIdx = stars.map((s, i) => s.layerIdx === 2 ? i : -1).filter(i => i >= 0);

  // ---- Reposition stars if the viewport resizes substantially. ----
  // We keep existing star positions but extend the field if needed.
  function reflowOnResize() {
    resize();
  }
  window.addEventListener('resize', reflowOnResize);

  // ---- Constellation edges ----
  const edges = [];                  // { aIdx, bIdx, bornAt, lifespan }
  const MAX_EDGES = 16;
  const EDGE_LIFE_MS = [4500, 11000];
  const EDGE_FADE_IN = 1100;
  const EDGE_FADE_OUT = 1700;
  const SPAWN_INTERVAL_MS = [700, 1800];
  const PROXIMITY = 320;             // px - max distance for edge candidates
  let nextSpawnAt = performance.now() + 1200;

  function spawnEdge(now) {
    if (frontIdx.length < 2) return;
    const aIdx = frontIdx[Math.floor(Math.random() * frontIdx.length)];
    const a = stars[aIdx];
    const candidates = [];
    for (const bIdx of frontIdx) {
      if (bIdx === aIdx) continue;
      // Avoid duplicate edges (already-active connections between same pair).
      let already = false;
      for (const e of edges) {
        if ((e.aIdx === aIdx && e.bIdx === bIdx) || (e.aIdx === bIdx && e.bIdx === aIdx)) {
          already = true; break;
        }
      }
      if (already) continue;
      const b = stars[bIdx];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < PROXIMITY * PROXIMITY) candidates.push({ idx: bIdx, d2 });
    }
    if (!candidates.length) return;
    candidates.sort((p, q) => p.d2 - q.d2);
    // Pick one of the 6 nearest with weighted randomness.
    const pick = candidates[Math.floor(Math.random() * Math.min(candidates.length, 6))];
    const lifespan = EDGE_LIFE_MS[0] + Math.random() * (EDGE_LIFE_MS[1] - EDGE_LIFE_MS[0]);
    edges.push({ aIdx, bIdx: pick.idx, bornAt: now, lifespan });
  }

  // ---- Render loop ----
  const start = performance.now();
  const INTRO_MS = 1800;             // alpha ramp on entrance
  let raf = null;

  function frame(now) {
    if (overlay.dataset.cancelled === 'true') return;
    const elapsed = now - start;
    const introT = Math.min(1, elapsed / INTRO_MS);
    // Easing for the entrance: cubic out so stars fade in smoothly.
    const introEase = 1 - Math.pow(1 - introT, 3);

    // Spawn edges
    if (now >= nextSpawnAt && edges.length < MAX_EDGES) {
      spawnEdge(now);
      nextSpawnAt = now + SPAWN_INTERVAL_MS[0] + Math.random() * (SPAWN_INTERVAL_MS[1] - SPAWN_INTERVAL_MS[0]);
    }

    // Camera: very slow drift (~80s + ~110s components on different axes
    // so the motion never feels cyclical).
    const camX = Math.sin(elapsed * 0.000078) * 26 + Math.sin(elapsed * 0.000031) * 12;
    const camY = Math.cos(elapsed * 0.000059) * 20 + Math.cos(elapsed * 0.000043) * 9;

    // Clear with a deep-space radial gradient.
    ctx.fillStyle = '#06060A';
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
    grad.addColorStop(0, 'rgba(18, 16, 32, 1)');
    grad.addColorStop(0.6, 'rgba(10, 9, 18, 1)');
    grad.addColorStop(1, 'rgba(6, 6, 10, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ---- Stars ----
    for (const s of stars) {
      const L = LAYERS[s.layerIdx];
      const sx = s.x + camX * L.parallax;
      const sy = s.y + camY * L.parallax;

      // Pulse: slow sine modulation of alpha.
      const pulse = Math.sin(elapsed * s.pulseSpeed + s.pulsePhase);
      // Optional rare flicker: a much slower additional pulse that
      // occasionally aligns with the main one for a brighter moment.
      const flicker = Math.sin(elapsed * s.flickerHz + s.flickerPhase);
      // Soft "twinkle" component - small high-frequency variation only on
      // glow stars, gated by the slow flicker (so most of the time it's
      // calm, but occasionally a star shimmers).
      let twinkle = 0;
      if (s.glow && flicker > 0.7) {
        twinkle = Math.sin(elapsed * 0.012 + s.pulsePhase) * 0.08 * (flicker - 0.7) / 0.3;
      }
      const alpha = Math.max(0, (s.baseAlpha + s.pulseAmp * pulse + twinkle) * introEase);
      if (alpha < 0.02) continue;

      // Soft halo for glow stars.
      if (s.glow) {
        const haloR = s.size * (5 + Math.max(0, flicker) * 2);
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloR);
        halo.addColorStop(0, `rgba(196, 184, 255, ${alpha * 0.32})`);
        halo.addColorStop(0.5, `rgba(196, 184, 255, ${alpha * 0.08})`);
        halo.addColorStop(1, 'rgba(196, 184, 255, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, haloR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Star body. Slight color tint per layer (cooler/warmer).
      const tint = s.layerIdx === 2
        ? `rgba(244, 244, 255, ${alpha})`
        : s.layerIdx === 1
          ? `rgba(228, 226, 246, ${alpha})`
          : `rgba(202, 200, 224, ${alpha})`;
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- Edges (dashed, transient) ----
    ctx.lineWidth = 0.7;
    ctx.setLineDash([2, 5]);
    const frontPx = LAYERS[2].parallax;
    for (let i = edges.length - 1; i >= 0; i--) {
      const e = edges[i];
      const age = now - e.bornAt;
      if (age > e.lifespan) { edges.splice(i, 1); continue; }
      const fadeIn = Math.min(1, age / EDGE_FADE_IN);
      const fadeOut = Math.min(1, (e.lifespan - age) / EDGE_FADE_OUT);
      const lifeAlpha = Math.min(fadeIn, fadeOut);
      if (lifeAlpha <= 0) continue;
      const sa = stars[e.aIdx];
      const sb = stars[e.bIdx];
      const ax = sa.x + camX * frontPx;
      const ay = sa.y + camY * frontPx;
      const bx = sb.x + camX * frontPx;
      const by = sb.y + camY * frontPx;
      ctx.strokeStyle = `rgba(180, 160, 255, ${0.22 * lifeAlpha * introEase})`;
      // Vary the dash offset per edge for a less mechanical look.
      ctx.lineDashOffset = (e.bornAt * 0.001) % 7;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  overlay.__cleanupCanvas = () => {
    overlay.dataset.cancelled = 'true';
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', reflowOnResize);
  };
}

// ----- Wire "Enter" to swap content to the wizard. -----
function wireEnter(overlay) {
  const skipBtn = overlay.querySelector('#reveal-skip');
  if (!skipBtn) return;
  skipBtn.addEventListener('click', () => {
    setSettings({ reveal_seen: true });
    swapToWizard(overlay);
  });
  // Keyboard: Enter / Space on the visible button works natively; we don't
  // dismiss on arbitrary keypress anymore because we want the user to
  // intentionally click Enter to proceed to the wizard.
}

// ----- Swap reveal-content for the onboarding wizard. -----
// Both panels are grid-stacked at the same cell, so we crossfade them
// in place rather than letting layout flow squish them side by side.
function swapToWizard(overlay) {
  const fg = overlay.querySelector('#reveal-foreground');
  if (!fg) return;

  // Build the wizard shell (initial state: opacity 0, slight translate).
  const wizardShell = document.createElement('div');
  wizardShell.id = 'reveal-wizard';
  const wizardNode = mountOnboarding({
    embedded: true,
    onFinish: () => dismissOverlay(overlay)
  });
  wizardShell.appendChild(wizardNode);
  fg.appendChild(wizardShell);

  // Start the leave transition on the welcome card.
  const oldContent = overlay.querySelector('#reveal-content');
  if (oldContent) oldContent.classList.add('is-leaving');

  // Force a reflow before adding is-entering so the transition runs
  // from the initial CSS state (opacity 0) rather than skipping straight
  // to the final value.
  void wizardShell.offsetWidth;
  wizardShell.classList.add('is-entering');

  // Remove the old content after its transition completes.
  setTimeout(() => {
    if (oldContent && oldContent.parentNode) oldContent.parentNode.removeChild(oldContent);
  }, 480);

  // Move focus into the wizard once the transition has begun.
  setTimeout(() => {
    const firstFocusable = wizardShell.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }, 540);
}

// ----- Tear down the overlay (after wizard finish or skip). -----
function dismissOverlay(overlay) {
  if (overlay.dataset.dismissing === 'true') return;
  overlay.dataset.dismissing = 'true';
  if (overlay.__cleanupCanvas) overlay.__cleanupCanvas();
  overlay.classList.add('is-leaving');
  // Ensure we land on the home page after dismissal.
  if (window.location.hash !== '#/' && window.location.hash !== '') {
    window.location.hash = '#/';
  }
  setTimeout(() => {
    overlay.remove();
  }, 480);
}

window.aise26 = Object.assign(window.aise26 || {}, { maybeShowReveal });
