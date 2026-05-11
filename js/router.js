// Hash router. Each route maps a regex to a render function that returns
// {node, title, breadcrumb, mainClass}.

import { CONCEPTS } from './data.js';
import { clear, announce } from './runtime.js';

export const ROUTES = [];

export function registerRoute(re, fn) {
  ROUTES.push({ re, fn });
}

export function ensureRoute(re, fn) {
  if (!ROUTES.some(r => String(r.re) === String(re))) ROUTES.push({ re, fn });
}

// j/k cycle list (alphabetical by default).
export const _alphaSlugs = CONCEPTS
  .slice()
  .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  .map(c => c.slug);
let _conceptCycleList = _alphaSlugs;
export function setCycleList(list) {
  _conceptCycleList = list && list.length ? list : _alphaSlugs;
}
export function cycleConcept(dir) {
  if (!_conceptCycleList.length) return;
  const cur = (window.location.hash.match(/^#\/concept\/([A-Za-z0-9-]+)/) || [])[1];
  let idx = cur ? _conceptCycleList.indexOf(cur) : -1;
  idx = (idx + dir + _conceptCycleList.length) % _conceptCycleList.length;
  window.location.hash = '#/concept/' + _conceptCycleList[idx];
}
document.addEventListener('aise26:cycle-concept', (e) => cycleConcept(e.detail.dir));

// Highlight the active rail link.
function highlightActiveNav() {
  const hash = window.location.hash || '#/';
  const links = document.querySelectorAll('.rail-link');
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const matches =
      (href === '#/' && (hash === '#/' || hash === '')) ||
      (href === '#/map' && hash.startsWith('#/map')) ||
      (href === '#/modules' && (hash === '#/modules' || hash.startsWith('#/module/'))) ||
      (href === '#/glossary' && hash.startsWith('#/glossary')) ||
      (href === '#/playbooks' && (hash === '#/playbooks' || hash.startsWith('#/playbook/'))) ||
      (href === '#/toolkit' && hash.startsWith('#/toolkit')) ||
      (href === '#/decisions' && (hash === '#/decisions' || hash.startsWith('#/decision/'))) ||
      (href === '#/library' && hash.startsWith('#/library')) ||
      (href === '#/profile' && hash.startsWith('#/profile')) ||
      (href === '#/path' && hash.startsWith('#/path')) ||
      (href === '#/topics' && hash.startsWith('#/topics')) ||
      (href === '#/practice' && hash.startsWith('#/practice')) ||
      (href === '#/review' && hash.startsWith('#/review')) ||
      (href === '#/career' && hash.startsWith('#/career')) ||
      (href === '#/settings' && hash.startsWith('#/settings'));
    if (matches) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function renderCrumbs(crumbs) {
  const root = document.getElementById('crumbs');
  if (!root) return;
  clear(root);
  if (!crumbs || !crumbs.length) {
    root.appendChild(document.createTextNode(''));
    return;
  }
  crumbs.forEach((c, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '/';
      root.appendChild(sep);
    }
    let node;
    if (c.href && i < crumbs.length - 1) {
      node = document.createElement('a');
      node.href = c.href;
      node.textContent = c.label;
    } else {
      node = document.createElement('span');
      node.className = 'last';
      node.textContent = c.label;
    }
    root.appendChild(node);
  });
}

export function renderNotFoundView(msg) {
  // Minimal not-found. msg may carry user-controlled text (e.g. the current
  // hash) so we MUST NOT use innerHTML; build the DOM with textContent.
  const wrap = document.createElement('article');
  wrap.className = 'fade-up';
  const h1 = document.createElement('h1');
  h1.textContent = 'Not found';
  const p = document.createElement('p');
  p.textContent = msg || 'That page does not exist.';
  const back = document.createElement('p');
  const a = document.createElement('a');
  a.href = '#/';
  a.textContent = 'Back to home';
  back.appendChild(a);
  wrap.appendChild(h1);
  wrap.appendChild(p);
  wrap.appendChild(back);
  return { node: wrap, title: 'Not found', crumbs: [{ label: 'Not found' }], mainClass: 'no-rail' };
}

export function route() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#bucket-')) return; // glossary jump anchors
  let result = null;
  for (const r of ROUTES) {
    const m = hash.match(r.re);
    if (m) {
      try { result = r.fn.apply(null, m.slice(1)); }
      catch (err) { console.error('[aise26] view error', err); result = renderNotFoundView('Page render error: ' + err.message); }
      break;
    }
  }
  if (!result) result = renderNotFoundView('Unknown route: ' + hash);

  const main = document.getElementById('view');
  if (!main) return;
  clear(main);
  // Apply optional main class (no-rail / full-bleed)
  const mainEl = document.getElementById('main-region');
  if (mainEl) {
    mainEl.className = 'main' + (result.mainClass ? ' ' + result.mainClass : '');
  }
  main.appendChild(result.node);
  // Right-rail content (optional)
  const ctx = document.getElementById('context');
  if (ctx) {
    clear(ctx);
    if (result.context) {
      if (result.context instanceof Node) ctx.appendChild(result.context);
      else ctx.innerHTML = ''; // never accept HTML strings
      ctx.style.display = '';
    } else if (result.mainClass === 'no-rail' || result.mainClass === 'full-bleed') {
      ctx.style.display = 'none';
    } else {
      ctx.style.display = '';
    }
  }
  document.title = (result.title ? result.title + ' | ' : '') + 'AISE 2026';
  renderCrumbs(result.crumbs);
  highlightActiveNav();
  // Move focus to main on USER-DRIVEN route changes only. On the initial
  // page load we want the natural Tab order to land on the skip-link first.
  if (_routeHasFiredOnce) {
    try { main.focus({ preventScroll: false }); } catch {}
  }
  _routeHasFiredOnce = true;
  if (!hash.startsWith('#bucket-')) window.scrollTo({ top: 0, behavior: 'instant' });
  document.dispatchEvent(new CustomEvent('aise26:after-route', { detail: { hash } }));
}

let _routeHasFiredOnce = false;

window.addEventListener('hashchange', route);

window.aise26 = Object.assign(window.aise26 || {}, {
  ROUTES, route, registerRoute, ensureRoute,
  setCycleList, cycleConcept, _alphaSlugs
});
