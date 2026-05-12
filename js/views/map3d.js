// 3D System Map. Canvas2D-rendered 3D-projection, no Three.js vendor.
// Nodes positioned in 3D space (x by module column, y by subsection,
// z from cross-reference clustering). Mouse drag orbits camera; wheel zooms.

import { CONCEPTS, MODULES } from '../data.js';
import { el, getSettings, lsSet } from '../runtime.js';
import { conceptBySlug } from '../crossref.js';
import { getConceptState, isSaved } from '../gamification.js';

let _running = false;
let _cleanup = null;

export function renderMap3D(params) {
  // Tear down any previous mount so _cleanup doesn't leak across navigations.
  if (_cleanup) { try { _cleanup(); } catch {} _cleanup = null; }

  lsSet('map3d_opened', true);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build the page wrapper + canvas. NOTE: we intentionally do NOT use
  // the .fade-up class here. fade-up animates `transform: translateY()`
  // which makes the article a containing block for any descendant with
  // `position: fixed`. The .map3d-stage relies on `position: fixed`
  // being relative to the viewport so it can fill the screen below the
  // topstrip; with a transformed ancestor the stage collapses to 0×0.
  const wrap = el('article', { 'aria-labelledby': 'm3-h1' });
  wrap.appendChild(el('div', { class: 'home-eyebrow' }, 'System Map · 3D'));
  wrap.appendChild(el('h1', { id: 'm3-h1', style: 'position: absolute; left: -9999px;' }, '3D System Map'));

  const stage = el('div', { class: 'map3d-stage' });
  const canvas = el('canvas', {
    class: 'map3d-canvas',
    'aria-label': '3D system map of 514 concepts. Use arrow keys to orbit, plus and minus to zoom, Enter to open the focused concept.',
    role: 'application',
    tabindex: '0'
  });
  stage.appendChild(canvas);

  // HUD
  const hud = el('div', { class: 'map3d-hud' });
  hud.appendChild(el('div', { class: 'practice-card-eyebrow' }, '514 nodes · 16 modules'));
  hud.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); margin: 4px 0 8px;' }, 'Drag or arrow keys to orbit · Scroll or +/- to zoom · Enter to open'));
  const autoBtn = el('button', { type: 'button', class: 'btn btn-sm btn-ghost', 'aria-pressed': 'false' }, 'Auto rotate');
  autoBtn.addEventListener('click', () => {
    autoRotate = !autoRotate;
    autoBtn.setAttribute('aria-pressed', autoRotate ? 'true' : 'false');
  });
  hud.appendChild(el('div', { style: 'display: flex; gap: 8px; flex-wrap: wrap;' }, [
    _hudBtn('Reset view', () => { camera.target = { x: 0, y: 0, z: 0 }; camera.theta = 0.6; camera.phi = -0.5; camera.dist = 1500; }),
    autoBtn,
    el('a', { class: 'btn btn-sm btn-ghost', href: '#/map' }, 'Back to 2D')
  ]));
  stage.appendChild(hud);

  // Side sheet
  const sheet = el('aside', { class: 'map3d-sheet', 'aria-label': 'Concept detail' });
  stage.appendChild(sheet);
  sheet.style.display = 'none';

  wrap.appendChild(stage);

  // ------- Build node positions -------
  // Layout: arrange 16 modules in a circle on the X-Z plane; concepts within
  // a module are spaced vertically (Y axis) by subsection.
  const RADIUS = 600;
  const nodes = [];
  const moduleAngle = {};
  for (let i = 0; i < MODULES.length; i++) {
    moduleAngle[MODULES[i].n] = (i / MODULES.length) * Math.PI * 2;
  }
  // Group concepts by module + subsection for clean Y-stacking
  const grouped = {};
  for (const c of CONCEPTS) {
    if (!grouped[c.module]) grouped[c.module] = {};
    const sub = c.subsection || '';
    if (!grouped[c.module][sub]) grouped[c.module][sub] = [];
    grouped[c.module][sub].push(c);
  }
  for (const m of MODULES) {
    const ang = moduleAngle[m.n];
    const cx = Math.cos(ang) * RADIUS;
    const cz = Math.sin(ang) * RADIUS;
    const subs = Object.keys(grouped[m.n] || {});
    let yIdx = 0;
    for (const sub of subs) {
      const items = grouped[m.n][sub];
      for (let i = 0; i < items.length; i++) {
        const c = items[i];
        // Spread within group: small XZ offset, increasing Y by index
        const subOffset = (i - (items.length - 1) / 2) * 18;
        const radialOffset = (yIdx % 3 === 0 ? -40 : yIdx % 3 === 1 ? 0 : 40);
        const px = cx + Math.cos(ang) * radialOffset + Math.sin(ang) * subOffset;
        const pz = cz + Math.sin(ang) * radialOffset - Math.cos(ang) * subOffset;
        const py = yIdx * 24 - (subs.length * 24 / 2);
        nodes.push({
          slug: c.slug, name: c.name, module: c.module, fleshed: c.fleshed,
          x: px, y: py, z: pz, color: _moduleColor(c.module)
        });
        yIdx++;
      }
    }
  }

  // ------- Camera -------
  const camera = {
    theta: 0.6,            // orbit angle around Y
    phi: -0.5,             // pitch
    dist: 1500,            // distance from target
    target: { x: 0, y: 0, z: 0 },
    fov: 800
  };
  let autoRotate = false;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let hoveredIdx = -1;
  let selectedSlug = null;

  // ------- Sizing -------
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ------- Project 3D -> 2D -------
  function project(node) {
    const cosT = Math.cos(camera.theta), sinT = Math.sin(camera.theta);
    const cosP = Math.cos(camera.phi), sinP = Math.sin(camera.phi);
    const dx = node.x - camera.target.x;
    const dy = node.y - camera.target.y;
    const dz = node.z - camera.target.z;
    // Rotate around Y
    const x1 = cosT * dx - sinT * dz;
    const z1 = sinT * dx + cosT * dz;
    // Rotate around X
    const y2 = cosP * dy - sinP * z1;
    const z2 = sinP * dy + cosP * z1;
    // Translate by camera distance
    const cz = z2 + camera.dist;
    if (cz < 1) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = (x1 * camera.fov) / cz + rect.width / 2;
    const sy = (y2 * camera.fov) / cz + rect.height / 2;
    return { sx, sy, depth: cz, scale: camera.fov / cz };
  }

  // ------- Render loop -------
  function frame() {
    if (!_running) return;
    if (autoRotate && !reduceMotion) camera.theta += 0.003;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    // Clear
    ctx.fillStyle = _bg();
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Project + sort
    const projected = [];
    for (let i = 0; i < nodes.length; i++) {
      const p = project(nodes[i]);
      if (!p) continue;
      projected.push({ idx: i, ...p });
    }
    projected.sort((a, b) => b.depth - a.depth);   // far first

    // Faint center grid (orientation cue)
    _drawGrid(ctx, rect);

    // Draw nodes
    for (const p of projected) {
      const n = nodes[p.idx];
      const r = Math.max(2, p.scale * 4);
      const isHovered = p.idx === hoveredIdx;
      const isSelected = n.slug === selectedSlug;
      const state = getConceptState(n.slug);
      const completed = state.complete;
      // Depth-based alpha
      const depthAlpha = Math.max(0.25, Math.min(1.0, 1.0 - (p.depth - camera.dist) / 1800));
      ctx.globalAlpha = depthAlpha;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r * (isHovered ? 1.6 : 1), 0, Math.PI * 2);
      let fill = n.color;
      if (completed) fill = '#B4A0FF';
      if (!n.fleshed) fill = _withAlpha(n.color, 0.55);
      ctx.fillStyle = fill;
      ctx.fill();
      if (isHovered || isSelected) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;

    // Hovered label
    if (hoveredIdx >= 0) {
      const n = nodes[hoveredIdx];
      const p = project(n);
      if (p) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(p.sx + 12, p.sy - 14, ctx.measureText(n.name).width + 16, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.fillText(n.name, p.sx + 20, p.sy + 2);
      }
    }

    requestAnimationFrame(frame);
  }

  // ------- Mouse interaction -------
  function onMouseDown(e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  }
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (dragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      camera.theta -= dx * 0.005;
      camera.phi -= dy * 0.005;
      camera.phi = Math.max(-1.4, Math.min(1.4, camera.phi));
      lastX = e.clientX;
      lastY = e.clientY;
    } else {
      // Hit test for hover
      let bestIdx = -1, bestDist = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const p = project(nodes[i]);
        if (!p) continue;
        const dxh = p.sx - mx;
        const dyh = p.sy - my;
        const dh = dxh * dxh + dyh * dyh;
        const r = Math.max(2, p.scale * 4);
        if (dh < r * r * 4 && dh < bestDist) { bestDist = dh; bestIdx = i; }
      }
      hoveredIdx = bestIdx;
      canvas.style.cursor = bestIdx >= 0 ? 'pointer' : 'grab';
    }
  }
  function onMouseUp() { dragging = false; canvas.style.cursor = 'grab'; }
  function onWheel(e) {
    e.preventDefault();
    camera.dist *= e.deltaY > 0 ? 1.08 : 0.92;
    camera.dist = Math.max(400, Math.min(3500, camera.dist));
  }
  function onClick() {
    if (hoveredIdx < 0) return;
    const n = nodes[hoveredIdx];
    selectedSlug = n.slug;
    showSheet(n);
  }
  function showSheet(n) {
    const c = conceptBySlug(n.slug);
    if (!c) return;
    sheet.style.display = '';
    sheet.innerHTML = '';
    sheet.appendChild(el('div', { class: 'practice-card-eyebrow' }, 'Module ' + c.module + (c.fleshed ? ' · Fleshed' : ' · Stub')));
    sheet.appendChild(el('h2', { style: 'margin: 4px 0 8px;' }, c.name));
    if (c.aliases && c.aliases.length) {
      sheet.appendChild(el('p', { style: 'font-size: var(--fs-100); color: var(--text-3); margin: 0 0 8px;' }, 'Also: ' + c.aliases.join(', ')));
    }
    sheet.appendChild(el('p', null, c.stub));
    const actions = el('div', { style: 'display: flex; gap: 8px; margin-top: 12px;' });
    actions.appendChild(el('a', { class: 'btn btn-primary btn-sm', href: '#/concept/' + c.slug }, 'Open concept →'));
    actions.appendChild(_hudBtn('Close', () => { sheet.style.display = 'none'; selectedSlug = null; }));
    sheet.appendChild(actions);
  }

  // ------- Keyboard interaction -------
  let kbIdx = 0;            // index into nodes[] for keyboard "focus"
  function onKey(e) {
    if (e.target !== canvas) return;
    switch (e.key) {
      case 'ArrowLeft':  camera.theta -= 0.08; e.preventDefault(); break;
      case 'ArrowRight': camera.theta += 0.08; e.preventDefault(); break;
      case 'ArrowUp':    camera.phi   -= 0.06; e.preventDefault(); break;
      case 'ArrowDown':  camera.phi   += 0.06; e.preventDefault(); break;
      case '+': case '=':
        camera.dist = Math.max(400, camera.dist * 0.92); e.preventDefault(); break;
      case '-': case '_':
        camera.dist = Math.min(3500, camera.dist * 1.08); e.preventDefault(); break;
      case 'Tab':
        kbIdx = (kbIdx + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length;
        hoveredIdx = kbIdx;
        // orbit to face the focused node
        const n = nodes[kbIdx];
        camera.target = { x: n.x * 0.3, y: n.y * 0.3, z: n.z * 0.3 };
        e.preventDefault();
        break;
      case 'Enter':
        if (hoveredIdx >= 0) { showSheet(nodes[hoveredIdx]); selectedSlug = nodes[hoveredIdx].slug; }
        e.preventDefault();
        break;
    }
    camera.phi = Math.max(-1.4, Math.min(1.4, camera.phi));
  }

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('keydown', onKey);
  window.addEventListener('resize', resize);

  // Touch interaction (basic single-finger orbit)
  let touchStart = null;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      touchStart = [lastX, lastY];
    }
  });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && dragging) {
      const t = e.touches[0];
      onMouseMove({ clientX: t.clientX, clientY: t.clientY });
      e.preventDefault();
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { dragging = false; });

  // Lifecycle
  _running = true;
  _cleanup = () => {
    _running = false;
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', resize);
  };
  // Tear down on hashchange
  window.addEventListener('hashchange', () => {
    if (!window.location.hash.includes('/map')) {
      if (_cleanup) _cleanup();
      _cleanup = null;
    }
  }, { once: true });

  // Defer sizing + render until DOM mounted
  setTimeout(() => {
    resize();
    requestAnimationFrame(frame);
  }, 30);

  return {
    node: wrap,
    title: '3D System Map',
    crumbs: [{ label: 'System Map', href: '#/map' }, { label: '3D' }],
    mainClass: 'no-rail full-bleed'
  };
}

