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
        <div class="reveal-eyebrow">AI Solutions Engineer / Architect 2026</div>
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

// ----- Canvas: constellation animation. Runs forever until cancelled. -----
function startCanvas(overlay) {
  const canvas = overlay.querySelector('#reveal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Constellation of points + nearest-neighbor edges.
  const NODES = 220;
  const points = [];
  for (let i = 0; i < NODES; i++) {
    points.push({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.95,
      y: H * 0.5 + (Math.random() - 0.5) * H * 0.85,
      r: 0.5 + Math.random() * 1.7,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05
    });
  }
  const edges = [];
  for (let i = 0; i < points.length; i++) {
    const nearest = [];
    for (let j = 0; j < points.length; j++) {
      if (j === i) continue;
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      nearest.push({ j, d2: dx * dx + dy * dy });
    }
    nearest.sort((a, b) => a.d2 - b.d2);
    for (let k = 0; k < 2 + Math.floor(Math.random() * 2); k++) {
      const e = nearest[k];
      if (e && e.j > i) edges.push({ a: i, b: e.j, alpha: 0.15 + Math.random() * 0.2 });
    }
  }

  const start = performance.now();
  // Intro reveal (alpha ramp + slight zoom) completes in INTRO_MS; after that
  // the animation continues in steady-state until the overlay is dismissed.
  const INTRO_MS = 3200;
  let raf = null;

  function frame(now) {
    if (overlay.dataset.cancelled === 'true') return;
    const elapsed = now - start;
    const introT = Math.min(1, elapsed / INTRO_MS);
    // Gentle 12s camera oscillation that keeps the field alive without
    // ever feeling like a hard restart of the animation.
    const cycleT = (elapsed / 12000) * (Math.PI * 2);
    const camOffsetX = Math.sin(cycleT) * W * 0.03;
    const camOffsetY = Math.cos(cycleT * 0.5) * H * 0.02;
    const zoom = 1.05 + introT * 0.08 + Math.sin(cycleT * 0.4) * 0.01;

    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H));
    grad.addColorStop(0, 'rgba(15, 15, 20, 0)');
    grad.addColorStop(1, 'rgba(8, 8, 10, 0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W * 0.5 + camOffsetX, H * 0.5 + camOffsetY);
    ctx.scale(zoom, zoom);
    ctx.translate(-W * 0.5, -H * 0.5);

    // Edges
    ctx.lineWidth = 0.6;
    for (const e of edges) {
      const a = points[e.a], b = points[e.b];
      ctx.strokeStyle = `rgba(180, 160, 255, ${e.alpha * introT})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // Nodes
    for (const p of points) {
      // Micro-drift; wrap around viewport softly.
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -50) p.x = W + 50;
      else if (p.x > W + 50) p.x = -50;
      if (p.y < -50) p.y = H + 50;
      else if (p.y > H + 50) p.y = -50;
      ctx.fillStyle = `rgba(244, 244, 245, ${0.4 + 0.55 * introT})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.3 + introT * 1.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // Stash teardown hooks on the overlay so wireEnter / dismissOverlay can
  // call them.
  overlay.__cleanupCanvas = () => {
    overlay.dataset.cancelled = 'true';
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
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
function swapToWizard(overlay) {
  const fg = overlay.querySelector('#reveal-foreground');
  if (!fg) return;
  const oldContent = overlay.querySelector('#reveal-content');
  if (oldContent) {
    oldContent.classList.add('is-leaving');
    setTimeout(() => oldContent.remove(), 320);
  }

  const wizardShell = document.createElement('div');
  wizardShell.id = 'reveal-wizard';
  wizardShell.className = 'reveal-wizard';
  // The wizard mounts inline with onFinish dismissing the overlay.
  const wizardNode = mountOnboarding({
    embedded: true,
    onFinish: () => dismissOverlay(overlay)
  });
  wizardShell.appendChild(wizardNode);
  fg.appendChild(wizardShell);

  // Move focus into the wizard for screen readers.
  setTimeout(() => {
    const firstFocusable = wizardShell.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }, 350);
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
