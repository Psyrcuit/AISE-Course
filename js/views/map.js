// System Map. Force-directed knowledge graph rendered to Canvas2D via the
// vendored `force-graph` library. 514 concept nodes, ~1000 cross-ref edges,
// clustered by module. Pan, zoom, click-to-focus.

import { CONCEPTS, MODULES } from '../data.js';
import { el, clear, announce } from '../runtime.js';
import { conceptBySlug, moduleByN, resolveCrossRef, linkifyText } from '../crossref.js';
import { getConceptState, isSaved } from '../gamification.js';

// Module hue ramp (matches CSS tokens)
const MODULE_HUES = [
  null, // index 0 placeholder
  'oklch(72% .14 25)',  'oklch(72% .14 50)', 'oklch(72% .14 80)',  'oklch(72% .14 110)',
  'oklch(72% .14 140)', 'oklch(72% .14 170)','oklch(72% .14 200)', 'oklch(72% .14 230)',
  'oklch(72% .14 260)', 'oklch(72% .14 290)','oklch(72% .14 320)', 'oklch(72% .14 350)',
  'oklch(72% .14 15)',  'oklch(72% .14 65)', 'oklch(72% .14 125)', 'oklch(72% .14 215)'
];

let _filter = { fleshedOnly: false, completed: false, saved: false, module: null, search: '' };
let _graphInstance = null;
let _highlightedSlug = null;

export function renderSystemMap(rawHash) {
  // Parse hash params (#/map?focus=slug or #/map?module=N)
  const hash = window.location.hash || '';
  const qIdx = hash.indexOf('?');
  const params = new URLSearchParams(qIdx >= 0 ? hash.slice(qIdx + 1) : '');
  const focusSlug = params.get('focus');
  const focusModule = params.get('module');
  if (focusModule) _filter.module = parseInt(focusModule, 10);

  const wrap = el('section', { id: 'map-shell', class: 'map-shell', 'aria-label': 'System Map' });

  // HUD
  const hud = el('div', { class: 'map-hud' });
  // Search
  const searchBox = el('div', { class: 'map-search-box' });
  searchBox.appendChild(el('span', { class: 'ico', 'aria-hidden': 'true' }, '⌕'));
  const searchInput = el('input', {
    type: 'search',
    placeholder: 'Search concepts on the map',
    'aria-label': 'Search concepts on the map'
  });
  searchInput.addEventListener('input', () => {
    _filter.search = searchInput.value.trim().toLowerCase();
    refreshFilters();
  });
  searchBox.appendChild(searchInput);
  hud.appendChild(searchBox);

  // Filter chips
  const fleshedChip = el('button', {
    class: 'map-filter-chip',
    type: 'button',
    'aria-pressed': String(_filter.fleshedOnly)
  }, ['Fleshed only ', el('span', { class: 'count' }, '(' + CONCEPTS.filter(c => c.fleshed).length + ')')]);
  fleshedChip.addEventListener('click', () => {
    _filter.fleshedOnly = !_filter.fleshedOnly;
    fleshedChip.setAttribute('aria-pressed', String(_filter.fleshedOnly));
    refreshFilters();
  });
  hud.appendChild(fleshedChip);

  const completedChip = el('button', {
    class: 'map-filter-chip',
    type: 'button',
    'aria-pressed': String(_filter.completed)
  }, 'Completed');
  completedChip.addEventListener('click', () => {
    _filter.completed = !_filter.completed;
    completedChip.setAttribute('aria-pressed', String(_filter.completed));
    refreshFilters();
  });
  hud.appendChild(completedChip);

  const savedChip = el('button', {
    class: 'map-filter-chip',
    type: 'button',
    'aria-pressed': String(_filter.saved)
  }, 'Saved');
  savedChip.addEventListener('click', () => {
    _filter.saved = !_filter.saved;
    savedChip.setAttribute('aria-pressed', String(_filter.saved));
    refreshFilters();
  });
  hud.appendChild(savedChip);

  const modSelect = el('select', { class: 'map-module-select', 'aria-label': 'Filter by module' });
  modSelect.appendChild(el('option', { value: '' }, 'All modules'));
  for (const m of MODULES) {
    const o = el('option', { value: String(m.n) }, 'M' + m.n + ': ' + m.title);
    if (_filter.module === m.n) o.selected = true;
    modSelect.appendChild(o);
  }
  modSelect.addEventListener('change', () => {
    _filter.module = modSelect.value ? parseInt(modSelect.value, 10) : null;
    refreshFilters();
  });
  hud.appendChild(modSelect);

  wrap.appendChild(hud);

  // Canvas wrapper
  const canvasWrap = el('div', { id: 'map-canvas-wrap' });
  wrap.appendChild(canvasWrap);

  // Hover card
  const hoverCard = el('div', { class: 'map-hover-card', id: 'map-hover-card' });
  wrap.appendChild(hoverCard);

  // Legend
  const legend = el('div', { class: 'map-legend' }, [
    el('div', { class: 'row' }, [el('div', { class: 'swatch', style: 'background: oklch(72% .14 200)' }), 'Module hue']),
    el('div', { class: 'row' }, [el('div', { class: 'swatch', style: 'background: var(--accent)' }), 'Completed']),
    el('div', { class: 'row' }, [el('div', { class: 'swatch', style: 'background: var(--text-3)' }), 'Stub'])
  ]);
  wrap.appendChild(legend);

  // Help
  const help = el('div', { class: 'map-help' }, [
    'Drag to pan · scroll to zoom · click for details · ',
    el('kbd', null, '←→↑↓'),
    ' move focus · ',
    el('kbd', null, 'Enter'),
    ' open'
  ]);
  wrap.appendChild(help);

  // Concept side-sheet
  const sheet = el('aside', { class: 'map-concept-sheet', id: 'map-sheet', 'aria-label': 'Concept details', 'data-open': 'false' });
  wrap.appendChild(sheet);

  // Hidden a11y list (parallel keyboard nav)
  const a11y = el('ul', { class: 'sr-only', id: 'map-a11y-list', role: 'list', 'aria-label': 'All concepts on the map' });
  wrap.appendChild(a11y);

  // Defer graph init until the wrap is in the DOM
  Promise.resolve().then(() => initGraph(canvasWrap, hoverCard, sheet, a11y, focusSlug));

  return {
    node: wrap,
    title: 'System Map',
    crumbs: [{ label: 'System Map' }],
    mainClass: 'full-bleed'
  };
}

