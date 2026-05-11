// Command palette (Cmd/Ctrl+K). Universal interface: navigate, toggle theme,
// reset, jump to map. Uses search.js for concept ranking.

import { el, clear, announce, toggleTheme, lsResetAll } from './runtime.js';
import { searchConcepts, highlightTokens, pushSearchHistory, getSearchHistory } from './search.js';
import { MODULES } from './data.js';

let overlay = null;
let resultsList = null;
let inputEl = null;
let activeIdx = 0;
let currentResults = [];
let _returnFocusEl = null;

function open() {
  if (!overlay) build();
  // Remember where focus was so we can return it on close.
  _returnFocusEl = document.activeElement;
  overlay.setAttribute('data-open', 'true');
  inputEl.value = '';
  activeIdx = 0;
  renderResults('');
  setTimeout(() => inputEl.focus(), 30);
}

function close() {
  if (!overlay) return;
  overlay.setAttribute('data-open', 'false');
  if (_returnFocusEl && typeof _returnFocusEl.focus === 'function' && document.body.contains(_returnFocusEl)) {
    try { _returnFocusEl.focus(); } catch {}
  }
  _returnFocusEl = null;
}

function build() {
  overlay = el('div', { class: 'cmd-overlay', id: 'cmd-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Command palette' });
  const palette = el('div', { class: 'cmd-palette' });
  const inputRow = el('div', { class: 'cmd-input-row' });
  inputRow.appendChild(el('span', { class: 'ico', 'aria-hidden': 'true' }, '⌕'));
  inputEl = el('input', {
    class: 'cmd-input',
    type: 'search',
    placeholder: 'Search concepts, jump anywhere...',
    'aria-label': 'Command palette',
    'aria-autocomplete': 'list',
    'aria-controls': 'cmd-results'
  });
  inputRow.appendChild(inputEl);
  palette.appendChild(inputRow);
  resultsList = el('ul', {
    class: 'cmd-results',
    id: 'cmd-results',
    role: 'listbox',
    'aria-label': 'Search results'
  });
  palette.appendChild(resultsList);
  palette.appendChild(el('div', { class: 'cmd-foot' }, [
    el('span', null, ['↑↓ navigate · ', el('span', { class: 'kbd' }, 'Enter'), ' open · ', el('span', { class: 'kbd' }, 'Esc'), ' close']),
    el('span', null, [el('span', { class: 'kbd' }, 'Cmd'), '+', el('span', { class: 'kbd' }, 'K'), ' to open anywhere'])
  ]));
  overlay.appendChild(palette);
  document.body.appendChild(overlay);

  inputEl.addEventListener('input', () => {
    activeIdx = 0;
    renderResults(inputEl.value);
    document.dispatchEvent(new CustomEvent('aise26:cmdk-query', { detail: { query: inputEl.value } }));
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(currentResults.length - 1, activeIdx + 1); refreshActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); refreshActive(); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(activeIdx); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

function refreshActive() {
  const items = resultsList.querySelectorAll('.cmd-result');
  items.forEach((it, i) => {
    if (i === activeIdx) {
      it.classList.add('is-active');
      it.setAttribute('aria-selected', 'true');
      if (inputEl) inputEl.setAttribute('aria-activedescendant', 'cmd-result-' + i);
      it.scrollIntoView({ block: 'nearest' });
    } else {
      it.classList.remove('is-active');
      it.setAttribute('aria-selected', 'false');
    }
  });
}

function pick(i) {
  const r = currentResults[i];
  if (!r) return;
  // Record the query for history if it's a meaningful search
  const q = (inputEl && inputEl.value || '').trim();
  if (q && q.length >= 2 && r.kind === 'concept') pushSearchHistory(q);
  if (r.action) r.action();
  else if (r.href) window.location.hash = r.href;
  close();
}

function renderResults(query) {
  clear(resultsList);
  const q = (query || '').trim();
  // Quick actions
  const actions = [
    { label: 'Open System Map', meta: 'navigate', href: '#/map' },
    { label: 'Open System Map (3D)', meta: 'navigate', href: '#/map3d' },
    { label: 'Path (skill tree)', meta: 'navigate', href: '#/path' },
    { label: 'Topics (tag cloud)', meta: 'navigate', href: '#/topics' },
    { label: 'History (last 50 concepts)', meta: 'navigate', href: '#/history' },
    { label: 'Surprise me · random concept', meta: 'action', action: () => {
      const arr = window.aise26?.CONCEPTS || [];
      const fleshed = arr.filter(c => c.fleshed);
      const pool = fleshed.length ? fleshed : arr;
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (c) window.location.hash = '#/concept/' + c.slug;
    } },
    { label: 'Practice hub', meta: 'navigate', href: '#/practice' },
    { label: 'Daily review (SRS)', meta: 'navigate', href: '#/review' },
    { label: 'Browse Modules', meta: 'navigate', href: '#/modules' },
    { label: 'Glossary', meta: 'navigate', href: '#/glossary' },
    { label: 'Toolkit', meta: 'navigate', href: '#/toolkit' },
    { label: 'Token counter', meta: 'utility', href: '#/toolkit/utility/token-counter' },
    { label: 'Cost calculator', meta: 'utility', href: '#/toolkit/utility/cost-calculator' },
    { label: 'Prompt linter', meta: 'utility', href: '#/toolkit/utility/prompt-linter' },
    { label: 'Latency budget', meta: 'utility', href: '#/toolkit/utility/latency-budget' },
    { label: 'JSON Schema generator', meta: 'utility', href: '#/toolkit/utility/json-schema' },
    { label: 'System prompt analyzer', meta: 'utility', href: '#/toolkit/utility/system-prompt-analyzer' },
    { label: 'Playbooks', meta: 'navigate', href: '#/playbooks' },
    { label: 'Decision tools', meta: 'navigate', href: '#/decisions' },
    { label: 'Personal Library', meta: 'navigate', href: '#/library' },
    { label: 'Career hub', meta: 'navigate', href: '#/career' },
    { label: 'Resume bullets', meta: 'utility', href: '#/toolkit/utility/resume-bullets' },
    { label: 'Portfolio ideas', meta: 'utility', href: '#/toolkit/utility/portfolio-ideas' },
    { label: 'Salary negotiator', meta: 'utility', href: '#/decision/salary-negotiator' },
    { label: 'Profile', meta: 'navigate', href: '#/profile' },
    { label: 'Settings', meta: 'navigate', href: '#/settings' },
    { label: 'Replay onboarding', meta: 'navigate', href: '#/onboarding' },
    { label: 'Toggle dark/light mode', meta: 'theme', action: toggleTheme },
    { label: 'Reset all progress', meta: 'destructive', action: () => lsResetAll(true) }
  ];

  let combined;
  if (!q) {
    combined = actions.map(a => ({ ...a, kind: 'action' }));
  } else {
    const matched = actions.filter(a => a.label.toLowerCase().includes(q.toLowerCase())).map(a => ({ ...a, kind: 'action' }));
    const out = searchConcepts(q);
    const conceptHits = out.results.slice(0, 10).map(r => ({
      label: r.name,
      meta: 'M' + r.module + (r.fleshed ? ' · fleshed' : ''),
      href: '#/concept/' + r.slug,
      kind: 'concept',
      tokens: out.tokens
    }));
    combined = [...matched, ...conceptHits];
    // Module hits
    for (const m of MODULES) {
      if (m.title.toLowerCase().includes(q.toLowerCase())) {
        combined.push({ label: 'Module ' + m.n + ': ' + m.title, meta: 'module', href: '#/module/' + m.n, kind: 'module' });
      }
    }
  }
  currentResults = combined;
  if (!combined.length) {
    resultsList.appendChild(el('li', { class: 'cmd-empty', role: 'option' }, 'No matches.'));
    return;
  }
  combined.forEach((r, i) => {
    // Move role=option onto the <a> so the listbox owns the option directly
    // (no nested-interactive issue). The <li> is just structural.
    const li = el('li', { role: 'presentation' });
    const btn = el('a', {
      class: 'cmd-result' + (i === activeIdx ? ' is-active' : ''),
      href: r.href || '#',
      role: 'option',
      'aria-selected': i === activeIdx ? 'true' : 'false',
      id: 'cmd-result-' + i,
      tabindex: '-1'
    });
    if (r.kind === 'concept' && r.tokens && r.tokens.length) {
      const span = el('span', { class: 'name' });
      for (const child of highlightTokens(r.label, r.tokens)) span.appendChild(child);
      btn.appendChild(span);
    } else {
      btn.appendChild(el('span', { class: 'name' }, r.label));
    }
    btn.appendChild(el('span', { class: 'meta' }, r.meta || ''));
    btn.addEventListener('click', (e) => { e.preventDefault(); pick(i); });
    btn.addEventListener('mouseenter', () => { activeIdx = i; refreshActive(); });
    li.appendChild(btn);
    resultsList.appendChild(li);
  });
}

document.addEventListener('aise26:open-cmdk', open);
document.addEventListener('aise26:escape', () => {
  if (overlay && overlay.getAttribute('data-open') === 'true') close();
});
window.addEventListener('hashchange', close);

window.aise26 = Object.assign(window.aise26 || {}, { openCmdk: open });
