// Opening reveal: shown on the first ever visit. A 3-second cinematic that
// pans across a low-poly version of the System Map while a tagline fades in.
// Skippable with click or any keypress. Persists aise26:settings.reveal_seen.

import { getSettings, setSettings } from './runtime.js';

const REVEAL_DURATION_MS = 3200;

export function maybeShowReveal() {
  const s = getSettings();
  if (s.reveal_seen) return false;
  showReveal();
  return true;
}

function showReveal() {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = document.createElement('div');
  overlay.id = 'reveal-overlay';
  overlay.setAttribute('role', 'presentation');
  // Show the canvas only when motion is allowed; otherwise render a static
  // gradient background so the same overlay still works.
  overlay.innerHTML = `
    ${reduceMotion ? '' : '<canvas id="reveal-canvas" aria-hidden="true"></canvas>'}
    <div id="reveal-content">
      <div class="reveal-eyebrow">AI Solutions Engineer / Architect 2026</div>
      <h1 class="reveal-title">514 concepts.<br>16 modules.<br>One map.</h1>
      <p class="reveal-tagline">Built for the engineers shipping AI in 2026. Browse on a map. Learn on demand. Leave with a playbook.</p>
      <button id="reveal-skip" type="button" class="btn btn-primary btn-lg">Enter</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Reduced-motion users skip the canvas animation entirely.
  if (reduceMotion) {
    overlay.style.background = 'radial-gradient(circle at center, rgba(20, 16, 36, 1) 0%, rgba(8, 8, 10, 1) 80%)';
    function dismissRM() {
      setSettings({ reveal_seen: true });
      overlay.classList.add('is-leaving');
      document.removeEventListener('keydown', dismissRM);
      setTimeout(() => {
        overlay.remove();
        const s = getSettings();
        if (!s.onboarding_seen) window.location.hash = '#/onboarding';
      }, 200);
    }
    overlay.querySelector('#reveal-skip').addEventListener('click', dismissRM);
    document.addEventListener('keydown', dismissRM, { once: true });
    return;
  }

  const canvas = overlay.querySelector('#reveal-canvas');
  const ctx = canvas.getContext('2d');
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Generate a constellation of points + edges
  const NODES = 220;
  const points = [];
  const W = window.innerWidth, H = window.innerHeight;
  for (let i = 0; i < NODES; i++) {
    points.push({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.95,
      y: H * 0.5 + (Math.random() - 0.5) * H * 0.85,
      r: 0.5 + Math.random() * 1.7,
      // micro-drift
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05
    });
  }
  // Connect nearest neighbors
  const edges = [];
  for (let i = 0; i < points.length; i++) {
    let nearest = [];
    for (let j = 0; j < points.length; j++) {
      if (j === i) continue;
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const d2 = dx*dx + dy*dy;
      nearest.push({ j, d2 });
    }
    nearest.sort((a, b) => a.d2 - b.d2);
    for (let k = 0; k < 2 + Math.floor(Math.random() * 2); k++) {
      const e = nearest[k];
      if (e && e.j > i) edges.push({ a: i, b: e.j, alpha: 0.15 + Math.random() * 0.2 });
    }
  }

  let start = performance.now();
  let cancelled = false;
  let camOffsetX = 0, camOffsetY = 0;
  let zoom = 1.05;

  function frame(now) {
    if (cancelled) return;
    const t = (now - start) / REVEAL_DURATION_MS;
    // Camera: pan slowly L->R, slight zoom
    camOffsetX = (Math.sin(t * Math.PI) - 0.5) * W * 0.06;
    camOffsetY = (Math.cos(t * Math.PI * 0.5) - 0.5) * H * 0.04;
    zoom = 1.05 + t * 0.08;

    ctx.clearRect(0, 0, W, H);
    // Background gradient
    const grad = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.max(W, H));
    grad.addColorStop(0, 'rgba(15, 15, 20, 0)');
    grad.addColorStop(1, 'rgba(8, 8, 10, 0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W*0.5 + camOffsetX, H*0.5 + camOffsetY);
    ctx.scale(zoom, zoom);
    ctx.translate(-W*0.5, -H*0.5);

    // Edges
    ctx.lineWidth = 0.6;
    for (const e of edges) {
      const a = points[e.a], b = points[e.b];
      ctx.strokeStyle = `rgba(180, 160, 255, ${e.alpha * Math.min(1, t * 1.2)})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // Nodes
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      ctx.fillStyle = `rgba(244, 244, 245, ${0.4 + Math.min(0.55, t * 0.8)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * Math.min(1, t * 1.4 + 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (now - start < REVEAL_DURATION_MS + 1000) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);

  function dismiss() {
    if (cancelled) return;
    cancelled = true;
    setSettings({ reveal_seen: true });
    overlay.classList.add('is-leaving');
    window.removeEventListener('resize', resize);
    document.removeEventListener('keydown', dismiss);
    setTimeout(() => {
      overlay.remove();
      // After cinematic, route to onboarding if first launch.
      const s = getSettings();
      if (!s.onboarding_seen) {
        window.location.hash = '#/onboarding';
      }
    }, 360);
  }
  overlay.querySelector('#reveal-skip').addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'reveal-skip') return;
    dismiss();
  });
  document.addEventListener('keydown', dismiss, { once: true });
}

window.aise26 = Object.assign(window.aise26 || {}, { maybeShowReveal });