// ---- Graph data construction + rendering ----

function buildGraphData() {
  const nodes = CONCEPTS.map(c => {
    const state = getConceptState(c.slug);
    const saved = isSaved(c.slug);
    return {
      id: c.slug,
      name: c.name,
      module: c.module,
      stub: c.stub,
      fleshed: c.fleshed,
      complete: state.complete,
      saved,
      // Cluster anchor (one center per module on a circle)
      // d3-force will pull these toward the cluster center.
      _cx: 0, _cy: 0,
      // Visual size
      val: 1
    };
  });
  // Connectivity = degree
  const degree = new Map();
  const links = [];
  for (const c of CONCEPTS) {
    for (const ref of c.crossRefs) {
      const r = resolveCrossRef(ref);
      if (!r.ok || r.kind !== 'concept' || r.slug === c.slug) continue;
      links.push({ source: c.slug, target: r.slug });
      degree.set(c.slug, (degree.get(c.slug) || 0) + 1);
      degree.set(r.slug, (degree.get(r.slug) || 0) + 1);
    }
  }
  for (const n of nodes) n.val = 1 + Math.min(8, (degree.get(n.id) || 0) * 0.5);
  return { nodes, links };
}

function initGraph(canvasWrap, hoverCard, sheet, a11y, focusSlug) {
  if (typeof window.ForceGraph !== 'function') {
    console.error('[map] ForceGraph library not loaded');
    canvasWrap.appendChild(el('div', { style: 'color: var(--text-3); padding: 32px;' }, 'System Map failed to load (graph library missing).'));
    return;
  }
  const data = buildGraphData();

  // Populate the hidden a11y list
  data.nodes.forEach((n, i) => {
    const li = el('li', null, el('a', {
      href: '#/concept/' + n.id,
      'data-slug': n.id,
      'data-i': String(i)
    }, n.name + ' (Module ' + n.module + ')'));
    a11y.appendChild(li);
  });

  // Build cluster centers in a 4x4 grid (closer to a "system landscape").
  const centers = new Map();
  const COLS = 4;
  const SPACING = 360;
  for (let i = 0; i < MODULES.length; i++) {
    const m = MODULES[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    centers.set(m.n, {
      x: (col - (COLS - 1) / 2) * SPACING,
      y: (row - (Math.ceil(MODULES.length / COLS) - 1) / 2) * SPACING
    });
  }

  const Graph = window.ForceGraph()(canvasWrap)
    .graphData(data)
    .backgroundColor('#0A0A0C')
    .nodeRelSize(5)
    .nodeVal(n => n.val)
    .linkColor(() => 'rgba(180, 180, 220, 0.32)')
    .linkWidth(1)
    .linkDirectionalParticles(0)
    .nodeColor(n => {
      if (_highlightedSlug === n.id) return '#FFFFFF';
      if (n.complete) return '#B4A0FF';
      if (n.fleshed) return MODULE_HUES[n.module] || '#cccccc';
      return 'rgba(180, 180, 200, 0.6)';
    })
    .nodeCanvasObjectMode(n => (Graph.zoom() > 1.4 || _highlightedSlug === n.id) ? 'after' : undefined)
    .nodeCanvasObject((n, ctx, globalScale) => {
      // Custom label rendering when zoomed in
      if (globalScale < 1.4 && _highlightedSlug !== n.id) return;
      const label = n.name;
      const fontSize = 11 / globalScale;
      ctx.font = `${fontSize}px Geist, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = _highlightedSlug === n.id ? '#FFFFFF' : 'rgba(244, 244, 245, 0.85)';
      ctx.fillText(label, n.x, n.y + 8 / globalScale);
    })
    .onNodeHover(n => {
      if (n) {
        showHover(n, hoverCard);
        canvasWrap.style.cursor = 'pointer';
      } else {
        hoverCard.setAttribute('data-visible', 'false');
        canvasWrap.style.cursor = 'grab';
      }
    })
    .onNodeClick(n => {
      _highlightedSlug = n.id;
      Graph.centerAt(n.x, n.y, 600);
      Graph.zoom(2.4, 600);
      openSheet(n, sheet);
    })
    .onBackgroundClick(() => {
      _highlightedSlug = null;
      closeSheet(sheet);
    });

  // Cluster forces: pull nodes toward their module's grid cell.
  Graph.d3Force('cluster', alpha => {
    for (const n of data.nodes) {
      const c = centers.get(n.module);
      if (!c) continue;
      n.vx += (c.x - n.x) * alpha * 0.12;
      n.vy += (c.y - n.y) * alpha * 0.12;
    }
  });
  Graph.d3Force('charge').strength(-60);
  if (Graph.d3Force('link')) Graph.d3Force('link').distance(28).strength(0.3);

  _graphInstance = Graph;

  // Initial centering
  setTimeout(() => Graph.zoomToFit(800, 60), 800);

  // Keyboard nav: arrow keys move highlight, Enter opens
  document.addEventListener('keydown', _mapKeyHandler);

  // Initial focus from URL param
  if (focusSlug) {
    setTimeout(() => {
      const node = data.nodes.find(n => n.id === focusSlug);
      if (node) {
        _highlightedSlug = focusSlug;
        Graph.centerAt(node.x, node.y, 600);
        Graph.zoom(2.4, 600);
        openSheet(node, sheet);
      }
    }, 1000);
  }

  // Cleanup on route change
  window.addEventListener('hashchange', cleanup, { once: true });

  function refreshFiltersInner() {
    const q = _filter.search;
    const filtered = {
      nodes: data.nodes.filter(n => {
        if (_filter.fleshedOnly && !n.fleshed) return false;
        if (_filter.completed && !n.complete) return false;
        if (_filter.saved && !n.saved) return false;
        if (_filter.module && n.module !== _filter.module) return false;
        if (q) {
          const text = (n.name + ' ' + n.stub).toLowerCase();
          if (!text.includes(q)) return false;
        }
        return true;
      }),
      links: []
    };
    const ids = new Set(filtered.nodes.map(n => n.id));
    filtered.links = data.links.filter(l => ids.has(l.source.id || l.source) && ids.has(l.target.id || l.target));
    Graph.graphData(filtered);
    if (q) {
      // Fly to first match
      const first = filtered.nodes[0];
      if (first) {
        _highlightedSlug = first.id;
        Graph.centerAt(first.x, first.y, 600);
      }
    }
    announce(filtered.nodes.length + ' concepts visible on the map.');
  }
  // Make refresh available to outer scope
  window._refreshMapFilters = refreshFiltersInner;
}

function _mapKeyHandler(e) {
  if (!_graphInstance) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  const data = _graphInstance.graphData();
  if (!data.nodes.length) return;
  const idx = data.nodes.findIndex(n => n.id === _highlightedSlug);
  let nextIdx = idx;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % data.nodes.length;
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + data.nodes.length) % data.nodes.length;
  else if (e.key === 'Enter' && _highlightedSlug) {
    window.location.hash = '#/concept/' + _highlightedSlug;
    return;
  } else return;
  e.preventDefault();
  const n = data.nodes[nextIdx];
  _highlightedSlug = n.id;
  _graphInstance.centerAt(n.x, n.y, 400);
  _graphInstance.zoom(Math.max(_graphInstance.zoom(), 1.6), 400);
  // Update sheet
  const sheet = document.getElementById('map-sheet');
  const card = document.getElementById('map-hover-card');
  if (sheet) openSheet(n, sheet);
  showHover(n, card);
  announce(n.name);
}

function refreshFilters() {
  if (window._refreshMapFilters) window._refreshMapFilters();
}

function showHover(n, card) {
  if (!n || !card) return;
  card.setAttribute('data-visible', 'true');
  // Position near the cursor (force-graph puts hover at center)
  card.style.left = '50%';
  card.style.top = '50%';
  card.style.transform = 'translate(-50%, -150%)';
  card.innerHTML = '';
  const m = moduleByN(n.module);
  const name = el('div', { class: 'name' }, n.name);
  const stub = el('div', { class: 'stub' }, n.stub);
  const pills = el('div', { class: 'pills' }, [
    el('span', { class: 'pill pill-mod', 'data-module': String(n.module) }, 'M' + n.module),
    el('span', { class: 'pill ' + (n.fleshed ? 'pill-fleshed' : 'pill-stub') }, n.fleshed ? 'Fleshed' : 'Stub')
  ]);
  card.appendChild(name); card.appendChild(stub); card.appendChild(pills);
}

function openSheet(n, sheet) {
  if (!sheet) return;
  clear(sheet);
  const head = el('div', { class: 'map-concept-sheet-head' }, [
    el('span', { style: 'font-family: var(--font-mono); font-size: var(--fs-100); color: var(--text-3); letter-spacing: .04em; text-transform: uppercase;' }, 'Module ' + n.module),
    el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close' }, '✕')
  ]);
  head.querySelector('button').addEventListener('click', () => closeSheet(sheet));
  sheet.appendChild(head);
  const body = el('div', { class: 'map-concept-sheet-body' });
  // Render a compact concept card
  body.appendChild(el('h2', { style: 'font-size: var(--fs-500); margin: 0 0 8px;' }, n.name));
  body.appendChild(el('p', { class: 'prose' }, n.stub));
  const c = conceptBySlug(n.id);
  if (c && c.crossRefs && c.crossRefs.length) {
    const refs = el('section', { style: 'margin-top: 16px;' }, [
      el('h3', { style: 'font-size: var(--fs-200); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: .06em; color: var(--text-3); margin: 0 0 8px;' }, 'See also'),
      el('ul', { class: 'see-also-list' }, c.crossRefs.slice(0, 8).map(ref => {
        const r = resolveCrossRef(ref);
        if (!r.ok) return null;
        return el('li', null, el('a', { href: r.href }, r.label));
      }).filter(Boolean))
    ]);
    body.appendChild(refs);
  }
  body.appendChild(el('div', { style: 'margin-top: 18px; display: flex; gap: 8px;' }, [
    el('a', { class: 'btn btn-primary', href: '#/concept/' + n.id }, 'Open full page →'),
    el('a', { class: 'btn', href: '#/module/' + n.module }, 'Module')
  ]));
  sheet.setAttribute('data-open', 'true');
  linkifyText(body, { skipSlug: n.id });
}

function closeSheet(sheet) {
  if (!sheet) return;
  sheet.setAttribute('data-open', 'false');
  setTimeout(() => clear(sheet), 240);
}

function cleanup() {
  document.removeEventListener('keydown', _mapKeyHandler);
  if (_graphInstance) {
    try { _graphInstance.pauseAnimation(); } catch {}
    _graphInstance = null;
  }
  delete window._refreshMapFilters;
}