// ---- helpers ----
function _hudBtn(label, onClick) {
  const b = el('button', { class: 'btn btn-sm btn-ghost', type: 'button' }, label);
  b.addEventListener('click', onClick);
  return b;
}
function _moduleColor(n) {
  // Map module N to an OKLCH-like RGB approximation matching --hue-N tokens
  const palette = [
    '#E26A6A', '#E89656', '#E5BB58', '#B7D661', '#7CD686',
    '#5CD0B0', '#5BBED7', '#5C9CDB', '#7C8BDD', '#A284E0',
    '#C586D9', '#DC7AB8', '#E6708A', '#E89D63', '#A2D175', '#5CB7DD'
  ];
  return palette[(n - 1) % palette.length] || '#B4A0FF';
}
function _withAlpha(hex, alpha) {
  // hex -> rgba
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + alpha + ')';
}
function _bg() {
  const t = (getSettings() || {}).theme || 'dark';
  if (t === 'light') return '#F4F4F6';
  if (t === 'sepia') return '#EFE6D2';
  return '#08080A';
}
function _drawGrid(ctx, rect) {
  ctx.save();
  ctx.strokeStyle = 'rgba(180, 160, 255, 0.06)';
  ctx.lineWidth = 1;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  for (let r = 80; r < Math.max(rect.width, rect.height); r += 80) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
